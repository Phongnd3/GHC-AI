# Test Design Document: Story 2.2 - Handle Invalid Login Credentials

**Story ID:** 2.2  
**Epic:** 2 - Authentication & Session Management  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers error handling for invalid login credentials, ensuring clear user feedback and proper error states.

## Test Scenarios

### Positive Scenarios
- Clear error message display
- Form remains accessible after error
- No sensitive information exposed

### Negative Scenarios
- Multiple failed attempts
- Network errors during validation
- Malformed error responses

### Boundary Scenarios
- Very long error messages
- Non-English characters in errors
- Rapid successive login attempts

## Risk Assessment

**High Risk Areas:**
- Error message clarity (UX-DR-12)
- Security information leakage
- User experience during failures
- Form state preservation

**Medium Risk Areas:**
- Error message consistency
- Accessibility of error states

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-2.2.1 | AC1 - Invalid Username | Enter non-existent username | Shows clear error message | P0 |
| TC-2.2.2 | AC1 - Invalid Password | Enter wrong password for valid user | Shows clear error message | P0 |
| TC-2.2.3 | AC1 - Error Message Clarity | Verify error message is user-friendly | No technical jargon, actionable guidance | P0 |
| TC-2.2.4 | AC2 - Form Accessibility | Form remains usable after error | Can attempt login again | P0 |
| TC-2.2.5 | AC2 - Field Preservation | Username field retains value after error | User doesn't need to retype username | P1 |
| TC-2.2.6 | AC3 - No Data Exposure | Error doesn't reveal sensitive information | No password hints or user enumeration | P1 |
| TC-2.2.7 | UI - Error Display | Error message styling and positioning | Clear, prominent error display | P1 |
| TC-2.2.8 | UI - Error Persistence | Error remains visible until next attempt | Error clears on new input | P2 |
| TC-2.2.9 | Negative - Network Error | Network failure during validation | Different error message for network vs auth | P1 |
| TC-2.2.10 | Negative - Server Error | 500 error during login attempt | Generic server error message | P2 |
| TC-2.2.11 | Boundary - Multiple Failures | Attempt login 5 times with wrong credentials | Consistent error handling | P2 |
| TC-2.2.12 | Boundary - Long Messages | Handle very long error messages | Messages truncated or wrapped appropriately | P3 |
| TC-2.2.13 | Accessibility - Screen Reader | Error announced to screen readers | Proper accessibility labels | P2 |

## Test Categorization

### Functional Tests (50%)
- Error detection and message display
- Form state management
- Authentication validation

### UI/UX Tests (35%)
- Error message design and clarity
- Form usability after errors
- Visual feedback

### API Tests (10%)
- Error response handling
- HTTP status code processing

### Performance Tests (5%)
- Error display speed
- Form responsiveness

## Entry/Exit Criteria

**Entry Criteria:**
- Story 2.1 complete (basic login)
- Error handling framework (Story 1.6)

**Exit Criteria:**
- All P0 test cases pass
- Invalid credentials handled gracefully
- Clear user feedback provided