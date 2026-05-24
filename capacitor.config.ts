import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tadreeb.tms',
  appName: 'نظام التدريب',
  webDir: 'dist',
  server: {
    androidScheme: "http"
  }
};

export default config;
