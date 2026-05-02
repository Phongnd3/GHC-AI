# Test Design Document: Story 3.3 - Handle Empty Patient List

**Story ID:** 3.3  
**Epic:** 3 - My Patients Dashboard  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers the empty state handling when a doctor has no assigned patients with active visits.

## Test Scenarios

### Positive Scenarios
- Empty state message displays
- Clear, helpful messaging
- Appropriate visual design

### Negative Scenarios
- Empty state not triggered
- Incorrect messaging
- Poor visual design

### Boundary Scenarios
- Doctor with inactive patients
- Temporary empty states
- Very long messages

## Risk Assessment

**High Risk Areas:**
- User confusion when no patients (FR11)
- Appropriate messaging for doctors
- Visual design consistency
- False empty states

**Medium Risk Areas:**
- Performance of empty check
- Accessibility

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-3.3.1 | AC1 - Empty State Display | Doctor with no active patients | Shows "No active patients assigned" | P0 |
| TC-3.3.2 | AC1 - Message Accuracy | Verify exact message text | Matches specification | P0 |
| TC-3.3.3 | AC2 - Visual Design | Empty state appearance | Centered, clear, professional | P0 |
| TC-3.3.4 | AC3 - No False Positives | Doctor with inactive patients only | Does not show empty state | P1 |
| TC-3.3.5 | UI - Icon Presence | Empty state includes appropriate icon | Medical or general empty icon | P1 |
| TC-3.3.6 | UI - Theme Consistency | Empty state uses theme tokens | No hardcoded colors | P1 |
| TC-3.3.7 | Negative - Active Patients | Doctor with active patients | Normal list displayed | P0 |
| TC-3.3.8 | Boundary - Temporary Empty | Patients become inactive during session | Empty state updates | P2 |
| TC-3.3.9 | Accessibility - Screen Reader | Empty state announced properly | Screen reader support | P2 |

## Test Categorization

### Functional Tests (50%)
- Empty state detection
- Message accuracy
- State transitions

### UI/UX Tests (40%)
- Visual design and layout
- Icon appropriateness
- Theme consistency

### API Tests (5%)
- Patient filtering logic

### Performance Tests (5%)
- Empty state rendering speed

## Entry/Exit Criteria

**Entry Criteria:**
- Story 3.1 complete (patient list)
- EmptyState component (Story 1.7)

**Exit Criteria:**
- All P0 test cases pass
- Empty state displays correctly
- Appropriate messaging