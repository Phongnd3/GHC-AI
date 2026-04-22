# Starter Template Evaluation

## Primary Technology Domain

**Native Android Mobile Application** with React Native + Expo framework

**Technology Stack Decision:**
- **Framework:** React Native with Expo (SDK 55)
- **Language:** TypeScript
- **UI Library:** React Native Paper v5 (Material Design 3)
- **Routing:** Expo Router v4+ (file-based routing)
- **Platform:** Android-first with iOS future support

**Rationale:**
- Fast to ship and demo (Expo's managed workflow eliminates native build complexity)
- Multi-platform support built-in (single codebase for Android/iOS)
- TypeScript for type safety and developer experience
- Material Design 3 support via React Native Paper v5
- No code sharing with web (mobile is independent project)
- Design patterns can be shared between web and mobile

## Starter Options Considered

**Option 1: Official Expo Default Template**
- Command: `npx create-expo-app@latest --template default@sdk-55`
- Includes: Expo Router, TypeScript, tab navigation pre-configured
- Pros: Official, well-maintained, Expo Router built-in
- Cons: No testing setup, no styling library, minimal structure

**Option 2: create-expo-stack (Interactive CLI)**
- Command: `npx create-expo-stack@latest`
- Includes: Interactive choices for routing, styling, backend
- Pros: Customizable, can add NativeWind/Tamagui, testing setup options
- Cons: More complex, may include unnecessary features

**Option 3: Expo Blank TypeScript Template**
- Command: `npx create-expo-app@latest --template blank-typescript`
- Includes: Minimal setup with TypeScript only
- Pros: Clean slate, no opinions
- Cons: Must configure routing, navigation, and all tooling manually

## Selected Starter: Expo Default Template (SDK 55)

**Rationale for Selection:**

1. **Speed to Demo:** Official template with Expo Router pre-configured means immediate navigation setup
2. **TypeScript Built-in:** No additional configuration needed
3. **File-based Routing:** Expo Router provides Next.js-style routing that's intuitive and scalable
4. **Multi-platform Ready:** Expo's managed workflow handles Android/iOS builds without native code
5. **Material Design 3 Compatible:** React Native Paper v5 integrates seamlessly with Expo
6. **Minimal Overhead:** Default template doesn't include unnecessary features, keeping the project lean

**Initialization Command:**

```bash
# Create new Expo project with TypeScript and Expo Router
npx create-expo-app@latest ghc-ai-doctor-app --template default@sdk-55

# Navigate to project
cd ghc-ai-doctor-app

# Install Material Design 3 UI library
npm install react-native-paper react-native-safe-area-context

# Install additional dependencies for API integration
npm install axios swr

# Install development dependencies
npm install --save-dev @types/react @types/react-native
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript enabled by default with `tsconfig.json`
- React Native 0.83 (via Expo SDK 55)
- React 19.2
- Node.js 18+ required

**Routing Solution:**
- Expo Router v4+ (file-based routing)
- Routes defined in `src/app/` directory
- `src/app/(tabs)/` for tab navigation structure
- `_layout.tsx` for app initialization and providers
- Universal deep linking support (iOS, Android, web)

**Styling Solution:**
- React Native StyleSheet (default)
- React Native Paper v5 for Material Design 3 components
- Theme provider for light/dark mode support
- No CSS-in-JS library (keeping it minimal)

**Build Tooling:**
- Expo CLI for development and builds
- Metro bundler for JavaScript bundling
- EAS Build for production builds (optional)
- Hot reloading enabled by default

**Testing Framework:**
- NOT included in starter (must be added manually)
- Recommendation: Jest + React Native Testing Library
- Will be configured in architectural decisions phase

**Code Organization:**
- `src/app/` - File-based routes (Expo Router convention)
- `src/components/` - Reusable UI components
- `src/services/` - API integration layer (OpenMRS REST)
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/constants/` - App constants and configuration

**Development Experience:**
- Fast Refresh (hot reloading) enabled
- TypeScript IntelliSense and type checking
- Expo Go app for instant device testing
- Development server with QR code scanning
- Error overlay for runtime errors

**Security & Storage:**
- Expo SecureStore for Android Keystore integration (session tokens)
- Expo Constants for environment variables
- Expo Splash Screen and App Loading

**Note:** Project initialization using these commands should be the first implementation story. The starter provides the foundation, but we'll need to add:
- Testing infrastructure (Jest + React Native Testing Library)
- API integration layer (OpenMRS REST client)
- State management (SWR for data fetching)
- Security configuration (FLAG_SECURE for clinical screens)
- Material Design 3 theming (OpenMRS O3 brand adaptation)
