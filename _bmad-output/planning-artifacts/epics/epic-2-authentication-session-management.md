# Epic 2: Authentication & Session Management

Doctors can securely log in using their existing OpenMRS credentials and have their sessions managed automatically with security best practices.

## Business Context

**Business Objective:** Enable secure access to patient data using existing hospital credentials
**User Impact:** Doctors can access the mobile app without creating new accounts, with automatic security protections
**Success Metrics:** 100% of doctors can log in with existing credentials; zero unauthorized access incidents

## Story 2.1: Doctor Login with OpenMRS Credentials

As a doctor,
I want to log in using my existing OpenMRS username and password,
So that I can access my assigned patients on mobile without creating new credentials.

**Acceptance Criteria:**

**AC1.**
**Given** I am on the login screen
**When** I enter my valid OpenMRS username and password and tap "Login"
**Then** The app authenticates me via OpenMRS REST API
**And** I am redirected to the My Patients dashboard
**And** My session token is stored securely
**And** The login completes within 3 seconds

**Technical Context:**
- POST /openmrs/ws/rest/v1/session with username/password
- Store session token in Expo SecureStore (Android Keystore)
- Covers FR1, FR2, FR3, NFR1, NFR6

## Story 2.2: Handle Invalid Login Credentials

As a doctor,
I want to see a clear error message when I enter wrong credentials,
So that I know what went wrong and can try again.

**Acceptance Criteria:**

**AC1.**
**Given** I am on the login screen
**When** I enter invalid username or password and tap "Login"
**Then** I see the error message "Invalid username or password. Please try again."
**And** The username and password fields remain editable
**And** I can attempt to log in again
**And** No session token is stored

**Technical Context:**
- Handle 401 response from OpenMRS API
- Use centralized error handler for consistent messaging
- Covers FR4

## Story 2.3: Handle Network Errors During Login

As a doctor,
I want to see a helpful message when login fails due to network issues,
So that I know the problem is with connectivity, not my credentials.

**Acceptance Criteria:**

**AC1.**
**Given** I am on the login screen and have no internet connection
**When** I enter credentials and tap "Login"
**Then** I see the error message "No internet connection. Please check your WiFi."
**And** I see a "Retry" button

**AC2.**
**Given** I see the network error message
**When** I tap "Retry" after connection is restored
**Then** The login attempt is retried automatically

**Technical Context:**
- Handle network timeout and connection errors
- Use centralized error handler
- Covers NFR5, NFR11

## Story 2.4: Automatic Session Timeout After 30 Minutes of Inactivity

As a hospital administrator,
I want doctor sessions to automatically expire after 30 minutes of inactivity,
So that patient data remains secure if a device is left unattended.

**Acceptance Criteria:**

**AC1.**
**Given** A doctor is logged in and using the app
**When** 30 minutes pass with no user interaction
**Then** The session automatically expires
**And** The session token is cleared from secure storage
**And** The doctor is redirected to the login screen
**And** A message displays "Session expired due to inactivity. Please log in again."

**AC2.**
**Given** A doctor is logged in
**When** The doctor interacts with the app (tap, scroll, navigation)
**Then** The 30-minute inactivity timer resets

**Technical Context:**
- Implement inactivity timer in AuthContext
- Track user interactions to reset timer
- Covers FR5, NFR9

## Story 2.5: Prevent Screenshots on Clinical Screens

As a hospital administrator,
I want screenshots to be blocked on all screens after login,
So that patient data cannot be captured and shared inappropriately.

**Acceptance Criteria:**

**AC1.**
**Given** A doctor is logged in and viewing any screen
**When** The doctor attempts to take a screenshot
**Then** The screenshot is blocked (screen appears black in the capture)
**And** This applies to all screens except the login screen
**And** Screenshot prevention is active on Android devices

**Technical Context:**
- Use expo-screen-capture library
- Enable on all authenticated routes
- Covers NFR10

## Story 2.6: Doctor Logout with Confirmation

As a doctor,
I want to log out of the app with a confirmation dialog,
So that I don't accidentally log out and lose my session.

**Acceptance Criteria:**

**AC1.**
**Given** I am logged in and on the My Patients dashboard
**When** I press the Android back button or tap the menu and select "Logout"
**Then** A confirmation dialog appears asking "Are you sure you want to log out?"

**AC2.**
**Given** The logout confirmation dialog is displayed
**When** I tap "Yes"
**Then** My session token is cleared from secure storage
**And** I am redirected to the login screen

**AC3.**
**Given** The logout confirmation dialog is displayed
**When** I tap "No"
**Then** The dialog closes and I remain on the dashboard

**Technical Context:**
- DELETE /openmrs/ws/rest/v1/session
- Clear SecureStore token
- Covers FR22, UX-DR18

## Story 2.7: Session Persistence Across App Restarts

As a doctor,
I want my session to persist when I close and reopen the app,
So that I don't have to log in again unless my session has expired.

**Acceptance Criteria:**

**AC1.**
**Given** I am logged in with an active session
**When** I close the app and reopen it within 30 minutes
**Then** I am automatically taken to the My Patients dashboard
**And** My session token is still valid

**AC2.**
**Given** I was logged in but closed the app
**When** I reopen the app after 30 minutes of inactivity
**Then** I am taken to the login screen
**And** I see the message "Session expired. Please log in again."

**Technical Context:**
- Check SecureStore for token on app launch
- Validate token expiration time
- Covers NFR8
