# Domain Model

**Source Documents:**
- `docs/reverse-engineering/01-domain-logic/system-glossary.md`
- `docs/reverse-engineering/01-domain-logic/patient-entity-analysis.md`
- `docs/reverse-engineering/01-domain-logic/visit-entity-analysis.md`
- `docs/reverse-engineering/01-domain-logic/appointment-entity-analysis.md`
- `docs/reverse-engineering/01-domain-logic/integrated-workflow-map.md`

---

## Core Entities

The GHC-AI Doctor App interacts with four primary OpenMRS entities. Understanding their relationships and lifecycle rules is mandatory for correct implementation.

### Entity Relationship

```
Patient ──< Visit ──< Encounter ──< Obs (vitals, diagnoses)
                  └──< QueueEntry        └──< Orders (medications)
Appointment ──────────────────────────────> Visit (created at check-in)
```

### 1. Patient

The central entity. All clinical activities revolve around it.

**Key fields used by the app:**
- `uuid` — used in all API calls
- `person.names[preferred=true]` — display name
- `identifiers[preferred=true].identifier` — MRN shown in patient header
- `person.gender`, `person.birthdate`, `person.birthdateEstimated`
- `person.dead` — must be checked; deceased patients must not appear in active lists

**Critical rule:** A patient can have multiple identifiers. Always use the one with `preferred: true` for display. Never show a voided patient (`voided: true`).

---

### 2. Visit

Represents a patient's current episode of care at the facility.

**Key fields:**
- `uuid`
- `stopDatetime: null` → **active visit** (patient is currently at facility)
- `stopDatetime: <date>` → closed visit
- `encounters[]` — clinical data recorded during this visit
- `attributes[]` — includes queue number as a visit attribute

**Critical rule for the app:** The My Patients Dashboard must filter visits where `stopDatetime === null` AND the doctor's provider UUID appears in at least one encounter's `encounterProviders`. This is the "active visit where doctor is primary provider" logic.

**Active visit detection:**
```typescript
const isActiveVisit = (visit: Visit): boolean => visit.stopDatetime === null;

const isDoctorPrimaryProvider = (visit: Visit, providerUuid: string): boolean =>
  visit.encounters.some(enc =>
    enc.encounterProviders.some(ep => ep.provider.uuid === providerUuid)
  );
```

---

### 3. Encounter

A specific clinical interaction within a visit. The app reads (never writes in Phase 1) encounters to extract clinical summary data.

**Encounter types relevant to the app:**
| Encounter Type | Data Extracted |
|---|---|
| Triage / Vitals | Heart Rate, Blood Pressure, SpO2 (last 3 obs) |
| Consultation | Active diagnoses, chief complaint |
| Medication Dispensing | Active medications / drug orders |

**Key fields:**
- `encounterType.display` — used to filter relevant encounters
- `encounterProviders[].provider.uuid` — used to match doctor
- `obs[]` — vitals and clinical observations
- `orders[]` — medication orders

---

### 4. Appointment

Scheduled interaction. The app reads appointment data to show upcoming appointments on the patient card (Phase 2+). In Phase 1, appointments are read-only context.

**Status lifecycle:**
```
Scheduled → CheckedIn → Completed
                      → Cancelled
                      → Missed
```

**Key fields:**
- `status` — current appointment state
- `startDateTime` — scheduled time
- `service.name` — clinic/service type
- `providers[].provider` — assigned provider

---

## TypeScript Type Definitions

These types must be used in `src/types/` and `src/services/api/types.ts`. They are derived directly from the domain analysis documents.

```typescript
// src/types/patient.ts

export interface PatientName {
  uuid: string;
  preferred: boolean;
  givenName: string;
  middleName?: string;
  familyName: string;
}

export interface PatientIdentifier {
  uuid: string;
  identifier: string;
  identifierType: { uuid: string; display: string };
  preferred: boolean;
}

export interface Patient {
  uuid: string;
  identifiers: PatientIdentifier[];
  person: {
    uuid: string;
    names: PatientName[];
    gender: string;
    birthdate: string;
    birthdateEstimated: boolean;
    dead: boolean;
    deathDate?: string;
    attributes: Array<{ attributeType: { display: string }; value: string }>;
    addresses: Array<Record<string, string>>;
  };
  voided: boolean;
}
```

```typescript
// src/types/visit.ts

export interface EncounterProvider {
  uuid: string;
  provider: { uuid: string; person: { uuid: string; display: string } };
  encounterRole: { uuid: string; display: string };
}

export interface Observation {
  uuid: string;
  concept: { uuid: string; display: string };
  value: string | number | { display: string };
  obsDatetime: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterType: { uuid: string; display: string };
  encounterProviders: EncounterProvider[];
  obs: Observation[];
  orders: Order[];
  voided: boolean;
}

export interface Visit {
  uuid: string;
  display: string;
  patient: { uuid: string; display: string };
  visitType: { uuid: string; display: string };
  location: { uuid: string; display: string };
  startDatetime: string;
  stopDatetime: string | null; // null = active visit
  encounters: Encounter[];
  attributes: Array<{ attributeType: { display: string }; value: string }>;
  voided: boolean;
}
```

