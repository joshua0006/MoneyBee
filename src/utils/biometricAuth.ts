import { mobileService } from '@/utils/mobileService';

export type BiometryType = 'fingerprint' | 'face' | 'iris' | 'unknown';

// Lazy accessor for the plugin to avoid build issues on web
const getPlugin = async (): Promise<any | null> => {
  if (!mobileService.isMobile) return null;
  try {
    // @ts-ignore - optional dependency at runtime until npx cap sync
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    return BiometricAuth;
  } catch (e) {
    return null;
  }
};

export const isBiometricAvailable = async () => {
  const plugin = await getPlugin();
  if (!plugin) return { available: false as const, biometryType: 'unknown' as BiometryType };
  try {
    const res = await plugin.isAvailable();
    return { available: !!res?.isAvailable, biometryType: (res?.biometryType || 'unknown') as BiometryType };
  } catch {
    return { available: false as const, biometryType: 'unknown' as BiometryType };
  }
};

export const verifyBiometrics = async (reason = 'Unlock MoneyBee') => {
  const plugin = await getPlugin();
  if (!plugin) return false;
  try {
    const result = await plugin.verify({ reason, allowDeviceCredential: true });
    return !!result?.verified;
  } catch {
    return false;
  }
};
