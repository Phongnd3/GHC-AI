# Story Execution Time Tracking Guide

**Purpose:** Track actual development time for each story to improve estimation accuracy and team velocity measurement.

**Status:** ✅ Active  
**Last Updated:** 2026-04-24

---

## Overview

The BMad workflow automatically tracks execution time for every story from start to completion. This data is stored in `sprint-status.yaml` and can be analyzed to:

- Improve future story estimates
- Measure team velocityt
- Identify bottlenecks
- Compare estimated vs actual time
- Track developer productivity trends

---

## How It Works

### Automatic Time Tracking

Time tracking happens automatically when developers use `bmad-dev-story`:

1. **Story Start** (Step 4 of dev-story workflow):
   - When story status changes from `ready-for-dev` → `in-progress`
   - System records `started_at` timestamp in ISO format
   - Example: `2026-04-24T12:09:14+07:00`

2. **Story Completion** (Step 9 of dev-story workflow):
   - When story status changes from `in-progress` → `review`
   - System records `completed_at` timestamp in ISO format
   - System calculates `duration_hours` automatically
   - Formula: `(completed_at - started_at) / 3600` rounded to 1 decimal

3. **Data Storage**:
   - All time data stored in `sprint-status.yaml` under `time_tracking` section
   - Preserves full timestamp precision for analysis
   - Duration calculated in hours for easy comparison

### Data Structure

```yaml
time_tracking:
  1-6-implement-centralized-error-handler:
    started_at: "2026-04-24T09:30:00+07:00"
    completed_at: "2026-04-24T12:15:00+07:00"
    duration_hours: 2.8
  
  2-1-doctor-login-openmrs-credentials:
    started_at: "2026-04-24T13:00:00+07:00"
    completed_at: null
    duration_hours: null  # Story still in progress
```

---

## Sprint Status File Structure

The `sprint-status.yaml` file contains both development status and time tracking:

```yaml
# generated: 2026-04-24T12:09:14+07:00
# last_updated: 2026-04-24T12:09:14+07:00
# project: GHC Mobile App - OpenMRS Patient Management
# project_key: NOKEY
# tracking_system: file-system
# story_location: _bmad-output/implementation-artifacts/stories

# STATUS DEFINITIONS:
# ==================
# Epic Status:
#   - backlog: Epic not yet started
#   - in-progress: Epic actively being worked on
#   - done: All stories in epic completed
#
# Story Status:
#   - backlog: Story only exists in epic file
#   - ready-for-dev: Story file created in stories folder
#   - in-progress: Developer actively working on implementation
#   - review: Ready for code review
#   - done: Story completed
#
# Retrospective Status:
#   - optional: Can be completed but not required
#   - done: Retrospective has been completed

generated: "2026-04-24T12:09:14+07:00"
last_updated: "2026-04-24T12:09:14+07:00"
project: "GHC Mobile App - OpenMRS Patient Management"
project_key: "NOKEY"
tracking_system: "file-system"
story_location: "_bmad-output/implementation-artifacts/stories"

development_status:
  epic-1: in-progress
  1-1-initialize-expo-project: done
  1-2-configure-dev-tooling: done
  1-3-setup-testing-infrastructure: done
  1-4-implement-theme-system: done
  1-5-configure-api-client: done
  1-6-implement-centralized-error-handler: done
  1-7-create-base-ui-components: ready-for-dev
  1-8-configure-environment-variables: ready-for-dev
  epic-1-retrospective: optional

time_tracking:
  # Populated automatically by dev-story workflow
  # Format per story:
  #   story-key:
  #     started_at: ISO datetime when story moved to in-progress
  #     completed_at: ISO datetime when story moved to review
  #     duration_hours: elapsed hours (null if started_at missing)
  
  1-6-implement-centralized-error-handler:
    started_at: "2026-04-24T09:30:00+07:00"
    completed_at: "2026-04-24T12:15:00+07:00"
    duration_hours: 2.8
```

---

## Usage for Developers

### No Manual Action Required

Developers don't need to do anything special - time tracking is automatic:

1. Run `bmad-dev-story` to start working on a story
2. System automatically records start time
3. Complete the story following normal workflow
4. System automatically records completion time and calculates duration

### Checking Your Time

To see time spent on stories:

```bash
# View sprint status file
cat _bmad-output/planning-artifacts/sprint-status.yaml

# Or use the time tracking report utility (see below)
node _bmad-output/planning-artifacts/time-tracking-report.js
```

---

## Time Tracking Report Utility

A utility script is provided to analyze time tracking data:

### Features

- Summary statistics (total time, average time per story)
- Epic-level time breakdown
- Individual story times with status
- Identify stories without time data
- Export data for further analysis

### Usage

```bash
# Generate time tracking report
node _bmad-output/planning-artifacts/time-tracking-report.js

# Output example:
# =====================================
# Story Execution Time Report
# =====================================
# Generated: 2026-04-24T12:09:14+07:00
# Project: GHC Mobile App
# 
# SUMMARY
# -------
# Total Stories Tracked: 6
# Total Development Time: 18.5 hours
# Average Time per Story: 3.1 hours
# 
# EPIC BREAKDOWN
# --------------
# Epic 1: 18.5 hours (6 stories)
#   - Avg: 3.1 hours/story
# 
# STORY DETAILS
# -------------
# 1-1-initialize-expo-project: 4.2 hours ✅ done
# 1-2-configure-dev-tooling: 2.8 hours ✅ done
# 1-3-setup-testing-infrastructure: 3.5 hours ✅ done
# 1-4-implement-theme-system: 2.9 hours ✅ done
# 1-5-configure-api-client: 2.3 hours ✅ done
# 1-6-implement-centralized-error-handler: 2.8 hours ✅ done
```

