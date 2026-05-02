# Test Design Document: Story 3.4 - Navigate to Patient Clinical Summary

**Story ID:** 3.4  
**Epic:** 3 - My Patients Dashboard  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers navigation from the patient list to the clinical summary screen when tapping a patient card.

## Test Scenarios

### Positive Scenarios
- Tap navigation works
- Correct patient data passed
- Smooth transition

### Negative Scenarios
- Invalid patient data
- Navigation failures
- Data loading issues

### Boundary Scenarios
- Very fast taps
- Large patient lists
- Network issues during navigation

## Risk Assessment

**High Risk Areas:**
- Patient selection accuracy (FR12)
- Data passing between screens
- Navigation reliability
- Performance of transition

**Medium Risk Areas:**
- Touch target accuracy
- Loading states

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-3.4.1 | AC1 - Patient Tap | Tap patient card in list | Navigates to Clinical Summary | P0 |
| TC-3.4.2 | AC1 - Correct Patient | Verify navigated to correct patient | Patient data matches selection | P0 |
| TC-3.4.3 | AC2 - Navigation Speed | Measure tap-to-navigation time | Completes within 500ms | P1 |
| TC-3.4.4 | AC3 - Back Navigation | Back button from summary | Returns to patient list | P0 |
| TC-3.4.5 | UI - Touch Feedback | Visual feedback on tap | Ripple or highlight effect | P1 |
| TC-3.4.6 | UI - Loading Transition | Loading state during navigation | Smooth transition | P2 |
| TC-3.4.7 | Negative - Invalid Patient | Tap patient with missing data | Handles gracefully | P2 |
| TC-3.4.8 | Boundary - Rapid Taps | Multiple rapid patient taps | Handles correctly | P3 |
| TC-3.4.9 | Boundary - List Position | Tap patient not visible initially | Scrolls and navigates | P2 |

## Test Categorization

### Functional Tests (60%)
- Navigation trigger
- Data passing
- Back navigation

### UI/UX Tests (30%)
- Touch feedback
- Transition smoothness
- Visual consistency

### API Tests (5%)
- Data parameter passing

### Performance Tests (5%)
- Navigation speed
- Transition performance

## Entry/Exit Criteria

**Entry Criteria:**
- Story 3.1 complete (patient list)
- Clinical Summary screen exists

**Exit Criteria:**
- All P0 test cases pass
- Navigation working correctly
- Patient selection accurate