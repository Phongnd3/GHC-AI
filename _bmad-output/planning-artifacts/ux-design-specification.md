---
stepsCompleted: [1, 2, 3, 4, 6, "wireframes"]
lastStep: "wireframes"
inputDocuments: [
  "_bmad-output/planning-artifacts/prd.md",
  "_bmad-output/planning-artifacts/prd-qa-log.md"
]
projectName: "GHC-AI Doctor Mobile App"
phase: "Phase 1 - Clinical Foundation"
targetUsers: "Doctors/Physicians"
platform: "Native Android (Flutter/React Native)"
---

# UX Design Specification - GHC-AI Doctor Mobile App

**Author:** TrangN  
**Date:** 2026-04-21  
**Phase:** Phase 1 - Clinical Foundation (Month 1)

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

The GHC-AI Doctor Mobile App solves the "Last Meter" problem in clinical data access by delivering critical patient information directly to doctors at the point of care—bedside during ward rounds or in consultation rooms. Currently, doctors are "desk-locked": they review patient data at desktop stations, walk to the patient, realize they've forgotten a specific vital trend or allergy, then either walk back to the computer or resort to writing notes on hands and pockets. This information gap breaks the doctor-patient relationship, creates double-entry workflows, and increases the risk of medical errors.

This native Android mobile app (Flutter/React Native) transforms that experience by putting clinical decision-making data in the doctor's pocket. Immediately upon login, doctors are presented with a direct path to their assigned patients' critical data. The interface is architected to eliminate navigational layers, ensuring that life-saving information—such as Allergies and Active Medications—is accessible instantly at the point of care. The app maintains the doctor-patient conversation flow—no turning away to a computer, no breaking the consultation moment.

**Phase 1 Focus:** Three core features - Login, My Patients Dashboard, and Clinical Summary (read-only)  
**Timeline:** Month 1 of 3-month strategic roadmap  
**Platform:** Native Android smartphones (5-7 inch screens)

### Target Users

**Primary User:** Doctors and physicians performing ward rounds or patient consultations in hospital settings using OpenMRS

**User Characteristics:**
- Using Android smartphones (personal or hospital-provided devices)
- Performing ward rounds or consultations at bedside/consultation rooms
- Need instant access to clinical data without breaking patient interaction
- Working in always-connected hospital WiFi environment
- Familiar with OpenMRS web interface but need mobile-optimized experience
- Using app in real-world context: standing, potentially one-handed, quick glances

**User Goals:**
- Access assigned patients' clinical data instantly at point of care
- Verify medications and allergies without leaving patient's side
- Check recent vitals trends during consultation
- Maintain eye contact and therapeutic relationship with patient
- Avoid walking back to desktop station for forgotten information
- Reduce paper-scraping (writing notes on hands/pockets)

**User Context:**
- **When:** During ward rounds, patient consultations, bedside examinations
- **Where:** At patient bedside, in consultation rooms, moving between patients
- **How:** Standing, one-handed operation, quick glances (5-10 seconds typical)
- **Why:** To maintain clinical workflow without breaking patient interaction

### Key Design Challenges

**1. Speed vs. Information Density**
- **Challenge:** Display critical clinical data (Demographics, Meds, Allergies, Vitals) without overwhelming the doctor
- **UX Requirement:** Information must be scannable in seconds, prioritized by safety-criticality
- **Success Metric:** Doctors can verify key information in < 10 seconds

**2. One-Handed, Point-of-Care Interaction**
- **Challenge:** Doctors are standing at bedside, potentially holding a chart or examining a patient
- **UX Requirement:** Thumb-friendly navigation, large touch targets (minimum 48dp), minimal scrolling
- **Success Metric:** All critical actions within thumb reach on 5-7 inch screens

**3. Empty State Handling**
- **Challenge:** Some patients may have missing data (no recent vitals, no active medications)
- **UX Requirement:** Distinguish between "no data" vs "no problems" (e.g., "no allergies" is clinically significant!)
- **Success Metric:** Doctors never confused about whether data is missing or intentionally empty

**4. Zero Learning Curve**
- **Challenge:** Doctors need to use this effectively the first time, potentially in a time-sensitive situation
- **UX Requirement:** Intuitive navigation, familiar patterns, no onboarding required
- **Success Metric:** First-time users succeed without training

### Design Opportunities

