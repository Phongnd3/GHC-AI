# Requirements Inventory

## Functional Requirements

**FR1:** Doctor can log in using existing OpenMRS credentials (username and password)

**FR2:** Login screen triggers authentication via OpenMRS REST API (`POST /openmrs/ws/rest/v1/session`)

**FR3:** Successful authentication stores session token securely in Android Keystore

**FR4:** Failed authentication displays clear error message to user

**FR5:** Session management handles token expiration and auto-logout after 30 minutes of inactivity

**FR6:** Dashboard displays immediately after successful login

**FR7:** Dashboard shows only patients with active visits where logged-in doctor is the primary provider

**FR8:** Each patient card displays: Name, Patient ID, Age, Gender

**FR9:** Patient list is scrollable if more than 10 patients

**FR10:** Pull-to-refresh updates the patient list

**FR11:** Empty state message displayed if no patients assigned: "No active patients assigned to you"

**FR12:** Tapping a patient card navigates to Clinical Summary screen

**FR13:** Clinical Summary displays patient demographics (Name, ID, Age, Gender)

**FR14:** Clinical Summary displays active medications with drug name, dosage, frequency

**FR15:** Clinical Summary displays known allergies with severity indicators

**FR16:** Clinical Summary displays 3 most recent vitals (Heart Rate, Blood Pressure, SpO2) with timestamps

**FR17:** Clinical Summary handles empty states gracefully (e.g., "No active medications recorded")

**FR18:** Clinical Summary displays "No known allergies" as positive indicator (green checkmark)

**FR19:** Data refreshes on Clinical Summary screen load

**FR20:** Back button returns from Clinical Summary to My Patients dashboard

**FR21:** Android back button from dashboard shows logout confirmation dialog

**FR22:** Logout clears session token and returns to login screen

## Non-Functional Requirements

**NFR1:** Login completes within 3 seconds on hospital WiFi

**NFR2:** Patient list loads within 2 seconds

**NFR3:** Clinical Summary displays within 2 seconds of patient selection

**NFR4:** App launch (cold start) completes within 1 second

**NFR5:** Network timeout set to 10 seconds with retry option

**NFR6:** Session tokens stored in Android Keystore (secure storage)

**NFR7:** HTTPS for all API calls in production environment

**NFR8:** No sensitive data cached on device

**NFR9:** Automatic logout after 30 minutes of inactivity

**NFR10:** No screenshots allowed on clinical data screens (Android FLAG_SECURE equivalent)

**NFR11:** App handles network errors gracefully with clear error messages

**NFR12:** Zero crashes during clinical use

**NFR13:** Minimum Android Version: Android 8.0 (API Level 26)

**NFR14:** Target devices: Android smartphones (5-7 inch screens)

**NFR15:** WCAG 2.1 AA compliance for accessibility

**NFR16:** Touch targets minimum 48dp (Material Design standard)

**NFR17:** Support Android system font size settings

**NFR18:** Color contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)

## Additional Requirements (from Architecture)

**ARCH-REQ-1:** Use Expo Default Template (SDK 55) as starter template with TypeScript and Expo Router pre-configured

**ARCH-REQ-2:** Implement React Native with Expo SDK 55 + TypeScript + React Native Paper v5 (Material Design 3)

**ARCH-REQ-3:** Use SWR for state management and data fetching with 5-minute cache for patient list and no cache for clinical data

**ARCH-REQ-4:** Use Axios as HTTP client with interceptors for auth tokens and error handling

**ARCH-REQ-5:** Implement Expo SecureStore for session token storage (Android Keystore integration)

**ARCH-REQ-6:** Configure 30-minute inactivity timer for auto-logout using React Context

**ARCH-REQ-7:** Implement screenshot prevention using expo-screen-capture on clinical screens

**ARCH-REQ-8:** Set up Jest + React Native Testing Library for testing infrastructure

**ARCH-REQ-9:** Achieve 90%+ coverage for API services, 80%+ for UI components, 100% for critical paths

**ARCH-REQ-10:** Implement centralized error handler (`errorHandler.ts`) for user-friendly error messages

