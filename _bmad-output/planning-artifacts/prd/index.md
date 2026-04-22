# Product Requirements Document - GHC-AI Doctor Mobile App

## Table of Contents

- [Product Requirements Document - GHC-AI Doctor Mobile App](#table-of-contents)
  - [stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-features", "step-05-technical", "step-06-constraints", "step-07-timeline", "step-12-complete"]
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
workflowType: 'prd'](#stepscompleted-step-01-init-step-02-discovery-step-02b-vision-step-02c-executive-summary-step-03-success-step-04-features-step-05-technical-step-06-constraints-step-07-timeline-step-12-complete-inputdocuments-docsreverse-engineeringindexmd-docsreverse-engineeringreadmemd-docsreverse-engineering01-domain-logicintegrated-workflow-mapmd-documentcounts-briefcount-0-researchcount-0-brainstormingcount-0-projectdocscount-3-classification-projecttype-native-android-mobile-app-flutterreact-native-domain-healthcare-clinical-management-complexity-medium-projectcontext-brownfield-targetusers-doctorsphysicians-and-patients-platform-android-smartphones-timeline-3-month-roadmap-scope-dual-app-ecosystem-doctor-app-patient-app-connectivity-always-connected-hospital-wi-fi-authentication-openmrs-rest-api-existing-credentials-mypatientslogic-active-visits-filtered-by-provider-uuid-clinicalsummarypriority-demographics-active-medications-allergies-recent-vitals-last-3-referencedata-emptystate-william-robinson-id-10001hu-fullstate-snow-white-workflowtype-prd)
  - [Executive Summary](./executive-summary.md)
    - [The Vision: Dual-App Ecosystem](./executive-summary.md#the-vision-dual-app-ecosystem)
    - [What Makes This Special](./executive-summary.md#what-makes-this-special)
  - [Project Classification](./project-classification.md)
  - [Success Criteria](./success-criteria.md)
    - [Phase 1 Success (Month 1): Clinical Foundation - Doctor App](./success-criteria.md#phase-1-success-month-1-clinical-foundation-doctor-app)
    - [Phase 2 Success (Month 2): Patient Engagement - Patient App](./success-criteria.md#phase-2-success-month-2-patient-engagement-patient-app)
    - [Phase 3 Success (Month 3): Interactive Revamp - Advanced Workflows](./success-criteria.md#phase-3-success-month-3-interactive-revamp-advanced-workflows)
    - [Acceptance Criteria](./success-criteria.md#acceptance-criteria)
  - [High-Level Feature Matrix](./high-level-feature-matrix.md)
  - [3-Month Strategic Roadmap](./3-month-strategic-roadmap.md)
    - [Phase 1: Clinical Foundation - Doctor App (Month 1)](./3-month-strategic-roadmap.md#phase-1-clinical-foundation-doctor-app-month-1)
    - [Phase 2: Patient Engagement - Patient App (Month 2)](./3-month-strategic-roadmap.md#phase-2-patient-engagement-patient-app-month-2)
    - [Phase 3: Interactive Revamp - Advanced Workflows (Month 3)](./3-month-strategic-roadmap.md#phase-3-interactive-revamp-advanced-workflows-month-3)
  - [Phase-Based Milestone Table](./phase-based-milestone-table.md)
  - [Core Features & User Stories](./core-features-user-stories.md)
    - [Feature 1: Authentication (Doctor App - Phase 1)](./core-features-user-stories.md#feature-1-authentication-doctor-app-phase-1)
    - [Feature 2: My Patients Dashboard (Doctor App - Phase 1)](./core-features-user-stories.md#feature-2-my-patients-dashboard-doctor-app-phase-1)
    - [Feature 3: Clinical Summary (Doctor App - Phase 1)](./core-features-user-stories.md#feature-3-clinical-summary-doctor-app-phase-1)
  - [Business Rules & Edge Cases](./business-rules-edge-cases.md)
    - [Patient Assignment Logic](./business-rules-edge-cases.md#patient-assignment-logic)
    - [Empty State Handling](./business-rules-edge-cases.md#empty-state-handling)
    - [Data Refresh & Caching](./business-rules-edge-cases.md#data-refresh-caching)
    - [Clinical Data Priority](./business-rules-edge-cases.md#clinical-data-priority)
  - [Technical Requirements](./technical-requirements.md)
    - [Platform & Technology Stack](./technical-requirements.md#platform-technology-stack)
    - [Backend Integration](./technical-requirements.md#backend-integration)
    - [Required API Endpoints](./technical-requirements.md#required-api-endpoints)
    - [Performance Targets](./technical-requirements.md#performance-targets)
    - [Security Requirements](./technical-requirements.md#security-requirements)
  - [Constraints & Assumptions](./constraints-assumptions.md)
    - [Constraints](./constraints-assumptions.md#constraints)
    - [Assumptions](./constraints-assumptions.md#assumptions)
    - [Phase 1 Focus (First Implementation)](./constraints-assumptions.md#phase-1-focus-first-implementation)
    - [Out of Scope for Phase 1](./constraints-assumptions.md#out-of-scope-for-phase-1)
    - [Future Considerations (Post-Phase 3)](./constraints-assumptions.md#future-considerations-post-phase-3)
  - [Appendix](./appendix.md)
    - [Reference Data](./appendix.md#reference-data)
    - [API Documentation](./appendix.md#api-documentation)
    - [Glossary](./appendix.md#glossary)
