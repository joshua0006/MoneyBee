import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneybee.app',
  appName: 'MoneyBee',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera access is required to scan receipts',
        photos: 'Photo library access is required to select receipt images'
      }
    }
  }
};

export default config;