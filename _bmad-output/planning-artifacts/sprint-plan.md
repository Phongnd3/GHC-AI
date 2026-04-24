# Sprint Plan - GHC Mobile App Phase 1

**Generated:** 2026-04-22  
**Project:** GHC Mobile App - OpenMRS Patient Management  
**Sprint Goal:** Deliver production-ready Phase 1 mobile app with authentication, patient dashboard, and clinical summary features

---

## Sprint Overview

### Epic Dependencies

```
Epic 1 (Foundation)
    ↓
Epic 2 (Auth) ──┐
Epic 3 (Dashboard) ──┼──→ Epic 5 (Integration)
Epic 4 (Clinical Summary) ──┘
```

**Parallel Work Streams:**
- Epic 1 must complete first (foundation for all)
- Epics 2, 3, 4 can work in parallel after Epic 1
- Epic 5 integrates all features (requires 2, 3, 4 complete)

---

## Epic 1: Project Foundation & Core Infrastructure

**Status:** 🔴 Not Started  
**Priority:** P0 - Blocking all other work  
**Dependencies:** None  
**Estimated Duration:** 1-2 sprints

| Story | Title | Status | Assignee | Notes |
|-------|-------|--------|----------|-------|
| 1.1 | Initialize Expo Project with TypeScript and Expo Router | ✅ Done | - | Expo SDK 55, TypeScript, Expo Router |
| 1.2 | Configure Development Tooling (ESLint, Prettier, Husky) | ✅ Done | - | Code quality foundation |
| 1.3 | Set Up Testing Infrastructure (Jest + RNTL) | ✅ Done | - | 90% API, 80% UI coverage targets |
| 1.4 | Implement Theme System (Colors, Typography, Spacing) | ✅ Done | - | OpenMRS O3 brand, 8dp grid |
| 1.5 | Configure API Client (Axios with Interceptors) | ✅ Done | - | Auth injection, 401 handling |
| 1.6 | Implement Centralized Error Handler | ✅ Done | Kiro CLI | User-friendly error mapping |
| 1.7 | Create Base UI Components (EmptyState, LoadingSkeleton) | ✅ Done | - | Reusable patterns |
| 1.8 | Configure Environment Variables and Constants | ✅ Done | - | Dev/staging/prod configs |

**Acceptance Criteria for Epic Completion:**
- [x] All developers can start feature work immediately
- [x] Project runs on Android emulator with hot reload
- [x] All tooling (linting, testing, formatting) works
- [x] Theme system is complete and documented
- [x] API client handles auth and errors correctly

---

## Epic 2: Authentication & Session Management

**Status:** 🔴 Not Started  
**Priority:** P0 - Critical security feature  
**Dependencies:** Epic 1 complete  
**Estimated Duration:** 1 sprint  
**Can work in parallel with:** Epic 3, Epic 4

| Story | Title | Status | Assignee | Notes |
|-------|-------|--------|----------|-------|
| 2.1 | Doctor Login with OpenMRS Credentials | 🔴 Not Started | - | POST /session, SecureStore |
| 2.2 | Handle Invalid Login Credentials | 🔴 Not Started | - | 401 error handling |
| 2.3 | Handle Network Errors During Login | 🔴 Not Started | - | Retry mechanism |
| 2.4 | Automatic Session Timeout After 30 Minutes | 🟡 Ready for Dev | - | Inactivity timer |
| 2.5 | Prevent Screenshots on Clinical Screens | 🔴 Not Started | - | expo-screen-capture |
| 2.6 | Doctor Logout with Confirmation | 🔴 Not Started | - | DELETE /session |
| 2.7 | Session Persistence Across App Restarts | 🔴 Not Started | - | SecureStore validation |

**Acceptance Criteria for Epic Completion:**
- [ ] 100% of doctors can log in with existing credentials
- [ ] Sessions expire after 30 minutes of inactivity
- [ ] Screenshots are blocked on all authenticated screens
- [ ] Sessions persist across app restarts (within timeout)
- [ ] All error scenarios handled gracefully

---

## Epic 3: My Patients Dashboard

**Status:** 🔴 Not Started  
**Priority:** P0 - Core feature  
**Dependencies:** Epic 1 complete  
**Estimated Duration:** 1 sprint  
**Can work in parallel with:** Epic 2, Epic 4