```typescript
// src/types/clinical.ts

export interface Medication {
  uuid: string;
  drug: { display: string };
  dose: number;
  doseUnits: { display: string };
  frequency: { display: string };
  route: { display: string };
  dateActivated: string;
  autoExpireDate?: string;
  voided: boolean;
}

export interface Allergy {
  uuid: string;
  allergen: { display: string; allergenType: string };
  severity: { display: string } | null;
  reactions: Array<{ reaction: { display: string } }>;
  comment?: string;
}

export interface Vital {
  concept: string; // e.g. "Heart Rate", "Blood Pressure", "SpO2"
  value: string | number;
  units?: string;
  obsDatetime: string;
}

export interface Order {
  uuid: string;
  orderType: { display: string };
  drug?: { display: string };
  dose?: number;
  doseUnits?: { display: string };
  frequency?: { display: string };
  route?: { display: string };
  dateActivated: string;
  autoExpireDate?: string;
  voided: boolean;
}
```

---

## Business Rules

These rules are derived from the domain analysis and **must be enforced in the app**:

### Patient Display Rules
1. **Never show voided patients** (`patient.voided === true`)
2. **Never show deceased patients** (`patient.person.dead === true`) in active patient lists
3. **Preferred identifier** (`identifier.preferred === true`) is the MRN shown in the patient header
4. **Preferred name** (`name.preferred === true`) is the display name; fall back to first name if none marked preferred
5. **Estimated birthdate** — when `birthdateEstimated === true`, display age as "~X years" not exact date

### Active Visit / My Patients Rules
1. Active visit = `visit.stopDatetime === null`
2. "My patients" = active visits where the logged-in doctor's provider UUID appears in `encounter.encounterProviders[].provider.uuid`
3. A patient with no active visit must not appear on the dashboard
4. Cache patient list for 5 minutes (`dedupingInterval: 300000`); never cache clinical data

### Clinical Data Display Rules
1. **Medications**: Show only active drug orders (`order.voided === false` and not expired)
2. **Allergies**: Distinguish "no allergies recorded" (empty array) from "allergies not assessed" (null/missing) — clinically significant difference
3. **Vitals**: Show last 3 observations for Heart Rate, Blood Pressure, SpO2 — sorted by `obsDatetime` descending
4. **Empty states**: Every clinical section must have a distinct empty state message (see UX spec)

### Session / Provider Rules
1. After login, store the provider UUID from the session response — this is used for all "my patients" filtering
2. Session endpoint returns `{ authenticated: true, user: { uuid }, currentProvider: { uuid } }`
3. If `currentProvider` is null, the user is not a provider — show appropriate error

---

## API Endpoint Reference

All endpoints are relative to `EXPO_PUBLIC_API_BASE_URL` (e.g., `https://hospital.org/openmrs/ws/rest/v1`).

### Authentication
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/session` | Login — returns session token + provider UUID |
| `DELETE` | `/session` | Logout |
| `GET` | `/session` | Validate current session |

**Login response shape (critical fields):**
```typescript
interface SessionResponse {
  authenticated: boolean;
  sessionId: string;
  user: { uuid: string; display: string };
  currentProvider: { uuid: string; display: string } | null;
}
```

### Patient & Visit Data
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/visit?includeInactive=false&v=full` | All active visits (for dashboard) |
| `GET` | `/visit?patient={uuid}&includeInactive=false` | Active visits for a specific patient |
| `GET` | `/patient/{uuid}?v=full` | Full patient demographics |
| `GET` | `/patient/{uuid}/allergy` | Patient allergies |

### Clinical Data
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/obs?patient={uuid}&concept={conceptUuid}&limit=3` | Latest vitals (3 entries) |
| `GET` | `/order?patient={uuid}&orderType=drugorder&status=active` | Active medications |

### Concept UUIDs for Vitals (standard OpenMRS)
```typescript
export const VITAL_CONCEPTS = {
  HEART_RATE: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  BLOOD_PRESSURE_SYSTOLIC: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  BLOOD_PRESSURE_DIASTOLIC: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  SPO2: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;
```

> **Note:** Concept UUIDs may vary per OpenMRS installation. These are standard CIEL concept UUIDs. Confirm with the target hospital's OpenMRS configuration before hardcoding.

---

## Integrated Workflow: Patient Journey

This is the sequence the app must understand to correctly display patient data. The app is **read-only in Phase 1** — it observes this workflow but does not drive it.

```
Doctor opens app
  └─ GET /session → validate token, get providerUuid
  └─ GET /visit?includeInactive=false&v=full
       └─ Filter: stopDatetime === null (active visits)
       └─ Filter: encounters[].encounterProviders[].provider.uuid === providerUuid
       └─ Result: "My Patients" list

Doctor taps patient
  └─ GET /patient/{uuid}?v=full → demographics
  └─ GET /patient/{uuid}/allergy → allergies
  └─ GET /order?patient={uuid}&orderType=drugorder&status=active → medications
  └─ GET /obs?patient={uuid}&concept={HEART_RATE}&limit=3 → vitals
  └─ GET /obs?patient={uuid}&concept={BP_SYSTOLIC}&limit=3
  └─ GET /obs?patient={uuid}&concept={SPO2}&limit=3
  └─ Render: Demographics → Medications → Allergies → Vitals
```

**Data priority order for Clinical Summary (from PRD):**
1. Demographics (identity verification — always first)
2. Active Medications (safety check)
3. Allergies (safety check — empty state is clinically significant)
4. Recent Vitals (last 3: Heart Rate, BP, SpO2)
