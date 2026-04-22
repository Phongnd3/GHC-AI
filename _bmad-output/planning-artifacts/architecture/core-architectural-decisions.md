# Core Architectural Decisions

## Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State Management: SWR for data fetching and caching
- HTTP Client: Axios with interceptors for API integration
- Authentication: Expo SecureStore + 30-min session timeout
- Testing: Jest + React Native Testing Library
- Error Handling: Centralized error handler with user-friendly messages
- Environment Config: Expo Constants + .env files
- Theming: React Native Paper MD3 + OpenMRS O3 brand colors
- Project Structure: Expo Router file-based routing with organized folders
- Development Workflow: ESLint + Prettier + Husky pre-commit hooks

**Important Decisions (Shape Architecture):**
- Code organization patterns established
- Theme token system defined
- API layer structure defined
- Testing strategy and coverage targets set

**Deferred Decisions (Post-MVP):**
- E2E testing framework (Phase 2+)
- CI/CD pipeline setup (Phase 2+)
- Performance monitoring tools (Phase 2+)
- Analytics integration (Phase 2+)

## Data Architecture & State Management

**State Management: SWR (Stale-While-Revalidate)**
- **Version:** Latest stable (^2.2.5)
- **Rationale:** Lightweight (~5KB), perfect for REST API data fetching, built-in caching and revalidation
- **Configuration:**
  - Patient list: 5-min cache (`dedupingInterval: 300000`)
  - Clinical data: No cache (always fresh for accuracy)
  - Error retry: 3 attempts with 2s interval
  - Automatic revalidation on focus/reconnect

**Data Fetching Strategy:**
```typescript
// My Patients dashboard — active visits with 5-min cache
// Filter client-side: stopDatetime === null AND providerUuid in encounterProviders
const { data, error, mutate } = useSWR(
  '/visit?includeInactive=false&v=full',
  fetcher,
  { dedupingInterval: 300000, revalidateOnFocus: true }
);

// Clinical summary — no cache (accuracy critical)
const { data, error } = useSWR(`/patient/${id}?v=full`, fetcher, {
  dedupingInterval: 0,
  revalidateOnFocus: true
});

// Vitals — last 3 obs per concept, no cache
const { data } = useSWR(
  `/obs?patient=${id}&concept=${VITAL_CONCEPTS.HEART_RATE}&limit=3`,
  fetcher,
  { dedupingInterval: 0 }
);
```

**Affects:** All data fetching across the app, cache strategy implementation

## API Integration & Communication

**HTTP Client: Axios**
- **Version:** Latest stable (^1.6.0)
- **Rationale:** Interceptors for auth tokens, request/response transformation, automatic JSON handling
- **Configuration:**
  - Base URL from environment variables
  - 10-second timeout
  - Automatic session token injection
  - 401 error handling (auto-redirect to login)
  - Centralized error mapping

**API Layer Structure:**
```
src/services/api/
├── client.ts          # Axios instance with interceptors
├── auth.ts            # POST /session, DELETE /session
├── patients.ts        # GET /visit, GET /patient/{id}
└── types.ts           # TypeScript interfaces for API responses
```

> **MANDATORY:** All TypeScript types in `types.ts` must be derived from the domain model defined in `_bmad-output/planning-artifacts/architecture/domain-model.md`, which is sourced from `docs/reverse-engineering/01-domain-logic/`. Do not invent types — use the analysed schemas.

**Axios Interceptor Configuration:**
```typescript
// Request interceptor: Add session token
axios.interceptors.request.use((config) => {
  const token = await SecureStore.getItemAsync('sessionToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      SecureStore.deleteItemAsync('sessionToken');
      router.replace('/');
    }
    return Promise.reject(error);
  }
);
```

**Affects:** All API calls, authentication flow, error handling

## Authentication & Security

**Secure Storage: Expo SecureStore**
- **Version:** Built into Expo SDK 55
- **Rationale:** Uses Android Keystore automatically, simple API, no additional dependencies
- **Usage:** Store session tokens securely

**Session Management:**
- **Token Storage:** SecureStore for session token
- **Auto-logout:** React Context + 30-min inactivity timer
- **Token Refresh:** Axios interceptor handles 401 → redirect to login
- **Session Validation:** Check token on app resume

**Screenshot Prevention: expo-screen-capture**
- **Version:** Latest stable
- **Installation:** `npm install expo-screen-capture`
- **Usage:** Prevent screenshots on clinical screens (FLAG_SECURE equivalent)

```typescript
import * as ScreenCapture from 'expo-screen-capture';

// In Clinical Summary screen
useEffect(() => {
  ScreenCapture.preventScreenCaptureAsync();
  return () => {
    ScreenCapture.allowScreenCaptureAsync();
  };
}, []);
```

