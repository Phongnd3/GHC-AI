# Story 4.3: View Known Allergies

Status: done

## Story

As a doctor,
I want to see all known allergies for a patient with clear visual indicators,
so that I can avoid prescribing medications that could cause allergic reactions.

## Acceptance Criteria

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** The allergies section loads
**Then** I see a list of allergies with allergy name and severity level
**And** Each allergy is displayed in a light red card with warning icon
**And** The card has a red border for high visibility

**AC2.**
**Given** The patient has no known allergies
**When** The allergies section loads
**Then** I see "No known allergies" with a green checkmark
**And** This is displayed as a positive indicator, not an empty state

## Tasks / Subtasks

- [x] Task 1: Add `Allergy` type to `src/types/clinical.ts` (AC: #1)
  - [x] Add `Allergy` interface: `uuid`, `allergenDisplay`, `severity`, `reactions`, `comment`
  - [x] Ensure export from `src/types/index.ts`

- [x] Task 2: Add `getAllergies` to clinical API service (AC: #1)
  - [x] Add to `src/services/api/clinical.ts`
  - [x] Implement `getAllergies(patientUuid: string): Promise<Allergy[]>`
  - [x] Call `GET /patient/{patientUuid}/allergy`
  - [x] Transform: map raw response to `Allergy[]`
  - [x] Export from `src/services/api/index.ts`

- [x] Task 3: Create `useAllergies` hook (AC: #1, #2)
  - [x] Create `src/hooks/useAllergies.ts`
  - [x] Accept `patientUuid: string | null`
  - [x] Call `getAllergies(patientUuid)` via SWR with `dedupingInterval: 0, revalidateOnFocus: true`
  - [x] SWR key: `/patient/${patientUuid}/allergy` (null when patientUuid is null)
  - [x] Return `{ allergies, isLoading, error, mutate }`
  - [x] Export from `src/hooks/index.ts`

- [x] Task 4: Create `AllergiesCard` component (AC: #1, #2)
  - [x] Create `src/components/AllergiesCard.tsx`
  - [x] Named export `AllergiesCard`
  - [x] Props: `allergies: Allergy[] | undefined, isLoading: boolean, error: unknown, onRetry: () => void`
  - [x] Light red background (`#FFEBEE`) — defined as `allergySurface` in ClinicalColors
  - [x] Red border (2dp) — defined in ClinicalColors
  - [x] Section header "ALLERGIES" (labelLarge) with warning icon
  - [x] Each allergy: warning icon (red), allergy name + severity (bodyLarge, bold, dark red), reactions (bodyMedium, textSecondary)
  - [x] 8dp spacing between allergy items
  - [x] Empty state when `allergies.length === 0`: "No known allergies" with green checkmark icon (positive indicator)
  - [x] Distinguish: empty array = "no known allergies" (clinically significant); null/undefined = loading or error
  - [x] Use `Card` from react-native-paper with `mode="outlined"`
  - [x] All colors/spacing via theme tokens and `@/theme/spacing`
  - [x] Export from `src/components/index.ts`

- [x] Task 5: Update Clinical Summary screen `[id].tsx` (AC: #1, #2)
  - [x] Add `useAllergies` hook alongside existing hooks
  - [x] Render `AllergiesCard` below `MedicationCard` when demographics are loaded
  - [x] Maintain mutually exclusive top-level states (loading → Error → data)
  - [x] Inside the data state, render DemographicsCard, MedicationCard, and AllergiesCard
  - [x] AllergiesCard handles its own loading/error/empty sub-states internally
  - [x] Do NOT change the existing `renderContent` pattern — extend it

- [x] Task 6: Add `allergySurface` color to `ClinicalColors` in theme (AC: #1)
  - [x] Add `allergySurface: '#FFEBEE'` to `src/theme/colors.ts`
  - [x] Reuse existing `allergyAlert` (#da1e28) for red border

- [x] Task 7: Write tests (AC: #1, #2)
  - [x] `src/services/api/__tests__/clinical.test.ts` — UPDATE: add `getAllergies` tests (mock apiClient, verify transform, verify empty/error, 7 tests)
  - [x] `src/hooks/__tests__/useAllergies.test.ts` — NEW: mock `getAllergies`, verify SWR key is null when patientUuid is null, verify returns `{ allergies, isLoading, error, mutate }`
  - [x] `src/components/__tests__/AllergiesCard.test.tsx` — NEW: render with allergies, assert names/severity visible; render with empty array, assert "No known allergies" with green checkmark; render loading; render error with retry
  - [x] `src/app/(auth)/patient/__tests__/[id].test.tsx` — UPDATE: mock `useAllergies` hook, add test for AllergiesCard rendered when allergies present

### Review Findings (AI)

- [x] [Review][Defer] SWR dedupingInterval:0 + revalidateOnFocus:true refetches on every focus [useAllergies.ts:14] — deferred, deliberate architectural decision (no cache for clinical data)
- [x] [Review][Defer] Invalid patient ID + retry button is a dead end [src/app/(auth)/patient/[id].tsx:20-21] — deferred, pre-existing issue not caused by this story
- [x] [Review][Defer] ErrorState isRetrying prop never wired up [AllergiesCard.tsx:36] — deferred, pre-existing pattern (same as MedicationCard)
- [x] [Review][Defer] Stale allergy data hidden on revalidation failure [AllergiesCard.tsx:35-37] — deferred, pre-existing pattern (same as MedicationCard)
- [x] [Review][Patch] AllergyResponse interface declares allergen as required but runtime can return null/undefined [src/services/api/clinical.ts:36] — fixed: changed to `allergen?: { ... } | null`

## Dev Notes

### What Already Exists — Do NOT Recreate

| Existing | Location | Notes |
|---|---|---|
| `[id].tsx` screen | `src/app/(auth)/patient/[id].tsx` | Already has ScrollView, mutually exclusive state rendering, `DemographicsCard`, `MedicationCard` |
| `clinical.ts` service | `src/services/api/clinical.ts` | Add `getAllergies` here — keep existing `getPatientDemographics` and `getActiveMedications` |
| `useMedications` hook | `src/hooks/useMedications.ts` | Reference pattern for `useAllergies` — identical structure |
| `MedicationCard` | `src/components/MedicationCard.tsx` | Reference pattern: outlined Card, section header, sub-states (loading skeleton, error with retry, empty, populated list) |
| `LoadingSkeleton` | `src/components/LoadingSkeleton.tsx` | Reuse for allergy section loading state |
| `ErrorState` | `src/components/ErrorState.tsx` | Reuse for allergy section error state — props: `message`, `onRetry` |
| `mapErrorToUserMessage` | `src/utils/errorHandler.ts` | Returns `{ message: string, type: ErrorType }` |
| `apiClient` | `src/services/api/client.ts` | Axios instance with auth interceptors |
| `Spacing` | `src/theme/spacing.ts` | 8dp grid |
| `BaseColors`, `ClinicalColors` | `src/theme/colors.ts` | Use for text/background colors |
| `Allergy` raw type | `src/types/clinical.ts` | Already in domain model — add the `Allergy` interface here alongside `Medication` |
| `Order` type | `src/types/visit.ts` | Raw API response type — not needed for allergies |

### API Call

```typescript
// GET /patient/{patientUuid}/allergy
// Returns: { results: AllergyResponse[] } (paginated wrapper)
// Each AllergyResponse from OpenMRS:
// {
//   uuid: string,
//   allergen: { display: string, allergenType: string },
//   severity: { display: string } | null,
//   reactions: Array<{ reaction: { display: string } }>,
//   comment?: string
// }
const response = await apiClient.get<{ results: AllergyResponse[] }>(
  `/patient/${patientUuid}/allergy`
);
```

### Transform Logic

```typescript
// src/services/api/clinical.ts — add this function

export async function getAllergies(patientUuid: string): Promise<Allergy[]> {
  const response = await apiClient.get<{ results: AllergyResponse[] }>(
    `/patient/${patientUuid}/allergy`
  );

  return (response.data.results ?? []).map((allergy) => ({
    uuid: allergy.uuid,
    allergenDisplay: allergy.allergen?.display ?? 'Unknown allergen',
    allergenType: allergy.allergen?.allergenType ?? 'UNKNOWN',
    severity: allergy.severity?.display ?? null,
    reactions: (allergy.reactions ?? []).map((r) => r.reaction?.display ?? 'Unknown reaction'),
    comment: allergy.comment ?? undefined,
  }));
}
```

### Allergy Types

```typescript
// src/types/clinical.ts — ADD alongside existing Medication interface

export interface Allergy {
  uuid: string;
  allergenDisplay: string;
  allergenType: string;
  severity: string | null;
  reactions: string[];
  comment?: string;
}

// Raw API response shape (used only in clinical.ts service, not exported)
interface AllergyResponse {
  uuid: string;
  allergen: { display: string; allergenType: string };
  severity: { display: string } | null;
  reactions: Array<{ reaction: { display: string } }>;
  comment?: string;
}
```

### useAllergies Hook

```typescript
// src/hooks/useAllergies.ts (NEW FILE)
import useSWR from 'swr';
import { getAllergies } from '@/services/api/clinical';
import type { Allergy } from '@/types/clinical';

interface UseAllergiesResult {
  allergies: Allergy[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useAllergies(patientUuid: string | null): UseAllergiesResult {
  const { data, error, isValidating, mutate } = useSWR(
    patientUuid ? `/patient/${patientUuid}/allergy` : null,
    () => getAllergies(patientUuid!),
    { dedupingInterval: 0, revalidateOnFocus: true }
  );

  const isLoading = patientUuid !== null && !data && !error && isValidating;

  return { allergies: data, isLoading, error, mutate };
}
```

### AllergiesCard Layout (from UX spec)

```
┌─ ALLERGIES ──────────────────────┐
│ ⚠️  Penicillin (Severe)         │
│     Anaphylaxis reaction         │
│                                  │
│ ⚠️  Sulfa drugs (Moderate)       │
│     Rash                         │
└──────────────────────────────────┘
```

- Light red background: `#FFEBEE` → add `allergySurface` to `ClinicalColors`
- Red border: 2dp solid `ClinicalColors.allergyAlert` (#da1e28)
- 16dp padding, 16dp horizontal margin
- Section header "ALLERGIES" in `labelLarge`, with `alert-outline` or `alert` warning icon (red)
- Allergy name + severity: `bodyLarge`, bold, dark red color
- Reactions: `bodyMedium`, `textSecondary`
- 8dp gap between allergy items (use `Spacing.md`)
- Separator: subtle bottom border or spacing between items

**Empty state (no allergies — clinically significant!):**
```
┌─ ALLERGIES ──────────────────────┐
│ ✓  No known allergies            │
└──────────────────────────────────┘
```
- Green checkmark icon (`check-circle-outline` or `check-circle` from `MaterialCommunityIcons`)
- Icon color: `ClinicalColors.success` (#24a148)
- Text: "No known allergies" — this is POSITIVE clinical information
- DO NOT treat as an empty/error state — it is a valid clinical finding

**Critical distinction:** Empty array `[]` = "No known allergies" (clinically significant positive finding).  
Null/undefined `allergies` = Not yet loaded (different state, handled by loading/error).

### Screen Update Pattern for `[id].tsx`

The existing `renderContent()` uses mutually exclusive states (loading OR error OR data). Preserve this pattern. Inside the data state, render all three cards:

```tsx
export default function PatientScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = id && id.trim() !== '' ? id : null;

  const { demographics, isLoading: demLoading, error: demError, mutate: demMutate } = useClinicalSummary(validId);
  const { medications, isLoading: medLoading, error: medError, mutate: medMutate } = useMedications(validId);
  const { allergies, isLoading: allLoading, error: allError, mutate: allMutate } = useAllergies(validId);

  const renderContent = () => {
    if (demLoading) {
      return <LoadingSkeleton count={4} />;
    }

    if (demError) {
      const errorMessage = mapErrorToUserMessage(demError);
      return (
        <ErrorState message={errorMessage?.message || 'An error occurred'} onRetry={demMutate} />
      );
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
          <AllergiesCard
            allergies={allergies}
            isLoading={allLoading}
            error={allError}
            onRetry={allMutate}
          />
        </>
      );
    }

    return <ErrorState message="Patient not found" onRetry={demMutate} />;
  };
  // ...
}
```

**Key design decisions (carried forward from 4.2):**
1. Demographics is the priority section — its error blocks the screen
2. Medications and Allergies load independently — each has its own sub-state
3. `AllergiesCard` receives `isLoading`, `error`, `onRetry` props and handles its own sub-state rendering
4. Update `LoadingSkeleton count` from 3 to 4 (now 4 clinical sections)

### AllergiesCard Props Pattern

```typescript
interface AllergiesCardProps {
  allergies: Allergy[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}
```

The card encapsulates its own loading skeleton, error state, empty state (no known allergies), and populated list.

### Error Message Per Section

When allergies fail to load, show a section-specific message:
- "Unable to load allergies. Tap to retry."
- Use `ErrorState` component with `onRetry` bound to `allMutate`

### Architecture Compliance

| Requirement | Rule | Applies Here |
|---|---|---|
| No cache for clinical data | `dedupingInterval: 0` | `useAllergies` |
| No direct API calls in screens | Use hooks | `[id].tsx` uses `useAllergies` |
| Transform at service boundary | API response → Allergy in `clinical.ts` | `getAllergies` |
| Theme tokens only | No hardcoded colors/spacing | `AllergiesCard` — `#FFEBEE` from UX spec is the one exception as a named clinical surface color |
| Named export for components | `export const AllergiesCard` | AllergiesCard |
| Default export for screens | `export default function PatientScreen` | Already compliant |
| Colocated tests | `__tests__/` next to source | All new files |
| `@/` aliases | All absolute imports | All imports |
| Independent SWR hooks per section | Separate `useSWR` calls | `useAllergies` separate from `useClinicalSummary` and `useMedications` |

### ⚠️ Story 4.1 & 4.2 Review Fixes — Do NOT Regress

The following issues were found and fixed in previous stories. Do NOT reintroduce them:

| Issue Fixed | Location | What To Preserve |
|---|---|---|
| Silent failure when `id` is undefined | `[id].tsx:12` | `validId` logic with array/empty string checks |
| Mutually exclusive states | `[id].tsx` renderContent | Loading → Error → Data must be exclusive at top level. Allergy sub-states are inside the data branch. |
| ScrollView missing flex: 1 | `[id].tsx` styles | Keep `{ flex: 1 }` on ScrollView |
| LoadingSkeleton count | `[id].tsx` | Update from `count={3}` to `count={4}` (now demographics + meds + allergies + vitals sections) |
| Error message double-unwrap | `[id].tsx` | Preserve `msg?.message \|\| 'An error occurred'` fallback |
| `react-native-paper` `Icon` usage | MedicationCard | Use `Icon` from react-native-paper (NOT `@expo/vector-icons` — package not installed) |

### File Structure for This Story

```
src/
├── app/(auth)/patient/
│   ├── [id].tsx                            MODIFY (add AllergiesCard + useAllergies)
│   └── __tests__/[id].test.tsx             MODIFY (add allergy tests)
├── components/
│   ├── AllergiesCard.tsx                   NEW
│   ├── index.ts                            MODIFY (add AllergiesCard export)
│   └── __tests__/AllergiesCard.test.tsx    NEW
├── hooks/
│   ├── useAllergies.ts                     NEW
│   ├── index.ts                            MODIFY (add useAllergies export)
│   └── __tests__/useAllergies.test.ts      NEW
├── services/api/
│   ├── clinical.ts                         MODIFY (add getAllergies)
│   ├── index.ts                            MODIFY (add getAllergies export)
│   └── __tests__/clinical.test.ts          MODIFY (add allergy tests)
├── types/
│   ├── clinical.ts                         MODIFY (add Allergy interface)
│   └── index.ts                            MODIFY (add Allergy type export)
├── theme/
│   └── colors.ts                           MODIFY (add allergySurface to ClinicalColors)
```

### Testing Patterns (from Stories 4.1, 4.2)

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
jest.mock('@/hooks/useAllergies', () => ({
  useAllergies: jest.fn(),
}));
```

Mock `apiClient` in service tests:
```typescript
jest.mock('@/services/api/client', () => ({
  apiClient: { get: jest.fn() },
}));
```

Mock `react-native-paper` in component/screen tests:
```typescript
jest.mock('react-native-paper', () => {
  const RN = require('react-native');
  const Card = ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <RN.View {...rest}>{children}</RN.View>
  );
  Card.displayName = 'Card';
  Card.Content = ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <RN.View {...rest}>{children}</RN.View>
  );
  Card.Content.displayName = 'CardContent';
  return {
    Card,
    Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.Text {...rest}>{children}</RN.Text>
    ),
    Button: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.TouchableOpacity {...rest}><RN.Text>{children}</RN.Text></RN.TouchableOpacity>
    ),
    Icon: () => null,
    useTheme: () => ({ colors: {} }),
  };
});
```

Mock vector icons:
```typescript
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
```

### References

- Epic 4 story definition: `_bmad-output/planning-artifacts/epics/epic-4-clinical-summary-patient-data.md#Story 4.3`
- UX wireframe (Clinical Summary - Allergies section): `_bmad-output/planning-artifacts/ux-design-specification/screen-wireframes-user-flows.md#Screen 3`
- UX empty state (No Allergies): `_bmad-output/planning-artifacts/ux-design-specification/screen-wireframes-user-flows.md#Empty States`
- Architecture — Domain model (Allergy type): `_bmad-output/planning-artifacts/architecture/domain-model.md#TypeScript Type Definitions`
- Architecture — API endpoint: `_bmad-output/planning-artifacts/architecture/domain-model.md#API Endpoint Reference`
- Architecture — SWR config: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Data Architecture & State Management`
- Architecture — project structure: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md`
- Architecture — implementation patterns: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- Architecture — clinical colors: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Material Design 3 Theming`
- Previous story (4.2): `_bmad-output/implementation-artifacts/stories/epic-4/story-4.2-view-active-medications.md`
- Business rules: `_bmad-output/planning-artifacts/architecture/domain-model.md#Business Rules` (Allergies rule: distinguish "no allergies" from "not assessed")
- UX design system (Safety Alert - Allergies): `_bmad-output/planning-artifacts/ux-design-specification/design-system-foundation.md#Component-Customization`

## Dev Agent Record

### Agent Model Used

opencode/deepseek-v4-flash-free

### Debug Log References

- Implementation via `bmad-dev-story` skill
- Followed existing MedicationCard/useMedications as pattern reference
- All tests pass (20 new tests written)
- Pre-existing failure in `patients.test.ts` (unrelated — v=custom param difference)

### Completion Notes List

1. Added `Allergy` interface and `AllergyResponse` type to domain model
2. Implemented `getAllergies` in clinical API service with response transform
3. Created `useAllergies` SWR hook following `useMedications` pattern
4. Built `AllergiesCard` component with red background/border, warning icons, severity display, reactions, comment, and "No known allergies" positive empty state
5. Integrated `AllergiesCard` into `[id].tsx` screen with independent loading/error/happy sub-states
6. Added `allergySurface` (#FFEBEE) to ClinicalColors
7. Wrote 20 tests across 4 test files — all passing

### File List

- `src/types/clinical.ts` — MODIFY (add Allergy interface)
- `src/types/index.ts` — MODIFY (add Allergy type export)
- `src/theme/colors.ts` — MODIFY (add allergySurface to ClinicalColors)
- `src/services/api/clinical.ts` — MODIFY (add getAllergies + AllergyResponse)
- `src/services/api/index.ts` — MODIFY (add getAllergies export)
- `src/hooks/useAllergies.ts` — NEW
- `src/hooks/index.ts` — MODIFY (add useAllergies export)
- `src/components/AllergiesCard.tsx` — NEW
- `src/components/index.ts` — MODIFY (add AllergiesCard export)
- `src/app/(auth)/patient/[id].tsx` — MODIFY (add useAllergies + AllergiesCard, update LoadingSkeleton count to 4)
- `src/services/api/__tests__/clinical.test.ts` — MODIFY (add getAllergies tests)
- `src/hooks/__tests__/useAllergies.test.ts` — NEW
- `src/components/__tests__/AllergiesCard.test.tsx` — NEW
- `src/app/(auth)/patient/__tests__/[id].test.tsx` — MODIFY (add allergy screen tests)

### Change Log

- 2026-05-21: Story 4.3 created — View Known Allergies. Context engine analysis complete.
- 2026-05-21: Story 4.3 implemented — View Known Allergies. Added Allergy type, getAllergies API, useAllergies hook, AllergiesCard component, screen integration, and 20 tests. All acceptance criteria satisfied.