**1. "Instant Confidence" Moment**
- **Opportunity:** The moment a doctor opens the app and immediately sees their patients - no navigation, no searching
- **UX Approach:** Login → Dashboard with zero intermediate screens
- **Competitive Advantage:** Faster than walking back to a computer

**2. Safety-First Visual Hierarchy**
- **Opportunity:** Use color, typography, and spacing to make Allergies and Active Medications impossible to miss
- **UX Approach:** Bold visual treatment for safety-critical information, subtle treatment for contextual data
- **Competitive Advantage:** Reduces cognitive load and medical error risk

**3. Material Design 3 Familiarity**
- **Opportunity:** Leverage Android users' existing mental models and interaction patterns
- **UX Approach:** Material Design 3 components, familiar navigation patterns, system integration
- **Competitive Advantage:** Feels native and familiar, reducing cognitive load

**4. Graceful Performance**
- **Opportunity:** Show progress without making it feel slow (< 2 second data loads)
- **UX Approach:** Skeleton screens, optimistic UI updates, smooth transitions
- **Competitive Advantage:** Feels instant even when loading data

---

## Core User Experience

### Defining Experience

**The Core Action: Instant Access to Patient Clinical Data**

The entire product experience centers on eliminating the "Last Meter" problem through instant access to critical patient information. The core loop is simple and direct:

1. Doctor arrives at patient bedside or consultation room
2. Opens app → Sees "My Patients" list immediately (zero intermediate screens)
3. Taps patient → Clinical Summary appears instantly
4. Scans critical data (Demographics → Meds → Allergies → Vitals) in < 10 seconds
5. Continues patient interaction with confidence, maintaining eye contact

This loop replaces the old pattern of: Review data at desktop → Walk to patient → Forget specific detail → Walk back to computer → Return to patient (therapeutic relationship broken).

**The Experience Goal:** Make accessing clinical data faster and easier than walking back to a computer, while maintaining the doctor-patient conversation flow.

### Platform Strategy

**Native Android Mobile-First Design**

- **Primary Platform:** Native Android app (Flutter or React Native)
- **Interaction Model:** Touch-based, thumb-friendly, one-handed operation
- **Context of Use:** Standing at bedside/consultation room, potentially holding chart, quick glances
- **Connectivity:** Always connected via hospital WiFi (no offline mode in Phase 1)
- **Design System:** Material Design 3 for native Android familiarity
- **Screen Sizes:** Optimize for 5-7 inch phones (most common in target market)
- **Authentication:** Username/password via existing OpenMRS REST API (no biometric in Phase 1)

**Platform Capabilities to Leverage:**
- Material Design 3 components for familiar interaction patterns
- Android native back button for navigation
- Pull-to-refresh for manual data updates
- Automatic data refresh on screen load

### Effortless Interactions

**What Should Feel Completely Natural:**

1. **Login: Direct and Familiar**
   - Username and password fields (reusing existing OpenMRS API)
   - "Login" button triggers authentication
   - Session persists until logout or timeout
   - No "Remember me" checkbox - just standard login flow

2. **Patient List: Automatic and Immediate**
   - App opens directly to "My Patients" dashboard after login
   - No home screen, no navigation menu, no intermediate steps
   - Shows only assigned patients (active visits where doctor is primary provider)
   - Automatic refresh on load, pull-to-refresh as backup

3. **Clinical Summary: One Tap Away**
   - Tap patient card → Clinical Summary appears
   - No confirmation dialog, no loading screen (< 2 seconds)
   - Data displayed in priority order: Demographics → Meds → Allergies → Vitals
   - Back button returns to patient list

4. **Navigation: Android Native**
   - Use Android's native back button for all navigation
   - No custom navigation patterns
   - Familiar gestures and interactions

5. **Data Refresh: Automatic with Manual Backup**
   - Data refreshes automatically when screens load
   - Pull-to-refresh available as manual option
   - No "Refresh" button needed

**What Should Happen Automatically:**
- Detect assigned patients without user input
- Load clinical data on patient selection
- Update UI state without manual refresh
- Handle session management and token refresh

### Critical Success Moments

**Make-or-Break Interactions:**

1. **The "Instant Confidence" Moment**
   - **When:** Doctor logs in and immediately sees their patient list
   - **What:** Zero intermediate screens, zero navigation - just their patients
   - **Why Critical:** This is where the app proves it's faster than the desktop
   - **Failure Mode:** If there's any delay or extra navigation, doctors will stick with the desktop

