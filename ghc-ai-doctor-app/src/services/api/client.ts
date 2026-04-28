import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/config/env';

/**
 * Custom Axios config flag that marks a request as a login attempt.
 * Used by interceptors to skip attaching stored session cookies (request interceptor)
 * and to skip the 401 → redirect-to-login behaviour (response interceptor).
 * Exported so auth.ts can reference the same property name without duplication.
 */
export const LOGIN_REQUEST_FLAG = '_isLoginRequest' as const;

/** Axios config extended with the login-request flag. */
export type LoginRequestConfig = { [LOGIN_REQUEST_FLAG]?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Never attach a stored session cookie to login requests.
    // If a stale JSESSIONID is sent on a login POST, OpenMRS reuses the old
    // session and returns the existing session data without a Set-Cookie header
    // in the response — causing sessionId extraction to fail.
    const isLoginRequest =
      (config as InternalAxiosRequestConfig & LoginRequestConfig)[LOGIN_REQUEST_FLAG] === true;

    if (!isLoginRequest) {
      const token = await SecureStore.getItemAsync('sessionToken');
      if (token && !config.headers.get('Authorization')) {
        // OpenMRS uses cookie-based sessions — send JSESSIONID as a Cookie header.
        // React Native does not handle cookies automatically like a browser.
        config.headers.set('Cookie', `JSESSIONID=${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('sessionToken');
      // Only redirect to login if we are NOT on the login screen.
      // When on the login screen a 401 means wrong credentials — the login
      // handler owns the error display; redirecting here would race with it
      // and the user would never see the inline error message.
      // The login request is tagged with _isLoginRequest: true in auth.ts.
      // TODO (Story 2.4): Remove this redirect entirely and let AuthContext
      // state propagation drive navigation (tracked in deferred-work.md).
      const isLoginRequest =
        (error.config as typeof error.config & LoginRequestConfig)?.[LOGIN_REQUEST_FLAG] === true;
      if (!isLoginRequest) {
        router.replace('/');
      }
    }
    return Promise.reject(error);
  }
);
