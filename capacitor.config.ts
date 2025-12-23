
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.galeriekohl.app',
  appName: 'Galerie Kohl',
  webDir: 'out',
  server: {
    // This connects the native app to your live site
    url: 'https://galerie-kohl.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true
  }
};

export default config;
