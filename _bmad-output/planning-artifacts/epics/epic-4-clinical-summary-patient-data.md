# Epic 4: Clinical Summary & Patient Data

Doctors can access comprehensive clinical information (demographics, medications, allergies, vitals) for any assigned patient, providing essential context at the point of care.

## Business Context

**Business Objective:** Provide doctors with complete clinical context at the point of care
**User Impact:** Doctors can make informed clinical decisions with instant access to patient history
**Success Metrics:** Clinical data loads in < 2 seconds; zero wrong-patient incidents; 100% empty state handling accuracy

## Story 4.1: View Patient Demographics

As a doctor,
I want to see patient demographics when I open their clinical summary,
So that I can verify I'm viewing the correct patient's information.

**Acceptance Criteria:**

**AC1.**
**Given** I have tapped on a patient from the dashboard
**When** The Clinical Summary screen loads
**Then** I see the patient's Name, Patient ID, Age, and Gender at the top
**And** The demographics section loads within 2 seconds

**Technical Context:**
- GET /patient/{patientUuid}?v=full
- Display in priority order (safety: verify correct patient)
- Covers FR13, NFR3

## Story 4.2: View Active Medications

As a doctor,
I want to see all active medications for a patient,
So that I know what treatments they are currently receiving.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** The medications section loads
**Then** I see a list of active medications with drug name, dosage, and frequency
**And** Each medication is displayed in a light blue card with medication icon

**AC2.**
**Given** The patient has no active medications
**When** The medications section loads
**Then** I see "No active medications recorded" with a neutral icon

**Technical Context:**
- GET /order?patient={patientUuid}&careSetting=OUTPATIENT&status=ACTIVE
- Light blue background (#E3F2FD) for medication cards
- Covers FR14, FR17, UX-DR8, UX-DR16

## Story 4.3: View Known Allergies

As a doctor,
I want to see all known allergies for a patient with clear visual indicators,
So that I can avoid prescribing medications that could cause allergic reactions.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** The allergies section loads
**Then** I see a list of allergies with allergy name and severity level
**And** Each allergy is displayed in a light red card with warning icon
**And** The card has a red border for high visibility

**AC2.**
**Given** The patient has no known allergies
**When** The allergies section loads
**Then** I see "No known allergies" with a green checkmark
**And** This is displayed as a positive indicator, not an empty state

**Technical Context:**
- GET /patient/{patientUuid}/allergy
- Light red background (#FFEBEE), red border, warning icon
- "No known allergies" is clinically significant information
- Covers FR15, FR18, UX-DR9, UX-DR15

## Story 4.4: View Recent Vitals

As a doctor,
I want to see the 3 most recent vital signs for a patient,
So that I can assess their current clinical status.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** The vitals section loads
**Then** I see the last 3 entries for Heart Rate, Blood Pressure, and SpO2
**And** Each vital displays the value and timestamp

**AC2.**
**Given** The patient has no recent vitals recorded
**When** The vitals section loads
**Then** I see "No recent vitals recorded"
**And** If available, display "Last vitals recorded: [date]"

**Technical Context:**
- GET /obs?patient={patientUuid}&concept={vitalsConcepts}&limit=3
- Separate calls for Heart Rate, BP, SpO2 concepts
- Covers FR16, FR17, UX-DR17

## Story 4.5: Refresh Clinical Summary Data

As a doctor,
I want to refresh clinical data to see the latest information,
So that I have the most current patient data for clinical decisions.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** I pull down from the top of the screen
**Then** All clinical data (demographics, medications, allergies, vitals) refreshes
**And** A loading indicator appears during refresh
**And** The refresh completes within 2 seconds

**Technical Context:**
- SWR with dedupingInterval: 0 (no cache for clinical data)
- Always fetch fresh data for accuracy
- Covers FR19, UX-DR13

## Story 4.6: Navigate Back to Dashboard

As a doctor,
I want to return to the patient list from the Clinical Summary,
So that I can select another patient to review.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** I tap the back button or press the Android back button
**Then** I am returned to the My Patients dashboard
**And** The patient list is still loaded (cached)

**Technical Context:**
- Expo Router handles back navigation automatically
- Dashboard uses cached data (5-min cache)
- Covers FR20

## Story 4.7: Handle Network Errors on Clinical Summary

As a doctor,
I want to see helpful error messages when clinical data fails to load,
So that I understand what went wrong and can retry.

**Acceptance Criteria:**

**AC1.**
**Given** I am viewing a patient's Clinical Summary
**When** Any clinical data section fails to load due to network error
**Then** I see "Unable to load [section name]. Tap to retry." for that section
**And** Other sections that loaded successfully remain visible

**AC2.**
**Given** I see an error message for a section
**When** I tap the retry button
**Then** The app attempts to reload that specific section

**Technical Context:**
- Independent SWR hooks for each data section
- Partial failure handling (some sections load, others fail)
- Covers NFR11, NFR12, UX-DR19
