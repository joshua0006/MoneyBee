import { PushNotifications } from '@capacitor/push-notifications';
import { mobileService } from '@/utils/mobileService';

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

      PushNotifications.addListener('registration', (token) => {
        localStorage.setItem('pushToken', token.value);
        cleanup();
        resolve({ granted: true, token: token.value });
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
