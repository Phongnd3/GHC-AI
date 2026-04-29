import { login, logout } from '../auth';
import { apiClient } from '../client';

jest.mock('../client', () => ({
  apiClient: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUserData = {
  uuid: 'user-uuid',
  display: 'Test User',
  username: 'testuser',
  systemId: 'testuser',
  person: {
    uuid: 'person-uuid',
    display: 'Test User',
  },
};

const mockProviderData = { uuid: 'provider-uuid', display: 'Dr. Test' };

function makeLoginResponse(
  overrides: Partial<{
    authenticated: boolean;
    setCookie: string | string[];
    currentProvider: { uuid: string; display: string } | null | undefined;
  }> = {}
) {
  const hasProvider = 'currentProvider' in overrides;
  return {
    data: {
      authenticated: overrides.authenticated ?? true,
      user: mockUserData,
      currentProvider: hasProvider ? overrides.currentProvider : mockProviderData,
    },
    headers: {
      'set-cookie': overrides.setCookie ?? 'JSESSIONID=test-session-id; Path=/openmrs; HttpOnly',
    },
  };
}

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should POST to /session with Basic Auth header', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      await login('testuser', 'password');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/session',
        {},
        expect.objectContaining({
          timeout: expect.any(Number),
          headers: {
            Authorization: expect.stringMatching(/^Basic /),
          },
          _isLoginRequest: true,
        })
      );
    });

    it('should encode credentials as Base64 in Authorization header', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      await login('testuser', 'password');

      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      const authHeader = callArgs[2].headers.Authorization;
      const encoded = authHeader.replace('Basic ', '');
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      expect(decoded).toBe('testuser:password');
    });

    it('should extract sessionId from Set-Cookie header (string)', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      const result = await login('testuser', 'password');

      expect(result.sessionId).toBe('test-session-id');
    });

    it('should extract sessionId from Set-Cookie header (array)', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(
        makeLoginResponse({
          setCookie: ['JSESSIONID=array-session-id; Path=/openmrs; HttpOnly', 'other=value'],
        })
      );

      const result = await login('testuser', 'password');

      expect(result.sessionId).toBe('array-session-id');
    });

    it('should fall back to response body sessionId when Set-Cookie is not exposed', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          authenticated: true,
          sessionId: 'body-session-id',
          user: mockUserData,
          currentProvider: mockProviderData,
        },
        headers: {},
      });

      const result = await login('testuser', 'password');

      expect(result.sessionId).toBe('body-session-id');
    });

    it('should return a typed SessionResponse', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      const result = await login('testuser', 'password');

      expect(result.authenticated).toBe(true);
      expect(result.user.uuid).toBe('user-uuid');
      expect(result.user.display).toBe('Test User');
      expect(result.user.username).toBe('testuser');
      expect(result.user.systemId).toBe('testuser');
      expect(result.user.person.uuid).toBe('person-uuid');
      expect(result.user.person.display).toBe('Test User');
    });

    it('should throw when authenticated is false', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse({ authenticated: false }));

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should throw with AUTH_CREDENTIALS_INVALID code when authenticated is false', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse({ authenticated: false }));

      let thrownError: (Error & { code?: string }) | null = null;
      try {
        await login('testuser', 'wrongpassword');
      } catch (e) {
        thrownError = e as Error & { code?: string };
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError?.code).toBe('AUTH_CREDENTIALS_INVALID');
    });

    it('should allow authenticated response when no session token is exposed', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { authenticated: true, user: mockUserData },
        headers: {},
      });

      const result = await login('testuser', 'password');

      expect(result.authenticated).toBe(true);
      expect(result.sessionId).toBeNull();
      expect(result.user.username).toBe('testuser');
    });

    it('should return currentProvider when present in response', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      const result = await login('testuser', 'password');

      expect(result.currentProvider).toEqual({ uuid: 'provider-uuid', display: 'Dr. Test' });
    });

    it('should return currentProvider as null when absent from response', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse({ currentProvider: null }));

      const result = await login('testuser', 'password');

      expect(result.currentProvider).toBeNull();
    });

    it('should return currentProvider as null when undefined in response', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(
        makeLoginResponse({ currentProvider: undefined })
      );

      const result = await login('testuser', 'password');

      expect(result.currentProvider).toBeNull();
    });

    it('should handle non-Latin1 characters in credentials without throwing', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      await expect(login('tëstuser', 'pässwörd')).resolves.toBeDefined();

      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      const authHeader = callArgs[2].headers.Authorization;
      expect(authHeader).toMatch(/^Basic /);
    });

    it('should encode credentials when btoa is unavailable in the native runtime', async () => {
      const originalBtoa = global.btoa;
      // @ts-expect-error - intentionally simulates a native runtime without btoa.
      delete global.btoa;
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      try {
        await login('testuser', 'password');
      } finally {
        global.btoa = originalBtoa;
      }

      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      const authHeader = callArgs[2].headers.Authorization;
      const encoded = authHeader.replace('Basic ', '');
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      expect(decoded).toBe('testuser:password');
    });

    it('should propagate errors from apiClient', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(login('testuser', 'password')).rejects.toThrow('Network Error');
    });
  });

  describe('logout', () => {
    it('should call DELETE /session', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await logout();

      expect(apiClient.delete).toHaveBeenCalledWith('/session');
    });

    it('should propagate errors from apiClient', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValue(new Error('Logout failed'));

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });
});
