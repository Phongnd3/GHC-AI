# Story 1.3: Set Up Testing Infrastructure (Jest + React Native Testing Library)

**Status:** ready-for-dev  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.3  
**Priority:** P0 - Required before any feature stories  
**Depends On:** Story 1.1 (Expo project), Story 1.2 (ESLint/Prettier/Husky)

---

## Story

As a developer,  
I want testing infrastructure configured with Jest and React Native Testing Library,  
So that I can write and run unit, component, and integration tests with coverage reporting.

---

## Acceptance Criteria

**AC1. Test runner works**  
**Given** the project has development tooling configured (Story 1.2 complete)  
**When** I run `yarn test`  
**Then** Jest runs all `*.test.ts` and `*.test.tsx` files  
**And** the run exits with code 0 when all tests pass  
**And** a sample component test passes demonstrating RNTL usage

**AC2. Watch mode works**  
**Given** Jest is configured  
**When** I run `yarn test:watch`  
**Then** Jest starts in interactive watch mode  
**And** re-runs affected tests on file save

**AC3. Coverage reporting works**  
**Given** Jest is configured with coverage thresholds  
**When** I run `yarn test:coverage`  
**Then** a coverage report is generated in `coverage/`  
**And** the report includes `text`, `lcov`, and `html` formats  
**And** Jest fails if coverage falls below configured thresholds

**AC4. TypeScript tests work**  
**Given** the project uses TypeScript strict mode  
**When** I write a test file with `.test.tsx` extension  
**Then** TypeScript types are checked in test files  
**And** `@testing-library/react-native` types are available  
**And** `@testing-library/jest-native` matchers (e.g., `toBeOnTheScreen`) are available

**AC5. Module aliases resolve in tests**  
**Given** the project uses `@/` import aliases  
**When** a test file imports `import { X } from '@/components/X'`  
**Then** Jest resolves the alias correctly without errors

**AC6. React Native modules are mocked**  
**Given** React Native has native modules that cannot run in Node.js  
**When** tests run in the Jest environment  
**Then** `react-native` modules are handled by the React Native Jest preset  
**And** Expo modules (e.g., `expo-secure-store`, `expo-router`) are mocked  
**And** no "native module not found" errors occur

**AC7. Pre-commit hook runs related tests**  
**Given** Husky + lint-staged is configured (Story 1.2)  
**When** I commit a `.ts` or `.tsx` file  
**Then** `jest --bail --findRelatedTests` runs for staged files  
**And** the commit is blocked if related tests fail

---

## Tasks / Subtasks

