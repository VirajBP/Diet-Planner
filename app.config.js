export default {
  name: 'diet-planner-app',
  slug: 'diet-planner-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splashscreen_logo.png',
    resizeMode: 'contain',
    backgroundColor: '#2ECC71'
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
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/diet-planner-app'
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  extra: {
    eas: {
      projectId: '40f4ba6f-0493-4a84-a9d5-703632207825'
    }
  },

  plugins: [
    'expo-font',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/splashscreen_logo.png',
        resizeMode: 'contain',
        backgroundColor: '#2ECC71'
      }
    ],
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