| Story | Title | Status | Assignee | Notes |
|-------|-------|--------|----------|-------|
| 3.1 | View List of Assigned Patients | 🔴 Not Started | - | GET /visit, SWR 5-min cache |
| 3.2 | Refresh Patient List | 🔴 Not Started | - | Pull-to-refresh |
| 3.3 | Handle Empty Patient List | 🔴 Not Started | - | EmptyState component |
| 3.4 | Navigate to Patient Clinical Summary | 🔴 Not Started | - | Expo Router navigation |
| 3.5 | Display Last Updated Timestamp | 🔴 Not Started | - | date-fns formatting |
| 3.6 | Handle Network Errors on Dashboard | 🔴 Not Started | - | Retry mechanism |

**Acceptance Criteria for Epic Completion:**
- [ ] Patient list loads in < 2 seconds
- [ ] Only assigned patients with active visits shown
- [ ] Pull-to-refresh works correctly
- [ ] Empty states display helpful messages
- [ ] Navigation to clinical summary works
- [ ] Network errors handled gracefully

---

## Epic 4: Clinical Summary & Patient Data

**Status:** 🔴 Not Started  
**Priority:** P0 - Core feature  
**Dependencies:** Epic 1 complete  
**Estimated Duration:** 1-2 sprints  
**Can work in parallel with:** Epic 2, Epic 3

| Story | Title | Status | Assignee | Notes |
|-------|-------|--------|----------|-------|
| 4.1 | View Patient Demographics | 🔴 Not Started | - | GET /patient/{uuid}?v=full |
| 4.2 | View Active Medications | 🔴 Not Started | - | Light blue cards, medication icon |
| 4.3 | View Known Allergies | 🔴 Not Started | - | Light red cards, warning icon |
| 4.4 | View Recent Vitals | 🔴 Not Started | - | Last 3 entries for HR, BP, SpO2 |
| 4.5 | Refresh Clinical Summary Data | 🔴 Not Started | - | Pull-to-refresh, no cache |
| 4.6 | Navigate Back to Dashboard | 🔴 Not Started | - | Expo Router back navigation |
| 4.7 | Handle Network Errors on Clinical Summary | 🔴 Not Started | - | Partial failure handling |

**Acceptance Criteria for Epic Completion:**
- [ ] Clinical data loads in < 2 seconds
- [ ] All sections (demographics, meds, allergies, vitals) display correctly
- [ ] Empty states handled for each section
- [ ] Allergies have high-visibility red styling
- [ ] "No known allergies" shown as positive indicator
- [ ] Partial failures handled (some sections load, others fail)
- [ ] Back navigation preserves dashboard cache

---

## Epic 5: Integration & Navigation Flow

**Status:** 🔴 Not Started  
**Priority:** P0 - Production readiness  
**Dependencies:** Epics 2, 3, 4 all complete  
**Estimated Duration:** 1 sprint

| Story | Title | Status | Assignee | Notes |
|-------|-------|--------|----------|-------|
| 5.1 | Wire Authentication to Dashboard | 🔴 Not Started | - | Replace mock auth |
| 5.2 | Wire Patient Selection to Clinical Summary | 🔴 Not Started | - | Replace mock patient ID |
| 5.3 | End-to-End User Journey Testing | 🔴 Not Started | - | 100% critical path coverage |
| 5.4 | Performance Optimization and Polish | 🔴 Not Started | - | Verify all NFRs and UX-DRs |
| 5.5 | Production Deployment Preparation | 🔴 Not Started | - | APK signing, hardware testing |

**Acceptance Criteria for Epic Completion:**
- [ ] Complete user journey works: Login → Dashboard → Clinical Summary → Logout
- [ ] All performance targets met (< 3s login, < 2s loads)
- [ ] 100% end-to-end test coverage for critical paths
- [ ] Production APK builds and runs on target hardware
- [ ] All security features enabled and verified
- [ ] App ready for hospital deployment

---

## Sprint Metrics

### Story Status Summary

| Status | Count | Percentage |
|--------|-------|------------|
| 🔴 Not Started | 27 | 82% |
| 🟡 In Progress | 0 | 0% |
| 🟢 Complete | 6 | 18% |
| 🔵 Blocked | 0 | 0% |
| **Total Stories** | **33** | **100%** |

### Epic Status Summary

| Epic | Status | Stories Complete | Progress |
|------|--------|------------------|----------|
| Epic 1: Foundation | 🟡 In Progress | 6/8 | 75% |
| Epic 2: Authentication | 🔴 Not Started | 0/7 | 0% |
| Epic 3: Dashboard | 🔴 Not Started | 0/6 | 0% |
| Epic 4: Clinical Summary | 🔴 Not Started | 0/7 | 0% |
| Epic 5: Integration | 🔴 Not Started | 0/5 | 0% |
| **Overall Progress** | 🟡 In Progress | **6/33** | **18%** |

---

## Recommended Sprint Sequence

