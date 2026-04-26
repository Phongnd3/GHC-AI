import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, logout as apiLogout } from '@/services/api/auth';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@/services/api/auth', () => ({
  login: jest.fn(),
  logout: jest.fn(),
}));

const mockUser = {
  uuid: 'user-uuid',
  display: 'Test User',
  username: 'testuser',
  systemId: 'testuser',
  person: { uuid: 'person-uuid', display: 'Test User' },
};

const mockSession = {
  sessionId: 'test-session',
  authenticated: true,
  user: mockUser,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no existing session
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  describe('initial state', () => {
    it('should start with isLoading true then resolve to false', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should start unauthenticated when no stored session', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should restore session from SecureStore on mount', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sessionToken') return Promise.resolve('stored-token');
        if (key === 'sessionUser') return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.username).toBe('testuser');
    });

    it('should not set isAuthenticated when stored user JSON is corrupt', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sessionToken') return Promise.resolve('stored-token');
        if (key === 'sessionUser') return Promise.resolve('{invalid-json}');
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Corrupt JSON must not leave isAuthenticated=true with user=null
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should call apiLogin and store session token', async () => {
      (apiLogin as jest.Mock).mockResolvedValue(mockSession);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(apiLogin).toHaveBeenCalledWith('testuser', 'password');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('sessionToken', 'test-session');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'sessionUser',
        JSON.stringify(mockUser)
      );
    });

    it('should set isAuthenticated to true after login', async () => {
      (apiLogin as jest.Mock).mockResolvedValue(mockSession);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.username).toBe('testuser');
    });

    it('should propagate login errors', async () => {
      const error = new Error('Invalid credentials');
      (apiLogin as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.login('testuser', 'wrong');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call apiLogout and clear SecureStore', async () => {
      (apiLogout as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.logout();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionUser');
    });

    it('should set isAuthenticated to false after logout', async () => {
      (apiLogout as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should clear session even if apiLogout throws', async () => {
      (apiLogout as jest.Mock).mockRejectedValue(new Error('Network error'));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should not throw
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
    });

    it('should clear auth state even if SecureStore.deleteItemAsync throws', async () => {
      (apiLogout as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('Keystore error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should not throw — allSettled absorbs the SecureStore error
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});

// Tests for Story 2.4: Automatic Session Timeout
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { SESSION_TIMEOUT_MS } from '@/constants/auth';

jest.useFakeTimers();

describe('AuthContext - inactivity timeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    // handleSessionExpiry now calls apiLogout silently (D2)
    (apiLogout as jest.Mock).mockResolvedValue(undefined);
  });

  it('starts inactivity timer after login', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance timer to just before timeout — should still be authenticated
    act(() => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS - 1000);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('expires session after 30 minutes of inactivity', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance timer past timeout
    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.sessionExpiredMessage).toBe(
        'Session expired due to inactivity. Please log in again.'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionUser');
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('calls apiLogout silently when session expires (D2)', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    await waitFor(() => {
      expect(apiLogout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('clears sessionExpiredMessage when checkSession restores a valid session (patch)', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sessionToken') return Promise.resolve('stored-token');
      if (key === 'sessionUser') return Promise.resolve(JSON.stringify(mockUser));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    // sessionExpiredMessage should be null after a valid session restore
    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('resets timer on resetInactivityTimer call', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance to 25 minutes
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // User interacts — reset timer
    act(() => {
      result.current.resetInactivityTimer();
    });

    // Advance another 25 minutes (50 min total, but only 25 since last reset)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Should still be authenticated (timer was reset)
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears timer on explicit logout', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      await result.current.logout();
    });

    // Advance past timeout — should NOT trigger expiry message (timer was cleared)
    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('clears sessionExpiredMessage after successful login', async () => {
    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Trigger expiry
    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    await waitFor(() => {
      expect(result.current.sessionExpiredMessage).not.toBeNull();
    });

    // Log back in — message should clear
    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('starts timer when restoring session from SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sessionToken') return Promise.resolve('stored-token');
      if (key === 'sessionUser') return Promise.resolve(JSON.stringify(mockUser));
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Timer should be running — advance to just before timeout
    act(() => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS - 1000);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('does not start timer when resetInactivityTimer called while unauthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Call resetInactivityTimer while not authenticated
    act(() => {
      result.current.resetInactivityTimer();
    });

    // Advance time — should not trigger any expiry
    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionExpiredMessage).toBeNull();
  });
});
