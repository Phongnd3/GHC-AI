# GHC-AI Doctor App

Mobile application for doctors to access patient clinical information at the point of care.

## Prerequisites

- Node.js 18+ 
- Android Studio (for Android development)
- Expo CLI

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your local settings
# For development, the defaults should work with a local OpenMRS instance
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## Running on a Physical Device (Expo Go)

The fastest way to preview the app on your phone — no cable, no emulator needed.

**Step 1 — Install Expo Go on your phone**

- iOS: [App Store → Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Play Store → Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**Step 2 — Start the dev server**

```bash
npm start
```

A QR code will appear in your terminal.

**Step 3 — Scan the QR code**

- **iOS:** Open the default Camera app, point it at the QR code, and tap the banner that appears.
- **Android:** Open the Expo Go app, tap **"Scan QR code"**, and point it at the QR code.

The app will bundle and open on your device. Any code change you save will hot-reload automatically.

> **Note:** Your phone and computer must be on the **same Wi-Fi network**. If the connection fails, press `w` in the terminal to try tunnel mode (`npm start -- --tunnel`).

## Environment Configuration

The app supports multiple environments (development, staging, production) with different configurations.

### Environment Variables

Environment variables are defined in `.env.*` files:

- `.env.development` - Development environment (default)
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.local` - Local overrides (gitignored)

Available variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | OpenMRS REST API base URL | `http://localhost:8080/openmrs/ws/rest/v1` |
| `SESSION_TIMEOUT` | Session timeout in milliseconds | `1800000` (30 min) |
| `CACHE_DURATION` | Cache duration in milliseconds | `300000` (5 min) |
| `REQUEST_TIMEOUT` | API request timeout in milliseconds | `10000` (10 sec) |
| `APP_ENV` | Current environment | `development` |

### Switching Environments

Set the `APP_ENV` environment variable before running Expo commands:

```bash
# Development (default)
npm start

# Staging
APP_ENV=staging npm start

# Production
APP_ENV=production npm start
```

Each environment uses a different:
- API base URL
- App name (e.g., "GHC Mobile (Dev)")
- Bundle identifier (e.g., `com.ghc.mobile.dev`)

### Adding New Environment Variables

1. Add the variable to all `.env.*` files
2. Update `app.config.js` to include it in the `extra` object
3. Update `src/config/env.ts` to export the typed constant
4. Update `.env.example` with documentation

## Project Structure

```
src/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point / Login screen
├── components/            # Reusable UI components
├── services/              # API integration layer
│   └── api/
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── theme/                 # Design system
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── config/                # Configuration
```

## Import Aliases

Use `@/` aliases for clean imports:

```typescript
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api/client';
```

## Tech Stack

- **Framework:** Expo SDK 54
- **Language:** TypeScript (strict mode)
- **Routing:** Expo Router (file-based)
- **UI Library:** React Native Paper v5
- **Data Fetching:** SWR + Axios
- **Date Handling:** date-fns

## Development

- TypeScript compilation: `npx tsc --noEmit`
- Start dev server: `npm start`
- Run on Android: `npm run android`
- Run on iOS: `npm run ios`

## Architecture

This app follows the architecture defined in `_bmad-output/planning-artifacts/architecture/`.

Key principles:
- File-based routing with Expo Router
- Strict TypeScript for type safety
- Import aliases for clean code organization
- Separation of concerns (components, services, hooks)
