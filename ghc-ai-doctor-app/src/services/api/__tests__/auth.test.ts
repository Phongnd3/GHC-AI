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

function makeLoginResponse(
  overrides: Partial<{ authenticated: boolean; setCookie: string | string[] }> = {}
) {
  return {
    data: {
      authenticated: overrides.authenticated ?? true,
      user: mockUserData,
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

    it('should NOT call DELETE /session before login (bug fix: pre-login DELETE caused iOS cookie caching)', async () => {
      // Regression test for Story 2.8:
      // The pre-login DELETE /session caused iOS to cache the JSESSIONID from the
      // DELETE response and attach it to the subsequent POST, making OpenMRS reuse
      // the old session and skip Set-Cookie on the POST — breaking first-attempt login.
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      await login('testuser', 'password');

      expect(apiClient.delete).not.toHaveBeenCalled();
      expect(apiClient.post).toHaveBeenCalledTimes(1);
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

    it('should throw when no JSESSIONID cookie is returned', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { authenticated: true, user: mockUserData },
        headers: {},
      });

      await expect(login('testuser', 'password')).rejects.toThrow('No session token received');
    });

    it('should handle non-Latin1 characters in credentials without throwing', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(makeLoginResponse());

      await expect(login('tëstuser', 'pässwörd')).resolves.toBeDefined();

      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      const authHeader = callArgs[2].headers.Authorization;
      expect(authHeader).toMatch(/^Basic /);
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
