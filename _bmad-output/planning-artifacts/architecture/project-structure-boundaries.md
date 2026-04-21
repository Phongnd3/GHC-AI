# Project Structure & Boundaries

## Complete Project Directory Structure

```
ghc-ai-mobile/
├── README.md
├── package.json
├── tsconfig.json
├── app.json                          # Expo configuration
├── eas.json                          # EAS Build configuration
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous integration
│       ├── e2e.yml                   # E2E test automation
│       └── release.yml               # Release automation
│
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout with providers
│   ├── index.tsx                     # Entry point (redirect to login/dashboard)
│   ├── (auth)/
│   │   ├── _layout.tsx               # Auth layout
│   │   └── login.tsx                 # Login screen
│   └── (app)/
│       ├── _layout.tsx               # App layout (authenticated)
│       ├── dashboard.tsx             # Appointment dashboard
│       ├── check-in/[appointmentId].tsx  # Check-in screen
│       └── success.tsx               # Check-in success screen
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── SessionExpiredDialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useAuth.test.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── api/
│   │   │   │   ├── auth-api.ts       # Login, logout, session refresh
│   │   │   │   └── auth-api.test.ts
│   │   │   ├── store/
│   │   │   │   └── auth-store.ts     # Zustand store for auth state
│   │   │   └── types/
│   │   │       └── Auth.ts           # Session, Credentials interfaces
│   │   │
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   │   ├── AppointmentCard.tsx
│   │   │   │   ├── AppointmentCard.test.tsx
│   │   │   │   ├── AppointmentList.tsx
│   │   │   │   └── EmptyAppointments.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAppointments.ts  # Fetch today's appointments
│   │   │   │   ├── useAppointments.test.ts
│   │   │   │   └── useAppointmentPolling.ts  # 3-second polling
│   │   │   ├── api/
│   │   │   │   ├── appointments-api.ts
│   │   │   │   └── appointments-api.test.ts
│   │   │   └── types/
│   │   │       └── Appointment.ts
│   │   │
│   │   └── check-in/
│   │       ├── components/
│   │       │   ├── CheckInButton.tsx
│   │       │   ├── CheckInButton.test.tsx
│   │       │   ├── CheckInProgress.tsx  # Loading states
│   │       │   ├── CheckInSuccess.tsx   # Success confirmation
│   │       │   └── CheckInError.tsx     # Error handling
│   │       ├── hooks/
│   │       │   ├── useCheckIn.ts        # Main orchestration hook
│   │       │   ├── useCheckIn.test.ts
│   │       │   ├── useVisitManagement.ts  # Visit create/reuse logic
│   │       │   └── useQueueEntry.ts     # Queue entry creation
│   │       ├── api/
│   │       │   ├── visit-api.ts         # Visit CRUD operations
│   │       │   ├── visit-api.test.ts
│   │       │   ├── queue-api.ts         # Queue entry operations
│   │       │   └── queue-api.test.ts
│   │       └── types/
│   │           ├── Visit.ts
│   │           ├── Queue.ts
│   │           └── CheckInWorkflow.ts   # Orchestration types
│   │
│   ├── components/
│   │   └── shared/
│   │       ├── Button.tsx               # Custom Material Design 3 button
│   │       ├── Card.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── PullToRefresh.tsx
│   │
│   ├── api/
│   │   ├── client.ts                    # Axios instance with interceptors
│   │   ├── client.test.ts
│   │   ├── query-keys.ts                # Centralized TanStack Query keys
│   │   └── interceptors/
│   │       ├── auth-interceptor.ts      # Add session token to headers
│   │       └── error-interceptor.ts     # Handle 401, 5xx errors
│   │
│   ├── utils/
│   │   ├── shared/
│   │   │   ├── logger.ts                # Centralized logging
│   │   │   ├── logger.test.ts
│   │   │   ├── date-utils.ts            # date-fns wrappers
│   │   │   ├── date-utils.test.ts
│   │   │   ├── storage.ts               # MMKV wrapper
│   │   │   └── error-handler.ts         # AppError utilities
│   │   └── test/
│   │       ├── test-utils.tsx           # React Testing Library setup
│   │       ├── mock-data.ts             # Mock OpenMRS responses
│   │       └── mock-api.ts              # MSW handlers
│   │
│   ├── types/
│   │   └── shared/
│   │       ├── navigation.ts            # Expo Router type-safe params
│   │       ├── api.ts                   # Common API types
│   │       └── error.ts                 # AppError type
│   │
│   ├── theme/
│   │   ├── material-theme.ts            # Material Design 3 theme config
│   │   ├── colors.ts
│   │   └── typography.ts
│   │
│   └── config/
│       ├── env.ts                       # Environment variable access
│       └── constants.ts                 # App constants
│
├── e2e/                                 # Maestro E2E tests
│   ├── flows/
│   │   ├── login.yaml
│   │   ├── check-in-happy-path.yaml
│   │   ├── check-in-error-handling.yaml
│   │   └── appointment-polling.yaml
│   └── helpers/
│       └── test-data.ts
│
├── assets/
│   ├── images/
│   │   └── logo.png
│   └── fonts/                           # Custom fonts (if needed)
│
└── docs/
    ├── architecture.md                  # This document
    ├── api-integration.md               # OpenMRS API documentation
    └── development-guide.md             # Setup and development guide
```