2. **The "Safety Check" Moment**
   - **When:** Doctor taps a patient and sees Allergies + Active Medications prominently displayed
   - **What:** Safety-critical information is impossible to miss (bold, color-coded, top of screen)
   - **Why Critical:** This is life-saving information - must be instantly scannable
   - **Failure Mode:** If allergies are buried or hard to spot, medical errors could occur

3. **The "Empty State Clarity" Moment**
   - **When:** Doctor views a patient with missing data (no recent vitals, no active meds)
   - **What:** Clear distinction between "No data available" vs "No allergies" (which is good news!)
   - **Why Critical:** Doctors need to know if data is missing or intentionally empty
   - **Failure Mode:** If unclear, doctors will assume the app is broken or incomplete

4. **The "First-Time Success" Moment**
   - **When:** A doctor uses the app for the first time during ward rounds
   - **What:** They successfully find their patient and view clinical summary without help
   - **Why Critical:** Zero learning curve requirement - must be intuitive immediately
   - **Failure Mode:** If they need training or help, adoption fails

5. **The "Maintained Eye Contact" Moment**
   - **When:** Doctor is talking to patient and needs to verify a medication
   - **What:** Quick glance at phone (5-10 seconds), find info, continue conversation
   - **Why Critical:** This is the "Last Meter" problem solved - no breaking the therapeutic relationship
   - **Failure Mode:** If it takes too long or requires too much attention, doctors will walk back to computer

### Experience Principles

**Guiding Principles for All UX Decisions:**

1. **"Login to Patients in One Flow"**
   - Every interaction should move directly toward viewing patient data
   - Eliminate all intermediate screens and unnecessary navigation
   - Default to action, not options
   - **Example:** Login → My Patients Dashboard (no home screen, no menu selection)

2. **"Safety-Critical Information First"**
   - Life-saving data (Allergies, Active Medications) must be impossible to miss
   - Use bold visual hierarchy, color coding, and prominent placement
   - Safety information appears before diagnostic information
   - **Example:** Clinical Summary shows Demographics → Meds → Allergies → Vitals (in that order)

3. **"Thumb-Friendly, Glanceable, Point-of-Care"**
   - Design for standing at bedside, one-handed use, quick glances (5-10 seconds)
   - Large touch targets (minimum 48dp), minimal scrolling
   - Information hierarchy optimized for scanning, not reading
   - **Example:** Patient cards show only essential info (Name, ID, Age, Gender) - nothing more

4. **"Clarity Over Cleverness"**
   - Leverage Material Design 3 patterns doctors already know
   - Don't reinvent interaction patterns - use Android conventions
   - Make empty states crystal clear (distinguish "no data" from "no problems")
   - **Example:** "No known allergies" with green checkmark vs "No recent vitals" with neutral icon

5. **"Instant Feedback, Graceful Performance"**
   - Show progress without making it feel slow (< 2 second loads)
   - Use skeleton screens and smooth transitions
   - Never leave user wondering "did that work?"
   - **Example:** Patient list shows skeleton cards while loading, then smoothly populates

---

## Desired Emotional Response

### Primary Emotional Goals

**Confidence: The Foundation of Clinical Trust**

The primary emotional goal for the GHC-AI Doctor Mobile App is to make doctors feel **confident** - certain that the data they're viewing is accurate, current, and reliable. In a clinical context, confidence isn't just a nice-to-have emotion; it's essential for patient safety and effective care delivery.

**What Confidence Feels Like:**
- "I trust this data is correct and up-to-date"
- "I can make clinical decisions based on what I'm seeing"
- "This app won't fail me in a critical moment"
- "I can verify patient information without second-guessing"

**Secondary Emotional Goals:**
- **Efficiency** - "This saves me time compared to the desktop"
- **Control** - "I can maintain my patient interaction without interruption"
- **Trust** - "This app is as reliable as the desktop system"
- **Professional Presence** - "I can stay focused on my patient, not my device"

### Emotional Journey Mapping

**1. First Discovery (Curiosity → Skepticism)**
- **Moment:** Doctor hears about the app from colleagues
- **Feeling:** Curious but skeptical - "Will this actually work in real clinical situations?"
- **Design Goal:** Overcome skepticism through clear value proposition and peer testimonials

