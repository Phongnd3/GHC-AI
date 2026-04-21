---
documentType: "Q&A Log"
project: "GHC-AI Mobile Ecosystem"
phase: "PRD Creation"
purpose: "Record of all questions asked and answers provided during PRD development"
created: "2026-04-21"
participants: ["Kiro (AI Assistant)", "TrangN (Product Owner)"]
---

# PRD Development Q&A Log

**Project:** GHC-AI Mobile Ecosystem  
**Document:** Product Requirements Document (PRD)  
**Date Range:** 2026-04-21  
**Status:** Complete

---

## Session 1: Initial Discovery & Strategic Pivot

### Q1: Platform Classification
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What platform are we targeting? Is this a responsive web app or a native mobile app?"

**Answer by:** TrangN  
**Response:**
> "NOT Responsive Web: We are building a Native/Cross-platform Android App (e.g., using Flutter or React Native) to ensure better performance and UX for doctors. Target Device: Android Smartphones only."

**Impact on PRD:** Updated classification to "Native Android Mobile App (Flutter/React Native)"

---

### Q2: "My Patients" Logic
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "How do we determine which patients belong to a specific doctor? What's the mechanism for 'My Patients'?"

**Answer by:** TrangN  
**Response:**
> "Mechanism: Focus on Active Visits filtered by the Provider (Doctor) UUID. Context: In OpenMRS, a patient is assigned to a doctor via the Encounter Provider or Visit relationship. For the MVP, if a doctor is logged in, the app should fetch visits where they are the primary provider."

**Impact on PRD:** 
- Added business rule: `GET /visit?provider={doctorUuid}&includeInactive=false`
- Documented patient assignment logic in Business Rules section

---

### Q3: Clinical Summary Priority
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What information should be displayed in the Clinical Summary, and in what order?"

**Answer by:** TrangN  
**Response:**
> "Priority: 1. Demographics (Identity check) -> 2. Active Medications -> 3. Allergies -> 4. Recent Vitals (Last 3 entries). Scope: This is the Complete List for the 1-week MVP. Keep it lean."

**Impact on PRD:** 
- Established non-negotiable display order
- Added rationale: Safety-critical information (Meds, Allergies) before diagnostic information (Vitals)
- Documented in frontmatter: `clinicalSummaryPriority: ["Demographics", "Active Medications", "Allergies", "Recent Vitals (last 3)"]`

---

### Q4: Connectivity & Offline Mode
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Should the app support offline mode or local database synchronization?"

**Answer by:** TrangN  
**Response:**
> "Connectivity: Always Connected via Hospital Wi-Fi. No offline mode or local database synchronization is required for this 1-week demo."

**Impact on PRD:** 
- Added constraint: Always connected (no offline mode)
- Simplified technical requirements (no local database needed)
- Added to assumptions: "Hospital WiFi is reliable"

---

### Q5: Authentication Mechanism
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What authentication mechanism should we use? Do we need special mobile biometrics?"

**Answer by:** TrangN  
**Response:**
> "Mechanism: Reuse existing OpenMRS REST API Auth. Same credentials as the web app. No special mobile biometrics for this version."

**Impact on PRD:** 
- Authentication: Session-based using existing OpenMRS credentials
- No biometric authentication in Phase 1
- Added to "Out of Scope": Biometric authentication

---

### Q6: Reference Data for Testing
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What test data should we use for development and testing?"

**Answer by:** TrangN  
**Response:**
> "Use the 'William Robinson' (ID: 10001HU) case from my recent screenshots as a reference for 'Empty States' (where Vitals/Meds might be missing). Use 'Snow White' as the reference for 'Full Data' states."

**Impact on PRD:** 
- Added reference data section
- Documented empty state handling requirements
- Created acceptance criteria for both empty and full data scenarios

---

## Session 2: Vision Discovery & Problem Definition

### Q7: The Real Pain Point
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What is the core problem we're solving? Why do doctors need this mobile app?"

**Answer by:** TrangN  
**Response:**
> "The real problem isn't just carrying laptops; it's the information gap at the bedside. Currently, doctors are 'desk-locked'. They review data at a station, walk to the bedside, then realize they forgot a specific vital trend or allergy. This leads to paper-scraping (writing on pockets/hands) and double-entry later, which increases the risk of medical errors. We are solving the 'Last Meter' problem in clinical data access."

**Impact on PRD:** 
- Coined term: "Last Meter Problem"
- Added to Executive Summary as core problem statement
- Shaped entire value proposition around this insight

---

### Q8: The "Aha!" Moment
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What's the key moment of value for the doctor using this app?"

