# Executive Summary

## Project Vision

The GHC-AI Doctor Mobile App solves the "Last Meter" problem in clinical data access by delivering critical patient information directly to doctors at the point of care—bedside during ward rounds or in consultation rooms. Currently, doctors are "desk-locked": they review patient data at desktop stations, walk to the patient, realize they've forgotten a specific vital trend or allergy, then either walk back to the computer or resort to writing notes on hands and pockets. This information gap breaks the doctor-patient relationship, creates double-entry workflows, and increases the risk of medical errors.

This native Android mobile app (Flutter/React Native) transforms that experience by putting clinical decision-making data in the doctor's pocket. Immediately upon login, doctors are presented with a direct path to their assigned patients' critical data. The interface is architected to eliminate navigational layers, ensuring that life-saving information—such as Allergies and Active Medications—is accessible instantly at the point of care. The app maintains the doctor-patient conversation flow—no turning away to a computer, no breaking the consultation moment.

**Phase 1 Focus:** Three core features - Login, My Patients Dashboard, and Clinical Summary (read-only)  
**Timeline:** Month 1 of 3-month strategic roadmap  
**Platform:** Native Android smartphones (5-7 inch screens)

## Target Users

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

## Key Design Challenges

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

## Design Opportunities

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
