---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-features", "step-05-technical", "step-06-constraints", "step-07-timeline", "step-12-complete"]
inputDocuments: [
  "docs/reverse-engineering/INDEX.md",
  "docs/reverse-engineering/README.md",
  "docs/reverse-engineering/01-domain-logic/integrated-workflow-map.md"
]
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 3
classification:
  projectType: "Native Android Mobile App (Flutter/React Native)"
  domain: "Healthcare / Clinical Management"
  complexity: "Medium"
  projectContext: "Brownfield"
  targetUsers: "Doctors/Physicians and Patients"
  platform: "Android Smartphones"
  timeline: "3-month roadmap"
  scope: "Dual-App Ecosystem (Doctor App + Patient App)"
  connectivity: "Always connected (Hospital Wi-Fi)"
  authentication: "OpenMRS REST API (existing credentials)"
myPatientsLogic: "Active Visits filtered by Provider UUID"
clinicalSummaryPriority: ["Demographics", "Active Medications", "Allergies", "Recent Vitals (last 3)"]
referenceData:
  emptyState: "William Robinson (ID: 10001HU)"
  fullState: "Snow White"
workflowType: 'prd'
---

# Product Requirements Document - GHC-AI Doctor Mobile App

**Author:** TrangN
**Date:** 2026-04-21

## Executive Summary

The GHC-AI Mobile Ecosystem transforms healthcare delivery by solving two critical problems through a dual-app strategy: the "Last Meter" problem for doctors and the "Administrative Overhead" problem for patients. This 3-month strategic roadmap delivers a comprehensive mobile solution that serves both clinical decision-makers and patient engagement needs.

### The Vision: Dual-App Ecosystem

**Doctor App: Solving the "Last Meter" Problem**

Currently, doctors are "desk-locked": they review patient data at desktop stations, walk to the patient, realize they've forgotten a specific vital trend or allergy, then either walk back to the computer or resort to writing notes on hands and pockets. This information gap breaks the doctor-patient relationship, creates double-entry workflows, and increases the risk of medical errors.

The Doctor App delivers critical patient information directly to doctors at the point of care—bedside during ward rounds or in consultation rooms. Immediately upon login, doctors are presented with a direct path to their assigned patients' critical data. The interface is architected to eliminate navigational layers, ensuring that life-saving information—such as Allergies and Active Medications—is accessible instantly at the point of care.

**Patient App: Reducing Administrative Overhead**

Patients currently face significant administrative friction: waiting in queues for registration, manually tracking appointments, and lacking visibility into their own health records. The Patient App empowers patients to engage with their own health journey by providing direct access to their Personal Health Record (PHR), appointment schedules, lab results, and medication lists—reducing administrative burden on hospital staff while improving patient satisfaction and health literacy.

**Target Users:** Doctors, physicians, and patients  
**Timeline:** 3-month phased roadmap  
**Scope:** Phase 1 (Doctor App - Read-only), Phase 2 (Patient App - Engagement), Phase 3 (Advanced Workflows - Interactive)

### What Makes This Special

**Extreme Focus: Two Apps, Two Personas, Zero Compromise**

The existing OpenMRS O3 web interface serves receptionists, administrators, doctors, and patients with equal weight—registration forms, billing, queue management, and clinical data all compete for attention. This dual-app ecosystem takes a radically different approach: each app is laser-focused on a single persona's needs.

- **Doctor App:** Strips away 100% of administrative noise. No billing. No detailed appointments. No registration forms. Only direct access to patient health status: Medications, Allergies, Vitals. This is a deliberate persona shift from "data entry clerk" (desktop) to "point-of-care decision maker" (mobile).

- **Patient App:** Eliminates administrative friction by putting health information directly in patients' hands. No waiting in queues for appointment confirmations. No calling the hospital for lab results. Direct access to Personal Health Record, upcoming appointments, and medication schedules.

**Direct Access: Immediate Path to Life-Saving Information**

Both apps eliminate navigational friction entirely:

