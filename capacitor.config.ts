import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meravyapaar.app',
  appName: 'Mera Vyapaar',
  webDir: 'dist',

  android: {
    allowMixedContent: true,
  },
};

export default config;