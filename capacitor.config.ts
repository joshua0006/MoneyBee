import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.48cad12d4f1c4233aae8dd059f15e20a',
  appName: 'effortless-spend-sense',
  webDir: 'dist',
  server: {
    url: 'https://48cad12d-4f1c-4233-aae8-dd059f15e20a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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