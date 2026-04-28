# Course Correction 001: Patient Filtering Strategy Change

**Date:** 2026-04-28  
**Initiated By:** Technical Investigation  
**Status:** ✅ Approved  
**Impact:** Epic 3 (My Patients Dashboard)

---

## Summary

Changed patient filtering strategy from **encounterProviders matching** to **visit creator matching** due to data availability issues in the OpenMRS instance.

---

## Problem Statement

### Original Design
Epic 3 Story 3.1 specified filtering patients by matching the logged-in provider's UUID against `encounterProviders` in visit encounters:

```typescript
export function isDoctorPrimaryProvider(visit: Visit, providerUuid: string): boolean {
  return visit.encounters.some(enc =>
    enc.encounterProviders.some(ep => ep.provider?.uuid === providerUuid)
  );
}
```

### Issue Discovered
During testing against the OpenMRS demo instance (o3.openmrs.org), we found:
- **10 active visits** returned by the API
- **Most visits had empty `encounterProviders` arrays**
- Result: "No active patients" displayed despite active visits existing

### Root Cause Analysis

1. **Web App Pattern (ESM):**
   - Always populates `encounterProviders` when creating encounters
   - Gets `currentProvider` from session: `const { currentProvider } = useSession()`
   - Includes in encounter payload:
     ```typescript
     encounterProviders: [
       {
         provider: currentProvider?.uuid,
         encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
       }
     ]
     ```

2. **Data Reality:**
   - Visits created by admin users who aren't configured as providers
   - `currentProvider` was `null` during encounter creation
   - Encounters created through mechanisms that don't populate `encounterProviders`
   - Legacy data without provider assignments

3. **Impact:**
   - Mobile app filter returned zero results
   - Feature appeared broken despite correct implementation

---

## Proposed Solution

### Option 3: Match by Visit Creator

Filter patients by matching the logged-in user's UUID against the visit creator:

```typescript
export function isCreatedByUser(visit: Visit, userUuid: string): boolean {
  return visit.auditInfo?.creator?.uuid === userUuid;
}
```

### Rationale

**Advantages:**
- ✅ **Data always available** - Every visit has `auditInfo.creator`
- ✅ **Reliable** - Creator UUID is set automatically by OpenMRS
- ✅ **Matches workflow** - Doctor who creates visit typically manages that patient
- ✅ **Works with existing data** - No data migration needed

**Trade-offs:**
- ⚠️ Doesn't support provider handoffs (if visit created by one doctor, assigned to another)
- ⚠️ Admin-created visits won't appear in any doctor's list

**Alternatives Considered:**

1. **Match by location** - Too broad, shows all patients at facility
2. **Show all active visits** - No filtering, defeats purpose of "My Patients"
3. **Fix the data** - Requires backend changes, data migration, not feasible for Phase 1

---

## Changes Required

### Epic 3 Story 3.1 Update

**Before:**
```
Then I see a list of patients with active visits where I am the primary provider
```

**After:**
```
Then I see a list of patients with active visits where I am the visit creator
```

**Technical Context Update:**

**Before:**
```
- GET /visit?provider={doctorUuid}&includeInactive=false
- Filter: stopDatetime = null (active visits only)
```

**After:**
```
- GET /visit?includeInactive=false&v=full
- Filter client-side: stopDatetime = null (active visits) AND auditInfo.creator.uuid = userUuid
- Changed from encounterProviders matching to visit creator matching (more reliable with current data)
```

### Code Changes

**File:** `ghc-ai-doctor-app/src/hooks/usePatients.ts`

**Before:**
```typescript
export function isDoctorPrimaryProvider(visit: Visit, providerUuid: string): boolean {
  return visit.encounters.some(enc =>
    enc.encounterProviders.some(ep => ep.provider?.uuid === providerUuid)
  );
}
```

**After:**
```typescript
export function isCreatedByUser(visit: Visit, userUuid: string): boolean {
  return visit.auditInfo?.creator?.uuid === userUuid;
}
```

**Filter Update:**
```typescript
// Change from providerUuid to userUuid
export function usePatients(userUuid: string | null): UsePatientsResult {
  // ...
  const patients: FilteredPatientData[] =
    data && Array.isArray(data) && userUuid
      ? data
          .filter(
            visit =>
              isActiveVisit(visit) &&
              isCreatedByUser(visit, userUuid) &&  // Changed
              isValidPatient(visit)
          )
          // ...
}
```

**AuthContext Update:**
```typescript
// Pass user.uuid instead of providerUuid
const { patients } = usePatients(user?.uuid ?? null);
```

### Test Updates

**File:** `ghc-ai-doctor-app/src/hooks/__tests__/usePatients.test.ts`

- Rename `isDoctorPrimaryProvider` tests to `isCreatedByUser`
- Update test data to use `auditInfo.creator.uuid` instead of `encounterProviders`
- Update filter tests to pass `userUuid` instead of `providerUuid`

---

## Impact Assessment

### Affected Components
- ✅ Epic 3 Story 3.1 (specification updated)
- ✅ `usePatients` hook (implementation change)
- ✅ `AuthContext` (pass user.uuid instead of providerUuid)
- ✅ Unit tests (test data and assertions updated)

### Not Affected
- ✅ Epic 2 (Authentication) - No changes needed
- ✅ Epic 4 (Clinical Summary) - No changes needed
- ✅ Epic 5 (Integration) - No changes needed
- ✅ API client - No changes needed
- ✅ UI components - No changes needed

### Timeline Impact
- **No delay** - Change is implementation detail
- Story 3.1 can proceed as planned
- No additional stories required

---

## Validation Plan

### Unit Tests
- [x] Update `isDoctorPrimaryProvider` → `isCreatedByUser`
- [x] Test with `auditInfo.creator.uuid` matching
- [x] Test with non-matching creator
- [x] Test with missing `auditInfo`

### Integration Tests
- [ ] Verify patient list shows visits created by logged-in user
- [ ] Verify visits created by other users are filtered out
- [ ] Verify empty state when user has no created visits

### Manual Testing
- [ ] Log in as user who created visits → See those patients
- [ ] Log in as different user → See different patients
- [ ] Log in as admin who created visits → See admin's patients

---

## Future Considerations

### Phase 2 Enhancement Options

If provider-based filtering becomes required:

1. **Backend Enhancement:**
   - Ensure all encounter creation flows populate `encounterProviders`
   - Add validation to reject encounters without providers
   - Migrate legacy data to add provider assignments

2. **Hybrid Approach:**
   - Primary filter: `encounterProviders` matching
   - Fallback filter: Visit creator matching
   - Covers both new and legacy data

3. **Configuration Option:**
   - Allow deployment to choose filtering strategy
   - Support different workflows (creator-based vs provider-based)

---

## Approval

**Approved By:** Technical Lead  
**Date:** 2026-04-28  
**Rationale:** Pragmatic solution that works with existing data, no timeline impact, clear path for future enhancement if needed.

---

## References

- **Epic 3:** `_bmad-output/planning-artifacts/epics/epic-3-my-patients-dashboard.md`
- **Investigation Log:** `/tmp/expo-output.log` (API response analysis)
- **ESM Reference:** `packages/esm-ward-app/src/ward.resource.ts` (encounterProviders pattern)
- **OpenMRS API:** `GET /visit?includeInactive=false&v=full`

---

*Course correction approved and implemented. Epic 3 can proceed with updated filtering strategy.*
