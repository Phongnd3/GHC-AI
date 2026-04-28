# Story 3.4: Navigate to Patient Clinical Summary

Status: review

## Story

As a doctor,
I want to tap on a patient card to view their clinical information,
So that I can access detailed patient data for clinical decision-making.

---

## Acceptance Criteria

**AC1.**
**Given** I am viewing the My Patients dashboard with patient cards
**When** I tap on any patient card
**Then** I am navigated to the Clinical Summary screen for that patient
**And** The patient's UUID is passed to the Clinical Summary screen
**And** A ripple effect appears on the card when tapped

---

## ⚠️ PRE-IMPLEMENTATION NOTICE

**Partial implementation already exists from Story 3.1.**

`dashboard.tsx` already wires `PatientCard.onPress` to `router.push`:
```tsx
<PatientCard
  patient={item}
  onPress={() => router.push(`/patient/${item.patientUuid}` as never)}
/>
```

`PatientCard.tsx` already uses `Card` from react-native-paper with `onPress`, which provides a ripple effect automatically — no additional work needed for the ripple AC.

**What remains:**
1. Create the **navigation destination** — `src/app/(auth)/patient/[id].tsx` (does not exist yet)
2. **Remove the `as never` cast** in `dashboard.tsx` now that the typed route exists
3. Add **navigation test** to `dashboard.test.tsx` verifying `router.push` is called with the correct UUID
4. Add **tests** for the new `[id].tsx` screen

---

## Tasks / Subtasks

