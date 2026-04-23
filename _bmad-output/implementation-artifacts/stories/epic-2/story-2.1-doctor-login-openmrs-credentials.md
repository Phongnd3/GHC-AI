# Story 2.1: Doctor Login with OpenMRS Credentials

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.1  
**Priority:** P0 - Blocking all authentication features

---

## Story

As a doctor,  
I want to log in using my existing OpenMRS username and password,  
So that I can access my assigned patients on mobile without creating new credentials.

---

## Acceptance Criteria

**AC1.**  
**Given** I am on the login screen  
**When** I enter my valid OpenMRS username and password and tap "Login"  
**Then** The app authenticates me via OpenMRS REST API  
**And** I am redirected to the My Patients dashboard  
**And** My session token is stored securely  
**And** The login completes within 3 seconds

---

## Tasks / Subtasks

- [ ] Task 1: Implement auth service with OpenMRS session API (AC: #1)
  - [ ] Create `login()` function in `src/services/api/auth.ts`
  - [ ] POST to `/openmrs/ws/rest/v1/session` with Basic Auth
  - [ ] Extract session token from response
  - [ ] Return typed `SessionResponse` interface
  
- [ ] Task 2: Create AuthContext for session management (AC: #1)
  - [ ] Create `src/contexts/AuthContext.tsx`
  - [ ] Implement `login()`, `logout()`, `isAuthenticated` state
  - [ ] Store session token in Expo SecureStore
  - [ ] Provide context to app via root layout
  
- [ ] Task 3: Build login screen UI (AC: #1)
  - [ ] Create `src/app/index.tsx` login screen
  - [ ] Use Material Design 3 components (TextInput, Button)
  - [ ] Apply OpenMRS O3 theme (teal brand colors)
  - [ ] Add form validation (required fields)
  - [ ] Show loading state during authentication
  
- [ ] Task 4: Implement login flow (AC: #1)
  - [ ] Connect login form to AuthContext
  - [ ] Call `auth.login()` on form submit
  - [ ] Store token in SecureStore on success
  - [ ] Navigate to `/dashboard` on success
  - [ ] Handle errors (covered in Story 2.2)
  
- [ ] Task 5: Create protected route wrapper (AC: #1)
  - [ ] Create `src/app/(auth)/_layout.tsx` for authenticated routes
  - [ ] Check session token on mount
  - [ ] Redirect to login if no valid token
  - [ ] Prevent unauthorized access to dashboard

---

## Dev Notes

### Technical Context

**OpenMRS Session API:**
- **Endpoint:** `POST /openmrs/ws/rest/v1/session`
- **Authentication:** HTTP Basic Auth (username:password encoded in Base64)
- **Response:** JSON with `sessionId`, `authenticated`, `user` object
- **Session Token:** Use `sessionId` for subsequent authenticated requests

**Session API Request:**
```typescript
// POST /openmrs/ws/rest/v1/session
// Headers:
//   Authorization: Basic base64(username:password)
//   Content-Type: application/json

// Response (200 OK):
{
  "sessionId": "5B4F1D8E-5B4F-1D8E-5B4F-1D8E5B4F1D8E",
  "authenticated": true,
  "user": {
    "uuid": "45ce6c2e-dd5a-11e6-9d9c-0242ac150002",
    "display": "admin",
    "username": "admin",
    "systemId": "admin",
    "person": {
      "uuid": "24252571-dd5a-11e6-9d9c-0242ac150002",
      "display": "Super User"
    }
  }
}
```

**Secure Storage:**
- Use Expo SecureStore (Android Keystore)
- Store `sessionId` as `sessionToken` key
- Never store username/password

**Navigation:**
- Login screen: `src/app/index.tsx` (route: `/`)
- Dashboard: `src/app/(auth)/dashboard.tsx` (route: `/dashboard`)
- Use `router.replace('/dashboard')` to prevent back navigation to login

### Architecture Compliance

**ARCH-REQ-1: API Integration Layer**
- ✅ All API calls through `src/services/api/` layer
- ✅ Use `apiClient` from `client.ts` (already configured)
- ✅ Transform API responses to camelCase TypeScript types
- ✅ Handle errors through centralized error handler

**ARCH-REQ-2: Authentication & Security**
- ✅ Session tokens in Expo SecureStore (Android Keystore)
- ✅ No credentials stored on device
- ✅ HTTPS for all API calls (production)
- ✅ Session management via React Context

**ARCH-REQ-3: State Management**
- ✅ AuthContext for app-wide authentication state
- ✅ No global state library needed (Context sufficient)
- ✅ Session token in SecureStore, not in state

**ARCH-REQ-4: Material Design 3 Theming**
- ✅ Use React Native Paper components (TextInput, Button, Card)
- ✅ Apply OpenMRS O3 brand colors (teal palette)
- ✅ Use theme tokens from `@/theme/theme`
- ✅ No hardcoded colors or spacing

**ARCH-REQ-5: Project Structure**
- ✅ Auth service: `src/services/api/auth.ts`
- ✅ AuthContext: `src/contexts/AuthContext.tsx`
- ✅ Login screen: `src/app/index.tsx`
- ✅ Protected routes: `src/app/(auth)/` group

### Implementation Details

**1. Auth Service (`src/services/api/auth.ts`):**

```typescript
import { apiClient } from './client';
import type { SessionResponse } from './types';

/**
 * Authenticate user with OpenMRS credentials
 * @param username - OpenMRS username
 * @param password - OpenMRS password
 * @returns Session data with token
 */
export async function login(username: string, password: string): Promise<SessionResponse> {
  // Encode credentials for Basic Auth
  const credentials = btoa(`${username}:${password}`);
  
  const response = await apiClient.post<SessionResponse>(
    '/session',
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );
  
  // Transform snake_case to camelCase
  return {
    sessionId: response.data.sessionId,
    authenticated: response.data.authenticated,
    user: {
      uuid: response.data.user.uuid,
      display: response.data.user.display,
      username: response.data.user.username,
      systemId: response.data.user.systemId,
      person: {
        uuid: response.data.user.person.uuid,
        display: response.data.user.person.display,
      },
    },
  };
}

/**
 * End current session (logout)
 */
export async function logout(): Promise<void> {
  await apiClient.delete('/session');
}
```

**2. API Types (`src/services/api/types.ts`):**

```typescript
export interface SessionResponse {
  sessionId: string;
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    person: {
      uuid: string;
      display: string;
    };
  };
}
```

**3. AuthContext (`src/contexts/AuthContext.tsx`):**

```typescript
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

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = await SecureStore.getItemAsync('sessionToken');
      const userJson = await SecureStore.getItemAsync('sessionUser');
      
      if (token && userJson) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await apiLogin(username, password);
    
    // Store session token and user data
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
      // Clear local session regardless of API call result
      await SecureStore.deleteItemAsync('sessionToken');
      await SecureStore.deleteItemAsync('sessionUser');
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
```

**4. Login Screen (`src/app/index.tsx`):**

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) return;
    
    setIsLoading(true);
    try {
      await login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      // Error handling in Story 2.2
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.onBackground },
          ]}
        >
          GHC-AI Doctor
        </Text>
        
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Sign in with your OpenMRS credentials
        </Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!username || !password || isLoading}
          style={styles.button}
        >
          Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  title: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.lg,
  },
});
```

**5. Protected Route Layout (`src/app/(auth)/_layout.tsx`):**

```typescript
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**6. Update Root Layout (`src/app/_layout.tsx`):**

