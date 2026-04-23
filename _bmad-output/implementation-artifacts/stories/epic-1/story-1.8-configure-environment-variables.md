# Story 1.8: Configure Environment Variables and Constants

**Status:** ready-for-dev  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.8  
**Priority:** P0 - Blocking all environment-specific configuration  
**Depends On:** Story 1.5 (Configure API Client) ✅ ready-for-dev

---

## Story

As a developer,  
I want environment configuration for different deployment environments,  
So that API URLs and timeouts can be changed per environment without code changes.

---

## Acceptance Criteria

**AC1. Environment files created**  
**Given** the project needs different configurations per environment  
**When** environment files are created  
**Then** `.env.development`, `.env.staging`, and `.env.production` files exist  
**And** each file contains `API_BASE_URL`, `SESSION_TIMEOUT`, `CACHE_DURATION`, `REQUEST_TIMEOUT`  
**And** `.env.local` is added to `.gitignore` for local overrides

**AC2. app.config.js loads environment variables**  
**Given** environment files are created  
**When** `app.config.js` is configured  
**Then** it loads environment variables from `.env` files  
**And** it exports configuration with `extra` object containing typed environment values  
**And** it supports different app names per environment (e.g., "GHC Mobile (Dev)")

**AC3. Typed environment configuration module**  
**Given** environment variables are loaded in app.config.js  
**When** `src/config/env.ts` is created  
**Then** it exports typed environment variables using `expo-constants`  
**And** it provides `API_BASE_URL`, `SESSION_TIMEOUT`, `CACHE_DURATION`, `REQUEST_TIMEOUT` constants  
**And** it throws error if required environment variables are missing  
**And** TypeScript types ensure type safety

**AC4. API client uses environment variables**  
**Given** environment configuration is available  
**When** API client from Story 1.5 is updated  
**Then** it uses `API_BASE_URL` from environment config  
**And** it uses `REQUEST_TIMEOUT` from environment config  
**And** no hardcoded URLs or timeouts remain in API client

**AC5. Environment switching works**  
**Given** different environment files exist  
**When** `APP_ENV` environment variable is set (development/staging/production)  
**Then** the correct `.env` file is loaded  
**And** the app displays correct environment-specific values  
**And** API calls use correct base URL for the environment

**AC6. Documentation and examples**  
**Given** environment configuration is complete  
**When** documentation is created  
**Then** README or docs explain how to switch environments  
**And** example `.env.example` file is provided  
**And** developers know how to add new environment variables

---

## Tasks / Subtasks

- [ ] Create environment files (AC: 1)
  - [ ] Create `.env.development` with development values
  - [ ] Create `.env.staging` with staging values
  - [ ] Create `.env.production` with production values
  - [ ] Create `.env.example` as template
  - [ ] Add `.env.local` to `.gitignore`
  - [ ] Document environment variables in each file

- [ ] Configure app.config.js (AC: 2)
  - [ ] Convert `app.json` to `app.config.js` if needed
  - [ ] Load environment variables using `process.env`
  - [ ] Add `extra` object with environment configuration
  - [ ] Set app name based on environment (e.g., "GHC Mobile (Dev)")
  - [ ] Set bundle identifier/package name based on environment
  - [ ] Export dynamic configuration function

- [ ] Create typed environment module (AC: 3)
  - [ ] Create `src/config/env.ts`
  - [ ] Import `Constants` from `expo-constants`
  - [ ] Access `Constants.expoConfig.extra` for environment values
  - [ ] Define TypeScript interfaces for environment config
  - [ ] Export typed constants: `API_BASE_URL`, `SESSION_TIMEOUT`, etc.
  - [ ] Add validation to throw error if required values missing
  - [ ] Add JSDoc comments for each constant

- [ ] Update API client (AC: 4)
  - [ ] Import environment config in `src/services/api/client.ts`
  - [ ] Replace hardcoded base URL with `API_BASE_URL`
  - [ ] Replace hardcoded timeout with `REQUEST_TIMEOUT`
  - [ ] Verify no hardcoded environment-specific values remain

- [ ] Test environment switching (AC: 5)
  - [ ] Test with `APP_ENV=development`
  - [ ] Test with `APP_ENV=staging`
  - [ ] Test with `APP_ENV=production`
  - [ ] Verify correct values loaded for each environment
  - [ ] Verify API client uses correct base URL

- [ ] Create documentation (AC: 6)
  - [ ] Document environment variables in README or docs
  - [ ] Explain how to switch environments
  - [ ] Provide `.env.example` with all variables
  - [ ] Document how to add new environment variables

---

## Dev Notes

### Architecture Compliance

**ARCH-REQ-11: Environment Configuration**
- Separate configuration for dev/staging/prod environments
- No hardcoded environment-specific values in code
- Type-safe environment variable access