## Architectural Boundaries

**API Boundaries:**

1. **OpenMRS REST API (External)**
   - Base URL: Configured via environment variable
   - Authentication: Session-based (Bearer token)
   - Endpoints:
     - `POST /session` - Login
     - `DELETE /session` - Logout
     - `GET /appointment` - Fetch appointments
     - `POST /appointment/{id}/status-change` - Update appointment status
     - `GET /visit` - Fetch visits
     - `POST /visit` - Create visit
     - `GET /queue-entry-number` - Generate queue number
     - `POST /visit-queue-entry` - Create queue entry
     - `POST /audit-log` - Audit trail logging
   - Boundary: `src/api/client.ts` (Axios instance)

2. **Internal API Client Layer**
   - Responsibility: Transform OpenMRS responses, handle errors, add auth headers
   - Location: `src/features/*/api/`
   - Pattern: Feature-specific API modules import from `src/api/client.ts`

**Component Boundaries:**

1. **Feature Components**
   - Scope: Feature-specific UI components
   - Location: `src/features/{feature}/components/`
   - Communication: Via props, hooks, and Zustand stores
   - Example: `LoginForm` only in `auth/components/`, not shared

2. **Shared Components**
   - Scope: Reusable UI components across features
   - Location: `src/components/shared/`
   - Communication: Props only (no direct state access)
   - Example: `Button`, `Card`, `LoadingSpinner`

3. **Screen Components**
   - Scope: Top-level route components
   - Location: `app/` (Expo Router)
   - Communication: Compose feature components, use hooks

**Service Boundaries:**

1. **Authentication Service**
   - Responsibility: Session management, token storage, logout
   - Location: `src/features/auth/`
   - State: `auth-store.ts` (Zustand)
   - API: `auth-api.ts`

2. **Check-in Orchestration Service**
   - Responsibility: Coordinate 8-11 API calls, rollback on failure
   - Location: `src/features/check-in/hooks/useCheckIn.ts`
   - Dependencies: Visit API, Queue API, Appointment API
   - Pattern: TanStack Query mutations with compensating transactions

3. **Logging Service**
   - Responsibility: Audit trail, performance logging, error logging
   - Location: `src/utils/shared/logger.ts`
   - Consumers: All features
   - Pattern: Centralized utility, no state

**Data Boundaries:**

1. **TanStack Query Cache**
   - Scope: All API data caching
   - Keys: Centralized in `src/api/query-keys.ts`
   - Invalidation: Feature-specific hooks manage invalidation
   - Pattern: Factory functions for type-safe keys

