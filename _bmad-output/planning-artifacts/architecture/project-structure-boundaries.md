# Project Structure & Boundaries

## Complete Project Directory Structure

```
ghc-ai-doctor-app/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── app.json
├── app.config.js
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── .env.development
├── .env.staging
├── .env.production
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── .husky/
│   └── pre-commit
│
├── src/
│   ├── app/                          # Expo Router file-based routes
│   │   ├── _layout.tsx              # Root layout (PaperProvider, AuthContext)
│   │   ├── index.tsx                # Login screen (/)
│   │   ├── (auth)/                  # Authenticated routes group
│   │   │   ├── _layout.tsx          # Auth layout (session check, screen capture)
│   │   │   ├── dashboard.tsx        # My Patients Dashboard (/dashboard)
│   │   │   └── patient/
│   │   │       └── [id].tsx         # Clinical Summary (/patient/:id)
│   │   └── +not-found.tsx           # 404 screen
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── PatientCard.tsx
│   │   ├── ClinicalSummaryCard.tsx
│   │   ├── DemographicsCard.tsx
│   │   ├── MedicationsCard.tsx
│   │   ├── AllergiesCard.tsx
│   │   ├── VitalsCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorState.tsx
│   │   └── __tests__/
│   │       ├── PatientCard.test.tsx
│   │       ├── ClinicalSummaryCard.test.tsx
│   │       └── EmptyState.test.tsx
│   │
│   ├── services/                     # API integration layer
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance with interceptors
│   │   │   ├── auth.ts              # POST /session, DELETE /session
│   │   │   ├── patients.ts          # GET /visit, GET /patient/{id}
│   │   │   ├── clinical.ts          # GET /order, /allergy, /obs
│   │   │   ├── types.ts             # API response TypeScript interfaces
│   │   │   └── __tests__/
│   │   │       ├── client.test.ts
│   │   │       ├── auth.test.ts
│   │   │       └── patients.test.ts
│   │   ├── storage.ts               # SecureStore wrapper
│   │   └── __tests__/
│   │       └── storage.test.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── usePatients.ts           # SWR hook for patient list
│   │   ├── useClinicalSummary.ts    # SWR hook for clinical data
│   │   └── __tests__/
│   │       ├── useAuth.test.ts
│   │       ├── usePatients.test.ts
│   │       └── useClinicalSummary.test.ts
│   │
│   ├── contexts/                     # React contexts
│   │   ├── AuthContext.tsx          # Auth state + 30-min inactivity timer
│   │   └── __tests__/
│   │       └── AuthContext.test.tsx
│   │
│   ├── theme/                        # Design system
│   │   ├── colors.ts                # OpenMRS O3 brand + clinical colors
│   │   ├── typography.ts            # Material Design 3 type scale
│   │   ├── spacing.ts               # 8dp grid system
│   │   └── theme.ts                 # Combined MD3 theme
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── patient.ts               # Patient, Visit types
│   │   ├── clinical.ts              # Medication, Allergy, Vitals types
│   │   ├── api.ts                   # API request/response types
│   │   └── navigation.ts            # Expo Router navigation types
│   │
│   ├── utils/                        # Utility functions
│   │   ├── errorHandler.ts          # Error mapping to user messages
│   │   ├── validators.ts            # Input validation helpers
│   │   ├── formatters.ts            # Date/time formatting
│   │   └── __tests__/
│   │       ├── errorHandler.test.ts
│   │       └── validators.test.ts
│   │
│   └── config/                       # Configuration
│       ├── env.ts                   # Environment variable access
│       └── constants.ts             # App-wide constants
│
├── assets/                           # Static assets
│   ├── images/
│   │   └── logo.png
│   ├── fonts/
│   │   ├── IBMPlexSans-Regular.ttf
│   │   ├── IBMPlexSans-SemiBold.ttf
│   │   └── IBMPlexSans-Bold.ttf
│   └── icons/
│
└── __mocks__/                        # Global mocks for testing
    ├── expo-secure-store.ts
    ├── expo-router.ts
    └── react-native-paper.ts
```

## Architectural Boundaries

**API Boundaries:**
- **External API:** OpenMRS REST API v1 (`/openmrs/ws/rest/v1/`)
- **API Client:** `src/services/api/client.ts` (Axios with interceptors)
- **Service Layer:** `src/services/api/*.ts` (auth, patients, clinical)
- **Data Transformation:** snake_case → camelCase at service boundary
- **Authentication:** Session token in Authorization header (managed by interceptor)

**Component Boundaries:**
- **Screens (Routes):** `src/app/**/*.tsx` - Full-screen views, use hooks for data
- **Components:** `src/components/*.tsx` - Reusable UI, receive props only
- **No direct API calls in components** - Always use hooks
- **Theme access:** `useTheme()` hook from React Native Paper

**Service Boundaries:**
- **API Services:** `src/services/api/*.ts` - HTTP communication only
- **Storage Service:** `src/services/storage.ts` - SecureStore wrapper
- **No business logic in services** - Pure data fetching/transformation

**Data Boundaries:**
- **Server State:** Managed by SWR hooks (`src/hooks/use*.ts`)
- **Local State:** Component useState for UI-only state
- **Global State:** AuthContext for session management
- **No prop drilling** - Use hooks to access server state

## Requirements to Structure Mapping

**Phase 1 Features → Structure:**