**Authentication Flow:**
1. Login → Store token in SecureStore → Start 30-min timer
2. On app resume → Check token validity
3. On 401 error → Clear token, redirect to login
4. On logout → Clear SecureStore, reset timer
5. On inactivity (30 min) → Auto-logout

**Security Checklist:**
- ✅ Session tokens in Android Keystore (SecureStore)
- ✅ HTTPS for all API calls (production)
- ✅ No sensitive data caching on device
- ✅ Screenshot prevention on clinical screens
- ✅ 30-min auto-logout on inactivity

**Affects:** Login flow, session management, clinical data screens

## Testing Strategy

**Testing Framework: Jest + React Native Testing Library**
- **Jest Version:** Latest stable (^29.0.0)
- **React Native Testing Library:** Latest stable (^12.0.0)
- **Installation:**
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Testing Layers:**

1. **Unit Tests:** API services, utility functions, custom hooks
   - Coverage target: 90%+
   - Focus: Business logic, data transformations, error handling

2. **Component Tests:** UI components (PatientCard, ClinicalSummaryCard, EmptyState)
   - Coverage target: 80%+
   - Focus: Rendering, user interactions, prop handling

3. **Integration Tests:** Full screen flows (Login → Dashboard → Clinical Summary)
   - Coverage target: 100% for critical paths
   - Focus: User journeys, API integration, navigation

4. **E2E Tests:** (Deferred to Phase 2+)
   - Tool: Detox or Maestro
   - Focus: Full app workflows on real devices

**Test Structure:**
```
src/
├── services/__tests__/
│   ├── auth.test.ts
│   └── patients.test.ts
├── components/__tests__/
│   ├── PatientCard.test.tsx
│   └── ClinicalSummaryCard.test.tsx
├── hooks/__tests__/
│   ├── useAuth.test.ts
│   └── usePatients.test.ts
└── app/__tests__/
    ├── index.test.tsx
    └── dashboard.test.tsx
```

**Coverage Targets:**
- Critical paths (Login, Patient List, Clinical Summary): 100%
- API layer: 90%+
- UI components: 80%+
- Overall project: 85%+

**Test Scripts:**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

**Affects:** All code quality, reliability requirements, CI/CD pipeline

## Error Handling & Network Resilience

**Centralized Error Handler**
- **Location:** `src/utils/errorHandler.ts`
- **Rationale:** Consistent error messages, user-friendly feedback, centralized logging

**Error Categories & User Messages:**

1. **Network Errors** (no connection)
   - Message: "No internet connection. Please check your WiFi."
   - Action: Retry button

2. **Authentication Errors** (401)
   - Message: "Session expired. Please log in again."
   - Action: Auto-redirect to login

3. **Server Errors** (500, 503)
   - Message: "Server unavailable. Please try again."
   - Action: Retry button

4. **Timeout Errors** (10s timeout)
   - Message: "Request timed out. Please try again."
   - Action: Retry button

5. **Data Not Found** (404)
   - Message: "Patient data not found."
   - Action: Return to dashboard

**SWR Error Handling Configuration:**
```typescript
const swrConfig = {
  errorRetryCount: 3,
  errorRetryInterval: 2000,
  shouldRetryOnError: true,
  onError: (error) => {
    const userMessage = mapErrorToUserMessage(error);
    // Show toast or error banner
  }
};
```

**Error Handler Implementation:**
```typescript
// src/utils/errorHandler.ts
export function mapErrorToUserMessage(error: AxiosError): string {
  if (!error.response) {
    return "No internet connection. Please check your WiFi.";
  }
  
  switch (error.response.status) {
    case 401:
      return "Session expired. Please log in again.";
    case 404:
      return "Patient data not found.";
    case 500:
    case 503:
      return "Server unavailable. Please try again.";
    case 408:
      return "Request timed out. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
```

**Affects:** All API calls, user experience, error recovery flows

## Environment Configuration

**Environment Management: Expo Constants + .env files**
- **Rationale:** Type-safe configuration, environment-specific settings, secure credential management

**Installation:**
```bash
npm install --save-dev dotenv
```

**Configuration Files:**
```
.env.development     # Local OpenMRS: http://localhost:8080
.env.staging         # Staging server
.env.production      # Production hospital server
```

**Environment Variables:**
```bash
# .env.development
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/openmrs/ws/rest/v1
EXPO_PUBLIC_SESSION_TIMEOUT=1800000  # 30 minutes in ms
EXPO_PUBLIC_CACHE_DURATION=300000    # 5 minutes in ms
EXPO_PUBLIC_REQUEST_TIMEOUT=10000    # 10 seconds in ms
```

