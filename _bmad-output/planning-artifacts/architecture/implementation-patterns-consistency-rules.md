# Implementation Patterns & Consistency Rules

## Pattern Categories Defined

**Critical Conflict Points Identified:** 15 areas where AI agents could make different choices without explicit patterns

**Purpose:** These patterns ensure multiple AI agents write compatible, consistent code that works together seamlessly.

## Naming Patterns

**Component & File Naming:**

- **Components:** PascalCase files with PascalCase exports
  - ✅ `PatientCard.tsx` exports `PatientCard`
  - ❌ `patient-card.tsx` or `patientCard.tsx`

- **Screens/Routes:** lowercase for Expo Router convention
  - ✅ `dashboard.tsx`, `index.tsx`
  - ✅ `[id].tsx` for dynamic routes
  - ❌ `Dashboard.tsx` in app/ directory

- **Hooks:** camelCase with `use` prefix
  - ✅ `useAuth.ts` exports `useAuth`
  - ❌ `use-auth.ts` or `UseAuth.ts`

- **Utils/Services:** camelCase files
  - ✅ `errorHandler.ts` exports `mapErrorToUserMessage`
  - ❌ `error-handler.ts` or `ErrorHandler.ts`

**TypeScript Naming:**

- **Types/Interfaces:** PascalCase, no prefix
  - ✅ `type Patient = {...}`
  - ✅ `interface ClinicalSummary {...}`
  - ❌ `IPatient`, `PatientType`, `TPatient`

- **Enums:** PascalCase
  - ✅ `enum ErrorType { Network, Auth, Server }`
  - ❌ `ERROR_TYPE` or `errorType`

- **Constants:** UPPER_SNAKE_CASE
  - ✅ `const API_TIMEOUT = 10000;`
  - ✅ `const SESSION_TIMEOUT_MS = 1800000;`
  - ❌ `const apiTimeout` or `const API-TIMEOUT`

- **Variables/Functions:** camelCase
  - ✅ `const patientData = ...`
  - ✅ `function getPatientList() {...}`
  - ❌ `patient_data` or `get_patient_list`

**API Naming:**

- **Endpoints:** Plural nouns, lowercase
  - ✅ `/patients`, `/visits`, `/observations`
  - ❌ `/patient`, `/Patient`, `/getPatients`

- **Query Parameters:** camelCase
  - ✅ `?patientId=123&includeInactive=false`
  - ❌ `?patient_id` or `?PatientId`

- **Path Parameters:** camelCase in code, kebab-case in URLs
  - ✅ `/patient/[id].tsx` → `/patient/123`
  - ✅ `const { id } = useLocalSearchParams();`

## Structure Patterns

**Test Organization:**

- **Location:** Colocated `__tests__/` folders next to source
  - ✅ `src/components/__tests__/PatientCard.test.tsx`
  - ✅ `src/services/__tests__/auth.test.ts`
  - ❌ Separate `tests/` directory at root

- **Test File Naming:** `*.test.ts` or `*.test.tsx`
  - ✅ `PatientCard.test.tsx`
  - ❌ `PatientCard.spec.tsx` or `test-PatientCard.tsx`

- **Mock Files:** `__mocks__/` folders next to source
  - ✅ `src/services/__mocks__/api.ts`

**Import Organization:**

**Import Order (enforced by ESLint):**
1. React/React Native imports
2. Third-party libraries (alphabetical)
3. Absolute imports using aliases (`@/components`, `@/services`)
4. Relative imports (`./`, `../`)
5. Type imports (last, with `type` keyword)

```typescript
// ✅ Correct import order
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { getPatientList } from '@/services/api/patients';
import { PatientCard } from './PatientCard';
import type { Patient } from '@/types/patient';
import type { ClinicalSummary } from '@/types/clinical';

// ❌ Wrong - mixed order
import { PatientCard } from './PatientCard';
import React from 'react';
import type { Patient } from '@/types/patient';
import { Card } from 'react-native-paper';
```

**Component Organization:**

- **Export Pattern:**
  - Named exports for reusable components
    - ✅ `export const PatientCard = () => {...}`
  - Default exports for screens/routes
    - ✅ `export default function Dashboard() {...}`

