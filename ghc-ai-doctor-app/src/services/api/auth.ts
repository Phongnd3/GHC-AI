import { apiClient } from './client';
import { APP_ENV, REQUEST_TIMEOUT } from '@/config/env';
import type { SessionResponse } from './types';

// AC1 requires login within 3 seconds in production.
// In development/staging, use the global REQUEST_TIMEOUT to avoid tunnel latency issues.
const LOGIN_TIMEOUT = APP_ENV === 'production' ? 3000 : REQUEST_TIMEOUT;

/**
 * Extract JSESSIONID value from a Set-Cookie header string.
 * OpenMRS returns the session token as a cookie, not in the response body.
 *
 * @example "JSESSIONID=ABC123; Path=/openmrs; HttpOnly" → "ABC123"
 */
function extractJSessionId(setCookieHeader: string): string | null {
  const match = setCookieHeader.match(/JSESSIONID=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Authenticate user with OpenMRS credentials via Basic Auth.
 * POSTs to /session — OpenMRS returns the session token as a JSESSIONID cookie.
 *
 * @param username - OpenMRS username
 * @param password - OpenMRS password
 * @returns SessionResponse with sessionId extracted from Set-Cookie header
 */
export async function login(username: string, password: string): Promise<SessionResponse> {
  // Use encodeURIComponent + unescape to handle Unicode safely, then btoa.
  // Buffer is not available in Hermes (iOS/Android JS engine).
  const credentials = btoa(unescape(encodeURIComponent(`${username}:${password}`)));

  // Invalidate any existing unauthenticated session before attempting login.
  // OpenMRS issues a JSESSIONID even for failed auth (200 + authenticated: false).
  // The native HTTP layer caches that cookie and sends it on the next request,
  // causing OpenMRS to reuse the old session and skip the Set-Cookie header on
  // a subsequent successful login — making sessionId extraction fail.
  // Deleting the session first forces OpenMRS to issue a fresh JSESSIONID.
  try {
    await apiClient.delete('/session', { _isLoginRequest: true } as Parameters<
      typeof apiClient.delete
    >[1] & { _isLoginRequest: boolean });
  } catch {
    // Ignore errors — the session may not exist; we just want a clean slate.
  }

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

  // Extract JSESSIONID from Set-Cookie response header
  const setCookie = response.headers['set-cookie'];
  let sessionId: string | null = null;

  if (Array.isArray(setCookie)) {
    for (const cookie of setCookie) {
      sessionId = extractJSessionId(cookie);
      if (sessionId) break;
    }
  } else if (typeof setCookie === 'string') {
    sessionId = extractJSessionId(setCookie);
  }

  if (!sessionId) {
    throw new Error('No session token received from server');
  }

  const userData = response.data.user;

  return {
    sessionId,
    authenticated: response.data.authenticated,
    currentProvider: response.data.currentProvider ?? null,
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