- **Doctor App:** Upon login, doctors see their assigned patients immediately. Selecting a patient reveals the complete clinical summary without intermediate screens or menu navigation. This instant access to critical data—Allergies, Active Medications, Recent Vitals—solves the "Last Meter" problem by enabling doctors to verify medications or check BP trends while maintaining eye contact with the patient.

- **Patient App:** Upon login, patients see their health dashboard immediately. Direct access to upcoming appointments, recent lab results, and active medications—no phone calls, no waiting, no administrative overhead.

**Strategic Ecosystem: Proving OpenMRS Can Be Mobile-Native**

Many stakeholders believe "OpenMRS is too heavy for mobile." This 3-month roadmap proves otherwise: two lightweight, high-speed, native Android experiences that work seamlessly with the existing O3 backend. Success here establishes OpenMRS as a mobile-first platform, demonstrating that clinical-grade and patient-facing mobile apps can be built on OpenMRS infrastructure without compromising performance or user experience.

## Project Classification

**Project Type:** Native Android Mobile Application (Flutter or React Native)  
**Domain:** Healthcare / Clinical Management  
**Complexity:** Medium — healthcare domain with existing system integration constraints  
**Project Context:** Brownfield — integrating with existing OpenMRS O3 backend via REST APIs  
**Platform:** Android Smartphones  
**Connectivity:** Always connected via Hospital Wi-Fi (no offline mode required for MVP)  
**Authentication:** Existing OpenMRS REST API credentials (same as web app)  
**"My Patients" Logic:** Active Visits filtered by Provider (Doctor) UUID  
**Clinical Summary Priority:** 1. Demographics → 2. Active Medications → 3. Allergies → 4. Recent Vitals (last 3)


## Success Criteria

### Phase 1 Success (Month 1): Clinical Foundation - Doctor App

**Functional Completeness:**
- Doctor can log in using existing OpenMRS credentials
- "My Patients" dashboard displays only patients with active visits where the logged-in doctor is the primary provider
- Clinical Summary screen shows all required data: Demographics, Active Medications, Allergies, and Recent Vitals (last 3 entries)
- App successfully retrieves and displays data for both "full data" patients (like Snow White) and "empty state" patients (like William Robinson ID: 10001HU)

**Performance & Reliability:**
- Login completes within 3 seconds on hospital WiFi
- Patient list loads within 2 seconds
- Clinical summary displays within 2 seconds of patient selection
- App handles network errors gracefully with clear error messages
- Zero crashes during clinical use

**Stakeholder Buy-In:**
- Demonstrates that OpenMRS can support lightweight, high-speed mobile experiences
- Proves native Android app can integrate seamlessly with existing O3 backend
- Shows clear value proposition: solving the "Last Meter" problem with instant access to clinical data

### Phase 2 Success (Month 2): Patient Engagement - Patient App

**Functional Completeness:**
- Patient can log in using existing OpenMRS credentials or patient portal credentials
- Personal Health Record (PHR) dashboard displays patient demographics, active medications, known allergies
- Appointments screen shows upcoming appointments with date, time, location, and provider
- Lab Results screen displays recent test results with normal ranges and trend indicators

**User Engagement:**
- 30% of registered patients download and activate the app
- 50% of active users check appointments at least once per week
- 70% of users report improved satisfaction with health information access

**Administrative Impact:**
- 20% reduction in phone calls for appointment confirmations
- 15% reduction in front-desk inquiries about lab results

### Phase 3 Success (Month 3): Interactive Revamp - Advanced Workflows

**Doctor App - Write Capabilities:**
- Doctors can record vitals directly from mobile (Heart Rate, BP, SpO2, Temperature)
- AI-assisted clinical notes capture key observations with voice-to-text
- Real-time lab alerts notify doctors of critical results for their assigned patients

**Patient App - Interactive Features:**
- Patients can request appointment rescheduling directly from app
- Medication reminders with push notifications
- Secure messaging with care team

**Ecosystem Metrics:**
- 80% of doctors actively using Doctor App during ward rounds
- 50% of patients actively using Patient App for health management
- 25% reduction in administrative overhead (measured by front-desk workload)
- 90% user satisfaction rating across both apps

### Acceptance Criteria