**Usage:**
```typescript
// src/config/env.ts
import Constants from 'expo-constants';

export const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8080/openmrs/ws/rest/v1',
  SESSION_TIMEOUT: Constants.expoConfig?.extra?.sessionTimeout || 1800000,
  CACHE_DURATION: Constants.expoConfig?.extra?.cacheDuration || 300000,
  REQUEST_TIMEOUT: Constants.expoConfig?.extra?.requestTimeout || 10000,
};
```

**app.config.js Configuration:**
```javascript
module.exports = {
  expo: {
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      sessionTimeout: process.env.EXPO_PUBLIC_SESSION_TIMEOUT,
      cacheDuration: process.env.EXPO_PUBLIC_CACHE_DURATION,
      requestTimeout: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT,
    }
  }
};
```

**Structure:**
```
src/config/
├── env.ts           # Environment variable access
└── constants.ts     # App-wide constants
```

**Affects:** API configuration, deployment environments, local development

## Material Design 3 Theming

**Theming Strategy: React Native Paper MD3 + OpenMRS O3 Brand**
- **Base:** Material Design 3 (React Native Paper v5)
- **Brand:** OpenMRS O3 Teal palette (extracted from web app)
- **Typography:** Carbon Design System scale adapted to Material Design 3
- **Spacing:** 8dp grid system (aligned with Carbon)

**OpenMRS O3 Brand Colors (Extracted from Web App):**

**Primary Brand (Teal Palette):**
```typescript
export const OpenMRSColors = {
  // Primary brand colors
  brand01: '#005d5d',  // Teal 60 - Primary (darkest)
  brand02: '#004144',  // Teal 70 - Secondary (darker)
  brand03: '#007d79',  // Teal 50 - Accent (lighter)
  
  // Teal palette variants
  teal10: '#d9fbfb',
  teal20: '#9ef0f0',
  teal30: '#3ddbd9',
  teal40: '#08bdba',
  teal50: '#009d9a',
  teal60: '#005d5d',
  teal70: '#004144',
  teal80: '#007d79',
  teal90: '#022b30',
  teal100: '#081a1c',
};
```

**Clinical Safety Colors:**
```typescript
export const ClinicalColors = {
  // From Carbon Design System + UX spec
  error: '#da1e28',      // Allergy alerts, critical errors
  success: '#24a148',    // Vitals normal, positive states
  warning: '#f1c21b',    // Vitals abnormal, warnings
  info: '#0043ce',       // Medication info, informational
  
  // Semantic clinical colors
  allergyAlert: '#da1e28',     // High priority - red
  medicationInfo: '#0f62fe',   // Carbon blue
  vitalsNormal: '#24a148',     // Green
  vitalsAbnormal: '#f1c21b',   // Orange/warning
  emptyState: '#8d8d8d',       // Neutral grey
};
```

**Text & Background Colors:**
```typescript
export const BaseColors = {
  // Text colors (from Carbon White theme)
  textPrimary: '#161616',
  textSecondary: '#525252',
  textHelper: '#6f6f6f',
  textDisabled: 'rgba(22,22,22,0.25)',
  textInverse: '#ffffff',
  
  // Background colors
  background: '#ffffff',
  surface: '#f4f4f4',
  layer01: '#f4f4f4',
  layer02: '#ffffff',
  layer03: '#e0e0e0',
  
  // Border colors
  borderSubtle: '#e0e0e0',
  borderStrong: '#8d8d8d',
  borderInteractive: '#0f62fe',
};
```

**Spacing Scale (8dp grid):**
```typescript
export const Spacing = {
  xs: 2,   // 2px
  sm: 4,   // 4px
  md: 8,   // 8px
  lg: 12,  // 12px
  xl: 16,  // 16px
  xxl: 24, // 24px
  xxxl: 32, // 32px
  huge: 48, // 48px
  massive: 64, // 64px
};
```

**Typography Scale (Carbon → Material Design 3):**
```typescript
export const Typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    fontFamily: 'IBMPlexSans-Regular',
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400',
    fontFamily: 'IBMPlexSans-Regular',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
    fontFamily: 'IBMPlexSans-Regular',
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'IBMPlexSans-SemiBold',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'IBMPlexSans-Regular',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'IBMPlexSans-Regular',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'IBMPlexSans-SemiBold',
  },
};
```

