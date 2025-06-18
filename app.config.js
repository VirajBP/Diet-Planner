export default {
  name: 'diet-planner-app',
  slug: 'diet-planner-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dietplanner.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.dietplanner.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    eas: {
      projectId: 'diet-planner-app'
    }
  },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/diet-planner-app'
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },

  plugins: [
    'expo-font',
    'expo-web-browser',
    [
      'expo-media-library',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
        saveToPhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
        isAccessMediaLocationEnabled: true
      }
    ]
  ]
}; 