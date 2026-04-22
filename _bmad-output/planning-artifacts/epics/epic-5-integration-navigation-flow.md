# Epic 5: Integration & Navigation Flow

Complete end-to-end user journey with all features connected: Login → Dashboard → Clinical Summary → Logout, with proper navigation and state management.

## Business Context

**Business Objective:** Deliver production-ready Phase 1 application with seamless user experience
**User Impact:** Doctors experience smooth, intuitive workflow from login to patient care
**Success Metrics:** Zero navigation bugs; 100% end-to-end test coverage; app ready for hospital deployment

## Story 5.1: Wire Authentication to Dashboard

As a developer,
I want to connect real authentication to the dashboard,
So that only logged-in doctors can access patient data.

**Acceptance Criteria:**

**AC1.**
**Given** Epic 2 (Auth) and Epic 3 (Dashboard) are complete
**When** I replace mock auth checks in the dashboard
**Then** Unauthenticated users are redirected to login
**And** Authenticated users can access the dashboard
**And** The doctor's UUID from auth is used to filter patient list

**Technical Context:**
- Replace mock `isAuthenticated = true` with real AuthContext
- Use logged-in doctor's UUID for patient filtering
- Covers integration of FR1-FR12

## Story 5.2: Wire Patient Selection to Clinical Summary

As a developer,
I want to connect patient selection from dashboard to clinical summary,
So that tapping a patient shows their actual clinical data.

**Acceptance Criteria:**

**AC1.**
**Given** Epic 3 (Dashboard) and Epic 4 (Clinical Summary) are complete
**When** I replace mock patient ID in clinical summary
**Then** The patient UUID from dashboard navigation is used
**And** Tapping a patient on dashboard shows that patient's clinical data
**And** Navigation between screens works seamlessly

**Technical Context:**
- Replace mock `patientId = '123-mock-id'` with route params
- Use Expo Router dynamic route: `/patient/[id].tsx`
- Covers integration of FR12-FR20

## Story 5.3: End-to-End User Journey Testing

As a developer,
I want comprehensive end-to-end tests for the complete user journey,
So that we ensure all features work together correctly.

**Acceptance Criteria:**

**AC1.**
**Given** All epics are integrated
**When** I run end-to-end tests
**Then** Tests cover: Login → Dashboard → Select Patient → View Clinical Summary → Back → Logout
**And** Tests verify data flows correctly between screens
**And** Tests cover error scenarios (network failures, empty states)
**And** All critical paths have 100% test coverage

**Technical Context:**
- Integration tests using React Native Testing Library
- Mock OpenMRS API responses
- Covers all FRs (FR1-FR22)

## Story 5.4: Performance Optimization and Polish

As a developer,
I want to optimize app performance and polish the user experience,
So that the app meets all performance targets and feels production-ready.

**Acceptance Criteria:**

**AC1.**
**Given** All features are integrated
**When** I test app performance
**Then** Login completes in < 3 seconds
**And** Dashboard loads in < 2 seconds
**And** Clinical Summary loads in < 2 seconds
**And** App cold start completes in < 1 second

**AC2.**
**Given** All features are integrated
**When** I test the user experience
**Then** All loading states show skeleton screens (no blank screens)
**And** All error messages are user-friendly
**And** All interactions have appropriate feedback (ripples, animations)
**And** All empty states display helpful messages

**Technical Context:**
- Verify all NFRs (NFR1-NFR18)
- Verify all UX-DRs (UX-DR1-UX-DR24)
- Production-ready polish

## Story 5.5: Production Deployment Preparation

As a developer,
I want to prepare the app for production deployment,
So that it can be installed on hospital devices.

**Acceptance Criteria:**

**AC1.**
**Given** All features are complete and tested
**When** I build the production APK
**Then** The app builds successfully with production environment variables
**And** All security features are enabled (SecureStore, screenshot prevention)
**And** The app is signed and ready for distribution

**AC2.**
**Given** The production build is ready
**When** I test on a physical Android device
**Then** All features work correctly on real hardware
**And** Performance targets are met on target devices

**Technical Context:**
- Production environment configuration
- APK signing and distribution
- Final validation on target hardware

<!-- End of Epic and Story Generation -->

{{epic_goal_N}}

## Business Context

**Business Objective:** {{business_objective_N}}
**User Impact:** {{user_impact_N}}
**Success Metrics:** {{success_metrics_N}}

<!-- Technical context (architecture decisions, implementation approach, tech stack details) belongs in individual stories, not here. -->

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

## Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

**Technical Context:**
{{technical_notes_N_M}}

<!-- End story repeat -->
