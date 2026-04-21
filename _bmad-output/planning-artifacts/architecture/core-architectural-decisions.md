# Core Architectural Decisions

## Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. ✅ Authentication method (session-based)
2. ✅ Check-in orchestration pattern (parallel + sequential hybrid)
3. ✅ Transaction rollback strategy (compensating transactions)
4. ✅ Implicit relationship correlation (visit attributes)

**Important Decisions (Shape Architecture):**
5. ✅ Real-time sync strategy (hybrid polling + manual refresh)
6. ✅ Logging & audit trail (hybrid backend + local)
7. ✅ Error handling patterns (specific messages + retry + fallback)

**Deferred Decisions (Post-MVP):**
- OAuth 2.0 migration (if needed)
- WebSocket real-time updates (if OpenMRS supports)
- Cloud analytics integration (HIPAA-compliant service)
- Offline capability (future enhancement)

## Authentication & Security

**Authentication Method: Session-Based**
- **Implementation:** Username/password → session token from OpenMRS REST API
- **Token Storage:** MMKV (secure, encrypted key-value storage)
- **Session Management:** Auto-refresh on expiration, logout on 401 response
- **Migration Path:** OAuth 2.0 post-MVP if needed
- **Rationale:** Faster MVP delivery, OpenMRS REST API native support, secure storage via MMKV, no backend configuration required

**Security Headers:**
- Authorization: Bearer {session_token}
- Content-Type: application/json
- Accept: application/json

**Credential Storage:**
- Session token: MMKV (encrypted)
- Patient UUID: MMKV (linked to session)
- No password persistence (re-authenticate on session expiry)

## API Orchestration Strategy

**Check-in Workflow Pattern: Parallel + Sequential Hybrid**
- **Implementation:** TanStack Query dependent queries + Promise.all for parallel steps
- **Target Performance:** <3 seconds (estimated ~2.5s)
- **Orchestration Flow:**
  1. Check active visit (GET /visit) - 500ms
  2. Create/reuse visit (POST /visit if needed) - 500ms
  3. Parallel execution:
     - Update appointment status (POST /appointment/{id}/status-change) - 500ms
     - Generate queue number (GET /queue-entry-number) - 500ms
  4. Create queue entry (POST /visit-queue-entry) - 500ms
- **Rationale:** Meets <3 second performance requirement, TanStack Query native support, clear dependency management, no additional libraries

**Transaction Rollback Strategy: Compensating Transactions**
- **Implementation:** Explicit cleanup logic in TanStack Query mutation `onError` handlers
- **Cleanup Order:** Reverse execution order (LIFO - Last In, First Out)
- **Guarantee:** Zero orphaned records (100% traceability requirement)
- **Example Rollback Sequence:**
  - If queue entry creation fails → Delete visit (if created), revert appointment status
  - If appointment update fails → Delete visit (if created)
- **Rationale:** Healthcare context requires explicit error handling, no distributed transaction support in OpenMRS, meets 100% traceability requirement

**API Error Handling:**
- Network errors: Auto-retry 3x with exponential backoff
- Server errors (5xx): Auto-retry 2x
- Client errors (4xx): No retry, show specific error message
- Timeout: 10 seconds per API call

## Data Synchronization

**Real-time Status Update Strategy: Hybrid Polling + Manual Refresh**
- **Dashboard Screen:** Poll every 3 seconds while active (TanStack Query `refetchInterval: 3000`)
- **Other Screens:** Pull-to-refresh (user-initiated)
- **Background Optimization:** Pause polling when app backgrounded (battery/network conservation)
- **Meets Requirement:** <2 second sync on active screens
- **Rationale:** No OpenMRS backend modifications needed (brownfield constraint), TanStack Query native polling support, balanced performance vs battery usage

**State Consistency:**
- Optimistic UI updates for check-in action (immediate feedback)
- Revert on API failure (rollback + error message)
- Conflict resolution: Server state always wins (refetch on 409 conflict)

## Implicit Relationship Management

**Correlation Method: Visit Attributes**
- **Primary Strategy:** Store appointment UUID as visit attribute during check-in
- **Attribute Name:** `appointment_id`
- **Implementation:**
  ```typescript
  visit.attributes = [
    {
      attributeType: "appointment_id",
      value: appointmentUuid
    }
  ]
  ```
