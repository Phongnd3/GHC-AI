# Screen Wireframes & User Flows

## Screen 1: Login Screen

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

## Screen 2: My Patients Dashboard

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

## Screen 3: Clinical Summary

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

## User Flow: Complete Journey

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
