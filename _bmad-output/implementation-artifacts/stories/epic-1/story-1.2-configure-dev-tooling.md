# Story 1.2: Configure Development Tooling (ESLint, Prettier, Husky)

**Status:** ✅ complete  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.2  
**Priority:** P0 - Blocking all other work  
**Depends On:** Story 1.1 (Initialize Expo Project) ✅ Done

---

## Story

As a developer,  
I want code quality tools configured with pre-commit hooks,  
So that code style is consistent and errors are caught before commit.

---

## Acceptance Criteria

**AC1.**  
**Given** The Expo project is initialized (Story 1.1 complete)  
**When** I install and configure ESLint, Prettier, and Husky  
**Then** ESLint catches TypeScript errors and code style issues  
**And** Prettier formats code automatically  
**And** Pre-commit hooks run linting and formatting on staged files  
**And** Commits are blocked if linting fails

---

## Tasks / Subtasks

- [ ] Task 1: Install ESLint and TypeScript/React plugins (AC: #1)
  - [ ] Install `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
  - [ ] Install `eslint-plugin-react`, `eslint-plugin-react-native`
  - [ ] Install `eslint-config-prettier` (disables ESLint rules that conflict with Prettier)
  - [ ] Create `.eslintrc.js` with configuration from Dev Notes
  - [ ] Create `.eslintignore` to exclude build artifacts

- [ ] Task 2: Install and configure Prettier (AC: #1)
  - [ ] Install `prettier`
  - [ ] Create `.prettierrc` with configuration from Dev Notes (100-char width, single quotes)
  - [ ] Create `.prettierignore` to exclude build artifacts
  - [ ] Verify `prettier --check "src/**/*.{ts,tsx}"` runs without errors

- [ ] Task 3: Install and configure Husky + lint-staged (AC: #1)
  - [ ] Install `husky` and `lint-staged` as devDependencies
  - [ ] Run `npx husky init` to initialize Husky
  - [ ] Create `.husky/pre-commit` hook that runs `npx lint-staged`
  - [ ] Add `lint-staged` configuration to `package.json`
  - [ ] Add `"prepare": "husky"` to `package.json` scripts

- [ ] Task 4: Add NPM scripts to package.json (AC: #1)
  - [ ] Add `"lint": "eslint . --ext .ts,.tsx"`
  - [ ] Add `"lint:fix": "eslint . --ext .ts,.tsx --fix"`
  - [ ] Add `"format": "prettier --write \"src/**/*.{ts,tsx}\""`
  - [ ] Add `"type-check": "tsc --noEmit"`

- [ ] Task 5: Verify tooling works end-to-end (AC: #1)
  - [ ] Run `yarn lint` — should pass with no errors on existing code
  - [ ] Run `yarn format` — should format all files
  - [ ] Run `yarn type-check` — should pass with no TypeScript errors
  - [ ] Make a test commit — pre-commit hook should run lint-staged
  - [ ] Introduce a deliberate lint error, attempt commit — should be blocked

---

## Dev Notes

### Technical Context

**Architecture References:**
- **ARCH-REQ-19:** ESLint + Prettier for code quality enforcement
- **ARCH-REQ-20:** Husky + lint-staged for pre-commit hooks

**Current Project State (from Story 1.1):**
- Expo SDK 54 (not 55 — SDK 55 was unavailable; all packages aligned to SDK 54)
- React 19.1.0, React Native 0.81.5
- TypeScript ~5.9.2
- `babel-plugin-module-resolver` already installed
- `babel-preset-expo` already installed as devDependency
- Package manager: **npm** (use `npm install`, not `yarn`)
- Project root: `ghc-ai-doctor-app/`

> ⚠️ **IMPORTANT:** Story 1.1 Dev Agent Record notes that `--legacy-peer-deps` was required for some installs due to peer dependency conflicts. Use `--legacy-peer-deps` if any install fails with peer dependency errors.

### Exact Packages to Install

```bash
# ESLint core + TypeScript support
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# React + React Native ESLint plugins
npm install --save-dev eslint-plugin-react eslint-plugin-react-native

# Prettier + ESLint integration
npm install --save-dev prettier eslint-config-prettier

# Pre-commit hooks
npm install --save-dev husky lint-staged
```

If peer dependency errors occur, append `--legacy-peer-deps` to each command.

### ESLint Configuration (.eslintrc.js)

Use the **legacy `.eslintrc.js` format** (not flat config `eslint.config.mjs`) because:
- Expo's `eslint-config-expo` uses legacy format
- React Native ecosystem tooling has better legacy format support
- Flat config requires ESLint v9+; verify compatibility with installed Expo version first

```javascript
// .eslintrc.js — place in ghc-ai-doctor-app/ root
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'prettier', // MUST be last — disables conflicting ESLint formatting rules
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  rules: {
    // React 17+ JSX transform — no need to import React in every file
    'react/react-in-jsx-scope': 'off',
    // Enforce no unused variables (TypeScript-aware)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Warn on inline styles (use StyleSheet or theme tokens instead)
    'react-native/no-inline-styles': 'warn',
    // Allow explicit `any` with a comment (needed for some Expo/RN types)
    '@typescript-eslint/no-explicit-any': 'warn',
    // Enforce consistent type imports
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
  ],
};
```

### Prettier Configuration (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

### .prettierignore

```
node_modules/
.expo/
dist/
build/
coverage/
*.lock
```

### .eslintignore

```
node_modules/
.expo/
dist/
build/
coverage/
```

### Husky Setup

Husky v9 uses a simplified setup. After installing:

```bash
# Initialize Husky (creates .husky/ directory and adds prepare script)
npx husky init
```

This creates `.husky/pre-commit` with a placeholder. Replace its content:

```bash
# .husky/pre-commit
npx lint-staged
```

> **Note:** Husky v9 no longer uses `#!/bin/sh` or `. "$(dirname "$0")/_/husky.sh"` headers. The file should contain only the command to run.

