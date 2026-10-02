import type { ExpoConfig } from 'expo/config';
import brand from '@tarot/content/brand.json';

const BACKGROUND = '#0E0B16';

// App identity comes from packages/content/brand.json, the single place to rename the product.
const config: ExpoConfig = {
  name: brand.appName,
  slug: brand.slug,
  scheme: brand.urlScheme,
  // Marketing version shown on the App Store. Build numbers are managed by EAS (eas.json).
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: BACKGROUND,
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: brand.iosBundleId,
    // iPhone only for the first release: iPad would need its own layout pass and screenshots.
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
    // No tracking, no data collection. Reading history lives in on-device storage only.
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        // AsyncStorage / React Native read and write app-only preferences.
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
      ],
    },
  },
  android: {
    package: brand.androidPackage,
    adaptiveIcon: { foregroundImage: './assets/splash-icon.png', backgroundColor: BACKGROUND },
  },
  web: {
    output: 'single',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 200, resizeMode: 'contain', backgroundColor: BACKGROUND },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Set by `eas init`; kept in brand.json so the app config stays declarative.
    eas: brand.easProjectId ? { projectId: brand.easProjectId } : undefined,
  },
};

export default config;