**ARCH-REQ-4: API Integration**
- API client uses environment-specific base URL
- Timeout values configurable per environment
- Easy to switch between local and remote APIs

**ARCH-REQ-24: Security**
- Sensitive values in `.env` files (not committed to git)
- `.env.local` for local overrides (gitignored)
- No secrets in app.config.js (use EAS Secrets for production)

### Technical Requirements

**Environment Variable Values:**

**Development (.env.development):**
```bash
API_BASE_URL=http://localhost:8080/openmrs/ws/rest/v1
SESSION_TIMEOUT=1800000
CACHE_DURATION=300000
REQUEST_TIMEOUT=10000
APP_ENV=development
```

**Staging (.env.staging):**
```bash
API_BASE_URL=https://staging.ghc.example.com/openmrs/ws/rest/v1
SESSION_TIMEOUT=1800000
CACHE_DURATION=300000
REQUEST_TIMEOUT=10000
APP_ENV=staging
```

**Production (.env.production):**
```bash
API_BASE_URL=https://api.ghc.example.com/openmrs/ws/rest/v1
SESSION_TIMEOUT=1800000
CACHE_DURATION=300000
REQUEST_TIMEOUT=10000
APP_ENV=production
```

**app.config.js Structure:**
```javascript
// app.config.js

// Load environment variables from .env files
// Note: Expo automatically loads .env files based on APP_ENV
const isProduction = process.env.APP_ENV === 'production';
const isStaging = process.env.APP_ENV === 'staging';
const isDevelopment = process.env.APP_ENV === 'development' || !process.env.APP_ENV;

module.exports = ({ config }) => {
  return {
    ...config,
    name: isProduction
      ? 'GHC Mobile'
      : isStaging
      ? 'GHC Mobile (Staging)'
      : 'GHC Mobile (Dev)',
    slug: 'ghc-mobile',
    version: '1.0.0',
    
    // Android package name per environment
    android: {
      ...config.android,
      package: isProduction
        ? 'com.ghc.mobile'
        : isStaging
        ? 'com.ghc.mobile.staging'
        : 'com.ghc.mobile.dev',
    },
    
    // iOS bundle identifier per environment
    ios: {
      ...config.ios,
      bundleIdentifier: isProduction
        ? 'com.ghc.mobile'
        : isStaging
        ? 'com.ghc.mobile.staging'
        : 'com.ghc.mobile.dev',
    },
    
    // Extra configuration accessible via expo-constants
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800000', 10),
      cacheDuration: parseInt(process.env.CACHE_DURATION || '300000', 10),
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
      appEnv: process.env.APP_ENV || 'development',
    },
  };
};
```

**Typed Environment Module:**
```typescript
// src/config/env.ts

import Constants from 'expo-constants';

/**
 * Environment configuration loaded from app.config.js extra field.
 * Values are set per environment (development, staging, production).
 */
interface EnvironmentConfig {
  apiBaseUrl: string;
  sessionTimeout: number;
  cacheDuration: number;
  requestTimeout: number;
  appEnv: 'development' | 'staging' | 'production';
}

/**
 * Get environment configuration from expo-constants.
 * Throws error if required values are missing.
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const extra = Constants.expoConfig?.extra;

  if (!extra) {
    throw new Error('Environment configuration not found in expo-constants');
  }

  if (!extra.apiBaseUrl) {
    throw new Error('API_BASE_URL is required but not configured');
  }

  return {
    apiBaseUrl: extra.apiBaseUrl,
    sessionTimeout: extra.sessionTimeout || 1800000,
    cacheDuration: extra.cacheDuration || 300000,
    requestTimeout: extra.requestTimeout || 10000,
    appEnv: extra.appEnv || 'development',
  };
}

// Export typed environment configuration
export const ENV = getEnvironmentConfig();

/**
 * API base URL for OpenMRS REST API.
 * Example: http://localhost:8080/openmrs/ws/rest/v1
 */
export const API_BASE_URL = ENV.apiBaseUrl;

/**
 * Session timeout in milliseconds (default: 30 minutes).
 */
export const SESSION_TIMEOUT = ENV.sessionTimeout;

/**
 * Cache duration in milliseconds (default: 5 minutes).
 */
export const CACHE_DURATION = ENV.cacheDuration;

/**
 * Request timeout in milliseconds (default: 10 seconds).
 */
export const REQUEST_TIMEOUT = ENV.requestTimeout;

/**
 * Current app environment.
 */
export const APP_ENV = ENV.appEnv;
```

**Updated API Client:**
```typescript
// src/services/api/client.ts

import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL, // From environment config
  timeout: REQUEST_TIMEOUT, // From environment config
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Add session token from SecureStore
    const token = await getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await clearSessionToken();
      // Navigation logic here
    }
    return Promise.reject(error);
  }
);
```

