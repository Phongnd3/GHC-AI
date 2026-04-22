# Project Context Analysis

## Requirements Overview

**Functional Requirements:**

The GHC-AI Doctor Mobile App is a native Android application solving the "Last Meter" problem in clinical data access. Phase 1 (Month 1) delivers three core features:

1. **Authentication** - Login using existing OpenMRS credentials via REST API
2. **My Patients Dashboard** - Display patients with active visits where doctor is primary provider
3. **Clinical Summary** - Read-only view of patient clinical data in priority order:
   - Demographics (identity verification)
   - Active Medications (safety check)
   - Allergies (safety check)
   - Recent Vitals (last 3 entries: Heart Rate, BP, SpO2)

The app integrates with existing OpenMRS O3 backend via REST APIs with no backend changes required. Phase 2 adds Patient App for patient engagement, Phase 3 adds write capabilities (vitals entry, clinical notes, lab alerts).

**Non-Functional Requirements:**

- **Performance:** < 3s login, < 2s patient list load, < 2s clinical summary load
- **Security:** Session tokens in Android Keystore, HTTPS, no sensitive data caching, 30-min auto-logout, FLAG_SECURE on clinical screens
- **Reliability:** Zero crashes during clinical use, graceful error handling with retry options
- **Connectivity:** Always-connected via hospital WiFi (no offline mode in Phase 1)
- **Platform:** Native Android API 26+, optimized for 5-7 inch screens
- **Usability:** Thumb-friendly one-handed operation, < 10s to verify critical information, zero learning curve

**Scale & Complexity:**

- **Primary domain:** Native Android mobile with healthcare backend integration
- **Complexity level:** Medium - Healthcare domain with clinical safety requirements and existing system integration
- **Estimated architectural components:** 
  - Authentication module
  - API integration layer (OpenMRS REST)
  - Patient data management
  - UI component library (Material Design 3)
  - Security & session management
  - Error handling & network resilience

## Technical Constraints & Dependencies

**Backend Constraints:**
- Must use existing OpenMRS O3 REST API v1 (no backend modifications)
- Session-based authentication via `/session` endpoint
- API endpoints: `/visit`, `/patient`, `/order`, `/allergy`, `/obs`
- JSON data format
- **Domain model defined in:** `docs/reverse-engineering/01-domain-logic/` — all type definitions, business rules, and API shapes must follow these documents

**Domain Model Constraints (from 01-domain-logic analysis):**
- Active visit = `stopDatetime === null`; "My Patients" requires filtering by doctor's provider UUID in `encounter.encounterProviders`
- Patient display must use `preferred: true` identifier and name; voided and deceased patients must be excluded
- Allergy empty state is clinically significant: distinguish "no allergies" (empty array) from "not assessed" (null)
- Vitals: fetch last 3 obs per concept using standard CIEL concept UUIDs (confirm per installation)
- Session response includes `currentProvider.uuid` — required for all patient filtering logic
- Medications: active drug orders only (`voided === false`, not expired)

**Platform Constraints:**
- Android-only for Phase 1 (iOS future consideration)
- Minimum Android 8.0 (API Level 26)
- Hospital WiFi connectivity required (no offline mode)
- Material Design 3 UI framework

**Timeline Constraints:**
- Phase 1 delivery: 4 weeks (Month 1)
- Fast-to-ship and demo priority
- Architecture must support future multi-platform expansion

**Data Constraints:**
- Patient assignment logic: Active visits filtered by Provider UUID
- Clinical data priority: Demographics → Meds → Allergies → Vitals
- Cache strategy: 5-min cache for patient list, no cache for clinical data (accuracy critical)
- Empty state handling: Distinguish "no data" vs "no allergies" (clinically significant)

**Design Constraints:**
- **MANDATORY:** All UI implementation must follow `ux-design-specification/index.md`
- Material Design 3 with OpenMRS O3 brand adaptation
- Wireframes and component specifications are binding
- Screen layouts, navigation flows, and interaction patterns defined in UX spec

## Cross-Cutting Concerns Identified

**1. UX Design Compliance (MANDATORY)**
- **Reference Document:** `_bmad-output/planning-artifacts/ux-design-specification/index.md`
- All screens must match wireframes and specifications exactly
- Material Design 3 component usage as specified
- Color system, typography, and spacing must follow design tokens
- Navigation patterns and user flows are non-negotiable
- Empty state designs must be implemented as specified
- Performance targets tied to UX expectations (< 2s loads)

**2. Clinical Safety & Data Accuracy**
- Life-critical information display (Allergies, Medications)
- Wrong-patient error prevention (prominent patient ID display)
- Data freshness indicators (timestamps, sync status)
- Empty state clarity (missing data vs intentionally empty)

**3. Security & Compliance**
- Healthcare data protection (HIPAA implications)
- Secure session management (Android Keystore)
- No sensitive data caching on device
- Screenshot prevention (FLAG_SECURE)
- Automatic session timeout (30 minutes)

**4. Performance & Responsiveness**
- < 2s data load targets across all screens
- Skeleton screens for loading states
- Optimistic UI updates where safe
- Network timeout handling (10s with retry)

**5. API Integration & Network Resilience**
- OpenMRS REST API v1 integration
- Session token management and refresh
- Network error handling with user-friendly messages
- Retry mechanisms for failed requests
- Graceful degradation when data unavailable

**6. User Experience Consistency**
- Material Design 3 component library
- OpenMRS O3 brand adaptation (color palette, typography)
- Thumb-friendly touch targets (minimum 48dp)
- Android native navigation patterns
- Pull-to-refresh for manual data updates

**7. Future Extensibility**
- Architecture must support iOS addition (Phase 2+)
- Write capabilities planned (Phase 3: vitals entry, clinical notes)
- Patient App addition (Phase 2)
- Multi-language support (future consideration)