**User Story 1: Login (Doctor App)**
- ✅ Doctor enters existing OpenMRS username and password
- ✅ App authenticates via OpenMRS REST API `/session` endpoint
- ✅ Successful login redirects to "My Patients" dashboard
- ✅ Failed login shows clear error message
- ✅ Session persists until explicit logout or timeout

**User Story 2: My Patients Dashboard (Doctor App)**
- ✅ Displays list of patients with active visits where doctor is primary provider
- ✅ Each patient card shows: Name, Patient ID, Age, Gender
- ✅ List updates in real-time (or on pull-to-refresh)
- ✅ Empty state message if no assigned patients: "No active patients assigned to you"
- ✅ Tapping a patient navigates to Clinical Summary

**User Story 3: Clinical Summary (Doctor App)**
- ✅ **Demographics Section:** Patient Name, ID, Age, Gender, Photo (if available)
- ✅ **Active Medications Section:** List of current prescriptions with drug name, dosage, frequency
- ✅ **Allergies Section:** List of known allergies with severity indicators
- ✅ **Recent Vitals Section:** Last 3 vital sign entries showing Heart Rate, Blood Pressure, SpO2 with timestamps
- ✅ **Empty State Handling:** Shows "No data available" for missing sections (e.g., William Robinson case)
- ✅ **Full State Display:** Shows complete data when available (e.g., Snow White case)

---

## High-Level Feature Matrix

This table compares features across the Doctor App and Patient App, showing which capabilities are delivered in each phase of the 3-month roadmap.

| Feature Category | Doctor App | Patient App | Phase |
|------------------|------------|-------------|-------|
| **Authentication** | ✅ OpenMRS credentials | ✅ Patient portal credentials | Phase 1 & 2 |
| **Dashboard** | ✅ My Patients (assigned) | ✅ Personal Health Record | Phase 1 & 2 |
| **Demographics** | ✅ View patient demographics | ✅ View own demographics | Phase 1 & 2 |
| **Medications** | ✅ View active medications | ✅ View own active medications | Phase 1 & 2 |
| **Allergies** | ✅ View patient allergies | ✅ View own allergies | Phase 1 & 2 |
| **Vitals** | ✅ View recent vitals (last 3) | ✅ View own vitals history | Phase 1 & 2 |
| **Appointments** | ❌ Not included | ✅ View upcoming appointments | Phase 2 |
| **Lab Results** | ❌ Not included | ✅ View recent lab results | Phase 2 |
| **Vitals Entry** | ✅ Record vitals at bedside | ❌ Not included | Phase 3 |
| **Clinical Notes** | ✅ AI-assisted notes | ❌ Not included | Phase 3 |
| **Lab Alerts** | ✅ Critical result notifications | ❌ Not included | Phase 3 |
| **Appointment Management** | ❌ Not included | ✅ Request rescheduling | Phase 3 |
| **Medication Reminders** | ❌ Not included | ✅ Push notifications | Phase 3 |
| **Secure Messaging** | ✅ Message care team | ✅ Message care team | Phase 3 |

**Key Insights:**
- **Phase 1 (Doctor App):** Focused exclusively on read-only clinical data access for doctors
- **Phase 2 (Patient App):** Focused on patient engagement and health information access
- **Phase 3 (Both Apps):** Introduces write capabilities and interactive workflows for both personas

---

## 3-Month Strategic Roadmap

### Phase 1: Clinical Foundation - Doctor App (Month 1)

**Objective:** Solve the "Last Meter" problem by delivering read-only clinical data to doctors at the point of care.

**Deliverables:**
1. **Authentication System**
   - Login screen with OpenMRS credential validation
   - Secure session management
   - Automatic logout after 30 minutes of inactivity

2. **My Patients Dashboard**
   - Display patients with active visits where doctor is primary provider
   - Patient cards showing Name, ID, Age, Gender
   - Pull-to-refresh functionality
   - Empty state handling

3. **Clinical Summary Screen**
   - Demographics section
   - Active Medications section
   - Allergies section
   - Recent Vitals section (last 3 entries: Heart Rate, BP, SpO2)
   - Empty state handling for missing data