- **Traceability:** 100% via explicit attribute linkage
- **Validation:** Check-in fails if visit created but attribute not set (prevents orphaned records)
- **Query Pattern:** `visit.attributes.find(a => a.attributeType === 'appointment_id').value`
- **Rationale:** Guarantees 100% traceability requirement, no ambiguity, simple implementation, aligns with OpenMRS patterns

**Timezone Handling:**
- All timestamps in ISO 8601 format with timezone offset
- Server timezone: Africa/Nairobi (from OpenMRS config)
- Client timezone: Device local time converted to server timezone for API calls

## Logging & Audit Trail

**Logging Strategy: Hybrid (Backend Audit + Local Performance)**

**Backend Audit Trail (HIPAA Compliant):**
- **Endpoint:** POST /audit-log
- **Events Logged:**
  - Check-in success/failure
  - Patient UUID (no PII)
  - Timestamp
  - Visit UUID
  - Appointment UUID
  - Action type (check-in, logout, etc.)
- **Storage:** OpenMRS database (controlled environment)

**Local Performance Logging:**
- API call durations (per endpoint)
- Total check-in time (button tap to success screen)
- Error details (type, message, stack trace)
- Screen views and navigation flow

**Local Analytics:**
- Adoption metrics (check-ins per day)
- Success rate (successful check-ins / attempts)
- User engagement (session duration, screens visited)

**Compliance:**
- No PHI sent to third-party services
- All audit data stored in OpenMRS (HIPAA-compliant infrastructure)
- Local logs cleared on logout

**Rationale:** HIPAA compliance, no third-party PHI exposure, performance monitoring for <3 second SLA, analytics for 70% adoption metric

## Error Handling & User Feedback

**Error Strategy: Specific Messages + Auto-Retry + Fallback Guidance**

**Error Handling Patterns:**

| Error Type | User Message | Action | Retry Strategy |
|------------|--------------|--------|----------------|
| Network timeout | "Connection slow. Retrying..." | Auto-retry with loading indicator | 3x exponential backoff |
| Session expired | "Session expired. Please log in again." | Redirect to login screen | No retry |
| Already checked in | "You're already checked in! Queue number: A-042" | Show queue number and waiting area instructions | No retry |
| No appointment today | "No appointment found for today. Please contact reception." | Show reception desk location | No retry |
| Server error (5xx) | "System temporarily unavailable. Please try again or visit reception." | Manual retry button + fallback guidance | 2x retry |
| Invalid credentials | "Incorrect username or password. Please try again." | Clear password field, focus input | No retry |
| Visit creation failed | "Unable to complete check-in. Please try again or visit reception." | Manual retry button + fallback | No retry (already rolled back) |

**Retry Logic (TanStack Query):**
- Network errors: 3 retries, exponential backoff (1s, 2s, 4s)
- Server errors: 2 retries, exponential backoff (1s, 2s)
- Client errors (4xx): No retry
- Timeout: 10 seconds per attempt

**User Feedback:**
- Loading states: Spinner with progress message ("Checking in...", "Creating visit...", "Updating appointment...")
- Success state: Checkmark animation + queue number + instructions
- Error state: Clear message + retry button (if applicable) + fallback action

**Rationale:** Healthcare context requires clear, anxiety-reducing messages, meets >99% success rate goal, TanStack Query native retry support, always provides actionable guidance

## Decision Impact Analysis

**Implementation Sequence:**
1. **Foundation:** Project initialization (Obytes template + Material Design 3)
2. **Authentication:** Session-based login with MMKV storage
3. **API Client:** OpenMRS REST API client with TanStack Query
4. **Check-in Orchestration:** Parallel + sequential workflow with rollback
5. **UI Components:** Material Design 3 screens (login, dashboard, check-in, success)
6. **State Sync:** Polling + pull-to-refresh
7. **Logging:** Backend audit trail + local performance logging
8. **Error Handling:** Specific error messages + retry logic
9. **Testing:** Unit tests (Jest) + E2E tests (Maestro)

**Cross-Component Dependencies:**
- Authentication → API Client (session token in headers)
- API Client → Check-in Orchestration (TanStack Query mutations)
- Check-in Orchestration → Logging (audit trail on success/failure)
- Check-in Orchestration → Error Handling (rollback + user feedback)
- State Sync → UI Components (real-time status updates)
- Implicit Correlation → Check-in Orchestration (visit attributes)

---
