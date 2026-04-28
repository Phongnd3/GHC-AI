import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('sessionToken');
    if (token && !config.headers.get('Authorization')) {
      // OpenMRS uses cookie-based sessions — send JSESSIONID as a Cookie header.
      // React Native does not handle cookies automatically like a browser.
      config.headers.set('Cookie', `JSESSIONID=${token}`);
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
        (error.config as typeof error.config & { _isLoginRequest?: boolean })?._isLoginRequest ===
        true;
      if (!isLoginRequest) {
        router.replace('/');
      }
    }
    return Promise.reject(error);
  }
);