- **Component Structure:**
  ```typescript
  // 1. Imports
  // 2. Types/Interfaces
  // 3. Constants
  // 4. Component definition
  // 5. Styles (if using StyleSheet)
  
  import React from 'react';
  import { View, StyleSheet } from 'react-native';
  
  interface PatientCardProps {
    patient: Patient;
    onPress: () => void;
  }
  
  const CARD_HEIGHT = 88;
  
  export const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
    return <View style={styles.container}>...</View>;
  };
  
  const styles = StyleSheet.create({
    container: { height: CARD_HEIGHT },
  });
  ```

**File Organization:**

- **Index Files:** Avoid barrel exports (performance)
  - ❌ `components/index.ts` that re-exports everything
  - ✅ Direct imports: `import { PatientCard } from '@/components/PatientCard'`

- **Folder Naming:** camelCase for feature folders
  - ✅ `src/components/patientCard/`
  - ❌ `src/components/patient-card/` or `src/components/PatientCard/`

## Format Patterns

**API Response Format:**

- **Success Response:** Direct data, no wrapper
  ```typescript
  // ✅ OpenMRS returns direct data
  {
    uuid: '123',
    display: 'John Smith',
    person: { age: 45, gender: 'M' }
  }
  
  // ❌ Don't wrap in custom structure
  {
    data: { uuid: '123', ... },
    success: true,
    timestamp: '...'
  }
  ```

- **Error Response:** Axios error structure (handled by errorHandler)
  ```typescript
  // Axios provides this structure
  {
    response: {
      status: 401,
      data: { error: { message: '...' } }
    }
  }
  ```

**Date/Time Format:**

- **API Communication:** ISO 8601 strings (OpenMRS standard)
  - ✅ `"2026-04-22T08:30:00.000Z"`
  - ❌ Unix timestamps: `1713758400000`
  - ❌ Custom formats: `"04/22/2026"`

- **Display to Users:** Localized format via date-fns
  - ✅ `format(new Date(isoString), 'MMM dd, yyyy HH:mm')`
  - ✅ "Apr 22, 2026 08:30"
  - ❌ Raw ISO strings in UI

- **Relative Time:** Use date-fns for "2 minutes ago"
  - ✅ `formatDistanceToNow(date, { addSuffix: true })`

**JSON Field Naming:**

- **API Responses (OpenMRS):** snake_case
  - ✅ `{ patient_id: '123', first_name: 'John', date_of_birth: '...' }`

- **TypeScript Code:** camelCase
  - ✅ `{ patientId: '123', firstName: 'John', dateOfBirth: '...' }`

- **Transformation:** Map at API service boundary
  ```typescript
  // ✅ Transform in services/api/patients.ts
  export async function getPatient(id: string): Promise<Patient> {
    const response = await apiClient.get(`/patient/${id}`);
    return {
      patientId: response.data.patient_id,
      firstName: response.data.first_name,
      // ... map all fields
    };
  }
  
  // ❌ Don't transform in components
  ```

**Boolean Representations:**

- **TypeScript:** `true` / `false`
- **API:** `true` / `false` (JSON standard)
- ❌ Never use `1` / `0` or `"true"` / `"false"` strings

**Null Handling:**

- **TypeScript:** Use `null` for intentional absence, `undefined` for uninitialized
  - ✅ `allergies: null` (patient has no allergies - known state)
  - ✅ `allergies: undefined` (allergies not loaded yet)
  - ❌ Mixing null and undefined for same purpose

## Communication Patterns

**SWR Data Fetching:**

- **Hook Pattern:** One hook per data source
  ```typescript
  // ✅ Dedicated hooks
  export function usePatients() {
    return useSWR('/patients', fetcher, {
      dedupingInterval: 300000, // 5-min cache
    });
  }
  
  export function useClinicalSummary(patientId: string) {
    return useSWR(`/patient/${patientId}/clinical`, fetcher, {
      dedupingInterval: 0, // No cache
    });
  }
  
  // ❌ Don't use useSWR directly in components
  const { data } = useSWR('/patients', fetcher); // Wrong
  ```