**2. First Use (Skepticism → Relief)**
- **Moment:** Logs in during ward rounds for the first time
- **Feeling:** Relieved - "Finally, I don't have to walk back to the computer!"
- **Design Goal:** Deliver immediate value - patient list appears instantly

**3. Core Experience (Relief → Confidence)**
- **Moment:** Taps patient, sees clinical summary with current data
- **Feeling:** Confident and empowered - "I have everything I need right here"
- **Design Goal:** Build confidence through clear data presentation and timestamps

**4. After Task Completion (Confidence → Professional Satisfaction)**
- **Moment:** Continues patient conversation without breaking eye contact
- **Feeling:** Professional and present - "I maintained the therapeutic relationship"
- **Design Goal:** Reinforce value through seamless workflow integration

**5. Returning Use (Satisfaction → Dependency)**
- **Moment:** Uses app daily during ward rounds
- **Feeling:** Dependent in a positive way - "I can't imagine doing ward rounds without this now"
- **Design Goal:** Build habit through consistent reliability and performance

### Micro-Emotions

**Critical Micro-Emotional States:**

1. **Confidence vs. Confusion**
   - **Target:** Doctors must feel confident the data is correct
   - **How:** Timestamps, clear patient identification, data source indicators
   - **Why Critical:** Clinical decisions depend on data accuracy

2. **Trust vs. Skepticism**
   - **Target:** Doctors must trust the app won't fail them in critical moments
   - **How:** Consistent performance, graceful error handling, zero crashes
   - **Why Critical:** Reliability builds long-term adoption

3. **Efficiency vs. Frustration**
   - **Target:** Doctors must feel the app saves time
   - **How:** < 2 second loads, minimal taps, instant access
   - **Why Critical:** Time pressure in clinical settings

4. **Calm vs. Anxiety**
   - **Target:** The app should reduce stress, not add to it
   - **How:** Predictable behavior, clear feedback, no surprises
   - **Why Critical:** Doctors are already under high cognitive load

### Design Implications

**Emotion-Driven UX Decisions:**

1. **Confidence Through Timestamps**
   - **Emotion:** "This data is current"
   - **UX Approach:** Show "Last updated: 2 minutes ago" on clinical summary
   - **Design Choice:** Timestamp at top of screen, always visible, auto-updates

2. **Confidence Through Visual Clarity**
   - **Emotion:** "I can quickly verify this is the right patient"
   - **UX Approach:** Large patient name and ID at top of clinical summary
   - **Design Choice:** Bold typography (24sp+), high contrast, prominent placement

3. **Confidence Through Data Source Indicators**
   - **Emotion:** "This came from the official OpenMRS system"
   - **UX Approach:** Subtle "Synced with OpenMRS" indicator
   - **Design Choice:** Small icon or text showing data source and sync status

4. **Confidence Through Empty State Honesty**
   - **Emotion:** "The app is telling me the truth about missing data"
   - **UX Approach:** Clear distinction: "No known allergies" (good) vs "No data available" (missing)
   - **Design Choice:** Different icons/colors - green checkmark for "no allergies", neutral icon for "no data"

5. **Confidence Through Performance**
   - **Emotion:** "This app is reliable and won't fail me"
   - **UX Approach:** < 2 second loads, graceful error handling, never crashes
   - **Design Choice:** Skeleton screens while loading, clear error messages with retry button

6. **Trust Through Consistency**
   - **Emotion:** "This app behaves predictably"
   - **UX Approach:** Consistent navigation patterns, familiar Material Design components
   - **Design Choice:** Use Android conventions, no custom gestures

### Emotional Design Principles

**Guiding Principles for Emotional UX:**

1. **"Confidence First, Delight Second"**
   - Prioritize data accuracy indicators over visual flourishes
   - Never sacrifice clarity for aesthetics
   - **Example:** Timestamp is more important than animation

2. **"Transparency Builds Trust"**
   - Always show data freshness (timestamps)
   - Be honest about empty states and missing data
   - Show sync status and data source
   - **Example:** "Last updated: 2 min ago" vs hiding update time

3. **"Predictability Reduces Anxiety"**
   - Use familiar Android patterns (Material Design 3)
   - Consistent behavior across all screens
   - No surprises or unexpected interactions
   - **Example:** Back button always returns to patient list

