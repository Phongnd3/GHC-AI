# Epic 1: Project Foundation & Core Infrastructure

Development team has a working project foundation with all tooling, testing infrastructure, design system, API client, and error handling configured, enabling rapid parallel feature development.

## Business Context

**Business Objective:** Establish technical foundation to enable rapid parallel feature development
**User Impact:** No direct user impact; enables all user-facing features
**Success Metrics:** All developers can start feature work immediately after Epic 1 completion

## Story 1.1: Initialize Expo Project with TypeScript and Expo Router

As a developer,
I want a working Expo project with TypeScript and Expo Router configured,
So that I can start building features with type safety and file-based routing.

**Acceptance Criteria:**

**AC1.**
**Given** I have Node.js 18+ installed
**When** I run the Expo initialization command
**Then** A new project is created with Expo SDK 55, TypeScript, and Expo Router
**And** The project runs successfully on Android emulator with "Hello World" screen
**And** Hot reload works when I make code changes
**And** Project structure includes `src/app/` directory for routes

**Technical Context:**
- Use `npx create-expo-app@latest --template default@sdk-55`
- Install React Native Paper v5, Axios, SWR
- Configure import aliases (@/components, @/services, etc.)

## Story 1.2: Configure Development Tooling (ESLint, Prettier, Husky)

As a developer,
I want code quality tools configured with pre-commit hooks,
So that code style is consistent and errors are caught before commit.

**Acceptance Criteria:**

**AC1.**
**Given** The Expo project is initialized
**When** I install and configure ESLint, Prettier, and Husky
**Then** ESLint catches TypeScript errors and code style issues
**And** Prettier formats code automatically
**And** Pre-commit hooks run linting and formatting on staged files
**And** Commits are blocked if linting fails

**Technical Context:**
- ESLint with TypeScript, React, React Native plugins
- Prettier with 100-char line width, single quotes
- Husky + lint-staged for pre-commit hooks
- Follows ARCH-REQ-19, ARCH-REQ-20

## Story 1.3: Set Up Testing Infrastructure (Jest + React Native Testing Library)

As a developer,
I want testing infrastructure configured,
So that I can write and run unit, component, and integration tests.

**Acceptance Criteria:**

**AC1.**
**Given** The project has development tooling configured
**When** I install Jest and React Native Testing Library
**Then** `yarn test` runs all tests successfully
**And** `yarn test:watch` runs tests in watch mode
**And** `yarn test:coverage` generates coverage reports
**And** A sample test file exists demonstrating component testing

**Technical Context:**
- Jest v29+ with React Native preset
- React Native Testing Library v12+
- Coverage targets: 90% API, 80% UI, 100% critical paths
- Follows ARCH-REQ-8, ARCH-REQ-9

## Story 1.4: Implement Theme System (Colors, Typography, Spacing)

As a developer,
I want a complete theme system with OpenMRS O3 brand colors,
So that all UI components use consistent design tokens.

**Acceptance Criteria:**

**AC1.**
**Given** The project structure is set up
**When** I create theme files in `src/theme/`
**Then** `colors.ts` exports OpenMRS O3 brand colors (Teal palette) and clinical safety colors
**And** `typography.ts` exports Material Design 3 type scale with IBM Plex Sans
**And** `spacing.ts` exports 8dp grid spacing scale
**And** `theme.ts` combines all tokens into React Native Paper theme
**And** A sample screen demonstrates theme usage (no hardcoded values)

**Technical Context:**
- Primary: #005d5d (Teal 60), Accent: #007d79 (Teal 50)
- Clinical colors: Error #da1e28, Success #24a148, Warning #f1c21b
- Spacing: 8dp grid (xs:2, sm:4, md:8, lg:12, xl:16, xxl:24, xxxl:32)
- Follows ARCH-REQ-12, ARCH-REQ-13, ARCH-REQ-14, ARCH-REQ-28, ARCH-REQ-29

## Story 1.5: Configure API Client (Axios with Interceptors)

As a developer,
I want a configured Axios client with interceptors,
So that all API calls have consistent error handling and auth token injection.

**Acceptance Criteria:**

**AC1.**
**Given** The project has theme system configured
**When** I create API client in `src/services/api/client.ts`
**Then** Axios instance is configured with base URL from environment variables
**And** Request interceptor adds session token to all requests
**And** Response interceptor handles 401 errors (redirects to login)
**And** 10-second timeout is configured
**And** A sample API call demonstrates the client usage

**Technical Context:**
- Base URL: `http://localhost:8080/openmrs/ws/rest/v1/`
- Interceptors for auth token injection and 401 handling
- Follows ARCH-REQ-4, ARCH-REQ-24

## Story 1.6: Implement Centralized Error Handler

As a developer,
I want a centralized error handler that maps API errors to user-friendly messages,
So that users see consistent, helpful error messages throughout the app.

**Acceptance Criteria:**

**AC1.**
**Given** The API client is configured
**When** I create `src/utils/errorHandler.ts`
**Then** `mapErrorToUserMessage()` function maps network errors to "No internet connection"
**And** 401 errors map to "Session expired. Please log in again."
**And** 500/503 errors map to "Server unavailable. Please try again."
**And** Timeout errors map to "Request timed out. Please try again."
**And** Unit tests cover all error scenarios

**Technical Context:**
- Centralized error mapping for consistent UX
- Follows ARCH-REQ-10, ARCH-REQ-23

## Story 1.7: Create Base UI Components (EmptyState, LoadingSkeleton)

As a developer,
I want reusable base UI components for common patterns,
So that loading and empty states are consistent across the app.

**Acceptance Criteria:**

**AC1.**
**Given** The theme system is configured
**When** I create base components in `src/components/`
**Then** `EmptyState.tsx` component displays icon + message for empty data
**And** `LoadingSkeleton.tsx` component displays grey placeholder cards
**And** Both components use theme tokens (no hardcoded values)
**And** Component tests verify rendering and prop handling
**And** A demo screen shows both components in action

**Technical Context:**
- EmptyState: Icon + message + optional action button
- LoadingSkeleton: Grey placeholder cards matching real content layout
- Follows UX-DR4, UX-DR5, ARCH-REQ-22

## Story 1.8: Configure Environment Variables and Constants

As a developer,
I want environment configuration for different deployment environments,
So that API URLs and timeouts can be changed per environment.

**Acceptance Criteria:**

**AC1.**
**Given** The project has API client configured
**When** I create `.env.development`, `.env.staging`, `.env.production` files
**Then** Environment variables include API_BASE_URL, SESSION_TIMEOUT, CACHE_DURATION, REQUEST_TIMEOUT
**And** `src/config/env.ts` exports typed environment variables using Expo Constants
**And** `app.config.js` loads environment variables correctly
**And** API client uses environment variables for configuration

**Technical Context:**
- Development: `http://localhost:8080/openmrs/ws/rest/v1`
- Session timeout: 1800000ms (30 minutes)
- Cache duration: 300000ms (5 minutes)
- Request timeout: 10000ms (10 seconds)
- Follows ARCH-REQ-11
