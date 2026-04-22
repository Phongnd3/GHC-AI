# Epic List

## Epic 1: Project Foundation & Core Infrastructure
Development team has a working project foundation with all tooling, testing infrastructure, design system, API client, and error handling configured, enabling rapid parallel feature development.

**FRs covered:** None directly (enables all future epics)
**NFRs covered:** NFR4, NFR5, NFR13, NFR14, NFR15, NFR16, NFR17, NFR18
**ARCH-REQs covered:** ARCH-REQ-1 through ARCH-REQ-30 (all infrastructure)
**UX-DRs covered:** UX-DR1, UX-DR4, UX-DR5, UX-DR10, UX-DR11, UX-DR12, UX-DR21, UX-DR22, UX-DR23, UX-DR24

## Epic 2: Authentication & Session Management
Doctors can securely log in using their existing OpenMRS credentials and have their sessions managed automatically with security best practices (auto-logout, screenshot prevention).

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR22
**NFRs covered:** NFR1, NFR6, NFR7, NFR8, NFR9, NFR10, NFR11
**UX-DRs covered:** UX-DR6, UX-DR18, UX-DR19
**Depends on:** Epic 1 only
**Can work in parallel with:** Epic 3, Epic 4

## Epic 3: My Patients Dashboard
Doctors can view a real-time list of their assigned patients with key demographics, enabling quick patient identification and selection.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR21
**NFRs covered:** NFR2, NFR12
**UX-DRs covered:** UX-DR2, UX-DR7, UX-DR13, UX-DR14, UX-DR20
**Depends on:** Epic 1 only (uses mock auth initially)
**Can work in parallel with:** Epic 2, Epic 4

## Epic 4: Clinical Summary & Patient Data
Doctors can access comprehensive clinical information (demographics, medications, allergies, vitals) for any assigned patient, providing essential context at the point of care.

**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20
**NFRs covered:** NFR3, NFR12
**UX-DRs covered:** UX-DR3, UX-DR8, UX-DR9, UX-DR13, UX-DR14, UX-DR15, UX-DR16, UX-DR17, UX-DR20
**Depends on:** Epic 1 only (uses mock auth and mock patient ID initially)
**Can work in parallel with:** Epic 2, Epic 3

## Epic 5: Integration & Navigation Flow
Complete end-to-end user journey with all features connected: Login → Dashboard → Clinical Summary → Logout, with proper navigation and state management.

**FRs covered:** All FRs integrated (FR1-FR22)
**NFRs covered:** All NFRs validated
**Depends on:** Epic 2, Epic 3, Epic 4 all complete
**Delivers:** Production-ready Phase 1 application