4. **"Speed Equals Confidence"**
   - Fast performance signals reliability
   - Slow apps feel broken or unreliable
   - < 2 second loads maintain confidence
   - **Example:** Skeleton screens show progress, not blank screens

5. **"Clarity Prevents Doubt"**
   - Prominent patient identification prevents wrong-patient errors
   - Clear empty state messaging prevents confusion
   - Explicit error messages guide recovery
   - **Example:** "No known allergies" (clear) vs "None" (ambiguous)

**Emotions to Actively Avoid:**

- ❌ **Doubt** - "Is this data current?" → Prevented by visible timestamps
- ❌ **Confusion** - "Is this the right patient?" → Prevented by prominent patient ID
- ❌ **Anxiety** - "What if the app crashes during rounds?" → Prevented by reliability testing
- ❌ **Frustration** - "This is taking too long" → Prevented by performance targets (< 2s)
- ❌ **Uncertainty** - "Did that action work?" → Prevented by clear feedback and confirmation

---

## Design System Foundation

### Design System Choice

**Hybrid Approach: Material Design 3 + OpenMRS O3 Brand Adaptation**

The GHC-AI Doctor Mobile App will use a hybrid design system that combines the mobile-optimized foundation of Material Design 3 with visual elements from the OpenMRS O3 web application to maintain brand consistency while delivering a superior mobile experience.

**Core Foundation:** Material Design 3 (Material You)
- Component library: Material Design 3 components
- Interaction patterns: Android native conventions
- Accessibility: WCAG 2.1 AA compliance built-in
- Touch targets: Minimum 48dp (Material Design standard)

**Brand Adaptation:** OpenMRS O3 Visual Language
- Color palette: Adapted from O3 web primary/secondary colors
- Icon style: Material Icons with O3 style matching where possible
- Brand recognition: Subtle visual connection to O3 ecosystem

### Rationale for Selection

**Why Hybrid Approach:**

1. **Mobile-First Optimization**
   - Material Design 3 is built specifically for mobile touch interfaces
   - Proven components optimized for thumb-friendly, one-handed use
   - Native Android patterns doctors already know
   - Faster development with ready-to-use components

2. **Brand Consistency**
   - Maintains visual connection to OpenMRS O3 ecosystem
   - Doctors recognize it as part of the OpenMRS family
   - Stakeholder comfort with familiar brand elements
   - Smooth transition from web to mobile

3. **Persona Differentiation**
   - Material Design 3 structure signals "mobile-first clinical tool"
   - Distinct from desktop "administrative interface" feel
   - Reinforces persona shift from "data entry clerk" to "point-of-care decision maker"
   - Visual language appropriate for clinical context

4. **Speed to Market**
   - Material Design 3 has extensive documentation and community support
   - No need to reverse-engineer O3 web design system
   - Faster implementation for 4-week Phase 1 timeline
   - Proven accessibility and performance

5. **Strategic Independence**
   - Mobile app can iterate UX independently of web changes
   - Easier to maintain and evolve over time
   - Not constrained by desktop-first design decisions

### Implementation Approach

**Component Strategy:**

1. **Use Material Design 3 Components Directly:**
   - Buttons (Filled, Outlined, Text)
   - Cards (Elevated, Filled, Outlined)
   - Lists (Single-line, Two-line, Three-line)
   - Text Fields (Filled, Outlined)
   - App Bars (Top, Bottom)
   - Navigation (Bottom Navigation, Navigation Drawer)
   - Dialogs, Snackbars, Progress Indicators

2. **Customize with O3 Brand Elements:**
   - **Colors:** Extract primary, secondary, and accent colors from O3 web
   - **Typography:** Use Material Design type scale with O3 font family (if specified)
   - **Spacing:** Material Design 8dp grid system
   - **Elevation:** Material Design elevation system (0dp, 1dp, 2dp, 3dp, 4dp, 6dp, 8dp)

3. **Create Custom Components for Clinical Context:**
   - Patient Card (for My Patients list)
   - Clinical Summary Card (for Demographics, Meds, Allergies, Vitals)
   - Empty State Components (for missing data)
   - Safety Alert Components (for critical allergies/medications)

**Technology Implementation:**