**1. Authentication (Login)**
- Screen: `src/app/index.tsx`
- Service: `src/services/api/auth.ts`
- Hook: `src/hooks/useAuth.ts`
- Context: `src/contexts/AuthContext.tsx`
- Storage: `src/services/storage.ts`
- Tests: `src/services/__tests__/auth.test.ts`, `src/hooks/__tests__/useAuth.test.ts`

**2. My Patients Dashboard**
- Screen: `src/app/(auth)/dashboard.tsx`
- Component: `src/components/PatientCard.tsx`
- Service: `src/services/api/patients.ts`
- Hook: `src/hooks/usePatients.ts`
- Types: `src/types/patient.ts`
- Tests: `src/components/__tests__/PatientCard.test.tsx`, `src/hooks/__tests__/usePatients.test.ts`

**3. Clinical Summary**
- Screen: `src/app/(auth)/patient/[id].tsx`
- Components:
  - `src/components/ClinicalSummaryCard.tsx`
  - `src/components/DemographicsCard.tsx`
  - `src/components/MedicationsCard.tsx`
  - `src/components/AllergiesCard.tsx`
  - `src/components/VitalsCard.tsx`
- Service: `src/services/api/clinical.ts`
- Hook: `src/hooks/useClinicalSummary.ts`
- Types: `src/types/clinical.ts`
- Tests: `src/components/__tests__/ClinicalSummaryCard.test.tsx`

**Cross-Cutting Concerns:**

**Theme System (OpenMRS O3 Branding)**
- Colors: `src/theme/colors.ts`
- Typography: `src/theme/typography.ts`
- Spacing: `src/theme/spacing.ts`
- Theme: `src/theme/theme.ts`
- Used by: All components via `useTheme()` hook

**Error Handling**
- Handler: `src/utils/errorHandler.ts`
- Used by: All SWR hooks via `onError` callback
- Display: `src/components/ErrorState.tsx`

**Loading States**
- Skeleton: `src/components/LoadingSkeleton.tsx`
- Used by: All screens during data fetching

**Empty States**
- Component: `src/components/EmptyState.tsx`
- Used by: Dashboard (no patients), Clinical Summary (no data)

## Integration Points

**Internal Communication:**

1. **Authentication Flow:**
   ```
   Login Screen → useAuth hook → auth service → API client
                                              ↓
                                        SecureStore (token)
                                              ↓
                                        AuthContext (state)
                                              ↓
                                        Dashboard Screen
   ```

2. **Data Fetching Flow:**
   ```
   Screen → Custom Hook (SWR) → API Service → API Client (Axios)
                                                    ↓
                                              OpenMRS API
                                                    ↓
                                          Transform (snake→camel)
                                                    ↓
                                              Return to Hook
                                                    ↓
                                              Render Component
   ```

3. **Navigation Flow:**
   ```
   Login → Dashboard → Patient Card tap → Clinical Summary
     ↓         ↓                               ↓
   router   router.push()              router.push('/patient/123')
   ```

**External Integrations:**

1. **OpenMRS REST API:**
   - Base URL: From environment config (`EXPO_PUBLIC_API_BASE_URL`)
   - Endpoints: `/session`, `/visit`, `/patient`, `/order`, `/allergy`, `/obs`
   - Authentication: Session token in Authorization header
   - Data format: JSON with snake_case fields

2. **Expo Services:**
   - SecureStore: Token storage (Android Keystore)
   - ScreenCapture: Screenshot prevention
   - Constants: Environment variable access
   - Router: File-based navigation

**Data Flow:**

```
OpenMRS API (snake_case JSON)
        ↓
API Service (transform to camelCase)
        ↓
SWR Hook (cache + revalidation)
        ↓
Screen Component (render)
        ↓
UI Components (display)
```

## File Organization Patterns

**Configuration Files (Root):**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `app.config.js` - Expo configuration with environment variables
- `.env.*` - Environment-specific variables
- `.eslintrc.js` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration

**Source Organization (`src/`):**
- `app/` - Expo Router file-based routes (screens)
- `components/` - Reusable UI components
- `services/` - API integration and storage
- `hooks/` - Custom React hooks (data fetching)
- `contexts/` - React contexts (global state)
- `theme/` - Design system tokens
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
- `config/` - App configuration

**Test Organization:**
- Colocated `__tests__/` folders next to source files
- Test files named `*.test.ts` or `*.test.tsx`
- Global mocks in root `__mocks__/` directory
- Test utilities in `src/utils/__tests__/`

**Asset Organization (`assets/`):**
- `images/` - App logo, illustrations
- `fonts/` - IBM Plex Sans font family
- `icons/` - Custom icons (if needed beyond Material icons)

## Development Workflow Integration

**Development Server Structure:**
- Entry point: `src/app/_layout.tsx`
- Expo CLI starts Metro bundler
- Hot reload enabled for all `src/` files
- Environment variables loaded from `.env.development`

**Build Process Structure:**
- Metro bundler compiles TypeScript → JavaScript
- Assets bundled from `assets/` directory
- Environment-specific builds use corresponding `.env.*` file
- Output: Android APK or iOS IPA via EAS Build

**Deployment Structure:**
- Development: Expo Go app via QR code
- Staging: EAS Build with `.env.staging`
- Production: EAS Build with `.env.production` → Google Play Store