- **Cache Strategy:**
  - Patient list: 5-min cache (`dedupingInterval: 300000`)
  - Clinical data: No cache (`dedupingInterval: 0`)
  - Revalidate on focus: `true` for all

**State Management:**

- **Local State:** `useState` for component-specific state
  - ✅ Form inputs, UI toggles, local loading states

- **Shared State:** React Context for app-wide state
  - ✅ AuthContext for session management
  - ❌ Don't use Context for data fetching (use SWR)

- **Server State:** SWR for all API data
  - ✅ Patient lists, clinical summaries, all OpenMRS data
  - ❌ Don't store API data in useState or Context

**Navigation Pattern:**

- **Stack Navigation:** `router.push()`
  - ✅ `router.push('/patient/123')` - adds to stack
  - Use for: Dashboard → Clinical Summary

- **Replace Navigation:** `router.replace()`
  - ✅ `router.replace('/')` - replaces current screen
  - Use for: Logout → Login, Auth redirects

- **Back Navigation:** Android back button (automatic)
  - ✅ Expo Router handles back button automatically
  - ❌ Don't implement custom back button logic

## Process Patterns

**Error Handling:**

- **Pattern:** Centralized error handler + SWR error handling
  ```typescript
  // ✅ All API errors go through errorHandler
  const { data, error } = useSWR('/patients', fetcher, {
    onError: (err) => {
      const message = mapErrorToUserMessage(err);
      // Show Snackbar with message
    }
  });
  
  // ❌ Don't handle errors in components
  try {
    const data = await fetch('/patients');
  } catch (error) {
    alert('Error!'); // Wrong
  }
  ```

- **User Messages:** Always user-friendly, never raw errors
  - ✅ "No internet connection. Please check your WiFi."
  - ✅ "Session expired. Please log in again."
  - ❌ "Network Error: ECONNREFUSED"
  - ❌ "AxiosError: Request failed with status code 401"

- **Error Display:** React Native Paper Snackbar
  - ✅ `<Snackbar visible={!!error} onDismiss={...}>{errorMessage}</Snackbar>`
  - ❌ `alert()` or custom error modals

**Loading States:**

- **Pattern:** SWR loading states + skeleton screens
  ```typescript
  const { data, isLoading, error } = useSWR('/patients', fetcher);
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState />;
  
  return <PatientList patients={data} />;
  ```

- **No Global Loading:** Each screen manages its own loading state
  - ✅ Per-screen loading skeletons
  - ❌ Global loading spinner that blocks entire app

- **Skeleton Screens:** Use for < 2s loads
  - ✅ Show skeleton cards while loading patient list
  - ❌ Blank screen or spinner

**Theme Usage:**

- **Pattern:** Always use theme tokens, never hardcoded values
  ```typescript
  // ✅ Use theme
  import { useTheme } from 'react-native-paper';
  import { Spacing } from '@/theme/spacing';
  
  const theme = useTheme();
  
  <View style={{
    backgroundColor: theme.colors.surface,
    padding: Spacing.xl,
    borderColor: theme.colors.outline,
  }}>
  
  // ❌ Hardcoded values
  <View style={{
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderColor: '#e0e0e0',
  }}>
  ```

- **Color Usage:**
  - Primary actions: `theme.colors.primary`
  - Backgrounds: `theme.colors.background`, `theme.colors.surface`
  - Text: `theme.colors.onSurface`, `theme.colors.onBackground`
  - Errors: `theme.colors.error`
  - Clinical colors: Import from `@/theme/colors`

**Authentication Flow:**

- **Pattern:** AuthContext + SecureStore + Axios interceptors
  ```typescript
  // ✅ Login flow
  1. User submits credentials
  2. Call auth.login() service
  3. Store token in SecureStore
  4. Update AuthContext state
  5. Start 30-min timer
  6. Navigate to dashboard
  
  // ✅ Auto-logout flow
  1. 30-min timer expires OR 401 error
  2. Clear SecureStore
  3. Reset AuthContext
  4. Navigate to login
  
  // ❌ Don't store tokens in AsyncStorage or state
  ```

## Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow naming conventions exactly** - No variations in file, component, or variable naming
2. **Use theme tokens exclusively** - Zero hardcoded colors, spacing, or typography values
3. **Transform API data at service boundary** - snake_case → camelCase in services, not components
4. **Colocate tests** - `__tests__/` folders next to source files, not separate test directories
5. **Use centralized error handling** - All errors through `errorHandler.ts`, no inline error messages
6. **Import in correct order** - React → Third-party → Absolute → Relative → Types
7. **Use SWR for all data fetching** - No direct fetch/axios calls in components
8. **Follow cache strategy** - 5-min for patient list, 0 for clinical data
9. **Use Expo Router navigation** - `router.push()` / `router.replace()`, no manual navigation
10. **Implement loading skeletons** - No blank screens or global spinners

**Pattern Verification:**

- **Pre-commit:** ESLint catches naming, import order, and code style violations
- **Code Review:** Check for hardcoded values, incorrect patterns
- **Testing:** Verify API transformations, error handling, navigation flows

**Pattern Violations:**

- **Document in:** GitHub issues or PR comments
- **Fix immediately:** Patterns are non-negotiable for consistency
- **Update patterns:** Only through architecture document updates

## Pattern Examples

**Good Example - Patient Card Component:**

```typescript
// ✅ Correct pattern usage
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import type { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const theme = useTheme();
  
  const handlePress = () => {
    router.push(`/patient/${patient.patientId}`);
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>
            {patient.firstName} {patient.lastName}
          </Text>
          <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>
            ID: {patient.patientId} • {patient.age}y • {patient.gender}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.xl,
  },
  content: {
    gap: Spacing.sm,
  },
  name: {
    ...Typography.titleLarge,
  },
  details: {
    ...Typography.bodyMedium,
  },
});
```

**Anti-Pattern Examples:**

```typescript
// ❌ Wrong - Multiple violations
import { Patient } from '@/types/patient'; // Type import should be last
import React from 'react'; // React should be first
import { Card } from 'react-native-paper';

export default function patient_card({ patient }) { // Wrong naming
  return (
    <Card style={{ 
      backgroundColor: '#f4f4f4', // Hardcoded color
      padding: 16, // Hardcoded spacing
    }}>
      <Text style={{ fontSize: 22 }}> // Hardcoded typography
        {patient.first_name} // Wrong - should use camelCase
      </Text>
    </Card>
  );
}
```

**Good Example - API Service:**

```typescript
// ✅ Correct API service pattern
import { apiClient } from './client';
import type { Patient, ClinicalSummary } from '@/types/patient';

export async function getPatientList(providerId: string): Promise<Patient[]> {
  const response = await apiClient.get('/visit', {
    params: { provider: providerId, includeInactive: false },
  });
  
  // Transform snake_case → camelCase at boundary
  return response.data.results.map((visit: any) => ({
    patientId: visit.patient.uuid,
    firstName: visit.patient.person.given_name,
    lastName: visit.patient.person.family_name,
    age: visit.patient.person.age,
    gender: visit.patient.person.gender,
  }));
}

export async function getClinicalSummary(patientId: string): Promise<ClinicalSummary> {
  const [patient, medications, allergies, vitals] = await Promise.all([
    apiClient.get(`/patient/${patientId}`),
    apiClient.get(`/order`, { params: { patient: patientId, status: 'ACTIVE' } }),
    apiClient.get(`/patient/${patientId}/allergy`),
    apiClient.get(`/obs`, { params: { patient: patientId, limit: 3 } }),
  ]);
  
  return {
    demographics: transformDemographics(patient.data),
    medications: transformMedications(medications.data),
    allergies: transformAllergies(allergies.data),
    vitals: transformVitals(vitals.data),
  };
}
```

**Anti-Pattern - API Service:**

```typescript
// ❌ Wrong - Multiple violations
export const GetPatients = async (provider_id) => { // Wrong naming
  const response = await fetch('http://localhost:8080/openmrs/ws/rest/v1/visit'); // Hardcoded URL
  const data = await response.json();
  return data; // No transformation - returns snake_case
};
```

