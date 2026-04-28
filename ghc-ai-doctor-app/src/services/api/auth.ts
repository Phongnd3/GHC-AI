import { apiClient } from './client';
import { APP_ENV, REQUEST_TIMEOUT } from '@/config/env';
import type { SessionResponse } from './types';

// AC1 requires login within 3 seconds in production.
// In development/staging, use the global REQUEST_TIMEOUT to avoid tunnel latency issues.
const LOGIN_TIMEOUT = APP_ENV === 'production' ? 3000 : REQUEST_TIMEOUT;

/**
 * Authenticate user with OpenMRS credentials via Basic Auth.
 * POSTs to /session — OpenMRS returns the sessionId directly in the response body.
 *
 * @param username - OpenMRS username
 * @param password - OpenMRS password
 * @returns SessionResponse with sessionId from response body
 */
export async function login(username: string, password: string): Promise<SessionResponse> {
  // Use encodeURIComponent + unescape to handle Unicode safely, then btoa.
  // Buffer is not available in Hermes (iOS/Android JS engine).
  const credentials = btoa(unescape(encodeURIComponent(`${username}:${password}`)));

  const response = await apiClient.post('/session', {}, {
    timeout: LOGIN_TIMEOUT,
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    // Flag this request so the 401 interceptor knows not to redirect —
    // on the login screen a 401 means wrong credentials, not session expiry.
    _isLoginRequest: true,
  } as Parameters<typeof apiClient.post>[2] & { _isLoginRequest: boolean });

  // OpenMRS returns 200 with authenticated: false for bad credentials — not a 4xx.
  // Throw with a typed code so mapErrorToUserMessage can classify this as AUTH_ERROR.
  if (!response.data.authenticated) {
    const err = new Error('Invalid credentials') as Error & { code: string };
    err.code = 'AUTH_CREDENTIALS_INVALID';
    throw err;
  }

  // OpenMRS returns the sessionId directly in the response body.
  // Do NOT rely on Set-Cookie headers — React Native's native HTTP stack
  // (both iOS and Android) strips or caches Set-Cookie headers, making
  // header-based extraction unreliable.
  const sessionId: string = response.data.sessionId;

  if (!sessionId) {
    throw new Error('No session token received from server');
  }

  const userData = response.data.user;

  return {
    sessionId,
    authenticated: response.data.authenticated,
    user: {
      uuid: userData.uuid,
      display: userData.display,
      username: userData.username ?? userData.systemId ?? '',
      systemId: userData.systemId,
      person: {
        uuid: userData.person?.uuid ?? '',
        display: userData.person?.display ?? '',
      },
    },
  };
}

/**
 * End the current OpenMRS session (logout).
 * DELETEs /session to invalidate the server-side session.
 */
export async function logout(): Promise<void> {
  await apiClient.delete('/session');
}