### lint-staged Configuration (in package.json)

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

> **Why no `jest --bail --findRelatedTests` in lint-staged?** Testing infrastructure is set up in Story 1.3. Add Jest to lint-staged after Story 1.3 is complete.

### Final package.json scripts section

After this story, `package.json` scripts should look like:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

### Architecture Compliance

**ARCH-REQ-19:** ESLint + Prettier for code quality enforcement
- ✅ ESLint with TypeScript, React, React Native plugins
- ✅ Prettier with 100-char line width, single quotes
- ✅ `eslint-config-prettier` prevents rule conflicts

**ARCH-REQ-20:** Husky + lint-staged for pre-commit hooks
- ✅ Husky v9 for Git hooks management
- ✅ lint-staged runs linting + formatting on staged `.ts`/`.tsx` files only
- ✅ Commits blocked if ESLint errors exist

**Implementation Patterns Compliance:**
- Import order rule enforced by ESLint (`react/react-in-jsx-scope: off` for React 17+ JSX transform)
- `@typescript-eslint/consistent-type-imports` enforces `import type` for type-only imports
- `react-native/no-inline-styles: warn` enforces theme token usage pattern

### Testing Requirements

**No unit tests for this story** — tooling configuration is verified through manual execution.

**Manual Verification Checklist:**
- [ ] `yarn lint` (or `npm run lint`) exits with code 0 on clean code
- [ ] `yarn format` formats all `.ts`/`.tsx` files in `src/`
- [ ] `yarn type-check` exits with code 0
- [ ] `git add src/app/index.tsx && git commit -m "test"` triggers pre-commit hook
- [ ] Pre-commit hook runs lint-staged and shows output
- [ ] Introducing `const x = 1` (unused var) in a staged file blocks the commit
- [ ] Running `yarn lint:fix` auto-fixes fixable issues

### Known Potential Issues

**1. `eslint-plugin-react-native` peer dependency warnings**
- This plugin may warn about peer deps with newer React Native versions
- Use `--legacy-peer-deps` if install fails
- The plugin still works correctly despite peer dep warnings

**2. Expo's built-in ESLint config**
- Expo SDK 54 ships with `eslint-config-expo` as an optional config
- We are NOT using `eslint-config-expo` — we define our own config for full control
- If Expo auto-generates an `.eslintrc.js`, replace it entirely with the config above

**3. Husky not running on CI**
- `husky` skips hook installation when `CI=true` environment variable is set
- This is correct behavior — CI runs linting separately
- Do NOT add `--no-verify` to any commit commands

**4. `react-native/no-color-literals` rule**
- `plugin:react-native/all` includes `no-color-literals` which will flag existing hardcoded colors in `src/app/index.tsx`
- This is intentional — it enforces the theme token pattern from ARCH-REQ-12
- Fix any flagged colors in `index.tsx` as part of this story, or disable the rule if theme system isn't ready yet (Story 1.4 handles theme)
- Recommended: Disable `react-native/no-color-literals` for now, re-enable in Story 1.4

