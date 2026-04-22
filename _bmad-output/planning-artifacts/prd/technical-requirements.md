# Technical Requirements

## Platform & Technology Stack

**Platform:** Native Android Application  
**Framework:** Flutter or React Native (decision to be made in architecture phase)  
**Minimum Android Version:** Android 8.0 (API Level 26)  
**Target Devices:** Android smartphones (5-7 inch screens)

## Backend Integration

**API Base URL:** `http://localhost:8080/openmrs/ws/rest/v1/` (local development)  
**Authentication:** OpenMRS REST API session-based authentication  
**Data Format:** JSON  
**API Version:** OpenMRS REST API v1

## Required API Endpoints

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `POST /session` | User authentication | Critical |
| `GET /visit?provider={uuid}` | Fetch assigned patients | Critical |
| `GET /patient/{uuid}?v=full` | Patient demographics | Critical |
| `GET /order?patient={uuid}&status=ACTIVE` | Active medications | Critical |
| `GET /patient/{uuid}/allergy` | Patient allergies | Critical |
| `GET /obs?patient={uuid}&concept={vitals}` | Recent vitals | Critical |
| `DELETE /session` | Logout | Important |

## Performance Targets

- **Login:** < 3 seconds
- **Patient List Load:** < 2 seconds
- **Clinical Summary Load:** < 2 seconds
- **App Launch:** < 1 second (cold start)
- **Network Timeout:** 10 seconds with retry option

## Security Requirements

- Session tokens stored in Android Keystore (secure storage)
- HTTPS for all API calls (production)
- No sensitive data cached on device
- Automatic logout after 30 minutes of inactivity
- No screenshots allowed on clinical data screens (Android FLAG_SECURE)

---