2. **Zustand Stores**
   - Scope: Feature-specific state (auth session, check-in workflow state)
   - Location: `src/features/{feature}/store/`
   - Pattern: One store per feature, no cross-feature store access

3. **MMKV Storage**
   - Scope: Persistent data (session token, patient UUID)
   - Location: `src/utils/shared/storage.ts`
   - Pattern: Wrapper utility, encrypted storage

## Requirements to Structure Mapping

**MVP Feature 1: Identity Linking & Login**
- **Screen:** `app/(auth)/login.tsx`
- **Components:** `src/features/auth/components/LoginForm.tsx`
- **Logic:** `src/features/auth/hooks/useAuth.ts`
- **API:** `src/features/auth/api/auth-api.ts`
- **State:** `src/features/auth/store/auth-store.ts`
- **Types:** `src/features/auth/types/Auth.ts`
- **Tests:** Co-located `.test.tsx` files + `e2e/flows/login.yaml`

**MVP Feature 2: Simple Appointment View (Dashboard)**
- **Screen:** `app/(app)/dashboard.tsx`
- **Components:** `src/features/appointments/components/AppointmentCard.tsx`, `AppointmentList.tsx`
- **Logic:** `src/features/appointments/hooks/useAppointments.ts`, `useAppointmentPolling.ts`
- **API:** `src/features/appointments/api/appointments-api.ts`
- **Types:** `src/features/appointments/types/Appointment.ts`
- **Tests:** Co-located `.test.tsx` files

**MVP Feature 3: Smart Check-in (Hero Feature)**
- **Screen:** `app/(app)/check-in/[appointmentId].tsx`, `app/(app)/success.tsx`
- **Components:** `src/features/check-in/components/CheckInButton.tsx`, `CheckInProgress.tsx`, `CheckInSuccess.tsx`, `CheckInError.tsx`
- **Logic (Orchestration):** `src/features/check-in/hooks/useCheckIn.ts`, `useVisitManagement.ts`, `useQueueEntry.ts`
- **API:** `src/features/check-in/api/visit-api.ts`, `queue-api.ts`
- **Types:** `src/features/check-in/types/Visit.ts`, `Queue.ts`, `CheckInWorkflow.ts`
- **Tests:** Co-located `.test.tsx` files + `e2e/flows/check-in-happy-path.yaml`, `check-in-error-handling.yaml`

**Cross-Cutting Concerns:**

1. **Error Handling**
   - **Types:** `src/types/shared/error.ts` (AppError)
   - **Utility:** `src/utils/shared/error-handler.ts`
   - **Component:** `src/components/shared/ErrorBoundary.tsx`
   - **Used by:** All features

2. **Logging & Audit Trail**
   - **Utility:** `src/utils/shared/logger.ts`
   - **API:** Backend audit endpoint called from logger
   - **Used by:** All features (auth, check-in, appointments)

3. **Date/Time Handling**
   - **Utility:** `src/utils/shared/date-utils.ts` (date-fns wrappers)
   - **Used by:** Appointments (display), Check-in (timestamps), API client (ISO 8601)

4. **API Client Configuration**
   - **Client:** `src/api/client.ts` (Axios instance)
   - **Interceptors:** `src/api/interceptors/auth-interceptor.ts`, `error-interceptor.ts`
   - **Query Keys:** `src/api/query-keys.ts`
   - **Used by:** All feature API modules

## Integration Points

**Internal Communication:**

1. **Auth → API Client**
   - Pattern: Auth interceptor adds session token to all requests
   - Flow: `auth-store.ts` → `auth-interceptor.ts` → Axios headers

2. **Check-in → Appointments**
   - Pattern: Check-in success invalidates appointment query cache
   - Flow: `useCheckIn.ts` → `queryClient.invalidateQueries(queryKeys.appointments(...))`

