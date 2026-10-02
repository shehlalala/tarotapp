import type { ExpoConfig } from 'expo/config';
import brand from '@tarot/content/brand.json';

// App identity comes from packages/content/brand.json, the single place to rename the product.
const config: ExpoConfig = {
  name: brand.appName,
  slug: brand.slug,
  scheme: brand.urlScheme,
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0E0B16',
  ios: {
    bundleIdentifier: brand.iosBundleId,
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: brand.androidPackage,
  },
  web: {
    output: 'single',
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