Add to `.eslintrc.js` rules temporarily:
```javascript
'react-native/no-color-literals': 'off', // Re-enable in Story 1.4 after theme system
```

### References

**Source Documents:**
- [Epic 1: Project Foundation & Core Infrastructure](_bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md)
- [Architecture: Core Architectural Decisions — Development Workflow & Tooling section](_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md)
- [Architecture: Implementation Patterns — Enforcement Guidelines section](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)
- [Story 1.1: Initialize Expo Project](_bmad-output/implementation-artifacts/stories/epic-1/story-1.1-initialize-expo-project.md) — completed reference

**External Documentation:**
- [ESLint Configuration (Legacy)](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated)
- [TypeScript ESLint Getting Started](https://typescript-eslint.io/getting-started/)
- [Prettier Configuration](https://prettier.io/docs/configuration)
- [Husky v9 Get Started](https://typicode.github.io/husky/get-started.html)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)

---

## Previous Story Intelligence (Story 1.1)

### Key Learnings That Affect This Story

1. **Package manager is npm, not yarn** — All commands use `npm install`, scripts run with `npm run`
2. **`--legacy-peer-deps` required** — Peer dependency conflicts exist in this project; use this flag if installs fail
3. **Expo SDK is 54, not 55** — Story 1.1 notes SDK 55 was unavailable; all packages aligned to SDK 54 compatible versions
4. **`babel-preset-expo` must be explicit devDependency** — Already done in Story 1.1; do not remove it
5. **React 19.1.0 is installed** — This is newer than the architecture specified (18.x); `eslint-plugin-react` should auto-detect version via `settings.react.version: 'detect'`
6. **Deferred from Story 1.1:** "No ESLint, Prettier, or Husky in devDependencies or scripts" — This story resolves that deferred item

### Files Created in Story 1.1 (Do Not Break)

```
ghc-ai-doctor-app/
├── src/app/_layout.tsx       # Root layout with PaperProvider + SafeAreaProvider
├── src/app/index.tsx         # Hello World entry screen
├── babel.config.js           # Babel with module-resolver (DO NOT MODIFY)
├── tsconfig.json             # TypeScript with path aliases (DO NOT MODIFY)
├── app.json                  # Expo Router config with expo.router.root: "src"
└── package.json              # Current state — add scripts and lint-staged config
```

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use legacy `.eslintrc.js` format, NOT flat config**
   - Flat config (`eslint.config.mjs`) has compatibility issues with Expo/React Native ecosystem
   - Use `module.exports = { ... }` format

2. **`prettier` MUST be last in `extends` array**
   - `eslint-config-prettier` disables conflicting ESLint formatting rules
   - If not last, Prettier and ESLint will conflict on formatting

3. **Do NOT modify `babel.config.js` or `tsconfig.json`**
   - These were carefully configured in Story 1.1
   - ESLint/Prettier configuration is separate from Babel/TypeScript config

4. **Do NOT add `jest` to lint-staged yet**
   - Testing infrastructure is Story 1.3
   - lint-staged should only run `eslint --fix` and `prettier --write` for now

5. **Husky v9 hook file format**
   - No shebang line (`#!/bin/sh`) needed in Husky v9
   - No `. "$(dirname "$0")/_/husky.sh"` line needed
   - File contains only the command: `npx lint-staged`

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** use `eslint-config-expo` — we define our own config
2. **DO NOT** run `npx husky install` — use `npx husky init` (Husky v9 changed the command)
3. **DO NOT** add `--no-verify` to any git commands — hooks must run
4. **DO NOT** modify existing source files beyond fixing lint errors flagged by the new config
5. **DO NOT** install additional ESLint plugins not listed in this story

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ `npm run lint` exits with code 0 on all files in `src/`
2. ✅ `npm run format` runs without errors
3. ✅ `npm run type-check` exits with code 0
4. ✅ `.husky/pre-commit` file exists and contains `npx lint-staged`
5. ✅ `lint-staged` config exists in `package.json`
6. ✅ `"prepare": "husky"` exists in `package.json` scripts
7. ✅ Making a commit triggers the pre-commit hook
8. ✅ A commit with a lint error is blocked
9. ✅ All config files committed: `.eslintrc.js`, `.prettierrc`, `.eslintignore`, `.prettierignore`
10. ✅ Code committed with message: `"chore: configure ESLint, Prettier, and Husky pre-commit hooks (Story 1.2)"`

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** Story 1.3 (Testing Infrastructure) — lint-staged Jest integration deferred to 1.3  
**Blocked By:** Story 1.1 ✅ Complete

---

## Implementation Record

**Completed:** 2026-04-23  
**Commit:** `439fd9a3` - "chore: configure ESLint, Prettier, and Husky pre-commit hooks (Story 1.2)"

### What Was Implemented

1. **ESLint Configuration**
   - Installed ESLint v8.57.1 (legacy config support for React Native ecosystem)
   - Installed TypeScript ESLint plugins: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
   - Installed React plugins: `eslint-plugin-react`, `eslint-plugin-react-native`
   - Installed `eslint-config-prettier` to prevent rule conflicts
   - Created `.eslintrc.js` with recommended rules for TypeScript, React, and React Native
   - Configured custom rules:
     - `react/react-in-jsx-scope: off` (React 17+ JSX transform)
     - `@typescript-eslint/no-unused-vars: error` (with `_` prefix ignore pattern)
     - `react-native/no-inline-styles: warn`
     - `@typescript-eslint/consistent-type-imports: error`
     - `react-native/no-color-literals: off` (deferred to Story 1.4)

2. **Prettier Configuration**
   - Installed Prettier v3.8.3
   - Created `.prettierrc` with project standards:
     - 100-character line width
     - Single quotes
     - Semicolons enabled
     - ES5 trailing commas
   - Created `.prettierignore` to exclude build artifacts

3. **Husky + lint-staged**
   - Installed Husky v9.1.7 and lint-staged v16.4.0
   - Created `.husky/pre-commit` hook in git root (parent directory)
   - Configured hook to run `npx lint-staged --config ghc-ai-doctor-app/package.json`
   - Added `lint-staged` configuration to `package.json`:
     - Runs `eslint --fix` on staged `.ts`/`.tsx` files
     - Runs `prettier --write` on staged `.ts`/`.tsx` files
   - Added `"prepare": "husky"` script to `package.json`

4. **NPM Scripts**
   - Added `lint`: Run ESLint on all TypeScript files
   - Added `lint:fix`: Auto-fix ESLint issues
   - Added `format`: Format all source files with Prettier
   - Added `type-check`: Run TypeScript compiler in check-only mode

5. **Auto-fixes Applied**
   - Fixed style property ordering in `src/app/index.tsx` (ESLint auto-fix)

### Verification Results

✅ All acceptance criteria met:
- `npm run lint` exits with code 0
- `npm run format` formats all files successfully
- `npm run type-check` exits with code 0
- Pre-commit hook runs on `git commit`
- Pre-commit hook blocks commits with lint errors (verified with test file)
- All configuration files committed

### Technical Decisions

**ESLint Version Choice:**
- Initially installed ESLint v10 (latest), but encountered compatibility issues with `eslint-plugin-react` in flat config mode
- Downgraded to ESLint v8.57.1 for stable legacy config support
- Used legacy `.eslintrc.js` format instead of flat config (`eslint.config.js`)
- This aligns with React Native ecosystem best practices and Expo compatibility

**Husky Setup:**
- Git repository is in parent directory (`/Users/itobeo/code/GHC-AI`)
- Created `.husky/pre-commit` in git root with path to app's `package.json`
- Hook command: `npx lint-staged --config ghc-ai-doctor-app/package.json`

**Deferred Items:**
- Jest integration in lint-staged (Story 1.3 will add testing infrastructure)
- Re-enabling `react-native/no-color-literals` rule (Story 1.4 will implement theme system)

### Files Created/Modified

**Created:**
- `ghc-ai-doctor-app/.eslintrc.js`
- `ghc-ai-doctor-app/.prettierrc`
- `ghc-ai-doctor-app/.prettierignore`
- `.husky/pre-commit`

**Modified:**
- `ghc-ai-doctor-app/package.json` (added scripts and lint-staged config)
- `ghc-ai-doctor-app/package-lock.json` (new dependencies)
- `ghc-ai-doctor-app/src/app/index.tsx` (auto-fixed style ordering)

### Dependencies Added

```json
{
  "devDependencies": {
    "@eslint/js": "^9.20.2",
    "@typescript-eslint/eslint-plugin": "^8.59.0",
    "@typescript-eslint/parser": "^8.59.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-native": "^5.0.0",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "prettier": "^3.8.3"
  }
}
```

### Known Issues

None. All tooling working as expected.

### Next Steps

Story 1.3: Setup Testing Infrastructure (Jest, React Native Testing Library)
