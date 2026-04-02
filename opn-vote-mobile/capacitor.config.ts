import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.opnvote.mobile',
  appName: 'opn-vote-mobile',
  webDir: 'www',
  android: {
    allowMixedContent: true
  }
};

export default config;
