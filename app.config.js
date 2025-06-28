export default {
  name: 'Diet Planner',
  slug: 'diet-planner-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  // Temporarily disabled splash screen to test crash
  // splash: {
  //   image: './assets/splashscreen_logo.png',
  //   resizeMode: 'contain',
  //   backgroundColor: '#2ECC71'
  // },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dietplanner.app',
    buildNumber: '1.0.0'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2ECC71'
    },
    package: 'com.dietplanner.app',
    versionCode: 1,
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'CAMERA',
      'VIBRATE',
      'WAKE_LOCK',
      'RECEIVE_BOOT_COMPLETED'
    ]
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
    'expo-notifications',
    // Temporarily disabled splash screen plugin to test crash
    // [
    //   'expo-splash-screen',
    //   {
    //     image: './assets/splashscreen_logo.png',
    //     resizeMode: 'contain',
    //     backgroundColor: '#2ECC71'
    //   }
    // ],
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