---

## Multi-Developer Synchronization

### How It Works Across Team

1. **Centralized Tracking**:
   - All time data stored in single `sprint-status.yaml` file
   - File is part of project repository
   - Changes committed with story completion

2. **Conflict Prevention**:
   - Each developer works on different stories (parallel work)
   - Story keys are unique (no overlap)
   - Git merge conflicts rare (different sections of file)

3. **Synchronization Workflow**:
   ```bash
   # Before starting a story
   git pull origin main  # Get latest sprint-status.yaml
   
   # Work on story using bmad-dev-story
   # Time tracking happens automatically
   
   # After story completion
   git add _bmad-output/planning-artifacts/sprint-status.yaml
   git commit -m "Complete story 1-7: Create Base UI Components (2.5 hours)"
   git push origin main
   ```

4. **Handling Merge Conflicts**:
   - If conflict occurs in `sprint-status.yaml`:
   - Keep both time tracking entries (they're for different stories)
   - Merge manually or use `git mergetool`
   - Preserve all `time_tracking` entries from both branches

### Best Practices for Teams

1. **Pull Before Starting**:
   - Always `git pull` before running `bmad-dev-story`
   - Ensures you have latest sprint status

2. **Commit After Completion**:
   - Commit `sprint-status.yaml` immediately after story completion
   - Include duration in commit message for visibility

3. **Parallel Work**:
   - Multiple developers can work simultaneously
   - Each works on different story (different key)
   - No conflicts as long as stories are different

4. **Sprint Planning Updates**:
   - Run `bmad-sprint-planning` to regenerate sprint status
   - Preserves existing time tracking data
   - Adds new stories from epics

---

## Data Analysis

### Metrics You Can Track

1. **Story Velocity**:
   - Average hours per story
   - Stories completed per sprint
   - Trend over time

2. **Epic Velocity**:
   - Total hours per epic
   - Average story time within epic
   - Compare across epics

3. **Estimation Accuracy**:
   - Compare estimated vs actual time
   - Identify patterns (always over/under)
   - Improve future estimates

4. **Developer Productivity**:
   - Individual developer velocity
   - Compare across team members
   - Identify training needs

5. **Bottleneck Identification**:
   - Stories taking longer than expected
   - Epics with high variance
   - Technical debt indicators

### Exporting Data

The time tracking data is in YAML format and can be easily exported:

```bash
# Convert to JSON for analysis
npm install -g js-yaml
js-yaml _bmad-output/planning-artifacts/sprint-status.yaml > sprint-data.json

# Import into spreadsheet
# Use the time-tracking-report.js utility to generate CSV
```

---

## Troubleshooting

### Missing Time Data

**Problem:** Story completed but no time tracking data

**Causes:**
1. Story was marked `done` manually (not via `bmad-dev-story`)
2. Sprint status file didn't exist when story started
3. Story status was changed outside workflow

**Solution:**
- Always use `bmad-dev-story` workflow for implementation
- Ensure `sprint-status.yaml` exists before starting stories
- Run `bmad-sprint-planning` to initialize tracking structure

### Incorrect Duration

**Problem:** Duration doesn't match actual work time

**Causes:**
1. Story was paused and resumed (workflow doesn't track pauses)
2. Multiple sessions across days
3. Interruptions not accounted for

**Solution:**
- Current tracking measures elapsed time (not active work time)
- For more accurate tracking, complete stories in single session
- Or manually adjust `duration_hours` in `sprint-status.yaml`

### Merge Conflicts

**Problem:** Git conflict in `sprint-status.yaml`

**Solution:**
```bash
# View conflict
git status

# Open file and manually merge
# Keep all time_tracking entries from both branches
# Merge development_status carefully

# Mark as resolved
git add _bmad-output/planning-artifacts/sprint-status.yaml
git commit
```

---

## Future Enhancements

Potential improvements to time tracking:

1. **Pause/Resume Support**:
   - Track active work time vs elapsed time
   - Handle interruptions and context switches

2. **Developer Attribution**:
   - Track which developer worked on each story
   - Team velocity metrics

3. **Estimation Integration**:
   - Add estimated time to story files
   - Compare estimated vs actual
   - Calculate estimation accuracy

4. **Dashboard Visualization**:
   - Web-based dashboard for time metrics
   - Charts and graphs
   - Real-time sprint progress

5. **Integration with Tools**:
   - Export to Jira, Linear, etc.
   - Sync with time tracking tools
   - Automated reporting

---

## References

- [Sprint Planning Workflow](.kiro/skills/bmad-sprint-planning/workflow.md)
- [Dev Story Workflow](.kiro/skills/bmad-dev-story/workflow.md)
- [Sprint Status File](sprint-status.yaml)
- [Time Tracking Report Utility](time-tracking-report.js)

---

## Questions?

For questions or issues with time tracking:

1. Check this guide first
2. Review the workflow documentation
3. Inspect `sprint-status.yaml` structure
4. Ask team lead or project maintainer

---

*This guide is maintained as part of the BMad workflow documentation.*
