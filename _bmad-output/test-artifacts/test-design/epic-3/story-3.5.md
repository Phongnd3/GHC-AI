# Test Design Document: Story 3.5 - Display Last Updated Timestamp

**Story ID:** 3.5  
**Epic:** 3 - My Patients Dashboard  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers displaying the last updated timestamp on the patient list to show data freshness.

## Test Scenarios

### Positive Scenarios
- Timestamp displays correctly
- Updates on data refresh
- Clear formatting

### Negative Scenarios
- Missing timestamp data
- Invalid timestamp formats
- Timezone issues

### Boundary Scenarios
- Very old timestamps
- Future timestamps
- Different locales

## Risk Assessment

**High Risk Areas:**
- Data freshness indication
- Timestamp accuracy
- User understanding
- Timezone handling

**Medium Risk Areas:**
- Formatting consistency
- Performance impact

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-3.5.1 | AC1 - Timestamp Display | Patient list shows last updated time | Timestamp visible on dashboard | P0 |
| TC-3.5.2 | AC1 - Update on Refresh | Pull refresh updates timestamp | New timestamp after refresh | P0 |
| TC-3.5.3 | AC2 - Formatting | Timestamp format is user-friendly | Readable date/time format | P0 |
| TC-3.5.4 | AC3 - Accuracy | Timestamp reflects actual update time | Matches server response time | P1 |
| TC-3.5.5 | UI - Position | Timestamp placement on screen | Clear, non-intrusive location | P1 |
| TC-3.5.6 | Negative - Missing Data | No timestamp in API response | Handles gracefully | P2 |
| TC-3.5.7 | Negative - Invalid Format | Malformed timestamp data | Fallback or error handling | P2 |
| TC-3.5.8 | Boundary - Old Data | Timestamp from days ago | Still displays correctly | P2 |
| TC-3.5.9 | Boundary - Timezone | Different device timezone | Consistent display | P3 |

## Test Categorization

### Functional Tests (50%)
- Timestamp display logic
- Update mechanisms
- Data accuracy

### UI/UX Tests (35%)
- Formatting and readability
- Position and visibility

### API Tests (10%)
- Timestamp data handling

### Performance Tests (5%)
- Display rendering speed

## Entry/Exit Criteria

**Entry Criteria:**
- Story 3.1 complete (patient list)
- Date/time utilities available

**Exit Criteria:**
- All P0 test cases pass
- Timestamp displays correctly
- Updates on refresh