3. **All Features → Logger**
   - Pattern: Import logger utility, call methods
   - Flow: Feature code → `logger.audit()` / `logger.error()` → Backend API / Local storage

4. **All Features → Error Handler**
   - Pattern: TanStack Query `onError` handlers use centralized error utility
   - Flow: API error → `error-handler.ts` → User-facing message + logging

**External Integrations:**

1. **OpenMRS REST API**
   - Integration Point: `src/api/client.ts`
   - Authentication: Session token in Authorization header
   - Error Handling: `error-interceptor.ts` handles 401, 5xx
   - Retry Logic: TanStack Query retry configuration

2. **Material Design 3 Dynamic Theming (Android 12+)**
   - Integration Point: `src/theme/material-theme.ts`
   - Library: `@pchmn/expo-material3-theme`
   - Pattern: Retrieve device theme, apply to React Native Paper

**Data Flow:**

1. **Login Flow**
   ```
   LoginForm → useAuth hook → auth-api.ts → OpenMRS /session
   → auth-store.ts (save token) → storage.ts (persist to MMKV)
   → Navigate to Dashboard
   ```

2. **Appointment View Flow**
   ```
   Dashboard screen → useAppointments hook → TanStack Query
   → appointments-api.ts → OpenMRS /appointment
   → Cache in TanStack Query → Render AppointmentCard components
   → useAppointmentPolling (refetch every 3s)
   ```

3. **Check-in Flow**
   ```
   CheckInButton → useCheckIn hook → TanStack Query mutation
   → Step 1: visit-api.ts GET /visit (check active)
   → Step 2: visit-api.ts POST /visit (create if needed)
   → Step 3-4 (parallel): appointments-api.ts POST /status-change
                          queue-api.ts GET /queue-entry-number
   → Step 5: queue-api.ts POST /visit-queue-entry
   → logger.audit() → OpenMRS /audit-log
   → Invalidate appointment cache
   → Navigate to Success screen
   
   (On error: Rollback in reverse order, logger.error(), show error message)
   ```

## File Organization Patterns

**Configuration Files:**
- **Root level:** `package.json`, `tsconfig.json`, `app.json`, `eas.json`
- **Environment:** `.env.{environment}` files for dev/staging/production
- **Build tools:** `babel.config.js`, `metro.config.js`, `jest.config.js`
- **Code quality:** `.eslintrc.js`, `.prettierrc`

**Source Organization:**
- **Routing:** `app/` directory (Expo Router file-based routing)
- **Features:** `src/features/{feature}/` (domain-driven organization)
- **Shared code:** `src/components/shared/`, `src/utils/shared/`, `src/types/shared/`
- **Infrastructure:** `src/api/`, `src/theme/`, `src/config/`

**Test Organization:**
- **Unit/Integration:** Co-located with source files (`.test.tsx`, `.test.ts`)
- **Test utilities:** `src/utils/test/` (test-utils, mock-data, mock-api)
- **E2E tests:** `e2e/flows/` (Maestro YAML files)

**Asset Organization:**
- **Images:** `assets/images/`
- **Fonts:** `assets/fonts/`
- **Icons:** Use `@expo/vector-icons` or React Native Paper icons (no custom icon files)

## Development Workflow Integration

**Development Server Structure:**
- **Command:** `npx expo start`
- **Entry point:** `app/_layout.tsx` (root layout with providers)
- **Hot reload:** Expo Metro bundler watches `app/` and `src/`
- **Environment:** Loads `.env.development`

**Build Process Structure:**
- **Local builds:** `eas build --profile development --platform android`
- **CI builds:** GitHub Actions workflow (`.github/workflows/ci.yml`)
- **Output:** APK/AAB files for Android
- **Environment:** Loads `.env.{profile}` based on EAS build profile

**Deployment Structure:**
- **Development:** EAS Build → Internal distribution
- **Staging:** EAS Build → TestFlight/Internal testing
- **Production:** EAS Build → Google Play Store
- **Environment:** `.env.production` for production builds
