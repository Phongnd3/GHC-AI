# Core User Experience

## Defining Experience

**The Core Action: Instant Access to Patient Clinical Data**

The entire product experience centers on eliminating the "Last Meter" problem through instant access to critical patient information. The core loop is simple and direct:

1. Doctor arrives at patient bedside or consultation room
2. Opens app → Sees "My Patients" list immediately (zero intermediate screens)
3. Taps patient → Clinical Summary appears instantly
4. Scans critical data (Demographics → Meds → Allergies → Vitals) in < 10 seconds
5. Continues patient interaction with confidence, maintaining eye contact

This loop replaces the old pattern of: Review data at desktop → Walk to patient → Forget specific detail → Walk back to computer → Return to patient (therapeutic relationship broken).

**The Experience Goal:** Make accessing clinical data faster and easier than walking back to a computer, while maintaining the doctor-patient conversation flow.

## Platform Strategy

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

## Effortless Interactions

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

## Critical Success Moments

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

## Experience Principles

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
