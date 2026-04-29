import { apiClient } from './client';
import { APP_ENV, REQUEST_TIMEOUT } from '@/config/env';
import type { SessionResponse } from './types';

// AC1 requires login within 3 seconds in production.
// In development/staging, use the global REQUEST_TIMEOUT to avoid tunnel latency issues.
const LOGIN_TIMEOUT = APP_ENV === 'production' ? 3000 : REQUEST_TIMEOUT;

/**
 * Extract JSESSIONID value from a Set-Cookie header string.
 * OpenMRS commonly returns the session token as a cookie.
 *
 * @example "JSESSIONID=ABC123; Path=/openmrs; HttpOnly" -> "ABC123"
 */
function extractJSessionId(setCookieHeader: string): string | null {
  const match = setCookieHeader.match(/JSESSIONID=([^;]+)/);
  return match ? match[1] : null;
}

function encodeBase64Utf8(value: string): string {
  const bytes = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes.charCodeAt(index);
    const second = bytes.charCodeAt(index + 1);
    const third = bytes.charCodeAt(index + 2);

    output += chars.charAt(first >> 2);
    output += chars.charAt(((first & 3) << 4) | (second >> 4));
    output += Number.isNaN(second) ? '=' : chars.charAt(((second & 15) << 2) | (third >> 6));
    output += Number.isNaN(third) ? '=' : chars.charAt(third & 63);
  }

  return output;
}

/**
 * Authenticate user with OpenMRS credentials via Basic Auth.
 * POSTs to /session. OpenMRS may expose the session token as a JSESSIONID
 * cookie, as a response body sessionId, or only through the native cookie jar.
 *
 * @param username - OpenMRS username
 * @param password - OpenMRS password
 * @returns SessionResponse with sessionId when exposed by the runtime
 */
export async function login(username: string, password: string): Promise<SessionResponse> {
  const credentials = encodeBase64Utf8(`${username}:${password}`);

  // Invalidate any existing unauthenticated session before attempting login.
  // OpenMRS issues a JSESSIONID even for failed auth (200 + authenticated: false).
  // The native HTTP layer can cache that cookie and send it on the next request.
  try {
    await apiClient.delete('/session', { _isLoginRequest: true } as Parameters<
      typeof apiClient.delete
    >[1] & { _isLoginRequest: boolean });
  } catch {
    // Ignore errors. The session may not exist; we just want a clean slate.
  }

  const response = await apiClient.post('/session', {}, {
    timeout: LOGIN_TIMEOUT,
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    // Flag this request so the 401 interceptor knows not to redirect.
    // On the login screen a 401 means wrong credentials, not session expiry.
    _isLoginRequest: true,
  } as Parameters<typeof apiClient.post>[2] & { _isLoginRequest: boolean });

  // OpenMRS returns 200 with authenticated: false for bad credentials, not a 4xx.
  // Throw with a typed code so mapErrorToUserMessage can classify this as AUTH_ERROR.
  if (!response.data.authenticated) {
    const err = new Error('Invalid credentials') as Error & { code: string };
    err.code = 'AUTH_CREDENTIALS_INVALID';
    throw err;
  }

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

  if (!sessionId && typeof response.data.sessionId === 'string') {
    sessionId = response.data.sessionId;
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
