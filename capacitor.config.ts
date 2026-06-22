import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tadreeb.tms',
  appName: 'نظام التدريب',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    // FIX #6: Allow the webview to navigate to LAN addresses so it can reach
    // the local Express server running on the laptop (192.168.x.x:3003).
    // Without this Capacitor blocks all non-localhost HTTP requests.
    allowNavigation: [
      '192.168.*.*',
      '10.*.*.*',
      '172.16.*.*',
      '172.17.*.*',
      '172.18.*.*',
      '172.19.*.*',
      '172.20.*.*',
      '172.21.*.*',
      '172.22.*.*',
      '172.23.*.*',
      '172.24.*.*',
      '172.25.*.*',
      '172.26.*.*',
      '172.27.*.*',
      '172.28.*.*',
      '172.29.*.*',
      '172.30.*.*',
      '172.31.*.*',
      'localhost',
    ],
  },
  android: {
    // FIX #6: Allow mixed HTTP content from within the HTTPS-based webview.
    allowMixedContent: true,
  },
};

export default config;
