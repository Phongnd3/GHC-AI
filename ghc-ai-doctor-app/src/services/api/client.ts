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
      // TODO (Story 2.4): This router.replace races with AuthLayout's useEffect,
      // which also calls router.replace('/') when isAuthenticated becomes false.
      // Full fix: remove navigation from interceptor and let AuthContext state
      // propagate to AuthLayout. Tracked in deferred-work.md.
      router.replace('/');
    }
    return Promise.reject(error);
  }
);