### Sprint 1: Foundation (Epic 1)
**Goal:** Establish technical foundation for all feature development

**Stories:** 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8  
**Duration:** 1-2 weeks  
**Deliverable:** Working project with tooling, theme, API client, testing infrastructure

**Success Criteria:**
- Project runs on Android emulator
- All tooling configured and working
- Theme system complete
- API client handles auth and errors
- Base components available

---

### Sprint 2: Parallel Feature Development (Epics 2, 3, 4)
**Goal:** Build core features in parallel

**Team A - Authentication (Epic 2):**
- Stories: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7

**Team B - Dashboard (Epic 3):**
- Stories: 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6

**Team C - Clinical Summary (Epic 4):**
- Stories: 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7

**Duration:** 2-3 weeks  
**Deliverable:** Three independent features ready for integration

**Success Criteria:**
- Authentication flow complete with security features
- Dashboard shows assigned patients with navigation
- Clinical summary displays all patient data sections

---

### Sprint 3: Integration & Production (Epic 5)
**Goal:** Integrate all features and prepare for production deployment

**Stories:** 5.1 → 5.2 → 5.3 → 5.4 → 5.5  
**Duration:** 1-2 weeks  
**Deliverable:** Production-ready Phase 1 mobile app

**Success Criteria:**
- End-to-end user journey works seamlessly
- All performance targets met
- 100% test coverage for critical paths
- Production APK ready for hospital deployment

---

## Risk Register

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| OpenMRS API availability for testing | High | Set up local OpenMRS instance or use demo server | 🟡 Monitor |
| Android device availability for testing | Medium | Ensure physical devices available before Sprint 3 | 🟡 Monitor |
| Parallel team coordination (Sprint 2) | Medium | Daily standups, clear interface contracts | 🟡 Monitor |
| Performance targets on low-end devices | Medium | Test on target hardware early in Sprint 2 | 🟡 Monitor |
| SecureStore compatibility issues | Low | Test on multiple Android versions early | 🟢 Low Risk |

---

## Definition of Done

### Story-Level DoD
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90% API, 80% UI coverage)
- [ ] Code reviewed and approved
- [ ] No linting errors
- [ ] Tested on Android emulator
- [ ] Documentation updated (if applicable)

### Epic-Level DoD
- [ ] All stories complete and meet story-level DoD
- [ ] Integration tests passing
- [ ] Epic acceptance criteria verified
- [ ] Performance targets met
- [ ] No critical or high-priority bugs
- [ ] Demo-ready

### Release-Level DoD (Phase 1)
- [ ] All epics complete and meet epic-level DoD
- [ ] End-to-end tests passing (100% critical path coverage)
- [ ] Performance verified on target hardware
- [ ] Security features verified (SecureStore, screenshot prevention)
- [ ] Production APK built and signed
- [ ] Deployment documentation complete
- [ ] Hospital stakeholders approve for deployment

---

## Notes

### Story File Locations
Individual story implementation files should be created in:
```
_bmad-output/implementation-artifacts/stories/
  ├── epic-1/
  │   ├── story-1.1-initialize-expo-project.md
  │   ├── story-1.2-configure-dev-tooling.md
  │   └── ...
  ├── epic-2/
  │   ├── story-2.1-doctor-login.md
  │   ├── story-2.2-handle-invalid-credentials.md
  │   └── ...
  ├── epic-3/
  ├── epic-4/
  └── epic-5/
```

### Assignee Management
**IMPORTANT:** When a developer starts working on any story using `bmad-dev-story`:
- The developer's name will be automatically assigned to the "Assignee" column in this sprint plan
- The story status will be updated to 🟡 In Progress
- This ensures accurate tracking of who is working on what

### Status Legend
- 🔴 **Not Started** - Story not yet begun
- 🟡 **In Progress** - Story actively being worked on
- 🟢 **Complete** - Story meets all acceptance criteria and DoD
- 🔵 **Blocked** - Story cannot proceed due to dependency or issue

### Update Frequency
This sprint plan should be updated:
- **Automatically** when a developer starts a story (assignee + status)
- Daily during active sprints (story status changes)
- After each story completion (metrics update)
- After each epic completion (epic status update)
- When risks materialize or are resolved

---

## Next Steps

1. **Review and approve sprint plan** with stakeholders
2. **Set up development environment** (Epic 1, Story 1.1)
3. **Create story files** for Sprint 1 stories (Epic 1)
4. **Begin Sprint 1** - Foundation work
5. **Schedule Sprint 2 kickoff** after Epic 1 completion

---

*This sprint plan is a living document. Update story statuses, metrics, and notes as work progresses.*