**Success Metrics:**
- ✅ 100% of core features functional (Login, Dashboard, Clinical Summary)
- ✅ App handles both full-data and empty-state patients correctly
- ✅ Performance targets met (< 3s login, < 2s data loads)
- ✅ Zero crashes during clinical use

**Timeline:** Weeks 1-4

---

### Phase 2: Patient Engagement - Patient App (Month 2)

**Objective:** Reduce administrative overhead by empowering patients with direct access to their health information.

**Deliverables:**
1. **Patient Authentication**
   - Login screen with patient portal credentials
   - Secure session management
   - Password reset functionality

2. **Personal Health Record Dashboard**
   - Patient demographics display
   - Active medications list
   - Known allergies display
   - Vitals history (last 10 entries with trend graphs)

3. **Appointments Screen**
   - Upcoming appointments list
   - Appointment details (date, time, location, provider)
   - Calendar integration

4. **Lab Results Screen**
   - Recent lab results with normal ranges
   - Trend indicators (improving, stable, declining)
   - Downloadable PDF reports

**Success Metrics:**
- ✅ 30% patient adoption rate within first month
- ✅ 50% of active users check appointments weekly
- ✅ 20% reduction in phone calls for appointment confirmations
- ✅ 70% user satisfaction rating

**Timeline:** Weeks 5-8

---

### Phase 3: Interactive Revamp - Advanced Workflows (Month 3)

**Objective:** Enable write capabilities and interactive workflows for both doctors and patients.

**Doctor App - Advanced Features:**
1. **Mobile Vitals Entry**
   - Record Heart Rate, BP, SpO2, Temperature at bedside
   - Voice-to-text for quick data entry
   - Automatic sync to OpenMRS backend

2. **AI-Assisted Clinical Notes**
   - Voice-to-text clinical observations
   - AI-powered summarization and structuring
   - Direct save to patient encounter

3. **Real-Time Lab Alerts**
   - Push notifications for critical lab results
   - Filtered by assigned patients only
   - One-tap navigation to patient clinical summary

**Patient App - Interactive Features:**
1. **Appointment Management**
   - Request appointment rescheduling
   - Cancel appointments with reason
   - Receive confirmation notifications

2. **Medication Reminders**
   - Push notifications for medication schedules
   - Mark as taken/skipped
   - Refill reminders

3. **Secure Messaging**
   - Message care team with questions
   - Receive responses within 24 hours
   - Attachment support (photos, documents)

**Success Metrics:**
- ✅ 80% of doctors actively using Doctor App during ward rounds
- ✅ 50% of patients actively using Patient App for health management
- ✅ 25% reduction in administrative overhead
- ✅ 90% user satisfaction rating across both apps

**Timeline:** Weeks 9-12

---

## Phase-Based Milestone Table

| Phase | Week | Milestone | Success Criteria |
|-------|------|-----------|------------------|
| **Phase 1** | Week 1 | Project setup & authentication | ✅ Login functional with OpenMRS API |
| **Phase 1** | Week 2 | My Patients Dashboard | ✅ Dashboard displays assigned patients |
| **Phase 1** | Week 3 | Clinical Summary - Part 1 | ✅ Demographics, Meds, Allergies displayed |
| **Phase 1** | Week 4 | Clinical Summary - Part 2 & Testing | ✅ Vitals displayed, end-to-end testing complete |
| **Phase 2** | Week 5 | Patient authentication & PHR dashboard | ✅ Patient login and health record display |
| **Phase 2** | Week 6 | Appointments & Lab Results | ✅ Appointments and lab results displayed |
| **Phase 2** | Week 7 | UI polish & user testing | ✅ Patient app user testing complete |
| **Phase 2** | Week 8 | Patient app deployment & adoption | ✅ 30% patient adoption achieved |
| **Phase 3** | Week 9 | Doctor app - Vitals entry & AI notes | ✅ Doctors can record vitals from mobile |
| **Phase 3** | Week 10 | Doctor app - Lab alerts | ✅ Real-time lab alerts functional |
| **Phase 3** | Week 11 | Patient app - Interactive features | ✅ Appointment management & reminders live |
| **Phase 3** | Week 12 | Final testing & ecosystem launch | ✅ Both apps fully functional, 90% satisfaction |

