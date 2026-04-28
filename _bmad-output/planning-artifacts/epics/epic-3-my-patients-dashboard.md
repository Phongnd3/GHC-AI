# Epic 3: My Patients Dashboard

Doctors can view a real-time list of their assigned patients with key demographics, enabling quick patient identification and selection.

## Business Context

**Business Objective:** Provide doctors with instant visibility into their assigned patients
**User Impact:** Doctors can quickly identify which patients need attention without manual lookup
**Success Metrics:** Patient list loads in < 2 seconds; 100% accuracy in patient assignment filtering

## Story 3.1: View List of Assigned Patients

As a doctor,
I want to see a list of only my assigned patients with active visits,
So that I can quickly identify which patients I need to see today.

**Acceptance Criteria:**

**AC1.**
**Given** I am logged in as a doctor
**When** I view the My Patients dashboard
**Then** I see a list of patients with active visits where I am the visit creator
**And** Each patient card displays: Name, Patient ID, Age, Gender
**And** The list loads within 2 seconds

**AC2.**
**Given** I have more than 10 assigned patients
**When** I view the dashboard
**Then** The list is scrollable to view all patients

**Technical Context:**
- GET /visit?includeInactive=false&v=full
- Filter client-side: stopDatetime = null (active visits) AND auditInfo.creator.uuid = userUuid
- Changed from encounterProviders matching to visit creator matching (more reliable with current data)
- SWR with 5-minute cache
- Covers FR6, FR7, FR8, FR9, NFR2

## Story 3.2: Refresh Patient List

As a doctor,
I want to refresh the patient list to see the latest assignments,
So that I have up-to-date information about my patients.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing the My Patients dashboard
**When** I pull down from the top of the screen
**Then** The patient list refreshes with the latest data from the server
**And** A loading indicator appears during refresh
**And** The refresh completes within 2 seconds

**AC2.**
**Given** I am viewing the dashboard
**When** I tap the refresh icon in the top bar
**Then** The patient list refreshes with the latest data

**Technical Context:**
- SWR mutate() for manual refresh
- Pull-to-refresh using React Native gesture
- Covers FR10, UX-DR13

## Story 3.3: Handle Empty Patient List

As a doctor,
I want to see a clear message when I have no assigned patients,
So that I know the app is working correctly and I simply have no patients today.

**Acceptance Criteria:**

**AC1.**
**Given** I am logged in as a doctor
**When** I have no patients with active visits assigned to me
**Then** I see the message "No active patients assigned to you"
**And** An appropriate icon is displayed
**And** No patient cards are shown

**Technical Context:**
- Use EmptyState component from Epic 1
- Covers FR11

## Story 3.4: Navigate to Patient Clinical Summary

As a doctor,
I want to tap on a patient card to view their clinical information,
So that I can access detailed patient data for clinical decision-making.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing the My Patients dashboard with patient cards
**When** I tap on any patient card
**Then** I am navigated to the Clinical Summary screen for that patient
**And** The patient's UUID is passed to the Clinical Summary screen
**And** A ripple effect appears on the card when tapped

**Technical Context:**
- Use Expo Router: router.push(`/patient/${patientUuid}`)
- PatientCard component with TouchableOpacity
- Covers FR12, UX-DR14

## Story 3.5: Display Last Updated Timestamp

As a doctor,
I want to see when the patient list was last updated,
So that I know how current the information is.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing the My Patients dashboard
**When** The patient list loads successfully
**Then** I see "Last updated: X min ago" below the top bar
**And** The timestamp updates automatically as time passes

**Technical Context:**
- Use date-fns formatDistanceToNow()
- Covers UX-DR20

## Story 3.6: Handle Network Errors on Dashboard

As a doctor,
I want to see a helpful error message when the patient list fails to load,
So that I understand what went wrong and can retry.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing the My Patients dashboard
**When** The patient list fails to load due to network error
**Then** I see the message "Unable to load patients. Tap to retry."
**And** A retry button is displayed

**AC2.**
**Given** I see the network error message
**When** I tap the retry button
**Then** The app attempts to load the patient list again

**Technical Context:**
- Use centralized error handler from Epic 1
- SWR error handling with retry
- Covers NFR11, NFR12, UX-DR19
