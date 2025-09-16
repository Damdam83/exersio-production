import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.exersio.app',
  appName: 'Exersio',
  webDir: 'dist',
  server: {
    androidScheme: 'capacitor'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
