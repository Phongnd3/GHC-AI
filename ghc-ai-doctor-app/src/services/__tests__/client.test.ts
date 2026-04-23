import axios from 'axios';
import { apiClient } from '../api/client';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct baseURL and timeout defaults', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8080/openmrs/ws/rest/v1');
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  it('attaches Authorization header when token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('skips Authorization header when no token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Authorization')).toBeUndefined();
  });

  it('clears token and redirects on 401', async () => {
    const error = { response: { status: 401 } };
    await expect(apiClient.interceptors.response.handlers![0].rejected!(error)).rejects.toEqual(
      error
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('passes through non-401 errors without redirect', async () => {
    const error = { response: { status: 500 } };
    await expect(apiClient.interceptors.response.handlers![0].rejected!(error)).rejects.toEqual(
      error
    );
    expect(router.replace).not.toHaveBeenCalled();
  });
});