**Theme Implementation:**
```typescript
// src/theme/theme.ts
import { MD3LightTheme } from 'react-native-paper';
import { OpenMRSColors, ClinicalColors, BaseColors } from './colors';

export const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: OpenMRSColors.brand01,
    secondary: OpenMRSColors.brand03,
    tertiary: OpenMRSColors.brand02,
    error: ClinicalColors.error,
    background: BaseColors.background,
    surface: BaseColors.surface,
    onPrimary: BaseColors.textInverse,
    onSecondary: BaseColors.textInverse,
    onBackground: BaseColors.textPrimary,
    onSurface: BaseColors.textPrimary,
  },
};
```

**Theme Structure:**
```
src/theme/
├── colors.ts        # OpenMRS O3 brand + clinical safety colors
├── typography.ts    # Material Design 3 type scale
├── spacing.ts       # 8dp grid system
└── theme.ts         # Combined MD3 theme with O3 branding
```

**MANDATORY RULE:** All color, typography, and spacing values MUST reference theme tokens. No hardcoded values in components.

**Example Usage:**
```typescript
import { useTheme } from 'react-native-paper';
import { Spacing } from '@/theme/spacing';

const PatientCard = () => {
  const theme = useTheme();
  
  return (
    <Card style={{ 
      backgroundColor: theme.colors.surface,
      padding: Spacing.xl,
      marginBottom: Spacing.md,
    }}>
      <Text style={{ 
        color: theme.colors.onSurface,
        ...Typography.titleLarge,
      }}>
        Patient Name
      </Text>
    </Card>
  );
};
```

**Affects:** All UI components, visual consistency, brand alignment with web app

## Project Structure & Code Organization

**File-Based Routing Structure (Expo Router):**
```
src/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx        # Root layout (PaperProvider, AuthContext)
│   ├── index.tsx          # Login screen (/)
│   ├── (auth)/            # Authenticated routes group
│   │   ├── _layout.tsx    # Auth layout (session check, screen capture)
│   │   ├── dashboard.tsx  # My Patients Dashboard (/dashboard)
│   │   └── patient/[id].tsx  # Clinical Summary (/patient/:id)
│   └── +not-found.tsx     # 404 screen
│
├── components/            # Reusable UI components
│   ├── PatientCard.tsx
│   ├── ClinicalSummaryCard.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSkeleton.tsx
│   └── __tests__/
│
├── services/              # API integration layer
│   ├── api/
│   │   ├── client.ts      # Axios instance with interceptors
│   │   ├── auth.ts        # POST /session, DELETE /session
│   │   ├── patients.ts    # GET /visit, GET /patient/{id}
│   │   └── types.ts       # API response TypeScript interfaces
│   ├── storage.ts         # SecureStore wrapper
│   └── __tests__/
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── usePatients.ts     # SWR hook for patient list
│   ├── useClinicalSummary.ts  # SWR hook for clinical data
│   └── __tests__/
│
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Auth state + 30-min inactivity timer
│
├── theme/                 # Design system
│   ├── colors.ts          # OpenMRS O3 brand + clinical colors
│   ├── typography.ts      # Material Design 3 type scale
│   ├── spacing.ts         # 8dp grid system
│   └── theme.ts           # Combined MD3 theme
│
├── types/                 # TypeScript type definitions (derived from domain-model.md)
│   ├── patient.ts         # Patient, PatientName, PatientIdentifier types
│   ├── visit.ts           # Visit, Encounter, EncounterProvider, Observation types
│   ├── clinical.ts        # Medication (Order), Allergy, Vital types
│   └── api.ts             # API request/response types (SessionResponse, etc.)
│
├── utils/                 # Utility functions
│   ├── errorHandler.ts    # Error mapping to user messages
│   ├── validators.ts      # Input validation helpers
│   └── __tests__/
│
└── config/                # Configuration
    ├── env.ts             # Environment variable access
    └── constants.ts       # App-wide constants
```

**Key Conventions:**

1. **File-Based Routing:**
   - Routes defined in `app/` directory (Expo Router convention)
   - Route groups with `(auth)/` for protected routes
   - Dynamic routes with `[id].tsx` for patient details
   - `_layout.tsx` for nested layouts and providers

2. **Component Organization:**
   - Named exports for reusable components
   - Default exports for screens/routes
   - Colocated tests in `__tests__/` folders

3. **Import Aliases:**
   - `@/components` → `src/components`
   - `@/services` → `src/services`
   - `@/hooks` → `src/hooks`
   - `@/theme` → `src/theme`
   - `@/types` → `src/types`
   - `@/utils` → `src/utils`
   - `@/config` → `src/config`

