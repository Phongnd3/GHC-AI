# Deferred Work Items

## Deferred from: code review of story-4.1-view-patient-demographics (2026-04-28)

- Sprint YAML data integrity issue [sprint-status.yaml] — Story in `review` status has `completed_at` timestamp - contradictory but not caused by current change
- Missing newline at end of YAML [sprint-status.yaml] — POSIX violation, pre-existing issue  
- Duration hours inconsistency in sprint tracking [sprint-status.yaml] — Earlier entries lack `duration_hours` field - tooling issue, not current change

## Deferred from: code review of story-4.3-view-known-allergies (2026-05-22)

- SWR dedupingInterval:0 + revalidateOnFocus:true refetches on every focus [useAllergies.ts:14] — Deliberate architectural decision (no cache for clinical data)
- Invalid patient ID + retry button is a dead end [[id].tsx:20-21] — Pre-existing issue not caused by this story
- ErrorState isRetrying prop never wired up [AllergiesCard.tsx:36] — Pre-existing pattern (same as MedicationCard)
- Stale allergy data hidden on revalidation failure [AllergiesCard.tsx:35-37] — Pre-existing pattern (same as MedicationCard)
