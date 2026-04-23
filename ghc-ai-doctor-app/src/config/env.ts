import Constants from 'expo-constants';

interface EnvironmentConfig {
  apiBaseUrl: string;
  sessionTimeout: number;
  cacheDuration: number;
  requestTimeout: number;
  appEnv: 'development' | 'staging' | 'production';
}

function getEnvironmentConfig(): EnvironmentConfig {
  const extra = Constants.expoConfig?.extra;

  if (!extra?.apiBaseUrl) {
    throw new Error('API_BASE_URL is required but not configured');
  }

  return {
    apiBaseUrl: extra.apiBaseUrl,
    sessionTimeout: extra.sessionTimeout || 1800000,
    cacheDuration: extra.cacheDuration || 300000,
    requestTimeout: extra.requestTimeout || 10000,
    appEnv: extra.appEnv || 'development',
  };
}

export const ENV = getEnvironmentConfig();

/** API base URL for OpenMRS REST API */
export const API_BASE_URL = ENV.apiBaseUrl;

/** Session timeout in milliseconds (default: 30 minutes) */
export const SESSION_TIMEOUT = ENV.sessionTimeout;

/** Cache duration in milliseconds (default: 5 minutes) */
export const CACHE_DURATION = ENV.cacheDuration;

/** Request timeout in milliseconds (default: 10 seconds) */
export const REQUEST_TIMEOUT = ENV.requestTimeout;

/** Current app environment */
export const APP_ENV = ENV.appEnv;
