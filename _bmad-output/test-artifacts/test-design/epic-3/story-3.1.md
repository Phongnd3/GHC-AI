# Test Design Document: Story 3.1 - View List of Assigned Patients

**Story ID:** 3.1  
**Epic:** 3 - My Patients Dashboard  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers displaying a list of patients assigned to the logged-in doctor with active visits, including patient card details and performance requirements.

## Test Scenarios

### Positive Scenarios
- Patient list displays correctly
- Filtering by provider works
- Performance within 2 seconds
- Scrollable list for many patients

### Negative Scenarios
- No assigned patients
- API failures
- Invalid data formats

### Boundary Scenarios
- Large patient lists
- Very long patient names
- Edge case data values

## Risk Assessment

**High Risk Areas:**
- Patient assignment logic (FR7)
- API performance (NFR2)
- Data accuracy and privacy
- Active visit filtering

**Medium Risk Areas:**
- UI responsiveness
- Memory usage with large lists

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-3.1.1 | AC1 - Patient List Display | Login and view dashboard | Shows assigned patients with active visits | P0 |
| TC-3.1.2 | AC1 - Patient Card Content | Verify Name, ID, Age, Gender displayed | All required fields shown | P0 |
| TC-3.1.3 | AC1 - Provider Filtering | Only patients with doctor as provider | Correct patient assignment | P0 |
| TC-3.1.4 | AC1 - Load Performance | Measure dashboard load time | Completes within 2 seconds | P0 |
| TC-3.1.5 | AC2 - Scrollable List | Test with >10 patients | List scrolls smoothly | P0 |
| TC-3.1.6 | UI - Card Layout | Patient card visual design | Consistent Material Design | P1 |
| TC-3.1.7 | UI - Loading State | Loading indicator during fetch | Skeleton or spinner shown | P1 |
| TC-3.1.8 | API - Visit Endpoint | Verify GET /visit API call | Correct parameters and filtering | P1 |
| TC-3.1.9 | Negative - No Patients | Doctor with no assigned patients | Empty state displayed | P1 |
| TC-3.1.10 | Negative - API Error | Simulate API failure | Error handling and retry | P1 |
| TC-3.1.11 | Boundary - Large List | 50+ patients assigned | Performance remains good | P2 |
| TC-3.1.12 | Boundary - Long Names | Patients with very long names | Text truncation or wrapping | P2 |
| TC-3.1.13 | Security - Data Privacy | Patient data not logged | No sensitive data exposure | P1 |

## Test Categorization

### Functional Tests (50%)
- Patient list display and filtering
- Data accuracy verification
- API integration

### UI/UX Tests (25%)
- Card layout and design
- Loading states
- Scrolling behavior

### API Tests (20%)
- Visit API calls and parameters
- Response processing
- Error handling

### Performance Tests (5%)
- Load time measurement
- Scrolling performance

## Entry/Exit Criteria

**Entry Criteria:**
- Story 2.1 complete (authentication)
- API client configured
- Patient types defined

**Exit Criteria:**
- All P0 test cases pass
- Patient list displays correctly
- Performance requirements met