```typescript
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { customTheme } from '@/theme/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### Testing Requirements

**Unit Tests:**

**Test: `src/services/api/__tests__/auth.test.ts`**
```typescript
import { login, logout } from '../auth';
import { apiClient } from '../client';

jest.mock('../client');

describe('auth service', () => {
  describe('login', () => {
    it('should authenticate with valid credentials', async () => {
      const mockResponse = {
        data: {
          sessionId: 'test-session-id',
          authenticated: true,
          user: {
            uuid: 'user-uuid',
            display: 'Test User',
            username: 'testuser',
            systemId: 'testuser',
            person: {
              uuid: 'person-uuid',
              display: 'Test User',
            },
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('testuser', 'password');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/session',
        {},
        {
          headers: {
            Authorization: expect.stringContaining('Basic '),
          },
        }
      );
      expect(result.sessionId).toBe('test-session-id');
      expect(result.authenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should call DELETE /session', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await logout();

      expect(apiClient.delete).toHaveBeenCalledWith('/session');
    });
  });
});
```

**Component Tests:**

**Test: `src/app/__tests__/index.test.tsx`**
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext');
jest.mock('expo-router');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('should render login form', () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);

    expect(getByText('GHC-AI Doctor')).toBeTruthy();
    expect(getByLabelText('Username')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should call login and navigate on success', async () => {
    mockLogin.mockResolvedValue(undefined);

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'testuser');
    fireEvent.changeText(getByLabelText('Password'), 'password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
      expect(router.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should disable login button when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);

    const loginButton = getByText('Login');
    expect(loginButton).toBeDisabled();
  });
});
```

**Integration Test:**

**Test: `src/contexts/__tests__/AuthContext.test.tsx`**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '@/services/api/auth';

jest.mock('expo-secure-store');
jest.mock('@/services/api/auth');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login and store session', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.username).toBe('testuser');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'sessionToken',
        'test-session'
      );
    });
  });

  it('should logout and clear session', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
    });
  });
});
```

**Manual Test Checklist:**
- [ ] Login screen displays correctly with OpenMRS branding
- [ ] Username and password fields accept input
- [ ] Login button disabled when fields empty
- [ ] Login button shows loading state during authentication
- [ ] Successful login navigates to dashboard
- [ ] Session token stored in SecureStore
- [ ] Protected routes redirect to login when not authenticated
- [ ] App remembers session after restart (within 30 min)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Core Architectural Decisions](_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)
- [PRD: Technical Requirements](_bmad-output/planning-artifacts/prd/technical-requirements.md)

**External Documentation:**
- [OpenMRS REST API - Session](https://rest.openmrs.org/#session)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Native Paper - TextInput](https://callstack.github.io/react-native-paper/docs/components/TextInput)
- [Expo Router - Authentication](https://docs.expo.dev/router/reference/authentication/)

**Previous Story Learnings:**
- Story 1.5: API client already configured with interceptors
- Story 1.6: Centralized error handler available at `@/utils/errorHandler`
- Story 1.7: LoadingSkeleton component available for loading states
- Story 1.8: Environment variables configured for API_BASE_URL

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use OpenMRS Session API Correctly**
   - POST to `/session` with Basic Auth header
   - Extract `sessionId` from response (not `token` or `authToken`)
   - Store in SecureStore as `sessionToken` key
   - Never store username/password

2. **Follow Authentication Flow**
   - Login → Store token → Update context → Navigate
   - Use `router.replace('/dashboard')` not `router.push()`
   - Check session on app mount in AuthContext
   - Redirect to login if no valid session

3. **Use Material Design 3 Components**
   - TextInput from react-native-paper (mode="outlined")
   - Button from react-native-paper (mode="contained")
   - Apply theme colors via `useTheme()` hook
   - No hardcoded colors or spacing

4. **Implement Proper TypeScript Types**
   - Define `SessionResponse` interface in `types.ts`
   - Type all function parameters and return values
   - Use strict TypeScript (no `any` types)
   - Transform API snake_case to camelCase

5. **Follow Project Structure**
   - Auth service: `src/services/api/auth.ts`
   - AuthContext: `src/contexts/AuthContext.tsx`
   - Login screen: `src/app/index.tsx`
   - Protected routes: `src/app/(auth)/_layout.tsx`

6. **Write Comprehensive Tests**
   - Unit tests for auth service
   - Component tests for login screen
   - Integration tests for AuthContext
   - Mock SecureStore and API calls

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** store credentials in SecureStore - only session token
2. **DO NOT** use `router.push()` after login - use `router.replace()`
3. **DO NOT** hardcode API URLs - use `API_BASE_URL` from config
4. **DO NOT** skip error handling - errors handled in Story 2.2
5. **DO NOT** use custom auth libraries - use Expo SecureStore
6. **DO NOT** create custom loading spinners - use LoadingSkeleton
7. **DO NOT** implement session timeout yet - covered in Story 2.4
8. **DO NOT** add screenshot prevention yet - covered in Story 2.5

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ Auth service implements login/logout with OpenMRS API
2. ✅ AuthContext manages authentication state
3. ✅ Login screen UI matches Material Design 3 with O3 branding
4. ✅ Successful login stores token and navigates to dashboard
5. ✅ Protected routes redirect to login when not authenticated
6. ✅ Session persists across app restarts
7. ✅ All unit, component, and integration tests pass
8. ✅ TypeScript compilation succeeds with no errors
9. ✅ Manual testing confirms all acceptance criteria
10. ✅ Code committed with message: "feat: implement story 2.1 - doctor login with OpenMRS credentials"

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** None (first story in Epic 2)  
**Blocked By:** Story 1.5 (API Client), Story 1.8 (Environment Config) - COMPLETED  
**Estimated Effort:** 4-6 hours

---

## Latest Technical Information

**Expo SecureStore (SDK 54):**
- Current stable version included in Expo SDK 54
- Android: Uses Android Keystore automatically
- No additional configuration needed
- API: `getItemAsync()`, `setItemAsync()`, `deleteItemAsync()`

**React Native Paper v5:**
- TextInput component supports `mode="outlined"` for Material Design 3
- Button component supports `mode="contained"` for primary actions
- Theme integration via `useTheme()` hook
- Full TypeScript support

**Expo Router v4:**
- File-based routing with route groups `(auth)/`
- `router.replace()` for authentication redirects
- Protected routes via layout components
- Automatic back button handling

**OpenMRS REST API v1:**
- Session endpoint: `/ws/rest/v1/session`
- Basic Auth: `Authorization: Basic base64(username:password)`
- Session token in response: `sessionId` field
- Token valid until logout or server timeout

---

**Ultimate context engine analysis completed - comprehensive developer guide created**
