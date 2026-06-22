import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tadreeb.tms',
  appName: 'نظام التدريب',
  webDir: 'dist',
  server: {
    // استخدام http (وليس https) للسماح بالاتصال بالخادم المحلي
    androidScheme: "http",
    // السماح بالتنقل لعناوين الشبكة المحلية
    allowNavigation: [
      'http://192.168.*',
      'http://10.*',
      'http://172.16.*',
      'http://172.17.*',
      'http://172.18.*',
      'http://172.19.*',
      'http://172.20.*',
      'http://172.21.*',
      'http://172.22.*',
      'http://172.23.*',
      'http://172.24.*',
      'http://172.25.*',
      'http://172.26.*',
      'http://172.27.*',
      'http://172.28.*',
      'http://172.29.*',
      'http://172.30.*',
      'http://172.31.*',
      'http://localhost:*',
    ],
    // تحديد hostname للـ webview
    hostname: 'tms.app',
  },
  android: {
    // السماح بالمحتوى المختلط (HTTP في سياق HTTPS)
    allowMixedContent: true,
  },
};

export default config;
