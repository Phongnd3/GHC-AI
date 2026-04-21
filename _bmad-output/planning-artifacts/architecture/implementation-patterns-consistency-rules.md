# Implementation Patterns & Consistency Rules

## Pattern Categories Defined

**Critical Conflict Points Identified:** 28 areas where AI agents could make different choices

**Patterns Established:** 7 core pattern categories to ensure consistency

## Naming Patterns

**File & Component Naming:**
- **Components:** PascalCase (e.g., `LoginScreen.tsx`, `CheckInButton.tsx`)
- **Utilities/Helpers:** kebab-case (e.g., `api-client.ts`, `date-utils.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useCheckIn.ts`, `useAuth.ts`)
- **Types:** PascalCase (e.g., `Patient.ts`, `Appointment.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)

**Variable & Function Naming:**
- **Variables:** camelCase (e.g., `patientId`, `appointmentData`)
- **Functions:** camelCase (e.g., `checkInPatient`, `fetchAppointments`)
- **Boolean variables:** Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)
- **Event handlers:** Prefix with `handle` (e.g., `handleCheckIn`, `handleLogin`)

## Structure Patterns

**Project Organization: By Feature (Domain-Driven)**

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── appointments/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── check-in/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
├── components/
│   └── shared/          # Shared components across features
├── utils/
│   └── shared/          # Shared utilities
├── api/
│   ├── client.ts        # Axios instance configuration
│   └── query-keys.ts    # Centralized TanStack Query keys
├── store/               # Zustand stores
└── types/
    └── shared/          # Shared type definitions
```

**Test File Location:**
- Co-located with source files: `LoginScreen.test.tsx` next to `LoginScreen.tsx`
- Test utilities: `src/utils/test/` (e.g., `test-utils.tsx`, `mock-data.ts`)

**Asset Organization:**
- Images: `assets/images/`
- Icons: Use `@expo/vector-icons` or React Native Paper icons
- Fonts: `assets/fonts/`

## Format Patterns

**API Response Format: TanStack Query Native**
- **No custom wrapper** - API client returns raw OpenMRS data
- **TanStack Query provides structure:** `{ data, error, isLoading, isSuccess }`
- **Error handling:** Via TanStack Query's `error` property
- **Example:**
  ```typescript
  const { data: appointment, error, isLoading } = useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => api.get(`/appointment/${id}`)
  });
  ```

**TypeScript Type Definitions:**
- **Entities (data models):** Use `interface`
  ```typescript
  interface Patient {
    uuid: string;
    name: string;
    identifiers: PatientIdentifier[];
  }
  ```
- **Utility types:** Use `type`
  ```typescript
  type CheckInStatus = 'idle' | 'loading' | 'success' | 'error';
  type ApiError = { message: string; code: string; retryable: boolean };
  ```

**Date/Time Format:**
- **Library:** date-fns for all date operations
- **API Format:** ISO 8601 strings with timezone (e.g., `"2026-04-21T10:19:12.162+07:00"`)
- **Display Format:** Localized using date-fns `format()`
- **Timezone Handling:** Server timezone (Africa/Nairobi) for API calls
- **Example:**
  ```typescript
  import { formatISO, parseISO, format } from 'date-fns';
  
  // To API
  const apiTimestamp = formatISO(new Date());
  
  // From API
  const date = parseISO(response.startDateTime);
  
  // Display to user
  const displayTime = format(date, 'h:mm a'); // "9:00 AM"
  ```

## Communication Patterns

**TanStack Query Key Naming: Factory Functions**
- **Centralized:** All query keys in `src/api/query-keys.ts`
- **Format:** Array-based with `as const` for type safety
- **Implementation:**
  ```typescript
  // src/api/query-keys.ts
  export const queryKeys = {
    appointment: (id: string) => ['appointment', id] as const,
    appointments: (patientId: string, date: string) => ['appointments', patientId, date] as const,
    activeVisit: (patientId: string) => ['visit', 'active', patientId] as const,
    patient: (id: string) => ['patient', id] as const,
    queueEntry: (visitId: string) => ['queue-entry', visitId] as const,
  };
  ```
- **Usage:**
  ```typescript
  const { data } = useQuery({
    queryKey: queryKeys.appointment(appointmentId),
    queryFn: () => fetchAppointment(appointmentId)
  });
  ```

**Zustand Store Structure:**
- **One store per feature** (e.g., `useAuthStore`, `useCheckInStore`)
- **Store location:** `src/features/{feature}/store/`
- **Pattern:**
  ```typescript
  interface AuthStore {
    // State
    sessionToken: string | null;
    patientUuid: string | null;
    
    // Actions
    setSession: (token: string, patientUuid: string) => void;
    clearSession: () => void;
  }
  
  export const useAuthStore = create<AuthStore>((set) => ({
    sessionToken: null,
    patientUuid: null,
    setSession: (token, patientUuid) => set({ sessionToken: token, patientUuid }),
    clearSession: () => set({ sessionToken: null, patientUuid: null }),
  }));
  ```

**Navigation Parameter Passing:**
- **Type-safe params:** Define route params in types file
- **Pattern:**
  ```typescript
  // src/types/navigation.ts
  export type RootStackParamList = {
    Login: undefined;
    Dashboard: { patientId: string };
    CheckIn: { appointmentId: string };
    Success: { queueNumber: string };
  };
  
  // Usage
  navigation.navigate('CheckIn', { appointmentId: '123' });
  ```

## Process Patterns

**Error Handling Pattern:**
- **Standardized error structure:**
  ```typescript
  type AppError = {
    type: 'network' | 'auth' | 'business' | 'server';
    message: string;
    code?: string;
    retryable: boolean;
  };
  ```
- **TanStack Query retry logic:**
  ```typescript
  const mutation = useMutation({
    mutationFn: checkInWorkflow,
    retry: (failureCount, error) => {
      if (error.type === 'network' || error.type === 'server') {
        return failureCount < 3;
      }
      return false;
    },
    onError: (error) => {
      logger.error(error);
      showErrorMessage(error);
    }
  });
  ```
- **User-facing error messages:** See Decision 7 error handling table

**Logging Pattern:**
- **Centralized logger:** `src/utils/logger.ts`
- **Implementation:**
  ```typescript
  export const logger = {
    // Backend audit trail (HIPAA compliant)
    audit: (event: AuditEvent) => api.post('/audit-log', event),
    
    // Local performance logging
    performance: (metric: PerformanceMetric) => {
      console.log('[Performance]', metric);
      // Store locally for analysis
    },
    
    // Error logging
    error: (error: AppError) => {
      console.error('[Error]', error);
      if (error.type === 'server') {
        logger.audit({ type: 'error', ...error });
      }
    }
  };
  ```

**Loading State Pattern:**
- **TanStack Query provides:** `isLoading`, `isFetching`, `isRefetching`
- **Use appropriate state:**
  - `isLoading`: Initial load (show full-screen spinner)
  - `isFetching`: Background refetch (show subtle indicator)
  - `isRefetching`: Pull-to-refresh (show refresh indicator)
- **Optimistic updates:**
  ```typescript
  const mutation = useMutation({
    mutationFn: updateAppointment,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.appointment(id) });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.appointment(id));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.appointment(id), newData);
      
      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.appointment(id), context.previous);
    }
  });
  ```

## Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow naming conventions** - PascalCase for components, kebab-case for utilities, camelCase for functions/variables
2. **Organize by feature** - Place all related code in feature folder, shared code in `shared/`
3. **Use centralized query keys** - Import from `query-keys.ts`, never hardcode keys
4. **Use date-fns for dates** - ISO 8601 for API, localized format for display
5. **Use interface for entities, type for utilities** - Clear semantic distinction
6. **Handle errors consistently** - Use standardized `AppError` type and logger utility
7. **Co-locate tests** - Test files next to source files with `.test.tsx` extension
8. **Use TanStack Query native structure** - No custom API response wrappers
9. **Log audit events** - Use `logger.audit()` for HIPAA-compliant backend logging
10. **Type navigation params** - Define route params in `types/navigation.ts`

**Pattern Enforcement:**

- **Code review checklist:** Verify patterns followed before merging
- **ESLint rules:** Configure linting to enforce naming conventions
- **TypeScript strict mode:** Catch type inconsistencies at compile time
- **Pattern violations:** Document in PR comments, update patterns if needed

**Process for updating patterns:**

1. Identify pattern conflict or improvement
2. Discuss with team and document rationale
3. Update this architecture document
4. Communicate changes to all AI agents via updated context
5. Refactor existing code to match new pattern (if breaking change)

## Pattern Examples

**Good Examples:**

```typescript
// ✅ Feature organization
src/features/check-in/components/CheckInButton.tsx
src/features/check-in/hooks/useCheckIn.ts
src/features/check-in/api/check-in-api.ts
src/features/check-in/types/CheckIn.ts

// ✅ Query key usage
const { data } = useQuery({
  queryKey: queryKeys.appointments(patientId, today),
  queryFn: () => fetchAppointments(patientId, today)
});

// ✅ Error handling
try {
  await checkInMutation.mutateAsync();
} catch (error) {
  logger.error({
    type: 'business',
    message: 'Check-in failed',
    code: error.code,
    retryable: false
  });
}

// ✅ Date formatting
const displayDate = format(parseISO(appointment.startDateTime), 'MMM d, h:mm a');
// "Apr 21, 9:00 AM"

// ✅ Type definitions
interface Appointment {
  uuid: string;
  status: AppointmentStatus;
  startDateTime: string;
}

type AppointmentStatus = 'Scheduled' | 'CheckedIn' | 'Completed' | 'Cancelled';
```

**Anti-Patterns (Avoid):**

```typescript
// ❌ Wrong file naming
src/features/check-in/components/check-in-button.tsx  // Should be CheckInButton.tsx
src/features/check-in/hooks/UseCheckIn.ts  // Should be useCheckIn.ts

// ❌ Hardcoded query keys
const { data } = useQuery({
  queryKey: ['appointment', id],  // Should use queryKeys.appointment(id)
  queryFn: () => fetchAppointment(id)
});

// ❌ Custom API wrapper
const response = await api.get('/appointment/123');
return { data: response, error: null };  // Don't wrap, return raw data

// ❌ Inconsistent date handling
const timestamp = Date.now();  // Use formatISO(new Date()) instead
const date = new Date(response.date);  // Use parseISO() instead

// ❌ Type vs Interface confusion
type Patient = { uuid: string };  // Should be interface for entities
interface CheckInStatus = 'idle' | 'loading';  // Should be type for unions

// ❌ Scattered error handling
console.error(error);  // Use logger.error() instead
throw new Error('Failed');  // Use AppError type instead
```


---