---

## Core Features & User Stories

**Note:** The features detailed in this section represent Phase 1 (Month 1) deliverables for the Doctor App. Phase 2 and Phase 3 features are outlined in the Strategic Roadmap above.

---

### Feature 1: Authentication (Doctor App - Phase 1)

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

### Feature 2: My Patients Dashboard (Doctor App - Phase 1)

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

### Feature 3: Clinical Summary (Doctor App - Phase 1)

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

## Business Rules & Edge Cases

### Patient Assignment Logic

**Rule:** A patient is "assigned" to a doctor if there is an active visit where the doctor is listed as the primary provider.

**Implementation:**
- Query: `GET /visit?provider={doctorUuid}&includeInactive=false`
- Filter: Visit must have `stopDatetime = null` (active visit)
- Provider relationship: Doctor UUID matches `visit.encounters[].encounterProviders[].provider.uuid` OR `visit.attributes` contains provider assignment

**Edge Cases:**
- **No active visits:** Display empty state message "No active patients assigned to you"
- **Multiple providers on same visit:** Show patient if logged-in doctor is listed as ANY provider (not just primary)
- **Visit without encounters:** Still show patient if visit exists with provider assignment

---

### Empty State Handling

**Reference Case:** William Robinson (ID: 10001HU) - Patient with minimal data

**Rules:**

1. **No Active Medications**
   - Display: "No active medications recorded"
   - UI: Show empty state icon with message
   - Do NOT show error or hide section

2. **No Allergies**
   - Display: "No known allergies" (important clinical information!)
   - UI: Show with neutral/positive indicator (green checkmark)
   - Do NOT treat as missing data - "no allergies" is valid clinical state

3. **No Recent Vitals**
   - Display: "No recent vitals recorded"
   - UI: Show empty state with timestamp of last check (if available)
   - Suggest: "Last vitals recorded: [date]" or "No vitals on record"

4. **Missing Demographics**
   - Display: Show available fields, hide missing fields
   - Required fields: Name, ID (always present in OpenMRS)
   - Optional fields: Age, Gender, Photo

---

### Data Refresh & Caching

**Rules:**

1. **On Login:** Fetch fresh patient list
2. **On Dashboard Load:** Use cached list, allow pull-to-refresh
3. **On Clinical Summary Load:** Always fetch fresh data (critical for clinical accuracy)
4. **Cache Duration:** Patient list cached for 5 minutes, clinical data never cached
5. **Network Failure:** Show last cached data with warning banner "Data may be outdated"

---

### Clinical Data Priority

**Display Order (Non-Negotiable):**

1. **Demographics** - Identity verification (prevent wrong-patient errors)
2. **Active Medications** - Safety check (drug interactions, current treatments)
3. **Allergies** - Safety check (prevent allergic reactions)
4. **Recent Vitals** - Clinical status (trending, current condition)

**Rationale:** Safety-critical information (Meds, Allergies) appears before diagnostic information (Vitals).

---

## Technical Requirements

### Platform & Technology Stack

**Platform:** Native Android Application  
**Framework:** Flutter or React Native (decision to be made in architecture phase)  
**Minimum Android Version:** Android 8.0 (API Level 26)  
**Target Devices:** Android smartphones (5-7 inch screens)

### Backend Integration

**API Base URL:** `http://localhost:8080/openmrs/ws/rest/v1/` (local development)  
**Authentication:** OpenMRS REST API session-based authentication  
**Data Format:** JSON  
**API Version:** OpenMRS REST API v1

### Required API Endpoints

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `POST /session` | User authentication | Critical |
| `GET /visit?provider={uuid}` | Fetch assigned patients | Critical |
| `GET /patient/{uuid}?v=full` | Patient demographics | Critical |
| `GET /order?patient={uuid}&status=ACTIVE` | Active medications | Critical |
| `GET /patient/{uuid}/allergy` | Patient allergies | Critical |
| `GET /obs?patient={uuid}&concept={vitals}` | Recent vitals | Critical |
| `DELETE /session` | Logout | Important |

### Performance Targets