**Answer by:** TrangN  
**Response:**
> "The 'Aha!' moment is when a doctor, while talking to a patient, can verify a medication or a blood pressure trend without turning their back on the patient to go to a computer. It's about maintaining the Doctor-Patient relationship while being data-driven."

**Impact on PRD:** 
- Added to "What Makes This Special" section
- Emphasized "maintaining eye contact" and "therapeutic relationship"
- Shaped UX requirements around instant access

---

### Q9: Point of Care Definition
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "When you say 'point of care,' do you mean only at the bedside?"

**Answer by:** TrangN  
**Response:**
> "Not only at the bedside but they can consult to patient in room."

**Impact on PRD:** 
- Updated terminology: "bedside during ward rounds OR consultation rooms"
- Broadened use case beyond just ward rounds
- Added to glossary: "Point of Care: Location where doctor-patient interaction occurs (bedside, consultation room)"

---

### Q10: Persona Shift Insight
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "How does this mobile app differ from the existing O3 web interface?"

**Answer by:** TrangN  
**Response:**
> "The current O3 Web interface seems designed for Receptionists/Administrators (focusing on registration and queue management). My Android App will strictly strip away all administrative noise. We are building it for Doctors only. Administrative UI (Skip): Billing, detailed appointments, registration forms. Clinical UI (Focus): Direct access to patient health status (Meds, Allergies, Vitals). Please ensure the Solution Design reflects this shift in user persona—moving from a 'Data Entry clerk' mindset to a 'Point-of-Care decision maker' mindset."

**Impact on PRD:** 
- Added "Extreme Focus" section highlighting persona shift
- Documented what to exclude (billing, appointments, registration)
- Emphasized "From 'Everything for Everyone' to 'Only What I Need'"

---

### Q11: Strategic Context - Why Now?
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Why is this project happening now? What's the strategic driver?"

**Answer by:** TrangN  
**Response:**
> "This is a Proof-of-Concept (PoC) to get buy-in for a larger mobile initiative. Many stakeholders think OpenMRS is 'too heavy' for mobile. By building this in 1 week, we prove that we can deliver a lightweight, high-speed, native experience that works seamlessly with the existing O3 backend."

**Impact on PRD:** 
- Added "Strategic Proof-of-Concept" section
- Included stakeholder buy-in as success criterion
- Framed as foundation for larger mobile initiative

---

## Session 3: Language & Messaging Refinement

### Q12: Frictionless Access Language
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Should we emphasize the '2 taps' metric in the PRD?"

**Answer by:** TrangN  
**Response:**
> "Please remove the specific phrase '2 taps' or 'Frictionless access (2 taps)'. Instead, replace it with language that emphasizes 'Instant Access,' 'Direct Clinical Path,' and 'Zero Navigational Friction.' We want to focus on the clinical value of the information reach, not just the count of screen touches."

**Impact on PRD:** 
- Removed all "2 taps" references
- Updated language to focus on clinical value
- Changed "Frictionless Access" to "Direct Access: Immediate Path to Life-Saving Information"
- Emphasized "speed of information reach preserves the therapeutic relationship"

---

## Session 4: Strategic Expansion to 3-Month Roadmap

### Q13: Timeline Expansion
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Should we proceed with the 1-week MVP timeline as documented?"

**Answer by:** TrangN  
**Response:**
> "I need to update the PRD. Remove all '1-week' or '5 working days' references. I want to move from 'Proof of Concept' mindset to 'Mobile Ecosystem' mindset. This should be a 3-Month Phased Roadmap."

**Impact on PRD:** 
- Complete timeline transformation from 1-week to 3-month roadmap
- Removed all "proof-of-concept" and "MVP demo" language
- Updated classification: `timeline: "3-month roadmap"`

---

### Q14: Dual-App Vision
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What should the expanded vision include beyond the Doctor App?"

**Answer by:** TrangN  
**Response:**
> "New Vision: Dual-App Ecosystem serving two personas:
> 1. Doctor App: Accessing 'Last Meter' clinical data at bedside
> 2. Patient App: Engaging with own health journey to reduce administrative overhead"

**Impact on PRD:** 
- Completely rewrote Executive Summary to include Dual-App Ecosystem
- Added Patient App problem statement (Administrative Overhead)
- Updated target users: "Doctors/Physicians and Patients"
- Updated scope: "Dual-App Ecosystem (Doctor App + Patient App)"

---

### Q15: Phased Roadmap Structure
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "How should the 3-month roadmap be structured?"

