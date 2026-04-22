# Business Rules & Edge Cases

## Patient Assignment Logic

**Rule:** A patient is "assigned" to a doctor if there is an active visit where the doctor is listed as the primary provider.

**Implementation:**
- Query: `GET /visit?provider={doctorUuid}&includeInactive=false`
- Filter: Visit must have `stopDatetime = null` (active visit)
- Provider relationship: Doctor UUID matches `visit.encounters[].encounterProviders[].provider.uuid` OR `visit.attributes` contains provider assignment

**Edge Cases:**
- **No active visits:** Display empty state message "No active patients assigned to you"
- **Multiple providers on same visit:** Show patient if logged-in doctor is listed as ANY provider (not just primary)
- **Visit without encounters:** Still show patient if visit exists with provider assignment

---

## Empty State Handling

**Reference Case:** William Robinson (ID: 10001HU) - Patient with minimal data

**Rules:**

1. **No Active Medications**
   - Display: "No active medications recorded"
   - UI: Show empty state icon with message
   - Do NOT show error or hide section

2. **No Allergies**
   - Display: "No known allergies" (important clinical information!)
   - UI: Show with neutral/positive indicator (green checkmark)
   - Do NOT treat as missing data - "no allergies" is valid clinical state

3. **No Recent Vitals**
   - Display: "No recent vitals recorded"
   - UI: Show empty state with timestamp of last check (if available)
   - Suggest: "Last vitals recorded: [date]" or "No vitals on record"

4. **Missing Demographics**
   - Display: Show available fields, hide missing fields
   - Required fields: Name, ID (always present in OpenMRS)
   - Optional fields: Age, Gender, Photo

---

## Data Refresh & Caching

**Rules:**

1. **On Login:** Fetch fresh patient list
2. **On Dashboard Load:** Use cached list, allow pull-to-refresh
3. **On Clinical Summary Load:** Always fetch fresh data (critical for clinical accuracy)
4. **Cache Duration:** Patient list cached for 5 minutes, clinical data never cached
5. **Network Failure:** Show last cached data with warning banner "Data may be outdated"

---

## Clinical Data Priority

**Display Order (Non-Negotiable):**

1. **Demographics** - Identity verification (prevent wrong-patient errors)
2. **Active Medications** - Safety check (drug interactions, current treatments)
3. **Allergies** - Safety check (prevent allergic reactions)
4. **Recent Vitals** - Clinical status (trending, current condition)

**Rationale:** Safety-critical information (Meds, Allergies) appears before diagnostic information (Vitals).

---
