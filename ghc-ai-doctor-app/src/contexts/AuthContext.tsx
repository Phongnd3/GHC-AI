import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, logout as apiLogout } from '@/services/api/auth';
import type { SessionResponse } from '@/services/api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from SecureStore on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = await SecureStore.getItemAsync('sessionToken');
      const userJson = await SecureStore.getItemAsync('sessionUser');

      if (token && userJson) {
        // Parse before setting state — if JSON is corrupt, no partial state is written
        const parsedUser = JSON.parse(userJson) as SessionResponse['user'];
        setIsAuthenticated(true);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await apiLogin(username, password);

    // Persist session token and user data securely
    await SecureStore.setItemAsync('sessionToken', response.sessionId);
    await SecureStore.setItemAsync('sessionUser', JSON.stringify(response.user));

    setIsAuthenticated(true);
    setUser(response.user);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Use allSettled so both deletes are attempted even if one throws,
      // and state is always cleared regardless of SecureStore errors.
      await Promise.allSettled([
        SecureStore.deleteItemAsync('sessionToken'),
        SecureStore.deleteItemAsync('sessionUser'),
      ]);
      setIsAuthenticated(false);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
