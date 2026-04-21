# Project Context Analysis

## Requirements Overview

**Functional Requirements:**

The MVP delivers three core capabilities:

1. **Identity Linking & Login** - Authenticate patients using existing OpenMRS credentials, establishing secure session linked to patient UUID
2. **Simple Appointment View** - Display today's scheduled appointments with provider, time, department, and real-time status
3. **Smart Check-in Orchestration** - Execute multi-step workflow: check for active visit → create/reuse visit → update appointment status to "CheckedIn" → generate queue number → create queue entry → display success confirmation

**Non-Functional Requirements:**

Critical NFRs driving architectural decisions:

- **Performance:** <3 second end-to-end check-in orchestration despite 8-11 API calls
- **Data Integrity:** 100% traceability between Appointments and Visits with zero orphaned records
- **Reliability:** >99% check-in success rate with graceful failure and transaction-like rollback
- **State Synchronization:** <2 second consistency between mobile app state and OpenMRS backend
- **Healthcare Compliance:** HIPAA compliance, audit trails, patient safety requirements
- **Brownfield Constraint:** Zero modifications to OpenMRS core schema - work within existing REST API
- **UX Performance:** Material Design 3 patterns, one-handed interaction, zero learning curve

**Scale & Complexity:**

- **Primary domain:** Mobile (Android) + Legacy System Integration
- **Complexity level:** High
- **Complexity drivers:** Healthcare regulation, implicit entity relationships, orchestration without distributed transactions, brownfield constraints
- **Estimated architectural components:** 6-8 major modules (Auth, API Client, Orchestration Engine, State Management, UI Components, Error Recovery, Logging/Analytics)

## Technical Constraints & Dependencies

**Backend Constraints:**
- OpenMRS REST API as-is (no schema modifications allowed)
- No direct foreign keys between Appointment ↔ Visit ↔ Queue entities
- Must implement implicit correlation using patient UUID + time-based matching algorithms
- No distributed transaction support - must implement custom rollback logic

**Platform Constraints:**
- Android only (MVP scope)
- Online-only connectivity (facility WiFi assumed)
- Material Design 3 component library required
- Existing OpenMRS patient accounts (no new registration flow)

**Integration Dependencies:**
- OpenMRS REST API endpoints: `/appointment`, `/visit`, `/queue-entry`, `/patient`
- Authentication mechanism: OpenMRS session-based or OAuth (TBD)
- Real-time status updates require polling or webhook strategy (TBD)

## Cross-Cutting Concerns Identified

**1. API Orchestration & Transaction Management**
- Coordinate 8-11 API calls with partial success handling
- Implement rollback logic when mid-workflow failures occur
- Optimize for parallel execution where dependencies allow

**2. State Synchronization**
- Maintain consistency between local app state and remote OpenMRS state
- Handle concurrent updates from web system (healthcare workers)
- Implement optimistic UI updates with conflict resolution

**3. Error Handling & Recovery**
- Graceful degradation for network failures
- Clear user-facing error messages for healthcare context
- Prevent partial check-ins that corrupt data integrity
- Retry mechanisms with exponential backoff

**4. Authentication & Session Management**
- Secure credential storage on device
- Session expiration and refresh handling
- Patient UUID correlation with app session

**5. Logging & Audit Trails**
- Comprehensive logging for healthcare compliance
- Audit trail for all check-in operations
- Performance monitoring for <3 second SLA
- Analytics for adoption metrics (70% self-service target)

**6. Implicit Relationship Management**
- Correlation algorithms linking Appointments → Visits → Queue entries
- Time-based matching with timezone handling
- Patient UUID as primary correlation key
- Validation logic to ensure 100% traceability

---
