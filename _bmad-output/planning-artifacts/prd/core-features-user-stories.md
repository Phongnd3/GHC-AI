# Core Features & User Stories

**Note:** The features detailed in this section represent Phase 1 (Month 1) deliverables for the Doctor App. Phase 2 and Phase 3 features are outlined in the Strategic Roadmap above.

---

## Feature 1: Authentication (Doctor App - Phase 1)

**User Story:** As a doctor, I want to log in using my existing OpenMRS credentials so that I can access my assigned patients on mobile.

**Acceptance Criteria:**
- Login screen with username and password fields
- "Login" button triggers authentication via OpenMRS REST API
- Successful authentication stores session token securely
- Failed authentication displays error message
- Session management handles token expiration

**API Integration:**
- `POST /openmrs/ws/rest/v1/session` - Authenticate user
- Store session token in secure storage (Android Keystore)

---

## Feature 2: My Patients Dashboard (Doctor App - Phase 1)

**User Story:** As a doctor, I want to see a list of only my assigned patients showing Name, ID, Age, and Gender so that I can quickly identify who I need to see.

**Acceptance Criteria:**
- Dashboard displays immediately after login
- Shows only patients with active visits where doctor is primary provider
- Each patient card displays: Name, Patient ID, Age, Gender
- List is scrollable if more than 10 patients
- Pull-to-refresh updates the list
- Empty state message if no patients assigned

**API Integration:**
- `GET /openmrs/ws/rest/v1/visit?provider={doctorUuid}&includeInactive=false&v=custom:(uuid,patient:(uuid,display,person:(age,gender)),startDatetime)`
- Filter results where doctor is primary provider on visit or encounter

---

## Feature 3: Clinical Summary (Doctor App - Phase 1)

**User Story:** As a doctor, I want to tap a patient and see their Allergies, Active Medications, and 3 most recent Vitals (Heart Rate, BP, SpO2) so that I have the essential clinical context at the point of care.

**Acceptance Criteria:**
- Tapping patient from dashboard navigates to Clinical Summary
- Summary displays in priority order: Demographics → Active Medications → Allergies → Recent Vitals
- Each section handles empty states gracefully
- Data refreshes on screen load
- Back button returns to My Patients dashboard

**API Integration:**
- `GET /openmrs/ws/rest/v1/patient/{patientUuid}?v=full` - Patient demographics
- `GET /openmrs/ws/rest/v1/order?patient={patientUuid}&careSetting=OUTPATIENT&status=ACTIVE&v=full` - Active medications
- `GET /openmrs/ws/rest/v1/patient/{patientUuid}/allergy` - Allergies
- `GET /openmrs/ws/rest/v1/obs?patient={patientUuid}&concept={vitalsConcepts}&limit=3&v=full` - Recent vitals (Heart Rate, BP, SpO2)

---
