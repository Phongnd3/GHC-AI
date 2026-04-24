# Story Time Tracking - Quick Reference

## For Developers

### ✅ What You Need to Know

**Time tracking is automatic** - just use the normal workflow:

```bash
# Start working on a story
bmad-dev-story

# System automatically:
# 1. Records start time when story begins
# 2. Records completion time when story finishes
# 3. Calculates duration in hours
```

**No manual tracking required!**

---

## Viewing Time Data

### Option 1: View Sprint Status File

```bash
cat _bmad-output/planning-artifacts/sprint-status.yaml
```

Look for the `time_tracking` section at the bottom.

### Option 2: Use Report Utility

```bash
# Text report (default)
node _bmad-output/planning-artifacts/time-tracking-report.js

# JSON format (for tools/scripts)
node _bmad-output/planning-artifacts/time-tracking-report.js --format=json

# CSV format (for spreadsheets)
node _bmad-output/planning-artifacts/time-tracking-report.js --format=csv

# Filter by epic
node _bmad-output/planning-artifacts/time-tracking-report.js --epic=1

# Filter by status
node _bmad-output/planning-artifacts/time-tracking-report.js --status=done
```

---

## Multi-Developer Workflow

### Before Starting Work

```bash
# Always pull latest sprint status
git pull origin main
```

### After Completing Story

```bash
# Commit sprint status with your changes
git add _bmad-output/planning-artifacts/sprint-status.yaml
git commit -m "Complete story 1-7: Create Base UI Components (2.5 hours)"
git push origin main
```

### Handling Conflicts

If you get a merge conflict in `sprint-status.yaml`:

1. Open the file
2. Keep ALL `time_tracking` entries from both branches
3. Merge `development_status` carefully
4. Save and commit

```bash
git add _bmad-output/planning-artifacts/sprint-status.yaml
git commit -m "Merge sprint status"
```

---

## Data Format

### In sprint-status.yaml

```yaml
time_tracking:
  1-6-implement-centralized-error-handler:
    started_at: "2026-04-24T09:30:00+07:00"
    completed_at: "2026-04-24T12:15:00+07:00"
    duration_hours: 2.8
```

### Fields

- **started_at**: ISO timestamp when story moved to `in-progress`
- **completed_at**: ISO timestamp when story moved to `review`
- **duration_hours**: Elapsed time in hours (1 decimal place)

---

## Common Questions

**Q: What if I pause work and resume later?**  
A: Current tracking measures elapsed time, not active work time. For accurate tracking, try to complete stories in single sessions.

**Q: Can I manually edit the time data?**  
A: Yes, you can edit `duration_hours` in `sprint-status.yaml` if needed.

**Q: What if I forget to use bmad-dev-story?**  
A: Time won't be tracked. Always use the workflow for automatic tracking.

**Q: How do I see team velocity?**  
A: Run the report utility to see average time per story and epic breakdowns.

---

## Report Examples

### Text Report

```
=====================================
Story Execution Time Report
=====================================
Generated: 2026-04-24T12:09:14+07:00
Project: GHC Mobile App

SUMMARY
-------
Total Stories Tracked: 6
Total Development Time: 18h 30m
Average Time per Story: 3h 5m

EPIC BREAKDOWN
--------------
Epic 1: 18h 30m (6 stories)
  - Avg: 3h 5m/story
```

### CSV Export

```csv
Story Key,Epic,Status,Started At,Completed At,Duration (hours)
1-1-initialize-expo-project,1,done,2026-04-22T09:00:00+07:00,2026-04-22T13:15:00+07:00,4.3
1-2-configure-dev-tooling,1,done,2026-04-22T14:00:00+07:00,2026-04-22T16:45:00+07:00,2.8
```

Import into Excel/Google Sheets for analysis.

---

## Tips

1. **Pull before starting** - Always get latest sprint status
2. **Commit after completion** - Share your time data with team
3. **Use the report** - Check team velocity regularly
4. **Complete in sessions** - For accurate time tracking
5. **Review trends** - Use data to improve estimates

---

## Need Help?

- Read full guide: `_bmad-output/planning-artifacts/time-tracking-guide.md`
- Check workflow docs: `.kiro/skills/bmad-dev-story/workflow.md`
- Ask team lead or project maintainer

---

**Remember: Time tracking is automatic when you use bmad-dev-story!**
