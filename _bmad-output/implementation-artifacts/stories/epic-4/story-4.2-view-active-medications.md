# Story 4.2: View Active Medications

Status: review

## Story

As a doctor,
I want to see all active medications for a patient,
so that I know what treatments they are currently receiving.

## Acceptance Criteria

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** The medications section loads
**Then** I see a list of active medications with drug name, dosage, and frequency
**And** Each medication is displayed in a light blue card with medication icon

**AC2.**
**Given** The patient has no active medications
**When** The medications section loads
**Then** I see "No active medications recorded" with a neutral icon

## Tasks / Subtasks

- [x] Task 1: Create `Medication` type (AC: #1)
  - [x] Create `src/types/clinical.ts`
  - [x] Define `Medication` interface: `uuid`, `drugName`, `dosage`, `frequency`
  - [x] Export from `src/types/index.ts`

- [x] Task 2: Add `getActiveMedications` to clinical API service (AC: #1)
  - [x] Add to `src/services/api/clinical.ts`
  - [x] Implement `getActiveMedications(patientUuid: string): Promise<Medication[]>`
  - [x] Call `GET /order?patient={patientUuid}&careSetting=OUTPATIENT&status=ACTIVE&v=full`
  - [x] Transform: filter `voided === false`, filter `orderType.display` includes "Drug", map to `Medication[]`
  - [x] Dosage string: combine `dose` + `doseUnits.display` (e.g., `500` + `mg` → `"500 mg"`), or `"N/A"` if missing
  - [x] Export from `src/services/api/index.ts`

- [x] Task 3: Create `useMedications` hook (AC: #1, #2)
  - [x] Create `src/hooks/useMedications.ts`
  - [x] Accept `patientUuid: string | null`
  - [x] Call `getActiveMedications(patientUuid)` via SWR with `dedupingInterval: 0, revalidateOnFocus: true`
  - [x] SWR key: `/order?patient=${patientUuid}&careSetting=OUTPATIENT&status=ACTIVE` (null when patientUuid is null)
  - [x] Return `{ medications, isLoading, error, mutate }`
  - [x] Export from `src/hooks/index.ts`

- [x] Task 4: Create `MedicationCard` component (AC: #1, #2)
  - [x] Create `src/components/MedicationCard.tsx`
  - [x] Named export `MedicationCard`
  - [x] Props: `medications: Medication[] | undefined, isLoading: boolean, error: unknown, onRetry: () => void`
  - [x] Light blue background (`#E3F2FD`) — defined as `medicationSurface` in ClinicalColors
  - [x] Section header "ACTIVE MEDICATIONS" (labelLarge)
  - [x] Each medication: pill icon (Icon from react-native-paper), drug name (bodyLarge, bold), dosage + frequency (bodyMedium, textSecondary)
  - [x] 8dp spacing between medication items
  - [x] Empty state when `medications.length === 0`: "No active medications recorded" with `information-outline` icon (neutral)
  - [x] Use `Card` from react-native-paper with `mode="outlined"`
  - [x] All colors/spacing via theme tokens and `@/theme/spacing`
  - [x] Export from `src/components/index.ts`

- [x] Task 5: Update Clinical Summary screen `[id].tsx` (AC: #1, #2)
  - [x] Add `useMedications` hook alongside existing `useClinicalSummary`
  - [x] Render `MedicationCard` below `DemographicsCard` when demographics are loaded
  - [x] Maintain mutually exclusive top-level states (loading → Error → data) from Story 4.1 review fixes
  - [x] Inside the data state, render both DemographicsCard and MedicationCard
  - [x] MedicationCard handles its own loading/error/empty sub-states internally
  - [x] Do NOT change the existing `renderContent` pattern — extend it

- [x] Task 6: Write tests (AC: #1, #2)
  - [x] `src/services/api/__tests__/clinical.test.ts` — UPDATE: add `getActiveMedications` tests (mock apiClient, verify transform, verify voided/drug-type filtering)
  - [x] `src/hooks/__tests__/useMedications.test.ts` — NEW: mock `getActiveMedications`, verify SWR key is null when patientUuid is null, verify returns `{ medications, isLoading, error, mutate }`
  - [x] `src/components/__tests__/MedicationCard.test.tsx` — NEW: render with medications, assert drug names/dosages visible; render with empty array, assert "No active medications recorded" visible
  - [x] `src/app/(auth)/patient/__tests__/[id].test.tsx` — UPDATE: mock `useMedications` hook, add test for MedicationCard rendered when medications present, add test for skeleton/error handling with medications hook

## Dev Notes

### What Already Exists — Do NOT Recreate

| Existing | Location | Notes |
|---|---|---|
| `Order` type | `src/types/visit.ts` | Raw API response type — has `drug`, `dose`, `doseUnits`, `frequency`, `route`, `dateActivated`, `autoExpireDate`, `voided` |
| `[id].tsx` screen | `src/app/(auth)/patient/[id].tsx` | Already has ScrollView, mutually exclusive state rendering, `DemographicsCard` |
| `clinical.ts` service | `src/services/api/clinical.ts` | Add `getActiveMedications` here — keep existing `getPatientDemographics` |
| `useClinicalSummary` hook | `src/hooks/useClinicalSummary.ts` | Stays as-is for demographics — new `useMedications` hook is separate |
| `DemographicsCard` | `src/components/DemographicsCard.tsx` | Reference pattern: outlined Card, section header, row layout |
| `LoadingSkeleton` | `src/components/LoadingSkeleton.tsx` | Reuse for medication section loading state |
| `ErrorState` | `src/components/ErrorState.tsx` | Reuse for medication section error state — props: `message`, `onRetry`, `isRetrying?` |
| `mapErrorToUserMessage` | `src/utils/errorHandler.ts` | Returns `{ message: string, type: ErrorType }` |
| `apiClient` | `src/services/api/client.ts` | Axios instance with auth interceptors |
| `Spacing` | `src/theme/spacing.ts` | 8dp grid |
| `BaseColors`, `ClinicalColors` | `src/theme/colors.ts` | Use for text/background colors |

### API Call

```typescript
// GET /order?patient={patientUuid}&careSetting=OUTPATIENT&status=ACTIVE&v=full
// Returns: { results: Order[] } (paginated wrapper)
// Each Order matches the Order type in src/types/visit.ts
const response = await apiClient.get<{ results: Order[] }>(
  `/order`, 
  { params: { patient: patientUuid, careSetting: 'OUTPATIENT', status: 'ACTIVE', v: 'full' } }
);
```

### Transform Logic

```typescript
// src/services/api/clinical.ts — add this function

export async function getActiveMedications(patientUuid: string): Promise<Medication[]> {
  const response = await apiClient.get<{ results: Order[] }>(
    '/order',
    { params: { patient: patientUuid, careSetting: 'OUTPATIENT', status: 'ACTIVE', v: 'full' } }
  );
  
  return (response.data.results ?? [])
    .filter((order) => !order.voided)
    .filter((order) => order.orderType?.display?.toLowerCase().includes('drug'))
    .filter((order) => order.drug) // must have a drug to display
    .map((order) => ({
      uuid: order.uuid,
      drugName: order.drug!.display,
      dosage: order.dose != null && order.doseUnits
        ? `${order.dose} ${order.doseUnits.display}`
        : 'N/A',
      frequency: order.frequency?.display ?? 'N/A',
    }));
}
```

### Medication Type

```typescript
// src/types/clinical.ts (NEW FILE)

export interface Medication {
  uuid: string;
  drugName: string;
  dosage: string;
  frequency: string;
}
```

### useMedications Hook

```typescript
// src/hooks/useMedications.ts (NEW FILE)
import useSWR from 'swr';
import { getActiveMedications } from '@/services/api/clinical';
import type { Medication } from '@/types/clinical';

interface UseMedicationsResult {
  medications: Medication[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useMedications(patientUuid: string | null): UseMedicationsResult {
  const { data, error, isValidating, mutate } = useSWR(
    patientUuid ? `/order?patient=${patientUuid}&careSetting=OUTPATIENT&status=ACTIVE` : null,
    () => getActiveMedications(patientUuid!),
    { dedupingInterval: 0, revalidateOnFocus: true }
  );

  const isLoading = patientUuid !== null && !data && !error && isValidating;

  return { medications: data, isLoading, error, mutate };
}
```

### MedicationCard Layout (from UX spec)

```
┌─ ACTIVE MEDICATIONS ───────────┐
│ 💊 Metformin 500mg             │
│    2x daily, with meals        │
│                                │
│ 💊 Lisinopril 10mg             │
│    1x daily, morning           │
│                                │
│ 💊 Atorvastatin 20mg           │
│    1x daily, evening           │
└────────────────────────────────┘
```

- Light blue background: `#E3F2FD`
- 16dp padding, 16dp horizontal margin
- Section header "ACTIVE MEDICATIONS" in `labelLarge`, with pill icon
- Drug name: `bodyLarge`, bold
- Dosage + frequency: `bodyMedium`, `textSecondary`
- 8dp gap between medication items (use `Spacing.md`)
- Separator: subtle bottom border or spacing between items

**Empty state:**
```
┌─ ACTIVE MEDICATIONS ───────────┐
│ ℹ️  No active medications      │
│     recorded                   │
└────────────────────────────────┘
```
- Neutral styling (not error red, not positive green)
- Use `information-outline` icon from `@expo/vector-icons/MaterialCommunityIcons`
- Icon color: `BaseColors.textSecondary`

### Screen Update Pattern for `[id].tsx`

The existing `renderContent()` uses mutually exclusive states (loading OR error OR data). Preserve this pattern. Inside the data state, render both cards:

```tsx
export default function PatientScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = id && id.trim() !== '' ? id : null;

  const { demographics, isLoading: demLoading, error: demError, mutate: demMutate } = useClinicalSummary(validId);
  const { medications, isLoading: medLoading, error: medError, mutate: medMutate } = useMedications(validId);

  // ⚠️ CRITICAL: Top-level render must remain mutually exclusive
  const renderContent = () => {
    // Initial load — demographics is the primary/priority section
    if (demLoading) {
      return <LoadingSkeleton count={3} />;
    }

    // Demographics error is blocking (patient identity must be verified)
    if (demError) {
      const msg = mapErrorToUserMessage(demError);
      return <ErrorState message={msg?.message || 'An error occurred'} onRetry={demMutate} />;
    }

    if (demographics) {
      return (
        <>
          <DemographicsCard demographics={demographics} />
          <MedicationCard
            medications={medications}
            isLoading={medLoading}
            error={medError}
            onRetry={medMutate}
          />
        </>
      );
    }

    return <ErrorState message="Patient not found" onRetry={demMutate} />;
  };
  // ...
}
```

**Key design decisions for this pattern:**
1. Demographics is the priority section — its error blocks the screen (patient identity must be verifiable)
2. Medications load independently — each has its own loading/error/empty sub-state
3. `MedicationCard` receives `isLoading`, `error`, `onRetry` props and handles its own sub-state rendering internally
4. This pattern scales cleanly to stories 4.3 (allergies) and 4.4 (vitals) without restructuring

### MedicationCard Props Pattern

```typescript
interface MedicationCardProps {
  medications: Medication[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}
```

The card encapsulates its own loading skeleton, error state, empty state, and populated list. The screen just passes the hook results through.

### Error Message Per Section

When medications fail to load, show a section-specific message using the pattern from story 4.7 (future-proofing):
- "Unable to load medications. Tap to retry."
- Use `ErrorState` component with `onRetry` bound to `medMutate`

### Architecture Compliance

| Requirement | Rule | Applies Here |
|---|---|---|
| No cache for clinical data | `dedupingInterval: 0` | `useMedications` |
| No direct API calls in screens | Use hooks | `[id].tsx` uses `useMedications` |
| Transform at service boundary | API response → Medication in `clinical.ts` | `getActiveMedications` |
| Theme tokens only | No hardcoded colors/spacing | `MedicationCard` — `#E3F2FD` from UX spec is the one exception as it's a named clinical surface color |
| Named export for components | `export const MedicationCard` | MedicationCard |
| Default export for screens | `export default function PatientScreen` | Already compliant |
| Colocated tests | `__tests__/` next to source | All new files |
| `@/` aliases | All absolute imports | All imports |
| Independent SWR hooks per section | Separate `useSWR` calls | `useMedications` separate from `useClinicalSummary` |

### ⚠️ Story 4.1 Review Fixes — Do NOT Regress

The following issues were found and fixed in Story 4.1 code review. Do NOT reintroduce them:

| Issue Fixed | Location | What To Preserve |
|---|---|---|
| Silent failure when `id` is undefined | `[id].tsx:12` | `validId` logic with array/empty string checks |
| Mutually exclusive states | `[id].tsx` renderContent | Loading → Error → Data must be exclusive at top level. Medication sub-states are inside the data branch. |
| ScrollView missing flex: 1 | `[id].tsx` styles | Keep `{ flex: 1 }` on ScrollView |
| LoadingSkeleton count | `[id].tsx` | Keep `count={3}` (reflects 3-4 clinical sections) |
| Error message double-unwrap | `[id].tsx` | Preserve `msg?.message \|\| 'An error occurred'` fallback |

### File Structure for This Story

```
src/
├── app/(auth)/patient/
│   ├── [id].tsx                            MODIFY (add MedicationCard + useMedications)
│   └── __tests__/[id].test.tsx             MODIFY (add medication tests)
├── components/
│   ├── MedicationCard.tsx                  NEW
│   ├── index.ts                            MODIFY (add MedicationCard export)
│   └── __tests__/MedicationCard.test.tsx   NEW
├── hooks/
│   ├── useMedications.ts                   NEW
│   ├── index.ts                            MODIFY (add useMedications export)
│   └── __tests__/useMedications.test.ts    NEW
├── services/api/
│   ├── clinical.ts                         MODIFY (add getActiveMedications)
│   ├── index.ts                            MODIFY (add getActiveMedications export)
│   └── __tests__/clinical.test.ts          MODIFY (add medication tests)
├── types/
│   ├── clinical.ts                         NEW
│   └── index.ts                            MODIFY (add Medication type export)
```

### Testing Patterns (from Story 4.1)

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
jest.mock('@/hooks/useMedications', () => ({
  useMedications: jest.fn(),
}));
```

Mock `apiClient` in service tests:
```typescript
jest.mock('@/services/api/client', () => ({
  apiClient: { get: jest.fn() },
}));
```

Mock `react-native-paper` in component/screen tests (existing pattern in `[id].test.tsx`).

Mock vector icons:
```typescript
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
```

### References

- Epic 4 story definition: `_bmad-output/planning-artifacts/epics/epic-4-clinical-summary-patient-data.md#Story 4.2`
- UX wireframe (Clinical Summary - Medications section): `_bmad-output/planning-artifacts/ux-design-specification/screen-wireframes-user-flows.md#Screen 3`
- UX empty state (No Active Medications): `_bmad-output/planning-artifacts/ux-design-specification/screen-wireframes-user-flows.md#Empty States`
- Architecture — Domain model (Order type): `_bmad-output/planning-artifacts/architecture/domain-model.md#TypeScript Type Definitions`
- Architecture — API endpoint: `_bmad-output/planning-artifacts/architecture/domain-model.md#API Endpoint Reference`
- Architecture — SWR config: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Data Architecture & State Management`
- Architecture — project structure: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md`
- Architecture — implementation patterns: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- Architecture — clinical colors: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Material Design 3 Theming`
- Previous story (4.1): `_bmad-output/implementation-artifacts/stories/epic-4/story-4.1-view-patient-demographics.md`
- Business rules: `_bmad-output/planning-artifacts/architecture/domain-model.md#Business Rules` (Medications rule: show only active, non-voided drug orders)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7

### Debug Log References

N/A

### Completion Notes List

- Created `Medication` type in `src/types/clinical.ts` with `uuid`, `drugName`, `dosage`, `frequency` fields
- Added `getActiveMedications` to `src/services/api/clinical.ts` — calls `GET /order` with OUTPATIENT/ACTIVE params, filters voided/non-drug orders, transforms to Medication[]
- Created `useMedications` hook with `dedupingInterval: 0, revalidateOnFocus: true` — returns `{ medications, isLoading, error, mutate }`
- Created `MedicationCard` component with 4 sub-states: loading skeleton, error with retry, empty state with info icon, populated list with pill icons
- Added `medicationSurface: '#E3F2FD'` to `ClinicalColors` in theme
- Updated `[id].tsx` screen to add `useMedications` hook and render `MedicationCard` below `DemographicsCard` in data state
- Preserved mutually exclusive top-level states (loading → error → data) from Story 4.1 review fixes
- Used `Icon` from `react-native-paper` instead of direct `@expo/vector-icons` import (package not installed in project)
- All 30 new/updated tests pass across 4 test suites
- No regressions introduced (pre-existing failures in `patients.test.ts` and `auth-layout.test.tsx` are unrelated)

### File List

- `src/types/clinical.ts` — NEW
- `src/types/index.ts` — MODIFY (add Medication export)
- `src/theme/colors.ts` — MODIFY (add medicationSurface to ClinicalColors)
- `src/services/api/clinical.ts` — MODIFY (add getActiveMedications)
- `src/services/api/index.ts` — MODIFY (add getActiveMedications export)
- `src/hooks/useMedications.ts` — NEW
- `src/hooks/index.ts` — MODIFY (add useMedications export)
- `src/components/MedicationCard.tsx` — NEW
- `src/components/index.ts` — MODIFY (add MedicationCard export)
- `src/app/(auth)/patient/[id].tsx` — MODIFY (add useMedications + MedicationCard)
- `src/services/api/__tests__/clinical.test.ts` — MODIFY (add getActiveMedications tests)
- `src/hooks/__tests__/useMedications.test.ts` — NEW
- `src/components/__tests__/MedicationCard.test.tsx` — NEW
- `src/app/(auth)/patient/__tests__/[id].test.tsx` — MODIFY (add medication screen tests)

### Change Log

- 2026-05-11: Story 4.2 created — View Active Medications. Context engine analysis complete.
- 2026-05-11: Story 4.2 implemented — Medication type, getActiveMedications API service, useMedications hook, MedicationCard component, screen integration, 30 tests passing

### Review Findings

(To be filled after code review)