**ARCH-REQ-11:** Configure environment variables using Expo Constants + .env files for API base URL and timeouts

**ARCH-REQ-12:** Implement Material Design 3 theming with OpenMRS O3 brand colors (Teal palette: #005d5d primary, #007d79 accent)

**ARCH-REQ-13:** Use 8dp grid spacing system aligned with Carbon Design System

**ARCH-REQ-14:** Implement IBM Plex Sans typography scale adapted to Material Design 3

**ARCH-REQ-15:** Organize project structure with Expo Router file-based routing in `src/app/` directory

**ARCH-REQ-16:** Create API service layer in `src/services/api/` with client, auth, and patients modules

**ARCH-REQ-17:** Define TypeScript types in `src/types/` derived from domain model (Patient, Visit, Clinical entities)

**ARCH-REQ-18:** Implement custom hooks in `src/hooks/` (useAuth, usePatients, useClinicalSummary)

**ARCH-REQ-19:** Set up ESLint + Prettier + Husky for code quality and pre-commit hooks

**ARCH-REQ-20:** Configure lint-staged to run ESLint, Prettier, and related tests on staged files

**ARCH-REQ-21:** Transform API responses from snake_case to camelCase at service boundary

**ARCH-REQ-22:** Implement loading skeleton screens for all data loading states (no blank screens)

**ARCH-REQ-23:** Use React Native Paper Snackbar for error display (no alert() calls)

**ARCH-REQ-24:** Implement Axios interceptors for automatic session token injection and 401 error handling

**ARCH-REQ-25:** Configure SWR with automatic revalidation on focus and reconnect

**ARCH-REQ-26:** Use Expo Router navigation with `router.push()` for stack navigation and `router.replace()` for auth redirects

**ARCH-REQ-27:** Implement AuthContext for app-wide session management and inactivity tracking

**ARCH-REQ-28:** Create theme tokens in `src/theme/` (colors.ts, typography.ts, spacing.ts, theme.ts)

**ARCH-REQ-29:** Enforce zero hardcoded colors, spacing, or typography values in components (theme tokens only)

**ARCH-REQ-30:** Colocate tests in `__tests__/` folders next to source files

## UX Design Requirements

**UX-DR1:** Implement Material Design 3 component library (React Native Paper v5) for all UI components

**UX-DR2:** Create custom PatientCard component for My Patients list (88dp height, elevated card with ripple effect)

**UX-DR3:** Create custom ClinicalSummaryCard component for clinical data sections (outlined card with section headers)

**UX-DR4:** Implement EmptyState component for missing data scenarios (icon + message)

**UX-DR5:** Implement LoadingSkeleton component for all loading states (grey placeholder cards)

**UX-DR6:** Design Login screen with OpenMRS logo, app title, username/password fields, and filled button

**UX-DR7:** Design My Patients Dashboard with top app bar, timestamp, refresh icon, and scrollable patient cards

**UX-DR8:** Design Clinical Summary screen with patient header, demographics card, medications card (light blue), allergies card (light red with warning), and vitals card

**UX-DR9:** Implement clinical safety colors: Allergy alerts (#da1e28 red), Medication info (#0f62fe blue), Vitals normal (#24a148 green), Vitals abnormal (#f1c21b orange)

**UX-DR10:** Implement OpenMRS O3 brand colors: Primary (#005d5d teal), Secondary (#007d79 lighter teal), Accent (#004144 darker teal)

**UX-DR11:** Implement 8dp spacing scale (xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, xxxl: 32, huge: 48, massive: 64)

**UX-DR12:** Implement Material Design 3 typography scale with IBM Plex Sans font family

**UX-DR13:** Implement pull-to-refresh interaction on My Patients Dashboard and Clinical Summary

**UX-DR14:** Implement ripple effect on all tappable cards and buttons

**UX-DR15:** Display "No known allergies" with green checkmark as positive indicator (not empty state)

**UX-DR16:** Display empty medications as "No active medications recorded" with neutral icon

**UX-DR17:** Display empty vitals as "No recent vitals recorded" with timestamp of last check if available

**UX-DR18:** Implement logout confirmation dialog when back button pressed from dashboard

**UX-DR19:** Implement error state UI with "Tap to retry" button for network failures

**UX-DR20:** Implement timestamp display "Last updated: X min ago" on dashboard and clinical summary

**UX-DR21:** Ensure all touch targets are minimum 48dp x 48dp for accessibility

**UX-DR22:** Implement semantic labels for screen readers on all interactive elements

**UX-DR23:** Support Android system font size settings for text scaling

**UX-DR24:** Implement visible focus indicators for keyboard navigation

## FR Coverage Map

**FR1:** Epic 2 - Doctor can log in using existing OpenMRS credentials
**FR2:** Epic 2 - Login screen triggers authentication via OpenMRS REST API
**FR3:** Epic 2 - Successful authentication stores session token securely
**FR4:** Epic 2 - Failed authentication displays clear error message
**FR5:** Epic 2 - Session management handles token expiration and auto-logout
**FR6:** Epic 3 - Dashboard displays immediately after successful login
**FR7:** Epic 3 - Dashboard shows only patients with active visits where doctor is primary provider
**FR8:** Epic 3 - Each patient card displays: Name, Patient ID, Age, Gender
**FR9:** Epic 3 - Patient list is scrollable if more than 10 patients
**FR10:** Epic 3 - Pull-to-refresh updates the patient list
**FR11:** Epic 3 - Empty state message displayed if no patients assigned
**FR12:** Epic 3 - Tapping a patient card navigates to Clinical Summary screen
**FR13:** Epic 4 - Clinical Summary displays patient demographics
**FR14:** Epic 4 - Clinical Summary displays active medications with details
**FR15:** Epic 4 - Clinical Summary displays known allergies with severity
**FR16:** Epic 4 - Clinical Summary displays 3 most recent vitals with timestamps
**FR17:** Epic 4 - Clinical Summary handles empty states gracefully
**FR18:** Epic 4 - Clinical Summary displays "No known allergies" as positive indicator
**FR19:** Epic 4 - Data refreshes on Clinical Summary screen load
**FR20:** Epic 4 - Back button returns from Clinical Summary to dashboard
**FR21:** Epic 3 - Android back button from dashboard shows logout confirmation
**FR22:** Epic 2 - Logout clears session token and returns to login screen

**NFR Coverage:**
- Epic 1: NFR4, NFR5, NFR13, NFR14, NFR15, NFR16, NFR17, NFR18 (Platform, accessibility, infrastructure)
- Epic 2: NFR1, NFR6, NFR7, NFR8, NFR9, NFR10, NFR11 (Security, performance)
- Epic 3: NFR2, NFR12 (Performance, reliability)
- Epic 4: NFR3, NFR12 (Performance, reliability)

**ARCH-REQ Coverage:**
- Epic 1: ARCH-REQ-1 through ARCH-REQ-30 (All infrastructure, tooling, patterns)
- Epic 2: Uses infrastructure from Epic 1 (Auth-specific implementation)
- Epic 3: Uses infrastructure from Epic 1 (Dashboard-specific implementation)
- Epic 4: Uses infrastructure from Epic 1 (Clinical-specific implementation)
- Epic 5: Integration and navigation wiring

**UX-DR Coverage:**
- Epic 1: UX-DR1, UX-DR4, UX-DR5, UX-DR10, UX-DR11, UX-DR12, UX-DR21, UX-DR22, UX-DR23, UX-DR24 (Design system foundation)
- Epic 2: UX-DR6, UX-DR18, UX-DR19 (Login screen, logout confirmation, error states)
- Epic 3: UX-DR2, UX-DR7, UX-DR13, UX-DR14, UX-DR20 (Dashboard screen, patient cards, interactions)
- Epic 4: UX-DR3, UX-DR8, UX-DR9, UX-DR13, UX-DR14, UX-DR15, UX-DR16, UX-DR17, UX-DR20 (Clinical screen, safety colors, empty states)
