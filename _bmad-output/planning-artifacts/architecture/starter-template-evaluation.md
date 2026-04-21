# Starter Template Evaluation

## Primary Technology Domain

**Mobile (React Native + Expo)** - Cross-platform with Android-first MVP, leveraging existing OpenMRS team's React/TypeScript expertise

## Technical Preferences Established

- **Platform:** React Native with Expo (SDK 55 - latest as of Feb 2026)
- **Language:** TypeScript (aligns with OpenMRS web system)
- **UI Framework:** Material Design 3 via React Native Paper v5
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand (included in starter)
- **API Client:** TanStack Query (React Query) for orchestration

## Starter Options Considered

**Option 1: Official Expo Default Template**
- Command: `npx create-expo-app@latest --template default@sdk-55`
- Includes: TypeScript, Expo Router, minimal setup
- Pros: Official, clean slate, full control
- Cons: Manual setup for state management, API layer, testing, CI/CD

**Option 2: Obytes Production Template** ⭐ **SELECTED**
- Command: `npx create-expo-app --template @obytes/react-native-template-obytes`
- Includes: TypeScript, Expo Router, TanStack Query, Zustand, TanStack Form + Zod, i18next, MMKV storage, Husky, GitHub Actions, E2E testing (Maestro), Jest
- Pros: Production-ready, API orchestration built-in, state management included, healthcare-appropriate (secure storage, validation)
- Maintenance: v9.0.0 (Jan 2026), 4.1k stars, actively maintained

## Selected Starter: Obytes React Native Template + Material Design 3

**Rationale for Selection:**

1. **Production-Ready Foundation** - Includes all architectural decisions needed for complex orchestration requirements
2. **API Orchestration Built-In** - TanStack Query perfect for 8-11 API call orchestration with caching, retry, and error handling
3. **State Management Included** - Zustand provides lightweight state management for appointment/visit/queue data
4. **Form Validation Ready** - TanStack Form + Zod matches data integrity requirements (100% traceability)
5. **Healthcare-Appropriate** - MMKV for secure credential storage, comprehensive validation
6. **Testing Infrastructure** - Jest + Maestro E2E testing for >99% reliability target
7. **CI/CD Ready** - GitHub Actions configured for automated builds
8. **OpenMRS Alignment** - TypeScript + React patterns familiar to web team

**Initialization Commands:**

```bash
# Create project with Obytes template
npx create-expo-app ghc-ai-mobile --template @obytes/react-native-template-obytes

# Navigate to project
cd ghc-ai-mobile

# Add Material Design 3 support
npx expo install react-native-paper @pchmn/expo-material3-theme react-native-safe-area-context
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript configured with strict mode
- React Native 0.83 (via Expo SDK 55)
- React 19.2
- New Architecture enabled by default

**UI & Styling:**
- NativeWind (TailwindCSS for React Native) - base styling system
- React Native Paper v5 - Material Design 3 components
- expo-material3-theme - Dynamic Material You theming for Android 12+
- Safe area handling configured

**Navigation:**
- Expo Router (file-based routing)
- Deep linking configured
- Tab navigation patterns included

**API & Data Layer:**
- TanStack Query (React Query) - API orchestration, caching, retry logic
- Axios pre-configured
- Environment variable management (.env support)

**State Management:**
- Zustand - lightweight global state
- MMKV - fast, secure key-value storage (credentials)

**Form Handling:**
- TanStack Form - form state management
- Zod - schema validation (healthcare data integrity)

**Testing Framework:**
- Jest + React Testing Library - unit/integration tests
- Maestro - E2E testing framework
- Test coverage reporting configured

**Code Quality:**
- ESLint + Prettier configured
- Husky pre-commit hooks
- TypeScript strict mode
- Import sorting and linting rules

**Build & Deployment:**
- Multi-environment support (dev, staging, production)
- GitHub Actions CI/CD workflows
- EAS Build configuration for Expo
- App versioning automation

**Development Experience:**
- Hot reloading via Expo
- TypeScript IntelliSense
- Debugging with React Native Debugger
- i18next for internationalization

**Project Structure:**
```
src/
├── api/          # API client and endpoints
├── components/   # Reusable UI components
├── screens/      # Screen components (Expo Router)
├── store/        # Zustand state management
├── types/        # TypeScript type definitions
├── utils/        # Helper functions
└── theme/        # Styling and theming
```

**Note:** Project initialization using these commands should be the first implementation story.

---
