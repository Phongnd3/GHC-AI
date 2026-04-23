const isProduction = process.env.APP_ENV === 'production';
const isStaging = process.env.APP_ENV === 'staging';

module.exports = {
  expo: {
    name: isProduction ? 'GHC Mobile' : isStaging ? 'GHC Mobile (Staging)' : 'GHC Mobile (Dev)',
    slug: 'ghc-ai-doctor-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'auto',
    newArchEnabled: true,
    scheme: 'ghc-ai-doctor-app',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isProduction
        ? 'com.ghc.mobile'
        : isStaging
        ? 'com.ghc.mobile.staging'
        : 'com.ghc.mobile.dev',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: isProduction
        ? 'com.ghc.mobile'
        : isStaging
        ? 'com.ghc.mobile.staging'
        : 'com.ghc.mobile.dev',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    router: {
      root: 'src',
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800000', 10),
      cacheDuration: parseInt(process.env.CACHE_DURATION || '300000', 10),
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
      appEnv: process.env.APP_ENV || 'development',
    },
  },
};
