# Deferred Work Items

## Deferred from: code review of story-4.1-view-patient-demographics (2026-04-28)

- Sprint YAML data integrity issue [sprint-status.yaml] — Story in `review` status has `completed_at` timestamp - contradictory but not caused by current change
- Missing newline at end of YAML [sprint-status.yaml] — POSIX violation, pre-existing issue  
- Duration hours inconsistency in sprint tracking [sprint-status.yaml] — Earlier entries lack `duration_hours` field - tooling issue, not current change
