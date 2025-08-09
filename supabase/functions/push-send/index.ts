import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendBody {
  token: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

function base64UrlEncode(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/g, "").replace(/-----END [^-]+-----/g, "").replace(/\s+/g, "");
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function createServiceAccountJWT(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const toSign = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    enc.encode(toSign),
  );
  const sigB64 = base64UrlEncode(signature);
  return `${toSign}.${sigB64}`;
}

async function getAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const assertion = await createServiceAccountJWT(sa);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get access token: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SendBody;
    if (!body || !body.token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
    if (!raw) {
      return new Response(JSON.stringify({ error: "Missing FCM service account secret. Please set FCM_SERVICE_ACCOUNT_JSON in Supabase secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sa: any;
    try {
      sa = JSON.parse(raw);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid FCM service account JSON" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken({ client_email: sa.client_email, private_key: sa.private_key });

    const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    // Ensure data values are strings as required by FCM
    const data: Record<string, string> | undefined = body.data
      ? Object.fromEntries(Object.entries(body.data).map(([k, v]) => [k, String(v)]))
      : undefined;

    const fcmRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: body.token,
          notification: {
            title: body.title || "Notification",
            body: body.body || "",
          },
          data,
        },
      }),
    });

    const text = await fcmRes.text();
    if (!fcmRes.ok) {
      console.error("FCM send error:", fcmRes.status, text);
      return new Response(JSON.stringify({ error: text }), {
        status: fcmRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let json: unknown;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    return new Response(JSON.stringify({ ok: true, result: json }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("push-send error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});