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

2. Start the development server:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

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
