import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { mobileService } from '@/utils/mobileService';
import { supabase } from '@/integrations/supabase/client';

export interface RegistrationResult {
  token?: string;
  granted: boolean;
  reason?: string;
}

export const registerForPush = async (): Promise<RegistrationResult> => {
  try {
    if (!mobileService.isMobile) {
      // Fallback to browser notifications
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        return { granted: perm === 'granted' };
      }
      return { granted: false, reason: 'Notifications not supported' };
    }

    // iOS: use Firebase Messaging to obtain an FCM token (APNs-only token is not enough)
    if (mobileService.platform === 'ios') {
      try {
        const FM: any = FirebaseMessaging as any;
        // Request notification permission (no-op if already granted)
        if (FM?.requestPermissions) {
          await FM.requestPermissions();
        }
        const tokenRes = await FM.getToken();
        const fcmToken = tokenRes?.token || tokenRes?.value || tokenRes;
        if (!fcmToken) {
          return { granted: false, reason: 'No FCM token from Firebase Messaging' };
        }
        localStorage.setItem('pushToken', String(fcmToken));
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
          deviceId = (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          localStorage.setItem('device_id', deviceId);
        }
        await supabase.functions.invoke('push-register', {
          body: {
            device_id: deviceId,
            token: String(fcmToken),
            platform: 'ios',
            user_id: localStorage.getItem('clerk_user_id') || undefined,
            user_email: localStorage.getItem('clerk_user_email') || undefined,
          },
        });
        return { granted: true, token: String(fcmToken) };
      } catch (err: any) {
        return { granted: false, reason: err?.message || 'iOS FCM error' };
      }
    }

    // Default Capacitor Push Notifications flow (Android / others)
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') {
        return { granted: false, reason: 'Permission denied' };
      }
    }

    await PushNotifications.register();

    return await new Promise<RegistrationResult>((resolve) => {
      const cleanup = () => {
        PushNotifications.removeAllListeners();
      };

      PushNotifications.addListener('registration', async (token) => {
        try {
          localStorage.setItem('pushToken', token.value);
          let deviceId = localStorage.getItem('device_id');
          if (!deviceId) {
            deviceId = (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem('device_id', deviceId);
          }
          await supabase.functions.invoke('push-register', {
            body: {
              device_id: deviceId,
              token: token.value,
              platform: mobileService.platform || 'web',
              user_id: localStorage.getItem('clerk_user_id') || undefined,
              user_email: localStorage.getItem('clerk_user_email') || undefined,
            },
          });
        } catch (e) {
          console.warn('push-register error', e);
        } finally {
          cleanup();
          resolve({ granted: true, token: token.value });
        }
      });

      PushNotifications.addListener('registrationError', (err) => {
        cleanup();
        resolve({ granted: false, reason: JSON.stringify(err) });
      });

      // Optional listeners for incoming notifications
      PushNotifications.addListener('pushNotificationReceived', () => {
        // handle foreground notifications if needed
      });
      PushNotifications.addListener('pushNotificationActionPerformed', () => {
        // handle taps on notifications
      });
    });
  } catch (e: any) {
    return { granted: false, reason: e?.message || 'Unknown error' };
  }
};
