import axios from 'axios';
import { apiClient, LOGIN_REQUEST_FLAG } from '../api/client';

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

  it('attaches Cookie header when token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-session-id');
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Cookie')).toBe('JSESSIONID=test-session-id');
  });

  it('skips Cookie header when no token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Cookie')).toBeUndefined();
  });

  it('does not overwrite Authorization header already set on request (e.g. Basic Auth for login)', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stale-token');
    const headers = new axios.AxiosHeaders();
    headers.set('Authorization', 'Basic dXNlcjpwYXNz');
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers,
    } as any);
    // Basic Auth header must be preserved — Cookie must NOT be set when Authorization is present
    expect(config.headers.get('Authorization')).toBe('Basic dXNlcjpwYXNz');
    expect(config.headers.get('Cookie')).toBeUndefined();
  });

  it('does NOT attach Cookie header when _isLoginRequest is true (Story 2.8 regression guard)', async () => {
    // Regression test: if a stale JSESSIONID is sent on a login POST, OpenMRS reuses
    // the old session and skips Set-Cookie in the response — breaking first-attempt login.
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stale-token');
    const config = await apiClient.interceptors.request.handlers![0].fulfilled({
      headers: new axios.AxiosHeaders(),
      [LOGIN_REQUEST_FLAG]: true,
    } as any);
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(config.headers.get('Cookie')).toBeUndefined();
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