### Testing Requirements

**Manual Testing:**
1. Test with `APP_ENV=development` - verify dev API URL used
2. Test with `APP_ENV=staging` - verify staging API URL used
3. Test with `APP_ENV=production` - verify production API URL used
4. Verify app name changes per environment
5. Verify API client uses correct base URL and timeout

**Unit Testing (Optional):**
- Test environment config module throws error if values missing
- Test environment config returns correct values
- Mock `Constants.expoConfig.extra` for testing

### Latest Technical Information (Context7)

**Expo Environment Variables Best Practices (SDK 55):**

1. **EXPO_PUBLIC_ Prefix:**
   - Variables prefixed with `EXPO_PUBLIC_` are automatically inlined at build time
   - Accessible via `process.env.EXPO_PUBLIC_VAR_NAME` in client code
   - Alternative to `extra` field in app.config.js
   - Can be disabled with `EXPO_NO_CLIENT_ENV_VARS=1`

2. **app.config.js vs app.json:**
   - Use `app.config.js` for dynamic configuration
   - Supports environment variables via `process.env`
   - Can use JavaScript logic for conditional configuration
   - Export function that receives `{ config }` parameter

3. **expo-constants Access:**
   - Use `Constants.expoConfig.extra` to access custom config
   - Values in `extra` are embedded in the app at build time
   - Type-safe access via TypeScript interfaces
   - Validate required values at app startup

4. **.env File Loading:**
   - Expo automatically loads `.env` files
   - Priority: `.env.local` > `.env.{APP_ENV}` > `.env`
   - Use `.env.local` for local overrides (gitignore it)
   - Use `.env.example` as template for team

5. **Security Considerations:**
   - Never commit `.env` files with secrets to git
   - Use EAS Secrets for production secrets
   - Values in `extra` are embedded in app (not secure for secrets)
   - Use SecureStore for runtime secrets (tokens, keys)

6. **Environment Switching:**
   - Set `APP_ENV` before running Expo commands
   - Example: `APP_ENV=staging npx expo start`
   - Different bundle identifiers per environment
   - Different app names per environment

### File Structure

```
project-root/
├── .env.development         # Development environment variables
├── .env.staging             # Staging environment variables
├── .env.production          # Production environment variables
├── .env.example             # Template for environment variables
├── .gitignore               # Add .env.local
├── app.config.js            # Dynamic Expo configuration
└── src/
    ├── config/
    │   └── env.ts           # Typed environment configuration
    └── services/
        └── api/
            └── client.ts    # API client using environment config
```

### Integration with Story 1.5 (API Client)

The environment configuration integrates with the API client from Story 1.5:

1. **API Client Updates:**
   - Replace hardcoded `baseURL` with `API_BASE_URL` from env config
   - Replace hardcoded `timeout` with `REQUEST_TIMEOUT` from env config
   - No other changes needed to interceptors

2. **Environment-Specific Behavior:**
   - Development: Points to `localhost:8080` for local OpenMRS
   - Staging: Points to staging server for testing
   - Production: Points to production server for hospital deployment

3. **Easy Switching:**
   - Change `APP_ENV` to switch environments
   - No code changes needed
   - Rebuild app to apply new environment

**Usage Example:**
```typescript
// In any component or service
import { API_BASE_URL, SESSION_TIMEOUT, APP_ENV } from '@/config/env';

console.log(`Running in ${APP_ENV} mode`);
console.log(`API URL: ${API_BASE_URL}`);
console.log(`Session timeout: ${SESSION_TIMEOUT}ms`);

// API client automatically uses these values
import { apiClient } from '@/services/api/client';
const response = await apiClient.get('/patient/123');
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md#Story 1.8]
- [Source: _bmad-output/planning-artifacts/architecture.md#ARCH-REQ-11]
- [Context7: Expo Configuration - https://github.com/expo/expo/blob/main/docs/pages/workflow/configuration.mdx]
- [Context7: Expo Constants - https://docs.expo.dev/versions/latest/sdk/constants/]
- [Context7: Expo Environment Variables - https://docs.expo.dev/versions/v55.0.0/config/metro]

---

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

- [ ] Environment files created (.env.development, .env.staging, .env.production)
- [ ] app.config.js configured with dynamic environment loading
- [ ] Typed environment module created (src/config/env.ts)
- [ ] API client updated to use environment variables
- [ ] Environment switching tested and verified
- [ ] Documentation created (.env.example, README)
- [ ] All acceptance criteria verified

### File List

_To be filled by dev agent_

---

**Story Status:** ready-for-dev  
**Next Step:** Run `bmad-dev-story` to implement this story
