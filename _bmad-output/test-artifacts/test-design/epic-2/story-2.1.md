# Test Design Document: Story 2.1 - Doctor Login with OpenMRS Credentials

**Story ID:** 2.1  
**Epic:** 2 - Authentication & Session Management  
**Test Architect:** Senior Test Architect  
**Date:** 2026-05-01

## Overview

This test design covers doctor authentication using existing OpenMRS credentials via REST API, including session token storage and dashboard redirection.

## Test Scenarios

### Positive Scenarios
- Successful login with valid credentials
- Session token secure storage
- Dashboard redirection after login
- Performance within 3 seconds

### Negative Scenarios
- Invalid username/password
- Network failures during login
- Server errors
- Session token storage failures

### Boundary Scenarios
- Very long credentials
- Special characters in passwords
- Slow network connections

## Risk Assessment

**High Risk Areas:**
- OpenMRS API authentication (FR2)
- Session token security (NFR-6, FR3)
- Login performance (NFR1)
- Authentication error handling (FR4)

**Medium Risk Areas:**
- Secure storage availability
- Token expiration handling

## Test Cases

| ID | Requirement Ref | Description | Expected Result | Priority |
|----|----------------|-------------|----------------|----------|
| TC-2.1.1 | AC1 - Valid Login | Enter valid OpenMRS credentials and tap Login | Authenticates via REST API, redirects to dashboard | P0 |
| TC-2.1.2 | AC1 - Session Token | Verify session token stored securely | Token stored in Expo SecureStore | P0 |
| TC-2.1.3 | AC1 - Dashboard Redirect | Successful login shows dashboard | Navigation to My Patients dashboard | P0 |
| TC-2.1.4 | AC1 - Login Performance | Measure login completion time | Completes within 3 seconds on hospital WiFi | P0 |
| TC-2.1.5 | UI - Login Form | Verify username/password fields and Login button | Form elements display correctly | P1 |
| TC-2.1.6 | UI - Loading State | Show loading indicator during authentication | Loading state visible during API call | P1 |
| TC-2.1.7 | Negative - Invalid Credentials | Enter wrong username/password | Shows clear error message | P0 |
| TC-2.1.8 | Negative - Network Error | Simulate network failure during login | Handles error gracefully | P1 |
| TC-2.1.9 | Negative - Server Error | Simulate 500 error from OpenMRS | Shows appropriate error message | P1 |
| TC-2.1.10 | Boundary - Long Credentials | Test with maximum length username/password | Handles long strings correctly | P2 |
| TC-2.1.11 | Boundary - Special Characters | Password with special characters | Authentication succeeds | P2 |
| TC-2.1.12 | Security - Token Encryption | Verify token encrypted at rest | Token not accessible in plain text | P1 |
| TC-2.1.13 | Performance - Slow Network | Test login on slow connection | Times out gracefully after 10 seconds | P2 |

## Test Categorization

### Functional Tests (50%)
- Authentication flow and API integration
- Session token handling
- Navigation and redirection
- Error handling

### UI/UX Tests (25%)
- Login form appearance and usability
- Loading states and feedback
- Error message display

### API Tests (20%)
- OpenMRS REST API integration
- Request/response handling
- Authentication endpoint validation

### Performance Tests (5%)
- Login speed measurement
- Network timeout handling

## Entry/Exit Criteria

**Entry Criteria:**
- API client configured (Story 1.5)
- AuthContext implemented
- Login screen UI ready

**Exit Criteria:**
- All P0 test cases pass
- Login functionality working end-to-end
- Session management verified