- **For Flutter:** Use `material` package (Material Design 3 widgets) + custom theme
- **For React Native:** Use React Native Paper (Material Design 3) + custom theme
- **Design Tokens:** Define color, typography, spacing tokens in theme configuration
- **Component Library:** Build reusable components on top of Material Design 3 foundation

### Customization Strategy

**Color System:**

1. **Extract O3 Brand Colors:**
   - Primary Color: [To be extracted from O3 web]
   - Secondary Color: [To be extracted from O3 web]
   - Background Colors: [To be extracted from O3 web]

2. **Define Clinical Safety Colors:**
   - **Allergy Alert:** Red (#D32F2F) - High visibility for safety-critical information
   - **Medication Info:** Blue (#1976D2) - Professional, trustworthy
   - **Vitals Normal:** Green (#388E3C) - Positive indicator
   - **Vitals Abnormal:** Orange (#F57C00) - Warning indicator
   - **Empty State:** Grey (#757575) - Neutral, non-alarming

3. **Material Design 3 Color Roles:**
   - Primary: O3 primary color
   - On-Primary: White or high-contrast text
   - Secondary: O3 secondary color
   - On-Secondary: White or high-contrast text
   - Surface: White or light grey
   - On-Surface: Dark grey or black
   - Error: Red (#B00020) - Material Design standard

**Typography System:**

- **Typeface:** Roboto (Material Design default) or O3 web font family if specified
- **Type Scale:** Material Design 3 type scale
  - Display Large: 57sp
  - Headline Large: 32sp
  - Headline Medium: 28sp (Patient names)
  - Headline Small: 24sp (Section headers)
  - Title Large: 22sp
  - Title Medium: 16sp (Patient ID, labels)
  - Body Large: 16sp (Clinical data)
  - Body Medium: 14sp (Secondary info)
  - Label Large: 14sp (Buttons)

**Spacing System:**

- **Base Unit:** 8dp (Material Design standard)
- **Common Spacing:**
  - 4dp: Tight spacing (icon-text gap)
  - 8dp: Default spacing (between related elements)
  - 16dp: Section spacing (between cards)
  - 24dp: Screen padding (left/right margins)
  - 32dp: Large spacing (between major sections)

**Component Customization:**

1. **Patient Card (My Patients List):**
   - Base: Material Design 3 Card (Elevated)
   - Height: 88dp (three-line list item)
   - Padding: 16dp
   - Elevation: 1dp
   - Ripple effect on tap
   - Content: Patient Name (Headline Small), Patient ID (Body Medium), Age & Gender (Body Medium)

2. **Clinical Summary Card:**
   - Base: Material Design 3 Card (Outlined)
   - Padding: 16dp
   - Border: 1dp solid divider color
   - Section Header: Title Medium (16sp, bold)
   - Content: Body Large (16sp, regular)
   - Empty State: Body Medium (14sp, grey)

3. **Safety Alert (Allergies):**
   - Base: Material Design 3 Card (Filled)
   - Background: Light red (#FFEBEE)
   - Border: 2dp solid red (#D32F2F)
   - Icon: Warning icon (24dp, red)
   - Text: Body Large (16sp, dark red)

**Accessibility Customization:**

- **Touch Targets:** Minimum 48dp x 48dp (Material Design standard)
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Text Scaling:** Support Android system font size settings
- **Screen Reader:** Semantic labels for all interactive elements
- **Focus Indicators:** Visible focus states for keyboard navigation

---

## Screen Wireframes & User Flows

### Screen 1: Login Screen

**Purpose:** Authenticate doctor using existing OpenMRS credentials

**Layout:**

```
┌─────────────────────────────────────┐
│  [Status Bar: Time, Battery, etc]  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          [OpenMRS Logo]             │
│                                     │
│      GHC-AI Doctor Mobile App       │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Username                      │  │
│  │ [                           ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Password                      │  │
│  │ [                           ] │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │         LOGIN                 │  │
│  └───────────────────────────────┘  │
│       (Filled Button, Primary)      │
│                                     │
│                                     │
│     [Error message area]            │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Components:**
- **App Logo:** OpenMRS logo (centered, 80dp height)
- **App Title:** "GHC-AI Doctor Mobile App" (Headline Medium, centered)
- **Username Field:** Material Design 3 Outlined Text Field (48dp height)
- **Password Field:** Material Design 3 Outlined Text Field (48dp height, password masked)
- **Login Button:** Material Design 3 Filled Button (48dp height, full width minus 48dp margins)
- **Error Message:** Body Medium text (red color, only visible on error)

**Interactions:**
1. User taps Username field → Keyboard appears
2. User enters username → Text appears in field
3. User taps Password field → Keyboard appears
4. User enters password → Text appears masked (••••)
5. User taps Login button → Loading indicator appears
6. **Success:** Navigate to My Patients Dashboard
7. **Failure:** Show error message "Invalid username or password. Please try again."

**States:**
- **Default:** Empty fields, Login button enabled
- **Loading:** Login button shows circular progress indicator, fields disabled
- **Error:** Error message visible below button, fields remain editable

**Performance Target:** < 3 seconds from tap to dashboard

---

### Screen 2: My Patients Dashboard

**Purpose:** Display list of assigned patients with active visits

**Layout:**

```
┌─────────────────────────────────────┐
│  [Status Bar: Time, Battery, etc]  │
├─────────────────────────────────────┤
│  ← My Patients            [Menu]    │
│                                     │
│  Last updated: 2 min ago   [↻]     │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ John Smith                    │  │
│  │ ID: 10002AB  •  45y  •  Male  │  │
│  │ Ward: 3B                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Mary Johnson                  │  │
│  │ ID: 10003CD  •  62y  •  Female│  │
│  │ Ward: 3B                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Robert Williams               │  │
│  │ ID: 10004EF  •  38y  •  Male  │  │
│  │ Ward: 4A                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Sarah Davis                   │  │
│  │ ID: 10005GH  •  71y  •  Female│  │
│  │ Ward: 4A                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Pull down to refresh]             │
│                                     │
└─────────────────────────────────────┘
```

**Components:**
- **Top App Bar:** Material Design 3 Top App Bar (64dp height)
  - Back button (48dp touch target)
  - Title: "My Patients" (Title Large)
  - Menu icon (48dp touch target)
- **Timestamp:** "Last updated: X min ago" (Body Medium, grey)
- **Refresh Icon:** Circular refresh icon (48dp touch target)
- **Patient Cards:** Material Design 3 Elevated Card (88dp height each)
  - Patient Name (Headline Small, 24sp, bold)
  - Patient ID, Age, Gender (Body Medium, 14sp, grey)
  - Ward location (Body Medium, 14sp, grey)
  - 16dp padding, 16dp spacing between cards
  - Ripple effect on tap
- **Pull-to-Refresh:** Material Design 3 pull-to-refresh indicator

**Interactions:**
1. User pulls down from top → Refresh indicator appears → Data reloads
2. User taps patient card → Navigate to Clinical Summary for that patient
3. User taps refresh icon → Data reloads with loading indicator
4. User taps menu icon → Show menu (Logout option)
5. User taps back button → Confirm logout dialog

**States:**
- **Loading (Initial):** Skeleton cards (grey placeholders)
- **Loaded:** Patient cards with data
- **Empty:** "No active patients assigned to you" message with icon
- **Error:** "Unable to load patients. Tap to retry." with retry button
- **Refreshing:** Pull-to-refresh indicator at top

**Performance Target:** < 2 seconds to load patient list

---

### Screen 3: Clinical Summary

**Purpose:** Display critical patient clinical data in priority order

**Layout:**

```
┌─────────────────────────────────────┐
│  [Status Bar: Time, Battery, etc]  │
├─────────────────────────────────────┤
│  ← John Smith                       │
│     ID: 10002AB                     │
│     Last updated: 1 min ago         │
├─────────────────────────────────────┤
│                                     │
│  ┌─ DEMOGRAPHICS ─────────────────┐ │
│  │ Name: John Smith              │ │
│  │ ID: 10002AB                   │ │
│  │ Age: 45 years                 │ │
│  │ Gender: Male                  │ │
│  │ Ward: 3B                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─ ACTIVE MEDICATIONS ───────────┐ │
│  │ 💊 Metformin 500mg            │ │
│  │    2x daily, with meals       │ │
│  │                               │ │
│  │ 💊 Lisinopril 10mg            │ │
│  │    1x daily, morning          │ │
│  │                               │ │
│  │ 💊 Atorvastatin 20mg          │ │
│  │    1x daily, evening          │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─ ALLERGIES ────────────────────┐ │
│  │ ⚠️  Penicillin (Severe)       │ │
│  │     Anaphylaxis reaction      │ │
│  │                               │ │
│  │ ⚠️  Sulfa drugs (Moderate)    │ │
│  │     Rash                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─ RECENT VITALS ────────────────┐ │
│  │ 📊 Heart Rate: 78 bpm         │ │
│  │    Today 08:30                │ │
│  │                               │ │
│  │ 📊 Blood Pressure: 128/82     │ │
│  │    Today 08:30                │ │
│  │                               │ │
│  │ 📊 SpO2: 98%                  │ │
│  │    Today 08:30                │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Scroll for more]                  │
│                                     │
└─────────────────────────────────────┘
```

**Components:**
- **Top App Bar:** Material Design 3 Top App Bar (80dp height)
  - Back button (48dp touch target)
  - Patient Name (Title Large, 22sp)
  - Patient ID (Body Medium, 14sp, grey)
  - Timestamp (Body Small, 12sp, grey)
- **Section Cards:** Material Design 3 Outlined Card
  - Section Header (Title Medium, 16sp, bold)
  - Content (Body Large, 16sp)
  - 16dp padding
  - 16dp spacing between cards
  - 24dp left/right margins

**Section Details:**

1. **Demographics Card:**
   - White background
   - Black text
   - Standard outlined card

2. **Active Medications Card:**
   - Light blue background (#E3F2FD)
   - Blue icon (💊)
   - Medication name (Body Large, bold)
   - Dosage and frequency (Body Medium, grey)
   - 8dp spacing between medications

3. **Allergies Card:**
   - Light red background (#FFEBEE)
   - Red border (2dp)
   - Warning icon (⚠️, red)
   - Allergy name and severity (Body Large, bold, dark red)
   - Reaction description (Body Medium, grey)
   - 8dp spacing between allergies

4. **Recent Vitals Card:**
   - White background
   - Chart icon (📊)
   - Vital name and value (Body Large, bold)
   - Timestamp (Body Medium, grey)
   - 8dp spacing between vitals

**Empty States:**

1. **No Active Medications:**
   ```
   ┌─ ACTIVE MEDICATIONS ───────────┐
   │ 💊 No active medications       │
   │    recorded                    │
   └───────────────────────────────┘
   ```

2. **No Allergies:**
   ```
   ┌─ ALLERGIES ────────────────────┐
   │ ✓  No known allergies          │
   │    (Green checkmark)           │
   └───────────────────────────────┘
   ```

3. **No Recent Vitals:**
   ```
   ┌─ RECENT VITALS ────────────────┐
   │ 📊 No recent vitals recorded   │
   │    Last recorded: 3 days ago   │
   └───────────────────────────────┘
   ```

**Interactions:**
1. User taps back button → Return to My Patients Dashboard
2. User scrolls down → View all sections
3. User pulls down from top → Refresh data
4. User taps medication → (Future: Show medication details)
5. User taps allergy → (Future: Show allergy details)

**States:**
- **Loading:** Skeleton cards (grey placeholders)
- **Loaded:** All sections with data or empty states
- **Error:** "Unable to load clinical summary. Tap to retry."
- **Refreshing:** Pull-to-refresh indicator at top

**Performance Target:** < 2 seconds to load clinical summary

---

### User Flow: Complete Journey

```
┌─────────────┐
│   Login     │
│   Screen    │
└──────┬──────┘
       │
       │ (Successful authentication)
       ↓
┌─────────────┐
│ My Patients │
│  Dashboard  │
└──────┬──────┘
       │
       │ (Tap patient card)
       ↓
┌─────────────┐
│  Clinical   │
│   Summary   │
└──────┬──────┘
       │
       │ (Tap back button)
       ↓
┌─────────────┐
│ My Patients │
│  Dashboard  │
└──────┬──────┘
       │
       │ (Tap menu → Logout)
       ↓
┌─────────────┐
│   Login     │
│   Screen    │
└─────────────┘
```

**Navigation Rules:**
- **Login → Dashboard:** Automatic after successful authentication
- **Dashboard → Clinical Summary:** Tap patient card
- **Clinical Summary → Dashboard:** Tap back button (Android native)
- **Dashboard → Login:** Tap menu → Logout (with confirmation dialog)
- **Any Screen → Dashboard:** Android back button (except from Dashboard, which shows logout confirmation)

---