**Answer by:** TrangN  
**Response:**
> "Replace Day 1-5 schedule with 3-Month Phased Roadmap:
> - Phase 1 (Month 1): Clinical Foundation - Doctor App (Auth, My Patients, Clinical Summary read-only)
> - Phase 2 (Month 2): Patient Engagement - Patient App (PHR view, Appointments, Lab Results)
> - Phase 3 (Month 3): Interactive Revamp - Advanced Workflows (Mobile Vitals Entry, AI Clinical Notes, Real-time Lab Alerts)"

**Impact on PRD:** 
- Removed entire "1-Week Implementation Timeline" section
- Created new "3-Month Strategic Roadmap" section with three phases
- Added detailed deliverables for each phase
- Added success metrics for each phase

---

### Q16: Feature Matrix Request
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Should we add a comparison of features across the two apps?"

**Answer by:** TrangN  
**Response:**
> "Add High-Level Feature Matrix comparing Doctor App vs Patient App features."

**Impact on PRD:** 
- Created new "High-Level Feature Matrix" section
- Table comparing 14 feature categories across both apps
- Phase mapping for each feature
- Clear differentiation between read-only and interactive capabilities

---

### Q17: Milestone Tracking
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "How should we track progress across the 3-month timeline?"

**Answer by:** TrangN  
**Response:**
> "Add Phase-Based Milestone Table with success metrics for each phase."

**Impact on PRD:** 
- Created "Phase-Based Milestone Table" with 12-week breakdown
- Weekly milestones with specific success criteria
- Clear progression: Doctor App → Patient App → Advanced Features

---

### Q18: First Implementation Focus
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "What should be the immediate focus for the first implementation?"

**Answer by:** TrangN  
**Response:**
> "For the first implement we will focus on 3 main features for doctor mobile app: Login, My Patients Dashboard, Clinical Summary."

**Impact on PRD:** 
- Added "Phase 1 Focus (First Implementation)" section in Constraints
- Emphasized 3 main features as foundation
- Clarified that Patient App is deferred to Phase 2

---

## Session 5: PRD Approval

### Q19: PRD Approval
**Asked by:** Kiro  
**Date:** 2026-04-21  
**Question:** "Is the transformed PRD approved and ready for next phase?"

**Answer by:** TrangN  
**Response:**
> "Okay approve for PRD"

**Impact on PRD:** 
- PRD marked as complete and approved
- Ready to proceed to Architecture Design or UX Design phase
- Document status: "Complete - 3-Month Strategic Roadmap"

---

## Key Decisions Summary

| Decision ID | Topic | Decision | Rationale |
|-------------|-------|----------|-----------|
| DEC-001 | Platform | Native Android (Flutter/React Native) | Better performance and UX for doctors |
| DEC-002 | Timeline | 3-month phased roadmap | Strategic ecosystem vs. quick PoC |
| DEC-003 | Scope | Dual-App Ecosystem (Doctor + Patient) | Solve both clinical and administrative problems |
| DEC-004 | Phase 1 Focus | Doctor App only (3 features) | Solid foundation before expansion |
| DEC-005 | Clinical Priority | Demographics → Meds → Allergies → Vitals | Safety-critical information first |
| DEC-006 | Patient Assignment | Active Visits filtered by Provider UUID | Leverages existing OpenMRS relationships |
| DEC-007 | Connectivity | Always connected (no offline) | Simplifies Phase 1, deferred to future |
| DEC-008 | Authentication | Existing OpenMRS credentials | No new registration system needed |
| DEC-009 | Test Data | William Robinson (empty) + Snow White (full) | Covers both edge cases |
| DEC-010 | Messaging | Focus on clinical value, not tap counts | Emphasize therapeutic relationship preservation |

---

## Open Questions (For Next Phase)

| Question ID | Topic | Question | Priority | Target Phase |
|-------------|-------|----------|----------|--------------|
| OQ-001 | Technology Stack | Flutter vs React Native final decision? | High | Architecture |
| OQ-002 | Patient Authentication | How do patients obtain login credentials? | Medium | Phase 2 Planning |
| OQ-003 | Lab Alerts | What defines a "critical" lab result? | Medium | Phase 3 Planning |
| OQ-004 | AI Clinical Notes | What AI model/service for voice-to-text? | Low | Phase 3 Planning |
| OQ-005 | Secure Messaging | Integration with existing hospital messaging? | Low | Phase 3 Planning |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-21 | Kiro | Initial Q&A log created from PRD development session |

---

**Document Status:** Complete  
**Last Updated:** 2026-04-21  
**Related Documents:** 
- `prd.md` - Product Requirements Document
- `phase-summary-report-template.md` - Phase reporting template