- **Login:** < 3 seconds
- **Patient List Load:** < 2 seconds
- **Clinical Summary Load:** < 2 seconds
- **App Launch:** < 1 second (cold start)
- **Network Timeout:** 10 seconds with retry option

### Security Requirements

- Session tokens stored in Android Keystore (secure storage)
- HTTPS for all API calls (production)
- No sensitive data cached on device
- Automatic logout after 30 minutes of inactivity
- No screenshots allowed on clinical data screens (Android FLAG_SECURE)

---

## Constraints & Assumptions

### Constraints

1. **Timeline:** 3-month phased roadmap (12 weeks total)
2. **Platform:** Android only (no iOS, no web) for initial release
3. **Connectivity:** Always connected via hospital WiFi (no offline mode in Phase 1-2)
4. **Phase 1 Scope:** Read-only Doctor App (no data entry, no editing)
5. **Authentication:** Existing OpenMRS credentials (no new registration system)
6. **Backend:** Must use existing OpenMRS O3 REST APIs (no backend changes required)

### Assumptions

1. **Hospital WiFi is reliable** - Stable connection available throughout facility
2. **Doctors and patients have Android smartphones** - Personal or hospital-provided devices
3. **OpenMRS O3 backend is running** - Production instance accessible via secure connection
4. **Test data exists** - William Robinson (10001HU) and Snow White patients available for testing
5. **Provider UUIDs are known** - Doctors have existing provider records in OpenMRS
6. **Active visits exist** - Patients have been checked in via web interface
7. **Patient portal credentials exist** - Patients can obtain login credentials from hospital administration

### Phase 1 Focus (First Implementation)

For the initial implementation (Month 1), we will focus on **3 main features for the Doctor App**:
1. **Login** - Authentication with OpenMRS credentials
2. **My Patients Dashboard** - List of assigned patients
3. **Clinical Summary** - Read-only view of patient clinical data

This focused approach ensures a solid foundation before expanding to the Patient App in Phase 2.

### Out of Scope for Phase 1

- ❌ Patient App (deferred to Phase 2)
- ❌ Offline mode / local data sync
- ❌ Data entry (vitals, notes, orders) - deferred to Phase 3
- ❌ Push notifications - deferred to Phase 3
- ❌ Biometric authentication
- ❌ Multi-language support
- ❌ iOS version
- ❌ Tablet optimization
- ❌ Patient search functionality
- ❌ Historical data (beyond last 3 vitals in Phase 1)

### Future Considerations (Post-Phase 3)

- 📱 iOS version for both apps
- 🌐 Multi-language support (French, Spanish, Swahili)
- 💾 Offline mode with local data synchronization
- 📊 Advanced analytics and reporting dashboards
- 🔐 Biometric authentication (fingerprint, face recognition)
- 📱 Tablet-optimized layouts
- 🔍 Advanced patient search with filters
- 📈 Comprehensive historical data views

---

## Appendix

### Reference Data

**Test Patients:**
- **William Robinson (ID: 10001HU)** - Empty state testing (minimal data)
- **Snow White** - Full state testing (complete clinical data)

### API Documentation

**OpenMRS REST API Documentation:** https://rest.openmrs.org/  
**Production Instance:** Secure hospital network endpoint (configured per deployment)

### Glossary

- **Active Visit:** Visit with `stopDatetime = null`
- **Primary Provider:** Doctor assigned as main provider on visit/encounter
- **Clinical Summary:** Aggregated view of patient's current clinical status
- **Last Meter Problem:** Information gap between desktop station and point of care
- **Point of Care:** Location where doctor-patient interaction occurs (bedside, consultation room)
- **Personal Health Record (PHR):** Patient-facing view of their own health information
- **Dual-App Ecosystem:** Coordinated mobile strategy serving both doctors and patients

---

**Document Status:** Complete - 3-Month Strategic Roadmap  
**Last Updated:** 2026-04-21  
**Next Steps:** 
- Phase 1: Architecture Design → Story Creation → Doctor App Implementation (Month 1)
- Phase 2: Patient App Design → Implementation (Month 2)
- Phase 3: Advanced Features Design → Implementation (Month 3)

