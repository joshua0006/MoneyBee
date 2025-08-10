import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { mobileService } from "@/utils/mobileService";
import { registerForPush } from "@/utils/pushNotifications";
import { isBiometricAvailable, verifyBiometrics } from "@/utils/biometricAuth";
import { useTheme } from "next-themes";

export default function MobileToolkit() {
  const { theme } = useTheme();
  const [pushToken, setPushToken] = useState<string | undefined>(localStorage.getItem('pushToken') || undefined);
  const [platform] = useState(mobileService.platform || 'web');
  const [isMobile] = useState(!!mobileService.isMobile);

  const handleRegisterPush = async () => {
    const res = await registerForPush();
    if (res.granted) {
      setPushToken(res.token);
      toast({ title: "Push Enabled", description: res.token ? `Token saved (${res.token.slice(0, 8)}...)` : "Permission granted" });
      mobileService.successHaptic();
    } else {
      toast({ title: "Push Not Enabled", description: res.reason || "Permission denied", variant: "destructive" });
      mobileService.errorHaptic();
    }
  };

  const handleBiometricCheck = async () => {
    const res = await isBiometricAvailable();
    if (res.available) {
      toast({ title: "Biometrics Available", description: `Type: ${res.biometryType}` });
    } else {
      toast({ title: "Biometrics Unavailable", description: "Device does not report biometrics", variant: "destructive" });
    }
  };

  const handleBiometricVerify = async () => {
    const ok = await verifyBiometrics();
    if (ok) {
      toast({ title: "Verified", description: "Biometric check passed" });
      mobileService.successHaptic();
    } else {
      toast({ title: "Verification Failed", description: "Could not verify", variant: "destructive" });
      mobileService.errorHaptic();
    }
  };

  const setStatusBarLight = () => {
    mobileService.setStatusBarColor('#ffffff', true);
    toast({ title: "Status Bar", description: "Set to light" });
  };

  const setStatusBarDark = () => {
    mobileService.setStatusBarColor('#0b0f1a', false);
    toast({ title: "Status Bar", description: "Set to dark" });
  };

  const hapticTest = () => {
    mobileService.lightHaptic();
    toast({ title: "Haptic", description: "Light tap triggered" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MoneyBee Mobile Toolkit</title>
        <meta name="description" content="Test push notifications, biometrics, haptics, and status bar for the MoneyBee mobile app." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/mobile` : '/mobile'} />
      </Helmet>

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Mobile Toolkit</h1>
          <p className="text-sm text-muted-foreground">Platform: {platform} · Mobile: {String(isMobile)} · Theme: {theme}</p>
        </header>

        <Card className="animate-enter">
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm break-all">Token: {pushToken ? pushToken : '—'}</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleRegisterPush}>Register for Push</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ensure you have configured your Firebase project on iOS/Android and set the FCM_SERVICE_ACCOUNT_JSON secret in Supabase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biometrics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleBiometricCheck}>Check Availability</Button>
            <Button onClick={handleBiometricVerify}>Verify</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device UX</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={hapticTest}>Haptic Test</Button>
            <Button onClick={setStatusBarLight}>Status Bar Light</Button>
            <Button onClick={setStatusBarDark}>Status Bar Dark</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Helpful Links</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li><a className="underline" href={`https://supabase.com/dashboard/project/zzzhmwwidepbnkwtppqj/functions`} target="_blank" rel="noreferrer">Supabase Edge Functions</a></li>
              <li><a className="underline" href={`https://supabase.com/dashboard/project/zzzhmwwidepbnkwtppqj/functions/push-send/logs`} target="_blank" rel="noreferrer">push-send Logs</a></li>
              <li><a className="underline" href={`https://supabase.com/dashboard/project/zzzhmwwidepbnkwtppqj/settings/functions`} target="_blank" rel="noreferrer">Edge Function Secrets</a></li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
