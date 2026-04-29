import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { login as apiLogin, logout as apiLogout } from '@/services/api/auth';
import { SESSION_TIMEOUT_MS } from '@/constants/auth';
import type { SessionResponse } from '@/services/api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  providerUuid: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimer: () => void;
  sessionExpiredMessage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionResponse['user'] | null>(null);
  const [providerUuid, setProviderUuid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionCheckPromiseRef = useRef<Promise<void> | null>(null);
  // Ref-based auth check to avoid stale closure in resetInactivityTimer (D3)
  const isAuthenticatedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const handleSessionExpiry = useCallback(async () => {
    // Clear timer ref immediately to prevent double-fire
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // D2: Call apiLogout silently — fire-and-forget, swallow errors
    try {
      await apiLogout();
    } catch {
      // Intentional: server-side logout failure must not block client-side cleanup
    }

    // Use allSettled so all deletes are attempted even if one throws (patch: sequential → parallel)
    await Promise.allSettled([
      SecureStore.deleteItemAsync('sessionToken'),
      SecureStore.deleteItemAsync('sessionUser'),
      SecureStore.deleteItemAsync('sessionTimestamp'),
    ]);

    setIsAuthenticated(false);
    setUser(null);
    setProviderUuid(null);
    setSessionExpiredMessage('Session expired due to inactivity. Please log in again.');

    // Patch: wrap router.replace in try/catch — navigation can fail if app is backgrounded
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation to login failed during session expiry:', error);
    }
  }, []); // router is a stable module-level singleton — no dep needed

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(handleSessionExpiry, SESSION_TIMEOUT_MS);
  }, [handleSessionExpiry]);

  // D3: Use ref-based auth check to avoid stale closure race condition
  const resetInactivityTimer = useCallback(() => {
    if (isAuthenticatedRef.current) {
      startInactivityTimer();
    }
  }, [startInactivityTimer]);

  // Restore session from SecureStore on mount
  useEffect(() => {
    const sessionCheckPromise = checkSession();
    sessionCheckPromiseRef.current = sessionCheckPromise;

    sessionCheckPromise.finally(() => {
      if (sessionCheckPromiseRef.current === sessionCheckPromise) {
        sessionCheckPromiseRef.current = null;
      }
    });
  }, []);

  async function checkSession() {
    try {
      const token = await SecureStore.getItemAsync('sessionToken');
      const userJson = await SecureStore.getItemAsync('sessionUser');
      const timestampStr = await SecureStore.getItemAsync('sessionTimestamp');

      if (token && userJson && timestampStr) {
        const elapsed = Date.now() - parseInt(timestampStr, 10);

        if (elapsed < SESSION_TIMEOUT_MS) {
          // Session is still valid — restore it and start the inactivity timer
          // Parse before setting state — if JSON is corrupt, no partial state is written
          const parsedSession = JSON.parse(userJson) as SessionResponse['user'] & {
            providerUuid?: string;
          };
          setIsAuthenticated(true);
          setUser(parsedSession);
          setProviderUuid(parsedSession.providerUuid ?? null);
          // Clear any stale expiry message from a previous session
          setSessionExpiredMessage(null);
          startInactivityTimer();
        } else {
          // Session has expired while app was closed — clean up all keys
          await Promise.allSettled([
            SecureStore.deleteItemAsync('sessionToken'),
            SecureStore.deleteItemAsync('sessionUser'),
            SecureStore.deleteItemAsync('sessionTimestamp'),
          ]);
          // Patch 2: explicitly reset auth state in expired branch (defensive — initial state
          // is already false/null, but guards against future remount scenarios)
          setIsAuthenticated(false);
          setUser(null);
          setProviderUuid(null);
          setSessionExpiredMessage('Session expired. Please log in again.');
        }
      } else if (token || userJson) {
        // Patch 1: orphaned keys — token/user present but timestamp missing (legacy upgrade
        // from pre-2.7 build, or partial write interrupted between setItemAsync calls).
        // Cannot validate session age → treat as expired and clean up to prevent stale data.
        await Promise.allSettled([
          SecureStore.deleteItemAsync('sessionToken'),
          SecureStore.deleteItemAsync('sessionUser'),
          SecureStore.deleteItemAsync('sessionTimestamp'),
        ]);
        console.warn('checkSession: orphaned session keys found without timestamp — cleared');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    if (sessionCheckPromiseRef.current) {
      await sessionCheckPromiseRef.current;
    }

    const response = await apiLogin(username, password);

    const providerUuidValue = response.currentProvider?.uuid ?? null;
    // Persist session token, user data (including providerUuid), and timestamp securely
    const userWithProvider = { ...response.user, providerUuid: providerUuidValue };
    if (response.sessionId) {
      await SecureStore.setItemAsync('sessionToken', response.sessionId);
      await SecureStore.setItemAsync('sessionUser', JSON.stringify(userWithProvider));
      await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString());
    } else {
      await Promise.allSettled([
        SecureStore.deleteItemAsync('sessionToken'),
        SecureStore.deleteItemAsync('sessionUser'),
        SecureStore.deleteItemAsync('sessionTimestamp'),
      ]);
    }

    setIsAuthenticated(true);
    setUser(response.user);
    setProviderUuid(providerUuidValue);
    setSessionExpiredMessage(null);
    startInactivityTimer();
  }

  async function logout() {
    // Cancel inactivity timer on explicit logout
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Use allSettled so all deletes are attempted even if one throws,
      // and state is always cleared regardless of SecureStore errors.
      await Promise.allSettled([
        SecureStore.deleteItemAsync('sessionToken'),
        SecureStore.deleteItemAsync('sessionUser'),
        SecureStore.deleteItemAsync('sessionTimestamp'),
      ]);
      setIsAuthenticated(false);
      setUser(null);
      setProviderUuid(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        providerUuid,
        login,
        logout,
        isLoading,
        resetInactivityTimer,
        sessionExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