- [x] Task 1: Create placeholder Clinical Summary screen `[id].tsx` (AC: #1)
  - [x] Create new file: `src/app/(auth)/patient/[id].tsx`
  - [x] Import `useLocalSearchParams` and `Stack` from `expo-router`
  - [x] Import `View`, `StyleSheet` from `react-native` and `Text` from `react-native-paper`
  - [x] Use `useLocalSearchParams<{ id: string }>()` to extract the `id` route parameter — this is the `patientUuid` passed by `dashboard.tsx`
  - [x] Render a `Stack.Screen` with `options={{ headerShown: true, title: 'Clinical Summary' }}`
  - [x] Render the `id` value so the screen is testable and the UUID is visually confirmed as received
  - [x] **Default export** the component as `PatientScreen` (function name) — screens in Expo Router use default exports
  - [x] This is a **placeholder** — full clinical data display is deferred to Epic 4. Do NOT implement SWR hooks, API calls, or clinical data rendering yet.
  - [ ] Exact implementation:
    ```tsx
    import React from 'react';
    import { View, StyleSheet } from 'react-native';
    import { Stack, useLocalSearchParams } from 'expo-router';
    import { Text } from 'react-native-paper';
    import { Spacing } from '@/theme/spacing';

    export default function PatientScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();

      return (
        <>
          <Stack.Screen
            options={{
              headerShown: true,
              title: 'Clinical Summary',
            }}
          />
          <View style={styles.container}>
            <Text variant="bodyMedium">{id}</Text>
          </View>
        </>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: Spacing.md,
      },
    });
    ```

- [x] Task 2: Create tests for `[id].tsx` (AC: #1)
  - [x] Create new file: `src/app/(auth)/patient/__tests__/[id].test.tsx`
  - [x] Mock `expo-router` with `useLocalSearchParams` returning `{ id: 'patient-uuid-1' }` and `Stack.Screen` as `() => null`
  - [x] Mock `react-native-paper` with a minimal `Text` component
  - [x] Add test: `renders the patient UUID from route params` — verify `getByText('patient-uuid-1')` is truthy
  - [x] Add test: `calls useLocalSearchParams to read id` — verify `useLocalSearchParams` was called
  - [ ] Example test file:
    ```tsx
    import React from 'react';
    import { render } from '@testing-library/react-native';
    import PatientScreen from '../[id]';

    jest.mock('expo-router', () => ({
      useLocalSearchParams: jest.fn(() => ({ id: 'patient-uuid-1' })),
      Stack: {
        Screen: () => null,
      },
    }));

    jest.mock('react-native-paper', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RN = require('react-native');
      return {
        Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
          <RN.Text {...rest}>{children}</RN.Text>
        ),
        useTheme: () => ({ colors: {} }),
      };
    });

    describe('PatientScreen', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useLocalSearchParams } = require('expo-router');
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'patient-uuid-1' });
      });

      it('renders the patient UUID from route params', () => {
        const { getByText } = render(<PatientScreen />);
        expect(getByText('patient-uuid-1')).toBeTruthy();
      });

      it('calls useLocalSearchParams to read id param', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useLocalSearchParams } = require('expo-router');
        render(<PatientScreen />);
        expect(useLocalSearchParams).toHaveBeenCalled();
      });
    });
    ```

- [x] Task 3: Remove `as never` cast in `dashboard.tsx` (AC: #1)
  - [x] Open `src/app/(auth)/dashboard.tsx`, line 94:
    ```tsx
    onPress={() => router.push(`/patient/${item.patientUuid}` as never)}
    ```
  - [x] With `[id].tsx` now existing and `typedRoutes: true` in `app.config.js`, Expo Router generates types for `/patient/[id]`. The `as never` cast is no longer needed.
  - [x] Attempt: change to `router.push(`/patient/${item.patientUuid}`)` without cast
  - [x] Run `npx tsc --noEmit` to check for TypeScript errors
  - [x] **If TypeScript passes cleanly** → keep the change (no cast) — TypeScript passed cleanly ✅
  - [x] Run all tests after this change to confirm no regressions

- [x] Task 4: Add navigation test to `dashboard.test.tsx` (AC: #1)
  - [ ] Add new test to the `describe('DashboardScreen - patient list', ...)` block:
    ```typescript
    it('navigates to clinical summary when patient card is tapped', () => {
      (usePatients as jest.Mock).mockReturnValue({
        ...defaultPatientsResult,
        patients: [
          {
            patientUuid: 'patient-uuid-1',
            displayName: 'John Doe',
            patientId: 'MRN-001',
            age: '44y',
            gender: 'M',
            ward: 'Ward A',
            visitUuid: 'visit-uuid-1',
          },
        ],
      });

      const { getByText } = render(<DashboardScreen />);
      fireEvent.press(getByText('John Doe'));

      expect(router.push).toHaveBeenCalledWith('/patient/patient-uuid-1');
    });
    ```
  - [x] Note: `router.push` is already mocked in the expo-router mock at the top of `dashboard.test.tsx` as `jest.fn()`. It is cleared in `beforeEach` via `jest.clearAllMocks()` so the mock is clean for each test.
  - [x] `fireEvent.press(getByText('John Doe'))` works because: the `Card` mock in `dashboard.test.tsx` renders a `View` with `{...rest}` (which includes `onPress`). RNTL's `fireEvent.press` bubbles up to the element with `onPress`.
  - [x] The test verifies `router.push` was called with the exact string `/patient/patient-uuid-1` (not with `as never`, which is a compile-time type cast that vanishes at runtime).
  - [x] Run `npx jest --no-coverage` — 182 tests pass (179 prior + 2 new `[id].test.tsx` + 1 new navigation test) ✅

---

## Dev Notes

### File Map

| File | Change Type | Notes |
|------|------------|-------|
| `src/app/(auth)/patient/[id].tsx` | NEW | Placeholder Clinical Summary screen; reads `id` param |
| `src/app/(auth)/patient/__tests__/[id].test.tsx` | NEW | 2 tests for `[id].tsx` |
| `src/app/(auth)/__tests__/dashboard.test.tsx` | UPDATE | Add 1 new navigation test |
| `src/app/(auth)/dashboard.tsx` | UPDATE (conditional) | Remove `as never` cast if TypeScript allows |

### Why `[id].tsx` Is a Placeholder

Story 3.4 only covers **navigation** — getting the patient UUID to the Clinical Summary screen. The clinical data (medications, allergies, vitals, observations) is Epic 4's scope. The `[id].tsx` screen shows the UUID as a sanity check that routing works, nothing more.

Do NOT implement in this story:
- `useClinicalSummary` hook
- API calls to `/patient/{id}`, `/obs`, `/order`, `/allergy`
- `ClinicalSummaryCard`, `MedicationsCard`, `AllergiesCard`, `VitalsCard` components
- Any clinical data rendering

### Expo Router: File-Based Routing & `[id].tsx`

Expo Router uses file-based routing with `src/` as root (configured in `app.config.js: router.root: 'src'`).

| File Path | Route |
|-----------|-------|
| `src/app/index.tsx` | `/` (login) |
| `src/app/(auth)/dashboard.tsx` | `/dashboard` |
| `src/app/(auth)/patient/[id].tsx` | `/patient/:id` |

The `(auth)` folder is a **route group** — it applies `_layout.tsx` (session check + screenshot prevention) to all screens inside it without adding to the URL path. So `/patient/someUuid` is protected by the auth layout.

`useLocalSearchParams<{ id: string }>()` reads the `:id` segment. When `dashboard.tsx` calls `router.push('/patient/patient-uuid-abc')`, Expo Router matches the `[id].tsx` file and passes `{ id: 'patient-uuid-abc' }` as the search params.

### `typedRoutes: true` and the `as never` Cast

`app.config.js` has `experiments: { typedRoutes: true }`. Expo Router generates route types into `.expo/types/router.d.ts` during Expo's build/dev server startup. In Jest (unit tests), this file is NOT regenerated automatically — tests use the generated types from the last build.

**Consequence for `as never`:**
- Before `[id].tsx` exists: `/patient/${id}` is an unrecognized route → TypeScript error → `as never` is the workaround used in Story 3.1
- After `[id].tsx` exists: once types are regenerated, `/patient/${id}` is a valid `Href` → `as never` is no longer needed

**In practice for this story:**
- Creating `[id].tsx` is the prerequisite
- Running `npx tsc --noEmit` verifies TypeScript is happy
- If `.expo/types/router.d.ts` has not been regenerated (common in CI/test-only runs), `as never` may still be needed in tests. In that case, use `as never` with a TODO comment.

### Ripple Effect: Already Provided

The `PatientCard.tsx` uses `Card` from react-native-paper with `onPress`. React Native Paper's `Card` component implements ripple via Android's native `Ripple` drawable and iOS's highlight opacity — this is built-in to `Card` when `onPress` is provided. No additional code is needed to satisfy AC1 "A ripple effect appears on the card when tapped."

Evidence: `PatientCard.tsx` line 13: `<Card mode="elevated" style={styles.card} onPress={onPress}>`

### Testing: `[id].test.tsx` File Name

The test file `src/app/(auth)/patient/__tests__/[id].test.tsx` has `[` and `]` in the name. Jest on Windows handles this correctly — the brackets are part of the Expo Router convention and Jest's `testMatch` glob pattern `**/__tests__/**/*.[jt]s?(x)` matches any character after `__tests__/` regardless of brackets.

### Testing: `router.push` Mock in Dashboard Tests

The existing `expo-router` mock in `dashboard.test.tsx` includes:
```typescript
router: {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
},
```

`jest.clearAllMocks()` is called in `beforeEach` of each `describe` block, so `router.push.mock.calls` is clean for each test. The new navigation test simply calls `render` + `fireEvent.press` and then asserts `router.push` was called with the expected path string.

**Important:** The test does NOT check for `as never` — it checks the runtime string `'/patient/patient-uuid-1'`. The `as never` cast only affects TypeScript's type checking, not the runtime value of the argument passed to `router.push`.

### Architecture Compliance

| Requirement | Source | Status |
|---|---|---|
| Expo Router file-based routing | `project-structure-boundaries.md` | ✅ `[id].tsx` in correct location |
| Named exports for components | `implementation-patterns-consistency-rules.md` | N/A — screens use default exports |
| Default export for screens | `implementation-patterns-consistency-rules.md` | ✅ `export default function PatientScreen()` |
| No direct API calls in screens | `project-structure-boundaries.md` | ✅ Placeholder only — no API calls |
| `@/` alias for absolute imports | `implementation-patterns-consistency-rules.md` | ✅ `@/theme/spacing` |
| Colocated `__tests__/` | `implementation-patterns-consistency-rules.md` | ✅ `patient/__tests__/[id].test.tsx` |

### Existing Behavior to Preserve

All existing `dashboard.tsx` behavior from Stories 3.1–3.3 must remain intact:
- `FlatList` rendering with `RefreshControl` (Story 3.2)
- Pull-to-refresh + header refresh button (Story 3.2)
- Empty state guard (Story 3.3)
- Error state with retry (Story 3.1)
- Loading skeleton (Story 3.1)
- Logout dialog and Android back button handler (Story 2.6)
- `lastUpdatedAt` timestamp (Story 3.1)

Only Task 3 (removing `as never`) touches `dashboard.tsx` and it only changes the type cast, not the runtime behavior.

### Previous Story Intelligence

From Story 3.1:
- The `as never` cast at line 94 of `dashboard.tsx` was explicitly flagged: "This is a known deferred item from Story 3.1's code review. Do not change this pattern." — Story 3.4 is the correct place to resolve it since the route file now exists.

From Story 3.2:
- `router` is available in dashboard via `import { Stack, router, useFocusEffect } from 'expo-router'` — no new import needed.

From Story 3.3:
- `PatientCard` already fires `onPress` when pressed (tested in `PatientCard.test.tsx`). No changes to `PatientCard.tsx` are needed.

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- AC1 satisfied: Tapping patient card navigates to `/patient/{uuid}` — `router.push` wired in `dashboard.tsx` (already existed from Story 3.1), verified by new test in `dashboard.test.tsx`.
- Ripple effect AC satisfied: `PatientCard` uses react-native-paper `Card` with `onPress` — ripple is built-in, no additional code needed.
- Created `src/app/(auth)/patient/[id].tsx`: minimal placeholder screen using `useLocalSearchParams<{ id: string }>()`. Full clinical data deferred to Epic 4.
- `as never` cast removed from `dashboard.tsx` — `typedRoutes: true` + `[id].tsx` existing allows TypeScript to resolve the route type cleanly. `tsc --noEmit` passes.
- 182 tests pass across 15 suites (up from 179/14). Zero regressions.

### File List

- `ghc-ai-doctor-app/src/app/(auth)/patient/[id].tsx` — NEW: Placeholder Clinical Summary screen
- `ghc-ai-doctor-app/src/app/(auth)/patient/__tests__/[id].test.tsx` — NEW: 2 tests for PatientScreen
- `ghc-ai-doctor-app/src/app/(auth)/__tests__/dashboard.test.tsx` — MODIFIED: Added navigation test
- `ghc-ai-doctor-app/src/app/(auth)/dashboard.tsx` — MODIFIED: Removed `as never` cast from `router.push`
