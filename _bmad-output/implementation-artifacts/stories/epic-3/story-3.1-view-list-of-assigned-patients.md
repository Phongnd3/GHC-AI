# Story 3.1: View List of Assigned Patients

Status: done

## Story

As a doctor,
I want to see a list of only my assigned patients with active visits,
So that I can quickly identify which patients I need to see today.

---

## Acceptance Criteria

**AC1.**
**Given** I am logged in as a doctor
**When** I view the My Patients dashboard
**Then** I see a list of patients with active visits where I am the primary provider
**And** Each patient card displays: Name, Patient ID, Age, Gender
**And** The list loads within 2 seconds

**AC2.**
**Given** I have more than 10 assigned patients
**When** I view the dashboard
**Then** The list is scrollable to view all patients

---

## Tasks / Subtasks

- [x] Task 1: Extend `SessionResponse` type and `auth.ts` to capture `currentProvider` (prerequisite for filtering)
  - [x] In `src/services/api/types.ts`: Add `currentProvider: { uuid: string; display: string } | null` to `SessionResponse`
  - [x] In `src/services/api/auth.ts` `login()`: Extract `response.data.currentProvider` and include it in the returned `SessionResponse` object
  - [x] In `src/contexts/AuthContext.tsx`: Update `AuthContextType.user` type to include `currentProvider` (or add `providerUuid: string | null` as a separate context field — see Dev Notes for recommendation)
  - [x] Update `checkSession()` to restore `currentProvider` from the persisted `sessionUser` JSON (no separate SecureStore key needed — it's already in the JSON blob)
  - [x] Add `src/services/api/__tests__/auth.test.ts` test: verifies `login()` extracts and returns `currentProvider` correctly (both present and null cases)

- [x] Task 2: Create `src/services/api/patients.ts` — `getActiveVisits()` function (AC: #1)
  - [x] Export `async function getActiveVisits(): Promise<Visit[]>` calling `GET /visit?includeInactive=false&v=full`
  - [x] Return `response.data.results` (OpenMRS paginates as `{ results: [...] }`)
  - [x] Import `Visit` type from `@/types/visit` (create if file does not exist yet — see Task 3)
  - [x] Add `src/services/api/__tests__/patients.test.ts`: unit test for `getActiveVisits()` — mock axios, assert correct URL and return shape

- [x] Task 3: Create TypeScript types for Visit/Patient entities (AC: #1)
  - [x] Create `src/types/patient.ts` with `Patient`, `PatientName`, `PatientIdentifier` types exactly as specified in domain-model.md
  - [x] Create `src/types/visit.ts` with `Visit`, `Encounter`, `EncounterProvider`, `Observation`, `Order` types exactly as specified in domain-model.md
  - [x] Add both to `src/types/index.ts` barrel export (currently `export {};`)

- [x] Task 4: Create `src/hooks/usePatients.ts` — SWR hook with client-side filtering (AC: #1, #2)
  - [x] Implement `usePatients(providerUuid: string)` using SWR to call `getActiveVisits()`
  - [x] Apply SWR config: `dedupingInterval: 300000` (5-min cache), `revalidateOnFocus: true`
  - [x] Client-side filter: keep only visits where `stopDatetime === null` AND providerUuid matches in `encounter.encounterProviders[].provider.uuid` (see domain-model helper functions below)
  - [x] Also filter out voided patients (`patient.voided === true`) and deceased patients (`patient.person.dead === true`)
  - [x] Return `{ patients: FilteredPatientData[], isLoading: boolean, error: unknown, mutate: () => void, lastUpdatedAt: Date | null }`
  - [x] Derive `lastUpdatedAt` from SWR's `isValidating` → flip to `new Date()` each time fresh data arrives
  - [x] Add `src/hooks/__tests__/usePatients.test.ts`: unit tests for filtering logic (test helper functions independently), loading/error states

- [x] Task 5: Create `src/components/PatientCard.tsx` (AC: #1)
  - [x] Named export `PatientCard` accepting `PatientCardProps`: `{ patient: FilteredPatientData; onPress: () => void }`
  - [x] Material Design 3 Elevated Card (88dp height, 1dp elevation) — use `<Card>` from `react-native-paper`
  - [x] Layout: Patient Name (Headline Small, `BaseColors.textPrimary`), Patient ID • Age • Gender (Body Medium, `BaseColors.textSecondary`), Ward (Body Medium, `BaseColors.textSecondary`)
  - [x] Ripple effect on tap — use `Card` with `onPress` prop (react-native-paper handles ripple)
  - [x] Follow component structure pattern: imports → types → constants → component → styles
  - [x] Add `src/components/__tests__/PatientCard.test.tsx`: render test + onPress interaction test

- [x] Task 6: Implement `src/app/(auth)/dashboard.tsx` — full My Patients screen (AC: #1, #2)
  - [x] Replace the placeholder `<View>` content with the full dashboard implementation
  - [x] Preserve the existing `Stack.Screen` header options (title "My Patients", logout IconButton, logout dialog — all from Stories 2.4–2.6)
  - [x] Use `useAuth()` to get `providerUuid`; use `usePatients(providerUuid)` for data
  - [x] Render states: loading → `<LoadingSkeleton count={3} />`, error → `<EmptyState>`, empty → `<EmptyState>`, loaded → `<FlatList>` of `<PatientCard>`
  - [x] "Last updated: X min ago" subtitle below the header (date-fns `formatDistanceToNow`) — renders when `lastUpdatedAt` is not null
  - [x] `FlatList` with `contentContainerStyle` padding for scrollability (AC: #2)
  - [x] Navigate to `/patient/${patientUuid}` on card press (router.push — route will be created in Story 3.4)
  - [x] Add `src/app/(auth)/__tests__/dashboard.test.tsx`: integration test covering loading state, rendered patient cards, and navigation on press

---

## Dev Notes

### Critical Finding: `currentProvider` Is Not Yet Captured

**This is the most important prerequisite for Story 3.1.**

The current `auth.ts` login flow (Story 2.1) does NOT extract `currentProvider` from the OpenMRS session response, and `SessionResponse` in `types.ts` has no `currentProvider` field. The OpenMRS `/session` endpoint returns:

```json
{
  "authenticated": true,
  "sessionId": "...",
  "user": { "uuid": "...", "display": "..." },
  "currentProvider": { "uuid": "abc-123-...", "display": "Dr. Smith" }
}
```

The `currentProvider.uuid` is the **providerUuid** required to filter "my patients" on the dashboard. Without it, `usePatients()` cannot distinguish the logged-in doctor's patients from all patients.

**Required changes (Task 1):**

```typescript
// src/services/api/types.ts — ADD currentProvider to SessionResponse
export interface SessionResponse {
  authenticated: boolean;
  sessionId: string;
  user: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    person: { uuid: string; display: string };
  };
  currentProvider: { uuid: string; display: string } | null; // ← ADD THIS
}
```

```typescript
// src/services/api/auth.ts — extract currentProvider in login()
return {
  sessionId,
  authenticated: response.data.authenticated,
  currentProvider: response.data.currentProvider ?? null, // ← ADD THIS
  user: { /* existing fields */ },
};
```

**AuthContext recommendation:** Add `providerUuid: string | null` as a top-level field in `AuthContextType` (not nested in `user`), to make it explicit and easy to consume:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  providerUuid: string | null; // ← ADD THIS
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimer: () => void;
  sessionExpiredMessage: string | null;
}
```

Set `providerUuid` from `response.currentProvider?.uuid ?? null` in `login()`, and restore it from the persisted `sessionUser` JSON in `checkSession()` (the JSON already includes it after this story's changes to `login()`).

---

### Domain Model: Filtering Logic (MUST follow exactly)

From `_bmad-output/planning-artifacts/architecture/domain-model.md`:

```typescript
// Active visit = stopDatetime is null
const isActiveVisit = (visit: Visit): boolean => visit.stopDatetime === null;

// "My patient" = doctor's providerUuid in any encounter's encounterProviders
const isDoctorPrimaryProvider = (visit: Visit, providerUuid: string): boolean =>
  visit.encounters.some(enc =>
    enc.encounterProviders.some(ep => ep.provider.uuid === providerUuid)
  );

// Never show voided or deceased patients
const isValidPatient = (visit: Visit): boolean =>
  !visit.patient.voided && !visit.patient.person?.dead;
```

Combined filter in `usePatients.ts`:
```typescript
const myActivePatients = allVisits.filter(visit =>
  isActiveVisit(visit) &&
  isDoctorPrimaryProvider(visit, providerUuid) &&
  isValidPatient(visit)
);
```

**⚠️ IMPORTANT — API endpoint:** The epic says `GET /visit?provider={doctorUuid}&includeInactive=false`. The architecture says `GET /visit?includeInactive=false&v=full` with client-side filtering. **Use the architecture's approach:** fetch all active visits with `?includeInactive=false&v=full`, then filter client-side. The `?provider=` parameter in OpenMRS matches against the visit's assigned provider (not encounter providers), which is less reliable for the "my patients" use case.

---

### Data Shape for `PatientCard`

The `usePatients` hook should derive display-ready data so the component stays pure. Define a `FilteredPatientData` interface:

```typescript
export interface FilteredPatientData {
  patientUuid: string;
  displayName: string;      // preferred name (givenName + familyName)
  patientId: string;        // preferred identifier
  age: string;              // e.g. "45y" or "~45y" if birthdateEstimated
  gender: string;           // "M" | "F" | "U"
  ward: string | null;      // visit location display name
  visitUuid: string;
}
```

**Name resolution** (from domain-model.md Business Rules):
```typescript
function resolveDisplayName(patient: Patient): string {
  const preferred = patient.person.names.find(n => n.preferred);
  const name = preferred ?? patient.person.names[0];
  if (!name) return 'Unknown Patient';
  return [name.givenName, name.familyName].filter(Boolean).join(' ');
}
```

**Identifier resolution:**
```typescript
function resolvePatientId(patient: Patient): string {
  const preferred = patient.identifiers.find(i => i.preferred);
  return preferred?.identifier ?? patient.identifiers[0]?.identifier ?? 'N/A';
}
```

**Age resolution:**
```typescript
function resolveAge(person: Patient['person']): string {
  if (!person.birthdate) return 'Unknown';
  const years = differenceInYears(new Date(), new Date(person.birthdate));
  return person.birthdateEstimated ? `~${years}y` : `${years}y`;
}
```
Use `differenceInYears` from `date-fns` (already a project dependency via `formatDistanceToNow` in architecture).

---

### `usePatients` Hook — `lastUpdatedAt` Pattern

The dashboard must show "Last updated: X min ago" (AC1, UX-DR20). Track when fresh data last arrived:

```typescript
const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

const { data, error, isValidating, mutate } = useSWR(
  providerUuid ? '/visit?includeInactive=false&v=full' : null, // null disables SWR when no providerUuid
  () => getActiveVisits(),
  { dedupingInterval: 300000, revalidateOnFocus: true }
);

useEffect(() => {
  if (data && !isValidating) {
    setLastUpdatedAt(new Date());
  }
}, [data, isValidating]);
```

When `providerUuid` is null (non-provider user), pass `null` as the SWR key — SWR will not fetch and `data` will be undefined.

---

### Dashboard Screen — Preserve Existing Behavior

`dashboard.tsx` currently implements (from Stories 2.6):
- `Stack.Screen` with title "My Patients" and logout `IconButton` in header
- Logout confirmation `Dialog` with Portal
- Android hardware back button interception via `useFocusEffect` + `BackHandler`
- `isLoggingOut` state guard preventing dialog dismissal mid-logout

**These must ALL be preserved.** Only the placeholder `<View>` content (lines with "My Patients" heading and "Dashboard coming in Epic 3" text) is replaced by the actual dashboard implementation.

---

### `PatientCard` — UX Spec Compliance

From UX wireframe (Screen 2, `screen-wireframes-user-flows.md`):
- Height: 88dp
- Padding: 16dp
- Spacing between cards: 16dp
- Content:
  - Line 1: Patient Name — `variant="titleMedium"` or `Headline Small` (24sp bold)
  - Line 2: `ID: {id}  •  {age}  •  {gender}` — Body Medium (14sp, `BaseColors.textSecondary`)
  - Line 3: Ward location — Body Medium (14sp, `BaseColors.textSecondary`)
- Elevation: 1dp (`mode="elevated"` on react-native-paper `Card`)
- Ripple on tap — provided automatically by `Card` with `onPress`

Example structure:
```tsx
export const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => (
  <Card mode="elevated" style={styles.card} onPress={onPress}>
    <Card.Content>
      <Text variant="titleMedium" style={styles.name}>{patient.displayName}</Text>
      <Text variant="bodyMedium" style={styles.secondary}>
        {`ID: ${patient.patientId}  •  ${patient.age}  •  ${patient.gender}`}
      </Text>
      {patient.ward && (
        <Text variant="bodyMedium" style={styles.secondary}>Ward: {patient.ward}</Text>
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.xl, height: 88 },
  name: { color: BaseColors.textPrimary },
  secondary: { color: BaseColors.textSecondary },
});
```

---

### Architecture Compliance

| Requirement | Source | Implementation |
|---|---|---|
| No direct API calls in components | `project-structure-boundaries.md` | Dashboard uses `usePatients()` hook only |
| SWR 5-min cache for patient list | `core-architectural-decisions.md` | `dedupingInterval: 300000` in `usePatients` |
| Never cache clinical data | `core-architectural-decisions.md` | N/A for this story (no clinical data) |
| Client-side filtering | `domain-model.md` | `usePatients` filters visits post-fetch |
| Named exports for components | `implementation-patterns-consistency-rules.md` | `export const PatientCard` |
| Default export for screens | `implementation-patterns-consistency-rules.md` | `export default function DashboardScreen()` |
| PascalCase component files | `implementation-patterns-consistency-rules.md` | `PatientCard.tsx` |
| camelCase hook files | `implementation-patterns-consistency-rules.md` | `usePatients.ts` |
| Colocated `__tests__/` | `implementation-patterns-consistency-rules.md` | Tests next to source files |
| `@/` alias for absolute imports | `implementation-patterns-consistency-rules.md` | `@/hooks/usePatients`, `@/components/PatientCard` |

---

### Files To Create (NEW)

| File | Type | Notes |
|---|---|---|
| `src/types/patient.ts` | NEW | `Patient`, `PatientName`, `PatientIdentifier` from domain-model.md |
| `src/types/visit.ts` | NEW | `Visit`, `Encounter`, `EncounterProvider`, `Observation`, `Order` from domain-model.md |
| `src/hooks/usePatients.ts` | NEW | SWR hook + filtering + `FilteredPatientData` interface |
| `src/components/PatientCard.tsx` | NEW | MD3 Elevated Card, 88dp height |
| `src/services/api/__tests__/patients.test.ts` | NEW | Unit test for `getActiveVisits()` |
| `src/hooks/__tests__/usePatients.test.ts` | NEW | Unit tests for filtering logic + SWR states |
| `src/components/__tests__/PatientCard.test.tsx` | NEW | Render + interaction tests |
| `src/app/(auth)/__tests__/dashboard.test.tsx` | NEW | Integration test for dashboard screen |

### Files To Update (EXISTING — read before modifying)

| File | Change | Preserve |
|---|---|---|
| `src/services/api/types.ts` | Add `currentProvider` to `SessionResponse` | `user` shape, `sessionId`, `authenticated` |
| `src/services/api/auth.ts` | Extract + return `currentProvider` in `login()` | Cookie extraction logic, credential encoding, pre-delete, existing `user` mapping |
| `src/contexts/AuthContext.tsx` | Add `providerUuid` state + expose in context | ALL existing auth logic (timer, logout, checkSession, SecureStore keys) |
| `src/services/api/patients.ts` | Implement `getActiveVisits()` — currently `export {};` | N/A (empty stub) |
| `src/hooks/index.ts` | Export `usePatients` — currently `export {};` | N/A |
| `src/types/index.ts` | Export `Patient`, `Visit`, `FilteredPatientData` — currently `export {};` | N/A |
| `src/app/(auth)/dashboard.tsx` | Replace placeholder content with real dashboard | Logout dialog, back button handler, Stack.Screen header, all Story 2.6 behavior |

---

### Testing Requirements

**Unit — `src/hooks/__tests__/usePatients.test.ts`**
- `isActiveVisit()`: returns true when `stopDatetime` is null, false otherwise
- `isDoctorPrimaryProvider()`: returns true when providerUuid matches in encounterProviders, false when not found, false when encounters array is empty
- `isValidPatient()`: returns false for voided patients, false for deceased patients, true otherwise
- SWR mock: `data` is undefined during load (isLoading=true), error state passes through, populated data filters correctly

**Component — `src/components/__tests__/PatientCard.test.tsx`**
- Renders patient name, ID, age, gender, ward
- `onPress` handler fires when card is tapped
- Does not render ward line when `patient.ward` is null

**Integration — `src/app/(auth)/__tests__/dashboard.test.tsx`**
- Loading state: renders `LoadingSkeleton`
- Loaded state: renders patient cards (mock 2 patients)
- Empty state: renders `EmptyState` with "No active patients assigned to you"
- Error state: renders error `EmptyState` with retry message
- Tap on card: `router.push` called with correct patient UUID path

**Service — `src/services/api/__tests__/patients.test.ts`**
- `getActiveVisits()`: calls correct URL `GET /visit?includeInactive=false&v=full`
- Returns `results` array from response

---

### Previous Story Intelligence (Epic 2)

From Story 2.7 (most recent):
- `AuthContext` stores `sessionUser` JSON in SecureStore — the JSON shape is `SessionResponse['user']`. After Task 1 adds `currentProvider` to this type, `sessionUser` JSON will automatically include it on next login, and `checkSession()` will restore it without any additional SecureStore key.
- `useAuth()` hook is exported from `src/contexts/AuthContext.tsx` — consume with `const { providerUuid } = useAuth()` on the dashboard.
- The `(auth)/_layout.tsx` redirect (`if (!isLoading && !isAuthenticated) router.replace('/')`) already protects the dashboard route — no changes needed there.
- `handleSessionExpiry()` and `logout()` clear all SecureStore keys — no changes needed; `providerUuid` lives in React state and is reset to `null` via `setUser(null)` / `setProviderUuid(null)`.

---

### SWR Configuration Note

**`swr` must be installed.** It was listed in the architecture as `^2.2.5`. Verify it is in `ghc-ai-doctor-app/package.json` before implementing. If not yet installed:

```bash
npm install swr --legacy-peer-deps
```

Similarly, `date-fns` must be installed for `formatDistanceToNow` and `differenceInYears`. Check `package.json`.

---

### Project Structure Reference

All files are under `ghc-ai-doctor-app/` (the React Native app package):
```
ghc-ai-doctor-app/src/
├── app/(auth)/dashboard.tsx          ← UPDATE (replace placeholder content)
├── components/
│   ├── PatientCard.tsx               ← CREATE
│   └── __tests__/PatientCard.test.tsx ← CREATE
├── hooks/
│   ├── usePatients.ts                ← CREATE
│   └── __tests__/usePatients.test.ts ← CREATE
├── services/api/
│   ├── patients.ts                   ← UPDATE (currently empty stub)
│   ├── types.ts                      ← UPDATE (add currentProvider)
│   ├── auth.ts                       ← UPDATE (extract currentProvider)
│   └── __tests__/patients.test.ts   ← CREATE
├── contexts/
│   └── AuthContext.tsx               ← UPDATE (add providerUuid)
└── types/
    ├── patient.ts                    ← CREATE
    ├── visit.ts                      ← CREATE
    └── index.ts                      ← UPDATE (currently empty)

---

### Review Findings

- [x] [FIXED][Runtime] `ep.provider.uuid` throws error when `provider` is null/undefined — OpenMRS API can return `encounterProviders` with null `provider` field. Fix: `ep.provider?.uuid === providerUuid` (optional chaining) [ghc-ai-doctor-app/src/hooks/usePatients.ts] — Fixed 2026-04-28
- [ ] [Review][Patch] `isLoading` is `true` when `providerUuid` is null — SWR key is disabled (null), so `data` and `error` stay `undefined` forever, making `isLoading` permanently `true`. Users without a provider UUID (or whose `currentProvider` is absent from the API response) see an infinite loading skeleton. Fix: `const isLoading = providerUuid !== null && !data && !error;` [ghc-ai-doctor-app/src/hooks/usePatients.ts]
- [ ] [Review][Patch] `setUser(parsedSession)` stores `providerUuid` inside `user` state after session restore — in `checkSession()`, `parsedSession` includes the `providerUuid` field and is passed directly to `setUser()`. After fresh login, `setUser(response.user)` stores only the original user fields. The `user` state has inconsistent shape depending on session origin. Fix: destructure `providerUuid` out before calling `setUser`: `const { providerUuid: restoredUuid, ...userOnly } = parsedSession; setUser(userOnly as SessionResponse['user']); setProviderUuid(restoredUuid ?? null);` [ghc-ai-doctor-app/src/contexts/AuthContext.tsx]
- [x] [Review][Defer] `router.push('/patient/...' as never)` — type-suppressed navigation to non-existent route [ghc-ai-doctor-app/src/app/(auth)/dashboard.tsx] — deferred, pre-existing (Story 3.4 will create the route)
- [x] [Review][Defer] `resolveAge` returns `"NaNy"` for invalid date strings (e.g., `"0000-00-00"`) — `new Date(invalidStr)` returns Invalid Date, `differenceInYears` returns NaN [ghc-ai-doctor-app/src/hooks/usePatients.ts] — deferred, pre-existing data quality concern
- [x] [Review][Defer] SWR cache key not scoped per-provider — all sessions share `/visit?includeInactive=false&v=full` key; stale data risk if provider changes between sessions [ghc-ai-doctor-app/src/hooks/usePatients.ts] — deferred, single-user assumption holds today
- [x] [Review][Defer] `resolveDisplayName` omits `middleName` — name assembly only uses `givenName + familyName`; OpenMRS can have middle names [ghc-ai-doctor-app/src/hooks/usePatients.ts] — deferred, out of scope for this story
```

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
