# Story 3.3: Handle Empty Patient List

Status: review

## Story

As a doctor,
I want to see a clear message when I have no assigned patients,
So that I know the app is working correctly and I simply have no patients today.

---

## Acceptance Criteria

**AC1.**
**Given** I am logged in as a doctor
**When** I have no patients with active visits assigned to me
**Then** I see the message "No active patients assigned to you"
**And** An appropriate icon is displayed
**And** No patient cards are shown

---

## ⚠️ PRE-IMPLEMENTATION NOTICE

**This story was implemented ahead-of-schedule as part of Story 3.1.**

The `dashboard.tsx` `renderContent()` function already has the following guard (as of Story 3.1):

```tsx
if (patients.length === 0) {
  return (
    <EmptyState
      icon="account-group"
      message="No active patients assigned to you"
    />
  );
}
```

A passing test also already exists in `dashboard.test.tsx`:
```typescript
it('shows empty state when no patients are assigned', () => {
  (usePatients as jest.Mock).mockReturnValue({
    ...defaultPatientsResult,
    patients: [],
  });
  const { getByText } = render(<DashboardScreen />);
  expect(getByText('No active patients assigned to you')).toBeTruthy();
});
```

The dev agent's primary job for this story is to **verify** the existing implementation is correct, add one additional test for completeness, and mark the story done.

---

## Tasks / Subtasks

