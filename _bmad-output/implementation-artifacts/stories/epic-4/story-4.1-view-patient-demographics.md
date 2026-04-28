# Story 4.1: View Patient Demographics

Status: done

## Story

As a doctor,
I want to see patient demographics when I open their clinical summary,
so that I can verify I'm viewing the correct patient's information.

## Acceptance Criteria

**AC1.**
**Given** I have tapped on a patient from the dashboard
**When** The Clinical Summary screen loads
**Then** I see the patient's Name, Patient ID, Age, and Gender at the top
**And** The demographics section loads within 2 seconds

## Tasks / Subtasks

- [x] Task 1: Create `useClinicalSummary` hook (AC: #1)
  - [x] Create `src/hooks/useClinicalSummary.ts`
  - [x] Accept `patientUuid: string | null` parameter
  - [x] Call `getPatientDemographics(patientUuid)` via SWR with `dedupingInterval: 0, revalidateOnFocus: true`
  - [x] Return `{ demographics, isLoading, error, mutate }`
  - [x] SWR key: `/patient/${patientUuid}?v=full` (null when patientUuid is null)
  - [x] Export from `src/hooks/index.ts`

- [x] Task 2: Create `clinical.ts` API service (AC: #1)
  - [x] Create `src/services/api/clinical.ts`
  - [x] Implement `getPatientDemographics(patientUuid: string): Promise<PatientDemographics>`
  - [x] Call `GET /patient/{patientUuid}?v=full` via `apiClient`
  - [x] Transform response: extract preferred name, preferred identifier, age (with `~` prefix if `birthdateEstimated`), gender
  - [x] Use `differenceInYears` from `date-fns` for age calculation (already a dependency)
  - [x] Export from `src/services/api/index.ts`

- [x] Task 3: Add `PatientDemographics` type (AC: #1)
  - [x] Add to `src/types/patient.ts`:
    ```typescript
    export interface PatientDemographics {
      displayName: string;
      patientId: string;
      age: string;
      gender: string;
    }
    ```

- [x] Task 4: Create `DemographicsCard` component (AC: #1)
  - [x] Create `src/components/DemographicsCard.tsx`
  - [x] Named export `DemographicsCard`
  - [x] Props: `demographics: PatientDemographics`
  - [x] White background, outlined card style (use `Card` from react-native-paper with `mode="outlined"`)
  - [x] Display: Name (titleLarge), Patient ID, Age, Gender (bodyMedium, textSecondary)
  - [x] Section header "DEMOGRAPHICS" (labelLarge)
  - [x] All colors/spacing via theme tokens and `@/theme/spacing`, `@/theme/colors`
  - [x] Export from `src/components/index.ts`

- [x] Task 5: Replace placeholder `[id].tsx` with full Clinical Summary screen (AC: #1)
  - [x] Replace content of `src/app/(auth)/patient/[id].tsx`
  - [x] Use `useClinicalSummary(id)` hook
  - [x] Show `LoadingSkeleton` while loading
  - [x] Show `ErrorState` with retry on error (use `mapErrorToUserMessage`)
  - [x] Show `DemographicsCard` when data loaded
  - [x] Update `Stack.Screen` title to patient's display name once loaded (fallback: `'Clinical Summary'`)
  - [x] Wrap in `ScrollView` (needed for future sections in 4.2–4.4)
  - [x] Apply `expo-screen-capture` prevention (already used in `(auth)/_layout.tsx` — verify it covers this route; if not, add `useEffect` with `ScreenCapture.preventScreenCaptureAsync()`)

- [x] Task 6: Write tests (AC: #1)
  - [x] `src/services/api/__tests__/clinical.test.ts` — unit test `getPatientDemographics`: mock `apiClient`, verify transformation (preferred name, preferred identifier, age with `~` for estimated, gender)
  - [x] `src/hooks/__tests__/useClinicalSummary.test.ts` — mock `getPatientDemographics`, verify SWR key is null when patientUuid is null, verify returns `{ demographics, isLoading, error, mutate }`
  - [x] `src/components/__tests__/DemographicsCard.test.tsx` — render with sample data, assert Name/ID/Age/Gender visible
  - [x] `src/app/(auth)/patient/__tests__/[id].test.tsx` — update existing tests: add loading state test, error state test, demographics rendered test

## Dev Notes

### What Already Exists — Do NOT Recreate

| Existing | Location | Notes |
|---|---|---|
| `[id].tsx` placeholder | `src/app/(auth)/patient/[id].tsx` | Replace content entirely |
| `[id].test.tsx` | `src/app/(auth)/patient/__tests__/[id].test.tsx` | Update, don't recreate |
| `LoadingSkeleton` | `src/components/LoadingSkeleton.tsx` | Reuse as-is |
| `ErrorState` | `src/components/ErrorState.tsx` | Reuse as-is — props: `message`, `onRetry`, `isRetrying?` |
| `mapErrorToUserMessage` | `src/utils/errorHandler.ts` | Returns `{ message, type }` |
| `ErrorType` enum | `src/utils/errorHandler.ts` | `NETWORK_ERROR`, `AUTH_ERROR`, etc. |
| `apiClient` | `src/services/api/client.ts` | Axios instance with auth interceptors |
| `differenceInYears` | `date-fns` (already installed) | Used in `usePatients.ts` |
| `resolveDisplayName`, `resolvePatientId`, `resolveAge` | `src/hooks/usePatients.ts` | **Reuse these helpers** — do NOT duplicate logic |
| `Patient` type | `src/types/patient.ts` | Full patient type with `person.names`, `identifiers`, etc. |
| `Spacing` | `src/theme/spacing.ts` | 8dp grid |
| `BaseColors`, `ClinicalColors` | `src/theme/colors.ts` | Use for clinical section colors |
| `Typography` | `src/theme/typography.ts` | Type scale |

### ⚠️ Critical: Reuse Existing Helper Functions

`src/hooks/usePatients.ts` already exports:
```typescript
export function resolveDisplayName(patient: Patient): string
export function resolvePatientId(patient: Patient): string
export function resolveAge(person: Patient['person']): string
```

**Import and reuse these in `clinical.ts`** — do NOT reimplement the same logic.

```typescript
// src/services/api/clinical.ts
import { resolveDisplayName, resolvePatientId, resolveAge } from '@/hooks/usePatients';
```

### API Call

```typescript
// GET /patient/{patientUuid}?v=full
// Returns the full Patient object (see src/types/patient.ts)
const response = await apiClient.get<Patient>(`/patient/${patientUuid}?v=full`);
```

The `Patient` type is already defined in `src/types/patient.ts`. No new types needed for the raw API response.

### SWR Configuration for Clinical Data

```typescript
// No cache — always fetch fresh for clinical accuracy
const { data, error, isValidating, mutate } = useSWR(
  patientUuid ? `/patient/${patientUuid}?v=full` : null,
  () => getPatientDemographics(patientUuid!),
  { dedupingInterval: 0, revalidateOnFocus: true }
);
```

### DemographicsCard Layout (from UX spec)

```
┌─ DEMOGRAPHICS ─────────────────┐
│ Name: John Smith               │
│ ID: 10002AB                    │
│ Age: 45 years                  │
│ Gender: Male                   │
└────────────────────────────────┘
```

- White background (`theme.colors.surface`)
- Outlined card (`mode="outlined"`)
- Section header: "DEMOGRAPHICS" in `labelLarge` style
- Each row: label in `bodyMedium` + `textSecondary`, value in `bodyLarge`
- 16dp padding, 16dp margin horizontal

### Screen Structure for `[id].tsx`

```tsx
export default function PatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { demographics, isLoading, error, mutate } = useClinicalSummary(id);

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        title: demographics?.displayName ?? 'Clinical Summary',
      }} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <LoadingSkeleton count={1} />}
        {error && (
          <ErrorState
            message={mapErrorToUserMessage(error).message}
            onRetry={mutate}
          />
        )}
        {demographics && <DemographicsCard demographics={demographics} />}
      </ScrollView>
    </>
  );
}
```

### Screenshot Prevention

Check `src/app/(auth)/_layout.tsx` — if it already calls `ScreenCapture.preventScreenCaptureAsync()` for all `(auth)` routes, no additional code is needed in `[id].tsx`. If not, add:

```typescript
useEffect(() => {
  ScreenCapture.preventScreenCaptureAsync();
  return () => { ScreenCapture.allowScreenCaptureAsync(); };
}, []);
```

### File Structure for This Story

```
src/
├── app/(auth)/patient/
│   ├── [id].tsx                          REPLACE (was placeholder)
│   └── __tests__/[id].test.tsx           UPDATE
├── components/
│   ├── DemographicsCard.tsx              NEW
│   ├── index.ts                          UPDATE (add DemographicsCard export)
│   └── __tests__/DemographicsCard.test.tsx  NEW
├── hooks/
│   ├── useClinicalSummary.ts             NEW
│   ├── index.ts                          UPDATE (add useClinicalSummary export)
│   └── __tests__/useClinicalSummary.test.ts  NEW
├── services/api/
│   ├── clinical.ts                       NEW
│   ├── index.ts                          UPDATE (add clinical exports)
│   └── __tests__/clinical.test.ts        NEW
└── types/
    └── patient.ts                        UPDATE (add PatientDemographics interface)
```

### Testing Patterns (from Epic 2 & 3 stories)

Mock `expo-router` in screen tests:
```typescript
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'patient-uuid-1' })),
  Stack: { Screen: () => null },
}));
```

Mock SWR hooks in screen tests:
```typescript
jest.mock('@/hooks/useClinicalSummary', () => ({
  useClinicalSummary: jest.fn(),
}));
```

Mock `apiClient` in service tests:
```typescript
jest.mock('@/services/api/client', () => ({
  apiClient: { get: jest.fn() },
}));
```

### Architecture Compliance

| Requirement | Rule | Applies Here |
|---|---|---|
| No cache for clinical data | `dedupingInterval: 0` | ✅ `useClinicalSummary` |
| No direct API calls in screens | Use hooks | ✅ `[id].tsx` uses `useClinicalSummary` |
| Transform at service boundary | snake_case → camelCase in `clinical.ts` | ✅ |
| Theme tokens only | No hardcoded colors/spacing | ✅ `DemographicsCard` |
| Named export for components | `export const DemographicsCard` | ✅ |
| Default export for screens | `export default function PatientScreen` | ✅ |
| Colocated tests | `__tests__/` next to source | ✅ |
| `@/` aliases | All absolute imports | ✅ |

### References

- Epic 4 story definition: `_bmad-output/planning-artifacts/epics/epic-4-clinical-summary-patient-data.md#Story 4.1`
- UX wireframe (Clinical Summary screen): `_bmad-output/planning-artifacts/ux-design-specification/screen-wireframes-user-flows.md#Screen 3`
- Architecture — SWR config: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Data Architecture & State Management`
- Architecture — project structure: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#Requirements to Structure Mapping`
- Domain model — Patient type: `_bmad-output/planning-artifacts/architecture/domain-model.md#TypeScript Type Definitions`
- Domain model — API endpoint: `_bmad-output/planning-artifacts/architecture/domain-model.md#API Endpoint Reference`
- Previous story (navigation foundation): `_bmad-output/implementation-artifacts/stories/epic-3/story-3.4-navigate-to-patient-clinical-summary.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5

### Debug Log References

- Pre-existing test failure in `patients.test.ts` (expects `v=full` but implementation uses custom query) — not caused by this story, confirmed via git stash.
- SWR retains stale data on error within same test run; fixed `useClinicalSummary.test.ts` to use a different patientUuid key for the error test.

### Completion Notes List

- Task 1: `useClinicalSummary` hook created with SWR `dedupingInterval: 0, revalidateOnFocus: true`. Null key when patientUuid is null. Exported from `hooks/index.ts`.
- Task 2: `clinical.ts` service created. Reuses `resolveDisplayName`, `resolvePatientId`, `resolveAge` from `usePatients.ts` as specified. Exported from `services/api/index.ts`.
- Task 3: `PatientDemographics` interface added to `types/patient.ts`.
- Task 4: `DemographicsCard` component created with outlined Card, DEMOGRAPHICS header, row layout using theme tokens. Exported from `components/index.ts`.
- Task 5: `[id].tsx` replaced with full Clinical Summary screen. Screen capture prevention confirmed covered by `(auth)/_layout.tsx` — no additional code needed.
- Task 6: 18 tests written and passing across 4 test files.

### File List

- `ghc-ai-doctor-app/src/types/patient.ts` — MODIFIED (added PatientDemographics interface)
- `ghc-ai-doctor-app/src/services/api/clinical.ts` — NEW
- `ghc-ai-doctor-app/src/services/api/index.ts` — MODIFIED (added clinical export)
- `ghc-ai-doctor-app/src/services/api/__tests__/clinical.test.ts` — NEW
- `ghc-ai-doctor-app/src/hooks/useClinicalSummary.ts` — NEW
- `ghc-ai-doctor-app/src/hooks/index.ts` — MODIFIED (added useClinicalSummary export)
- `ghc-ai-doctor-app/src/hooks/__tests__/useClinicalSummary.test.ts` — NEW
- `ghc-ai-doctor-app/src/components/DemographicsCard.tsx` — NEW
- `ghc-ai-doctor-app/src/components/index.ts` — MODIFIED (added DemographicsCard export)
- `ghc-ai-doctor-app/src/components/__tests__/DemographicsCard.test.tsx` — NEW
- `ghc-ai-doctor-app/src/app/(auth)/patient/[id].tsx` — MODIFIED (replaced placeholder with full screen)
- `ghc-ai-doctor-app/src/app/(auth)/patient/__tests__/[id].test.tsx` — MODIFIED (updated with loading/error/demographics tests)

### Change Log

- 2026-04-28: Implemented Story 4.1 — View Patient Demographics. Created clinical API service, useClinicalSummary hook, DemographicsCard component, and full Clinical Summary screen. 18 new/updated tests passing.

### Review Findings

- [x] [Review][Patch] Silent failure when `id` is undefined [patient/[id].tsx:12] — Fixed: Added proper validation for array params and empty strings
- [x] [Review][Patch] Header title flickers during load [patient/[id].tsx:19] — Fixed: Maintained fallback title behavior
- [x] [Review][Patch] Loading and error states render simultaneously [patient/[id].tsx:23-31] — Fixed: Implemented mutually exclusive state rendering
- [x] [Review][Patch] Stale data renders alongside error state [patient/[id].tsx:23-33] — Fixed: Single renderContent function prevents simultaneous states
- [x] [Review][Patch] Missing empty/null state handling [patient/[id].tsx:33] — Fixed: Added "Patient not found" state
- [x] [Review][Patch] ScrollView missing flex: 1 [patient/[id].tsx:22] — Fixed: Added style={{ flex: 1 }}
- [x] [Review][Patch] Hardcoded LoadingSkeleton count [patient/[id].tsx:23] — Fixed: Changed to count={3} to match content sections
- [x] [Review][Patch] Error message double-unwrap risk [patient/[id].tsx:26] — Fixed: Added fallback for missing message field
- [x] [Review][Patch] Label mismatch: "ID" vs "Patient ID" [DemographicsCard.tsx] — Fixed: Changed label to "Patient ID"
- [x] [Review][Defer] Sprint YAML data integrity issue [sprint-status.yaml] — deferred, pre-existing
- [x] [Review][Defer] Missing newline at end of YAML [sprint-status.yaml] — deferred, pre-existing  
- [x] [Review][Defer] Duration hours inconsistency in sprint tracking [sprint-status.yaml] — deferred, pre-existing