- [ ] **Task 1: Install testing dependencies** (AC: #1, #4)
  - [ ] Install `jest@^29.0.0` as devDependency
  - [ ] Install `@testing-library/react-native@^13.0.0` as devDependency
  - [ ] Install `@testing-library/jest-native@^5.4.0` as devDependency
  - [ ] Install `@types/jest@^29.0.0` as devDependency
  - [ ] Install `jest-expo` as devDependency (Expo's Jest preset — handles RN transforms)
  - [ ] Verify no peer dependency conflicts

- [ ] **Task 2: Create Jest configuration** (AC: #1, #3, #5, #6)
  - [ ] Create `jest.config.js` at project root
  - [ ] Set `preset: 'jest-expo'`
  - [ ] Configure `moduleNameMapper` for `@/` aliases
  - [ ] Configure `setupFilesAfterFramework` to import `@testing-library/jest-native/extend-expect`
  - [ ] Configure `collectCoverageFrom` to include `src/**/*.{ts,tsx}` and exclude `*.d.ts`, `src/app/` routes
  - [ ] Configure `coverageThreshold` per architecture targets
  - [ ] Configure `coverageReporters: ['text', 'lcov', 'html']`
  - [ ] Configure `transformIgnorePatterns` to allow Expo/RN module transforms

- [ ] **Task 3: Create Jest setup file** (AC: #4, #6)
  - [ ] Create `jest.setup.ts` at project root
  - [ ] Import `@testing-library/jest-native/extend-expect`
  - [ ] Add mock for `expo-router` (`useRouter`, `useLocalSearchParams`, `router`)
  - [ ] Add mock for `expo-secure-store`
  - [ ] Add mock for `@expo/vector-icons`

- [ ] **Task 4: Add test scripts to package.json** (AC: #1, #2, #3)
  - [ ] Add `"test": "jest"` script
  - [ ] Add `"test:watch": "jest --watch"` script
  - [ ] Add `"test:coverage": "jest --coverage"` script
  - [ ] Verify lint-staged config in package.json includes `jest --bail --findRelatedTests` for `.ts,.tsx` files

- [ ] **Task 5: Write sample tests demonstrating patterns** (AC: #1, #4, #5)
  - [ ] Create `src/utils/__tests__/errorHandler.test.ts` — unit test for `mapErrorToUserMessage` (stub the function if Story 1.6 not done)
  - [ ] Create `src/components/__tests__/SampleComponent.test.tsx` — component test using `render`, `screen`, `userEvent`
  - [ ] Verify both tests pass with `yarn test`

- [ ] **Task 6: Verify full setup** (AC: #1–#7)
  - [ ] Run `yarn test` — all tests pass
  - [ ] Run `yarn test:coverage` — coverage report generated, thresholds met
  - [ ] Run `npx tsc --noEmit` — no TypeScript errors in test files
  - [ ] Stage a test file and commit — pre-commit hook runs related tests

---

## Dev Notes

### Technical Context

**Architecture Requirements Addressed:**
- **ARCH-REQ-8:** Testing framework — Jest v29+ with React Native Testing Library v13+
- **ARCH-REQ-9:** Coverage targets — 90% API layer, 80% UI components, 100% critical paths

**Dependency Versions (pinned):**

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-expo": "^51.0.0",
    "@testing-library/react-native": "^13.0.0",
    "@testing-library/jest-native": "^5.4.3",
    "@types/jest": "^29.5.0"
  }
}
```

> **NOTE:** `jest-expo` version must align with the Expo SDK version in use (SDK 54 → `jest-expo@^51`). Check `npx expo install jest-expo` to get the correct version for the installed SDK.

---

### Jest Configuration (jest.config.js)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // Setup file runs after the test framework is installed
  setupFilesAfterFramework: ['./jest.setup.ts'],

  // Module alias resolution — mirrors tsconfig.json paths
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
  },

  // Allow Expo and React Native packages to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',          // Exclude route files (integration tested separately)
    '!src/**/__tests__/**', // Exclude test files themselves
    '!src/**/__mocks__/**',
  ],

  coverageThreshold: {
    // Overall project floor
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // API layer: 90% target (ARCH-REQ-8)
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // UI components: 80% target (ARCH-REQ-8)
    './src/components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Utils (includes errorHandler — critical path): 100%
    './src/utils/errorHandler.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',

  testPathPattern: '.*\\.test\\.(ts|tsx)$',
};
```

> **CRITICAL:** The key is `setupFilesAfterFramework` (not `setupFiles`). Using `setupFiles` will fail because `@testing-library/jest-native/extend-expect` requires the Jest expect object to be available.

---

### Jest Setup File (jest.setup.ts)

```typescript
// jest.setup.ts
import '@testing-library/jest-native/extend-expect';

// Mock expo-router — prevents "Cannot find native module 'ExpoRouter'" errors
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-secure-store — no native Keystore in test environment
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock @expo/vector-icons — prevents font loading errors
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons',
}));
```

---

### transformIgnorePatterns Explanation

React Native and Expo packages ship as ES modules (not CommonJS). Jest runs in Node.js which requires CommonJS. The `transformIgnorePatterns` config tells Jest which `node_modules` to transform through Babel:

- **Default:** Jest ignores all `node_modules` (no transform)
- **Required:** Expo/RN packages must be transformed
- **Pattern:** Negate the packages that need transformation using `(?!...)`

The `jest-expo` preset sets a sensible default, but if you add new Expo packages that fail with "SyntaxError: Cannot use import statement", add them to the negation list.

---

### Coverage Targets (from ARCH-REQ-8, ARCH-REQ-9)

| Layer | Target | Rationale |
|-------|--------|-----------|
| API services (`src/services/`) | 90% | Business logic, data transforms, error handling |
| UI components (`src/components/`) | 80% | Rendering, prop handling, user interactions |
| Critical paths (login, patient list, clinical summary) | 100% | Patient safety — zero untested paths |
| Utils (`src/utils/errorHandler.ts`) | 100% | Error mapping is a critical path |
| Overall project | 80% | Baseline quality floor |

---

### Sample Unit Test (src/utils/\_\_tests\_\_/errorHandler.test.ts)

This test demonstrates the unit test pattern for utility functions. If `errorHandler.ts` doesn't exist yet (Story 1.6), create a stub:

```typescript
// src/utils/__tests__/errorHandler.test.ts
import { mapErrorToUserMessage } from '@/utils/errorHandler';

// Stub if Story 1.6 not yet implemented:
// jest.mock('@/utils/errorHandler', () => ({
//   mapErrorToUserMessage: jest.fn((error) => 'Something went wrong.'),
// }));

describe('mapErrorToUserMessage', () => {
  it('returns network error message when no response', () => {
    const error = { response: undefined } as any;
    expect(mapErrorToUserMessage(error)).toBe(
      'No internet connection. Please check your WiFi.'
    );
  });

  it('returns session expired message for 401', () => {
    const error = { response: { status: 401 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Session expired. Please log in again.');
  });

  it('returns server unavailable message for 500', () => {
    const error = { response: { status: 500 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Server unavailable. Please try again.');
  });

  it('returns server unavailable message for 503', () => {
    const error = { response: { status: 503 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Server unavailable. Please try again.');
  });

  it('returns timeout message for 408', () => {
    const error = { response: { status: 408 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Request timed out. Please try again.');
  });

  it('returns generic message for unknown status', () => {
    const error = { response: { status: 422 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Something went wrong. Please try again.');
  });
});
```

---

### Sample Component Test (src/components/\_\_tests\_\_/SampleComponent.test.tsx)

This test demonstrates the RNTL component test pattern all future component tests must follow:

```typescript
// src/components/__tests__/SampleComponent.test.tsx
import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

jest.useFakeTimers(); // Required when using userEvent

// Inline sample component — replace with real component imports in future tests
function SampleButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    </View>
  );
}

describe('SampleButton', () => {
  it('renders the label', () => {
    render(<SampleButton label="Tap me" onPress={jest.fn()} />);
    expect(screen.getByText('Tap me')).toBeOnTheScreen();
  });

  it('calls onPress when tapped', async () => {
    const mockPress = jest.fn();
    const user = userEvent.setup();

    render(<SampleButton label="Tap me" onPress={mockPress} />);
    await user.press(screen.getByRole('button', { name: 'Tap me' }));

    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
```

---

### RNTL v13 Key Patterns (from latest docs)

**Always use `screen` object — never destructure from `render`:**

```typescript
// ✅ Correct
render(<MyComponent />);
screen.getByText('Hello');

// ❌ Wrong — deprecated pattern
const { getByText } = render(<MyComponent />);
getByText('Hello');
```

**Always use `userEvent` for interactions — not `fireEvent`:**

```typescript
// ✅ Correct — simulates real user behavior including timing
const user = userEvent.setup();
await user.press(screen.getByRole('button'));
await user.type(screen.getByLabelText('Email'), 'test@example.com');

// ❌ Avoid for new tests — fireEvent is synchronous and less realistic
fireEvent.press(screen.getByRole('button'));
```

**Always `jest.useFakeTimers()` when using `userEvent`:**

```typescript
// At the top of any test file using userEvent
jest.useFakeTimers();
```

**Use `waitFor` for async state updates:**

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeOnTheScreen();
});
```

**Use `toBeOnTheScreen()` matcher (from jest-native):**

```typescript
// ✅ Correct — checks element is in the rendered tree
expect(screen.getByText('Hello')).toBeOnTheScreen();

// ❌ Avoid — toBeTruthy doesn't verify DOM presence
expect(screen.getByText('Hello')).toBeTruthy();
```

---

### Test File Structure (from implementation-patterns-consistency-rules.md)

```
src/
├── components/
│   ├── PatientCard.tsx
│   └── __tests__/
│       └── PatientCard.test.tsx      ← colocated, not in root tests/
├── services/
│   ├── api/
│   │   ├── auth.ts
│   │   └── __tests__/
│   │       └── auth.test.ts
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── utils/
    ├── errorHandler.ts
    └── __tests__/
        └── errorHandler.test.ts
```

**Rules:**
- Test files: `*.test.ts` or `*.test.tsx` — never `*.spec.*`
- Location: `__tests__/` folder next to source — never a root `tests/` directory
- Mock files: `__mocks__/` folder next to source

---

### Architecture Compliance

**ARCH-REQ-8:** Testing Framework  
- ✅ Jest v29+ with `jest-expo` preset
- ✅ React Native Testing Library v13+
- ✅ `@testing-library/jest-native` for custom matchers

**ARCH-REQ-9:** Coverage Targets  
- ✅ 90% threshold on `src/services/`
- ✅ 80% threshold on `src/components/`
- ✅ 100% threshold on `src/utils/errorHandler.ts` (critical path)
- ✅ 80% global floor

**Implementation Patterns:**  
- ✅ Tests colocated in `__tests__/` folders
- ✅ Test files named `*.test.ts` / `*.test.tsx`
- ✅ `screen` object used (not destructured queries)
- ✅ `userEvent` used for interactions (not `fireEvent`)
- ✅ `jest.useFakeTimers()` in files using `userEvent`

---

## Previous Story Intelligence

**From Story 1.1 (Expo project initialization):**
- Expo SDK 54 is in use (not 55 as originally specified) — use `jest-expo@^51` not `jest-expo@^52`
- `babel-preset-expo` must be in `devDependencies` explicitly — already done in Story 1.1
- `babel.config.js` uses `babel-preset-expo` preset — Jest transform will use this same config
- Import aliases are configured in both `tsconfig.json` and `babel.config.js` — `moduleNameMapper` in Jest must mirror these exactly

**From Story 1.2 (ESLint/Prettier/Husky):**
- `lint-staged` is configured in `package.json` — add `jest --bail --findRelatedTests` to the `.ts,.tsx` entry
- Husky pre-commit hook is at `.husky/pre-commit` — no changes needed there, lint-staged handles it
- `package.json` already has `lint`, `format`, `type-check` scripts — add `test`, `test:watch`, `test:coverage` alongside them

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use `jest-expo` preset — not `react-native` preset**
   - `jest-expo` handles Expo-specific transforms and module resolution
   - `react-native` preset will fail on Expo modules

2. **`setupFilesAfterFramework` — not `setupFiles`**
   - `@testing-library/jest-native/extend-expect` requires Jest's `expect` to exist first
   - Using `setupFiles` will throw "expect is not defined"

3. **`moduleNameMapper` must exactly mirror `tsconfig.json` paths**
   - If aliases differ, tests will fail with "Cannot find module '@/...'"
   - Check `tsconfig.json` paths section and copy them verbatim

4. **`transformIgnorePatterns` must include all Expo packages**
   - Missing a package causes "SyntaxError: Cannot use import statement"
   - The pattern in this story covers all packages used in Epic 1

5. **`jest.useFakeTimers()` in every file using `userEvent`**
   - `userEvent` simulates real timing — fake timers prevent test timeouts
   - Place at file top level, not inside `beforeEach`

6. **Never use `fireEvent` for new tests**
   - `userEvent` is the RNTL v13 standard
   - `fireEvent` is kept for backward compatibility only

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** use `@testing-library/react` — this is React Native, use `@testing-library/react-native`
2. **DO NOT** destructure queries from `render` — always use `screen`
3. **DO NOT** create a root-level `tests/` or `__tests__/` directory — colocate tests
4. **DO NOT** use `*.spec.*` file extensions — use `*.test.*` only
5. **DO NOT** import `react-native-paper` components in tests without wrapping in `PaperProvider`
6. **DO NOT** set `coverageThreshold` below the architecture targets — they are non-negotiable

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ `yarn test` runs and all sample tests pass
2. ✅ `yarn test:watch` starts interactive watch mode
3. ✅ `yarn test:coverage` generates report in `coverage/` directory
4. ✅ Coverage thresholds are configured (may not be met until feature stories add code)
5. ✅ `@/` aliases resolve correctly in test files
6. ✅ Expo module mocks prevent native module errors
7. ✅ `npx tsc --noEmit` passes with no errors in test files
8. ✅ Pre-commit hook runs related tests on staged `.ts/.tsx` files
9. ✅ Code committed: `"feat: configure Jest and React Native Testing Library (Story 1.3)"`

---

## References

**Source Documents:**
- [Epic 1: Project Foundation & Core Infrastructure](_bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md)
- [Architecture: Core Architectural Decisions — Testing Strategy section](_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md)
- [Architecture: Implementation Patterns — Test Organization section](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)
- [Story 1.1: Initialize Expo Project](_bmad-output/implementation-artifacts/stories/epic-1/story-1.1-initialize-expo-project.md)

**External Documentation (latest as of story creation):**
- [React Native Testing Library v13 docs](https://callstack.github.io/react-native-testing-library/)
- [jest-expo documentation](https://docs.expo.dev/develop/unit-testing/)
- [Jest v29 configuration reference](https://jestjs.io/docs/configuration)
- [@testing-library/jest-native matchers](https://github.com/testing-library/jest-native)

---

## Dev Agent Record

*To be filled in by the implementing agent.*

### Agent Model Used

_TBD_

### Completion Checklist

- [ ] All tasks completed
- [ ] All acceptance criteria verified
- [ ] `yarn test` passes
- [ ] `yarn test:coverage` generates report
- [ ] TypeScript compilation passes
- [ ] Pre-commit hook verified

### Files Created/Modified

**To be created:**
- `jest.config.js` — Jest configuration
- `jest.setup.ts` — Setup file with mocks and matchers
- `src/utils/__tests__/errorHandler.test.ts` — Sample unit test
- `src/components/__tests__/SampleComponent.test.tsx` — Sample component test

**To be modified:**
- `package.json` — Add test scripts and jest devDependencies
- `package.json` — Update lint-staged to include jest for `.ts,.tsx` files

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** Stories 1.4–1.8 (all feature stories require testing infrastructure)  
**Blocked By:** Story 1.1 (Expo project), Story 1.2 (Husky/lint-staged)  
**Estimated Effort:** 1–2 hours