4. **Naming Conventions:**
   - Components: PascalCase (e.g., `PatientCard.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
   - Utils: camelCase (e.g., `errorHandler.ts`)
   - Types: PascalCase (e.g., `Patient`, `ClinicalSummary`)
   - Constants: UPPER_SNAKE_CASE

5. **Test Colocation:**
   - Tests live in `__tests__/` folders next to source files
   - Test files named `*.test.ts` or `*.test.tsx`
   - Mock files in `__mocks__/` folders

**Affects:** All code organization, imports, navigation, file structure

## Development Workflow & Tooling

**Linting & Formatting:**

**ESLint + Prettier**
- **ESLint:** TypeScript linting with recommended rules
- **Prettier:** Code formatting with consistent style
- **Integration:** eslint-config-prettier to avoid conflicts

**Installation:**
```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-native
```

**ESLint Configuration (.eslintrc.js):**
```javascript
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-native/no-inline-styles': 'warn',
  },
};
```

**Prettier Configuration (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Pre-commit Hooks:**

**Husky + lint-staged**
- **Husky:** Git hooks management
- **lint-staged:** Run linters on staged files only

**Installation:**
```bash
npm install --save-dev husky lint-staged
npx husky install
```

**Husky Configuration (.husky/pre-commit):**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**lint-staged Configuration (package.json):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

**NPM Scripts (package.json):**
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    
    "prepare": "husky install"
  }
}
```

**Git Workflow:**
1. **Pre-commit:** Run ESLint + Prettier + related tests on staged files
2. **Pre-push:** (Optional) Run full test suite
3. **CI/CD:** (Phase 2+) GitHub Actions for automated testing

**Development Tools:**
- **VS Code Extensions:** ESLint, Prettier, React Native Tools
- **Expo Go:** Instant device testing via QR code
- **React DevTools:** Component inspection and debugging
- **Flipper:** (Optional) Advanced debugging for React Native

**CI/CD (Deferred to Phase 2+):**
- GitHub Actions or similar
- Run tests + linting on pull requests
- EAS Build for production builds
- Automated deployment to staging/production

**Affects:** Code quality, team collaboration, development speed

## Decision Impact Analysis

**Implementation Sequence:**

1. **Project Initialization** (Story 1)
   - Run Expo starter command
   - Install dependencies (React Native Paper, Axios, SWR, etc.)
   - Configure ESLint, Prettier, Husky
   - Set up project structure

2. **Theme & Design System** (Story 2)
   - Implement theme tokens (colors, typography, spacing)
   - Configure React Native Paper with OpenMRS O3 branding
   - Create base components (Card, Button, Text)

3. **API Integration Layer** (Story 3)
   - Set up Axios client with interceptors
   - Implement auth service (login, logout)
   - Implement patients service (list, clinical summary)
   - Configure environment variables

4. **Authentication & Security** (Story 4)
   - Implement AuthContext with session management
   - Set up SecureStore for token storage
   - Configure 30-min auto-logout timer
   - Add screenshot prevention

5. **Login Screen** (Story 5)
   - Implement login UI (Material Design 3)
   - Connect to auth service
   - Handle authentication errors
   - Navigate to dashboard on success

6. **My Patients Dashboard** (Story 6)
   - Implement patient list UI
   - Connect to patients service with SWR
   - Add pull-to-refresh
   - Handle empty states and errors

7. **Clinical Summary Screen** (Story 7)
   - Implement clinical summary UI
   - Connect to clinical data service with SWR
   - Display Demographics, Meds, Allergies, Vitals
   - Handle empty states (William Robinson case)

8. **Testing Infrastructure** (Story 8)
   - Configure Jest + React Native Testing Library
   - Write unit tests for services
   - Write component tests
   - Write integration tests for critical paths

9. **Error Handling & Polish** (Story 9)
   - Implement centralized error handler
   - Add loading skeletons
   - Refine empty states
   - Performance optimization

**Cross-Component Dependencies:**

1. **Theme → All UI Components**
   - All components must use theme tokens
   - No hardcoded colors, typography, or spacing

2. **API Client → All Services**
   - All API calls go through Axios client
   - Interceptors handle auth and errors globally

3. **AuthContext → Protected Routes**
   - All authenticated routes check session validity
   - Auto-logout affects all screens

4. **SWR → Data Fetching Hooks**
   - All data fetching uses SWR hooks
   - Cache strategy configured per endpoint

5. **Error Handler → All API Calls**
   - All errors mapped to user-friendly messages
   - Consistent error UI across app

6. **Environment Config → API Client**
   - API base URL from environment variables
   - Timeout and cache settings from config

**Critical Path Dependencies:**
```
Project Init → Theme Setup → API Layer → Auth → Login → Dashboard → Clinical Summary
                                                    ↓
                                            Testing Infrastructure
```
