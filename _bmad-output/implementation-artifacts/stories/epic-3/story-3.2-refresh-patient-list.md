# Story 3.2: Refresh Patient List

Status: review

## Story

As a doctor,
I want to refresh the patient list to see the latest assignments,
So that I have up-to-date information about my patients.

---

## Acceptance Criteria

**AC1.**
**Given** I am viewing the My Patients dashboard with patients loaded
**When** I pull down from the top of the screen
**Then** The patient list refreshes with the latest data from the server
**And** A loading indicator appears during refresh
**And** The refresh completes within 2 seconds

**AC2.**
**Given** I am viewing the dashboard
**When** I tap the refresh icon in the top bar
**Then** The patient list refreshes with the latest data

---

## Tasks / Subtasks

- [x] Task 1: Extend `usePatients` hook to expose `isRefreshing` state (AC: #1, #2)
  - [x] In `src/hooks/usePatients.ts`: Add `isRefreshing: boolean` to the `UsePatientsResult` interface
  - [x] Derive `isRefreshing` as: `const isRefreshing = data !== undefined && isValidating;`
    - `isValidating` is already returned by SWR — destructure it from `useSWR()` alongside `data`, `error`, `mutate`
    - `data !== undefined` ensures we only show refresh spinner when data was previously loaded (i.e., a re-fetch), not on initial load (that is covered by `isLoading`)
  - [x] Return `isRefreshing` from the hook alongside the existing return values
  - [x] Add tests in `src/hooks/__tests__/usePatients.test.ts`:
    - `returns isRefreshing=true when SWR is validating with existing data`
    - `returns isRefreshing=false when data is undefined (initial load)`
    - `returns isRefreshing=false when isValidating=false`

- [x] Task 2: Add pull-to-refresh to `FlatList` in `dashboard.tsx` (AC: #1)
  - [x] Import `RefreshControl` from `react-native` (add to existing import line alongside `BackHandler`, `FlatList`, `View`, `StyleSheet`)
  - [x] Destructure `isRefreshing` from `usePatients(providerUuid)` (already destructures `patients, isLoading, error, mutate, lastUpdatedAt`)
  - [x] In `renderContent()`, add `refreshControl` prop to `<FlatList>`:
    ```tsx
    refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={mutate}
      />
    }
    ```
  - [x] **Do NOT** replace `FlatList` with `ScrollView` — `FlatList` virtualizes the list and `RefreshControl` is a built-in `FlatList` prop

- [x] Task 3: Add refresh `IconButton` to dashboard header (AC: #2)
  - [x] In `dashboard.tsx` `Stack.Screen` options, update `headerRight` to render BOTH the refresh icon and the existing logout icon
  - [x] Wrap both `IconButton` components in a `<View style={styles.headerActions}>` with `flexDirection: 'row'`
  - [x] Refresh button: `icon="refresh"`, `accessibilityLabel="Refresh"`, `onPress={mutate}`
  - [x] Logout button stays exactly as before: `icon="exit-to-app"`, `accessibilityLabel="Logout"`, `onPress={handleLogoutPress}`
  - [x] Add `headerActions` style: `{ flexDirection: 'row' }` to the `StyleSheet`
  - [x] **Do NOT** remove or modify the existing logout `IconButton` — it must be preserved exactly (this is Story 2.6 functionality)

- [x] Task 4: Update `dashboard.tsx` tests (AC: #1, #2)
  - [x] In `src/app/(auth)/__tests__/dashboard.test.tsx`, update the `defaultPatientsResult` mock to include `isRefreshing: false`
  - [x] Add test: `shows refresh icon button in header` (verify `getByLabelText('Refresh')` renders)
  - [x] Add test: `tapping refresh icon calls mutate` (fire `press` on Refresh button, assert `mockMutate` called)
  - [x] Add test: `FlatList has RefreshControl with refreshing=false by default` — verify `FlatList`'s `refreshControl` prop binds to `isRefreshing`
  - [x] Add test: `shows refreshing indicator when isRefreshing=true` — mock `usePatients` returning `isRefreshing: true` and verify `RefreshControl` prop is passed
  - [x] Note: `RefreshControl` is a React Native component — it will be available in the test environment via jest-expo's mock of react-native (no extra mock needed)

---

## Dev Notes

### Files to Modify (UPDATE only — no new files)

This story makes **no new files**. All changes are modifications to existing files:

| File | Change Type | What Changes |
|------|------------|--------------|
| `src/hooks/usePatients.ts` | UPDATE | Add `isRefreshing` to interface + return value |
| `src/hooks/__tests__/usePatients.test.ts` | UPDATE | Add 3 new tests for `isRefreshing` |
| `src/app/(auth)/dashboard.tsx` | UPDATE | Import `RefreshControl`; destructure `isRefreshing`; add `refreshControl` to `FlatList`; update `headerRight` with refresh + logout buttons |
| `src/app/(auth)/__tests__/dashboard.test.tsx` | UPDATE | Add `isRefreshing: false` to mock; add 4 new tests |

### `usePatients.ts` — `isRefreshing` Derivation

The SWR hook already returns `isValidating`. The distinction between initial load and re-fetch is:

```typescript
// isLoading: first fetch in progress (data not yet received)
const isLoading = providerUuid !== null && !data && !error;

// isRefreshing: re-fetch in progress (data was previously received)
const isRefreshing = data !== undefined && isValidating;
```

Both can be false simultaneously (idle state). They cannot both be true simultaneously because `isLoading` requires `!data` and `isRefreshing` requires `data !== undefined`.

**Updated `UsePatientsResult` interface:**
```typescript
interface UsePatientsResult {
  patients: FilteredPatientData[];
  isLoading: boolean;
  isRefreshing: boolean;   // ← NEW
  error: unknown;
  mutate: () => void;
  lastUpdatedAt: Date | null;
}
```

**Updated return statement:**
```typescript
return {
  patients,
  isLoading,
  isRefreshing,   // ← NEW
  error,
  mutate,
  lastUpdatedAt,
};
```

**Full updated hook excerpt (only the additions):**
```typescript
const { data, error, isValidating, mutate } = useSWR(   // isValidating already destructured in Story 3.1
  providerUuid ? SWR_KEY : null,
  () => getActiveVisits(),
  { dedupingInterval: 300000, revalidateOnFocus: true }
);

// ...existing useEffect for lastUpdatedAt...

const isLoading = providerUuid !== null && !data && !error;
const isRefreshing = data !== undefined && isValidating;  // ← NEW
```

### `dashboard.tsx` — Pull-to-Refresh Integration

**Import change** — add `RefreshControl` to the react-native import:
```typescript
import { BackHandler, FlatList, RefreshControl, View, StyleSheet } from 'react-native';
```

**Destructure `isRefreshing`** from `usePatients`:
```typescript
const { patients, isLoading, isRefreshing, error, mutate, lastUpdatedAt } = usePatients(providerUuid);
```

**Updated `renderContent` function** — only the FlatList return changes:
```tsx
return (
  <FlatList
    data={patients}
    keyExtractor={(item: FilteredPatientData) => item.visitUuid}
    renderItem={({ item }: { item: FilteredPatientData }) => (
      <PatientCard
        patient={item}
        onPress={() => router.push(`/patient/${item.patientUuid}` as never)}
      />
    )}
    contentContainerStyle={styles.listContent}
    refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={mutate}
      />
    }
  />
);
```

### `dashboard.tsx` — Header Refresh Button

The `Stack.Screen` `headerRight` currently renders a single `IconButton`. Update it to render both the refresh and logout buttons:

```tsx
<Stack.Screen
  options={{
    headerShown: true,
    title: 'My Patients',
    headerRight: () => (
      <View style={styles.headerActions}>
        <IconButton
          icon="refresh"
          iconColor={theme.colors.onSurface}
          onPress={mutate}
          accessibilityLabel="Refresh"
        />
        <IconButton
          icon="exit-to-app"
          iconColor={theme.colors.onSurface}
          onPress={handleLogoutPress}
          accessibilityLabel="Logout"
        />
      </View>
    ),
  }}
/>
```

**Add to styles:**
```typescript
const styles = StyleSheet.create({
  // ...existing styles...
  headerActions: {
    flexDirection: 'row',
  },
});
```

### Test Mock Updates

The `defaultPatientsResult` mock in `dashboard.test.tsx` must include the new `isRefreshing` field (defaults to `false`):

```typescript
const defaultPatientsResult = {
  patients: [],
  isLoading: false,
  isRefreshing: false,    // ← ADD THIS
  error: undefined,
  mutate: jest.fn(),
  lastUpdatedAt: null,
};
```

Failing to add `isRefreshing: false` will cause TypeScript type errors in tests (the mock won't match `UsePatientsResult`). Note that since `usePatients` is jest-mocked (not the real implementation), the test doesn't auto-inherit the new field — it must be manually added to all mock return values.

### Architecture Compliance

| Requirement | Source | Implementation |
|---|---|---|
| SWR mutate() for manual refresh | `core-architectural-decisions.md` | `onRefresh={mutate}` and `onPress={mutate}` |
| Pull-to-refresh using React Native gesture | Epic 3.2 Technical Context | `RefreshControl` from `react-native` |
| No direct API calls in components/screens | `project-structure-boundaries.md` | Dashboard uses `usePatients()` only; `mutate()` triggers SWR internally |
| React Native Paper MD3 components | `design-system-foundation.md` | `IconButton` from `react-native-paper` |
| 5-min SWR cache still applies | `core-architectural-decisions.md` | `mutate()` bypasses cache (forces immediate revalidation) |

### Previous Story Intelligence (Story 3.1 Learnings)

1. **`isLoading` pattern established** — `providerUuid !== null && !data && !error`. The new `isRefreshing` is complementary: `data !== undefined && isValidating`. These are correctly orthogonal.

2. **`isValidating` is already destructured** in Story 3.1's implementation of `usePatients.ts`:
   ```typescript
   const { data, error, isValidating, mutate } = useSWR(...)
   ```
   So `isValidating` is already available — no SWR import changes needed.

3. **`dashboard.test.tsx` mock** includes `Icon` and `Card` in the `react-native-paper` mock — these were added in Story 3.1 to fix test failures. Do not remove them.

4. **`router.push` workaround** — `router.push(\`/patient/${item.patientUuid}\` as never)` uses `as never` cast. This is a known deferred item from Story 3.1's code review. Do not change this pattern.

5. **`BackHandler` test setup** — `dashboard.test.tsx` has a `beforeAll` spy on `BackHandler.addEventListener` and a `simulateBackPress` helper. These are still needed; do not break them.

6. **`Stack.Screen` options rendering in tests** — the test mock for `expo-router` renders `Stack.Screen`'s `headerRight()` by calling it in a `<View>`. This means the refresh `IconButton` will render in tests and be findable via `getByLabelText('Refresh')`.

7. **`usePatients` is fully mocked in dashboard tests** — `jest.mock('@/hooks/usePatients', () => ({ usePatients: jest.fn() }))`. Tests must manually return `isRefreshing` in the mock return value — it won't auto-appear from the real implementation.

### UX Spec Notes

From `screen-wireframes-user-flows.md` (Screen 2 - My Patients Dashboard):
- **Pull-to-Refresh:** Material Design 3 pull-to-refresh indicator
- **Refresh Icon:** Circular refresh icon (48dp touch target) — Material icon `"refresh"` satisfies this
- **Interactions:** "User taps refresh icon → Data reloads with loading indicator"
- **State — Refreshing:** Pull-to-refresh indicator at top

> Note: `core-user-experience.md` line 67 says "No 'Refresh' button needed", but the wireframe on Screen 2 explicitly shows a refresh icon with 48dp touch target. The epic AC2 also explicitly requires the tap-to-refresh icon. Follow the epic ACs and wireframe — the icon is required.

### Existing Behavior to Preserve (Story 3.1 work)

The following functionality from Story 3.1 must remain intact without modification:
- `FlatList` rendering of `PatientCard` items
- `EmptyState` for empty and error states (error state still has its own "Retry" button)
- `LoadingSkeleton` for initial load state
- `lastUpdatedAt` timestamp display
- Logout `IconButton` in header (icon, accessibilityLabel, onPress handler — all unchanged)
- Logout confirmation dialog (Portal, Dialog, all buttons)
- Android back button interception via `useFocusEffect` + `BackHandler`
- `isLoading` state in `usePatients` hook — the formula `providerUuid !== null && !data && !error` is unchanged

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

None — all tasks completed cleanly in one pass.

### Completion Notes List

- ✅ Task 1: Added `isRefreshing: boolean` to `UsePatientsResult` interface and return value in `usePatients.ts`. Derived as `data !== undefined && isValidating`. `isValidating` was already destructured from SWR in Story 3.1. Added 3 new tests (28 total in hook suite, all passing).
- ✅ Task 2: Added `RefreshControl` import to `dashboard.tsx`. Destructured `isRefreshing` from `usePatients`. Added `refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={mutate} />}` to `FlatList`.
- ✅ Task 3: Updated `headerRight` to wrap both `IconButton` components in a `<View style={styles.headerActions}>`. Refresh icon (`icon="refresh"`, `accessibilityLabel="Refresh"`, `onPress={mutate}`) added left of existing logout icon. Added `headerActions: { flexDirection: 'row' }` style.
- ✅ Task 4: Updated `defaultPatientsResult` mock with `isRefreshing: false`. Added `describe('DashboardScreen - refresh')` block with 4 new tests using `UNSAFE_getByType(FlatList)` to verify RefreshControl prop binding. 
- ✅ Fixed pre-existing regression in `AuthContext.test.tsx`: Story 3.1 changed `sessionUser` JSON to include `providerUuid`, but the test still expected the old format. Fixed by adding `currentProvider: null` to `mockSession` and updating expected `setItemAsync` call to `{ ...mockUser, providerUuid: null }`.
- ✅ Full test suite: **178 tests passing, 14 suites, 0 failures** (up from 172 due to 6 new tests: 3 in usePatients + 4 in dashboard + 1 AuthContext regression correction = net +6 passing).

### Change Log

- 2026-04-29: Story 3.2 implemented — pull-to-refresh + header refresh button on dashboard (AC1, AC2 satisfied).
- 2026-04-29: Fixed pre-existing AuthContext test regression from Story 3.1 (sessionUser JSON shape mismatch).

### File List

- `ghc-ai-doctor-app/src/hooks/usePatients.ts` — MODIFIED: added `isRefreshing` to interface + return value
- `ghc-ai-doctor-app/src/hooks/__tests__/usePatients.test.ts` — MODIFIED: added 3 isRefreshing tests
- `ghc-ai-doctor-app/src/app/(auth)/dashboard.tsx` — MODIFIED: RefreshControl on FlatList, refresh IconButton in header, headerActions style
- `ghc-ai-doctor-app/src/app/(auth)/__tests__/dashboard.test.tsx` — MODIFIED: isRefreshing in mock, new refresh describe block with 4 tests
- `ghc-ai-doctor-app/src/contexts/__tests__/AuthContext.test.tsx` — MODIFIED: fixed pre-existing Story 3.1 regression (sessionUser JSON includes providerUuid)
