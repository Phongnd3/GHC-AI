# Constraints & Assumptions

## Constraints

1. **Timeline:** 3-month phased roadmap (12 weeks total)
2. **Platform:** Android only (no iOS, no web) for initial release
3. **Connectivity:** Always connected via hospital WiFi (no offline mode in Phase 1-2)
4. **Phase 1 Scope:** Read-only Doctor App (no data entry, no editing)
5. **Authentication:** Existing OpenMRS credentials (no new registration system)
6. **Backend:** Must use existing OpenMRS O3 REST APIs (no backend changes required)

## Assumptions

1. **Hospital WiFi is reliable** - Stable connection available throughout facility
2. **Doctors and patients have Android smartphones** - Personal or hospital-provided devices
3. **OpenMRS O3 backend is running** - Production instance accessible via secure connection
4. **Test data exists** - William Robinson (10001HU) and Snow White patients available for testing
5. **Provider UUIDs are known** - Doctors have existing provider records in OpenMRS
6. **Active visits exist** - Patients have been checked in via web interface
7. **Patient portal credentials exist** - Patients can obtain login credentials from hospital administration

## Phase 1 Focus (First Implementation)

For the initial implementation (Month 1), we will focus on **3 main features for the Doctor App**:
1. **Login** - Authentication with OpenMRS credentials
2. **My Patients Dashboard** - List of assigned patients
3. **Clinical Summary** - Read-only view of patient clinical data

This focused approach ensures a solid foundation before expanding to the Patient App in Phase 2.

## Out of Scope for Phase 1

- ❌ Patient App (deferred to Phase 2)
- ❌ Offline mode / local data sync
- ❌ Data entry (vitals, notes, orders) - deferred to Phase 3
- ❌ Push notifications - deferred to Phase 3
- ❌ Biometric authentication
- ❌ Multi-language support
- ❌ iOS version
- ❌ Tablet optimization
- ❌ Patient search functionality
- ❌ Historical data (beyond last 3 vitals in Phase 1)

## Future Considerations (Post-Phase 3)

- 📱 iOS version for both apps
- 🌐 Multi-language support (French, Spanish, Swahili)
- 💾 Offline mode with local data synchronization
- 📊 Advanced analytics and reporting dashboards
- 🔐 Biometric authentication (fingerprint, face recognition)
- 📱 Tablet-optimized layouts
- 🔍 Advanced patient search with filters
- 📈 Comprehensive historical data views

---