- [x] Task 1: Verify existing empty state implementation in `dashboard.tsx` (AC: #1)
  - [x] Open `src/app/(auth)/dashboard.tsx` and confirm `renderContent()` contains the empty state guard:
    ```tsx
    if (patients.length === 0) {
      return (
        <EmptyState
          icon="account-group"
          message="No active patients assigned to you"
        />
      );
    }
    ```
  - [x] Verify `EmptyState` is imported at the top of `dashboard.tsx` — it is: `import { EmptyState } from '@/components/EmptyState';`
  - [x] Confirm `EmptyState` is called WITHOUT `actionLabel` / `onActionPress` props — the empty patient state should have NO retry/action button (that is only for the error state)
  - [x] Confirm the empty guard appears **before** the `FlatList` return — when `patients.length === 0` the `FlatList` is never rendered, so no patient cards appear (AC1 "no patient cards shown")
  - [x] Confirm the `icon="account-group"` value — Material Design icon showing a group of people, semantically appropriate for "no assigned patients"
  - [x] **No code changes needed if all of the above are confirmed**

- [x] Task 2: Verify and extend tests in `dashboard.test.tsx` (AC: #1)
  - [x] Confirm the existing test `shows empty state when no patients are assigned` passes:
    ```typescript
    it('shows empty state when no patients are assigned', () => {
      (usePatients as jest.Mock).mockReturnValue({ ...defaultPatientsResult, patients: [] });
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('No active patients assigned to you')).toBeTruthy();
    });
    ```
  - [x] Add ONE new test to the `describe('DashboardScreen - patient list', ...)` block immediately after the above test:
    ```typescript
    it('does not render patient cards when patient list is empty', () => {
      (usePatients as jest.Mock).mockReturnValue({
        ...defaultPatientsResult,
        patients: [],
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FlatList } = require('react-native');
      const { UNSAFE_queryByType, queryByText } = render(<DashboardScreen />);

      // No FlatList should be rendered — renderContent() returns EmptyState before reaching it
      expect(UNSAFE_queryByType(FlatList)).toBeNull();
      // Confirm empty state message is present (double-check)
      expect(queryByText('No active patients assigned to you')).toBeTruthy();
      // Confirm error message is not present
      expect(queryByText('Unable to load patients. Tap to retry.')).toBeNull();
    });
    ```
  - [x] Run `npx jest --no-coverage src/app/\\(auth\\)/__tests__/dashboard.test.tsx` and confirm all tests pass (178 → 179 total)

---

## Dev Notes

### Pre-Implementation Summary

This story covers a single render state in the `renderContent()` function of `dashboard.tsx` — the "empty list" state. It was fully implemented during Story 3.1 as part of the complete dashboard scaffold.

### File Map (no new files)

| File | Change Type | What Changes |
|------|------------|--------------|
| `src/app/(auth)/dashboard.tsx` | VERIFY (no changes expected) | Confirm empty state guard is present and correct |
| `src/app/(auth)/__tests__/dashboard.test.tsx` | UPDATE | Add 1 new test: `does not render patient cards when patient list is empty` |

### `renderContent()` State Machine (full, as of Story 3.2)

```
isLoading === true               → <LoadingSkeleton count={3} />
error is truthy                  → <EmptyState icon="wifi-off" message="Unable to load patients. Tap to retry." actionLabel="Retry" onActionPress={mutate} />
patients.length === 0            → <EmptyState icon="account-group" message="No active patients assigned to you" />  ← Story 3.3
otherwise                        → <FlatList ... refreshControl={<RefreshControl>} />
```

Priority order is important: error is checked before empty. This means an error state takes precedence over an empty list (correct behavior — we don't want to show "no patients" when a network failure may have caused an empty result).

### `EmptyState` Component Contract

File: `src/components/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon: string;          // Material Design icon name (from react-native-paper's Icon component)
  message: string;       // Text to display below the icon
  actionLabel?: string;  // Optional: label for action button
  onActionPress?: () => void; // Required if actionLabel provided
}
```

- Uses `Icon` from `react-native-paper` at `size={64}` with `color={BaseColors.textSecondary}`
- Message uses `Typography.bodyLarge`, `color: BaseColors.textSecondary`, centered
- Action button only renders when BOTH `actionLabel` AND `onActionPress` are provided
- **Story 3.3 usage:** No action button (no `actionLabel`/`onActionPress`) — doctor just sees the message and icon, no retry needed since this is not an error state

### Icon Choice: `account-group`

The icon `"account-group"` is a valid Material Design Icons name (available via react-native-paper's `Icon` component). It shows a silhouette of multiple people, which is contextually appropriate for "no assigned patients" in a medical dashboard context.

### Test Architecture Notes

- `react-native-paper` is fully mocked in `dashboard.test.tsx`. The mock includes `Icon = () => null` — this means the icon itself does NOT render in test assertions. However, the `EmptyState` component still renders its `message` text, which is what the test checks.
- `EmptyState` component has its own test suite at `src/components/__tests__/EmptyState.test.tsx` (4 tests) that validates the icon and message render correctly. No duplication needed in dashboard tests.
- The new test uses `UNSAFE_queryByType(FlatList)` (note: `queryBy` not `getBy` to avoid throwing when not found) to confirm `FlatList` is absent in the empty state.

### Existing Tests That Must Keep Passing

All 178 existing tests must continue to pass. Key tests to verify remain intact:
- `shows empty state when no patients are assigned` — existing test that verifies the message text
- `shows patient cards when patients are loaded` — verifies FlatList renders when patients exist
- `shows loading skeleton when data is loading` — verifies `isLoading` branch
- `shows error state with retry when fetch fails` — verifies error branch

### Architecture Compliance

| Requirement | Source | Status |
|---|---|---|
| Use `EmptyState` component from Epic 1 | Epic 3.3 Technical Context | ✅ Already using `EmptyState` from `src/components/EmptyState.tsx` |
| No direct API calls in components/screens | `project-structure-boundaries.md` | ✅ No API call needed — empty state is a display-only state |
| React Native Paper MD3 components | `design-system-foundation.md` | ✅ `EmptyState` uses `Icon` and `Text` from react-native-paper |
| Covers FR11 | Epic 3.3 Technical Context | ✅ FR11 = "show empty state when no patients" |

### UX Spec Compliance

From `screen-wireframes-user-flows.md` (Screen 2 - My Patients Dashboard):
- **Empty:** "No active patients assigned to you" message with icon

✅ Exact message match: `"No active patients assigned to you"`
✅ Icon: `account-group` (group of people silhouette, semantically appropriate)

### Previous Story Intelligence

From Story 3.1:
- The `EmptyState` component mock in `dashboard.test.tsx` is: `const Icon = () => null;` — icons don't render in tests, but the message text does. This is expected and correct.
- The `react-native-paper` mock includes `Card` and `Icon` — required for `EmptyState` component to render in dashboard tests. Do not remove these from the mock.

From Story 3.2:
- `defaultPatientsResult` in `dashboard.test.tsx` now includes `isRefreshing: false`. All mock returns in new tests should spread this object.
- `renderContent()` state machine is now: `isLoading → error → empty → list`. The empty check (`patients.length === 0`) correctly sits between error and list states.

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

None — no implementation failures. Story was already implemented in Story 3.1.

### Completion Notes List

- ✅ Task 1: Verified `dashboard.tsx` `renderContent()` already contains correct empty state guard: `icon="account-group"`, `message="No active patients assigned to you"`, no action button. No code changes required.
- ✅ Task 2: Confirmed existing test `shows empty state when no patients are assigned` passes. Added new test `does not render patient cards when patient list is empty` using `UNSAFE_queryByType(FlatList)` to verify FlatList is absent in empty state.
- ✅ Full test suite: **179 tests passing, 14 suites, 0 failures** (+1 new test from Story 3.3).

### Change Log

- 2026-04-29: Story 3.3 verified and completed — empty state was pre-implemented in Story 3.1. Added 1 new test for `does not render patient cards when patient list is empty`.

### File List

- `ghc-ai-doctor-app/src/app/(auth)/__tests__/dashboard.test.tsx` — MODIFIED: added 1 new test (`does not render patient cards when patient list is empty`)
- `ghc-ai-doctor-app/src/app/(auth)/dashboard.tsx` — VERIFIED (no changes — empty state was already implemented in Story 3.1)
