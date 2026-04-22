# Design System Foundation

## Design System Choice

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

## Rationale for Selection

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

## Implementation Approach

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

## Customization Strategy

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
