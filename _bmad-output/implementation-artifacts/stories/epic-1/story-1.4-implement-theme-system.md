# Story 1.4: Implement Theme System (Colors, Typography, Spacing)

**Status:** ready-for-dev  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.4  
**Priority:** P0 - Blocking all UI component work  
**Depends On:** Story 1.1 (Initialize Expo Project) ✅ Done

---

## Story

As a developer,  
I want a complete theme system with OpenMRS O3 brand colors, Material Design 3 typography, and 8dp grid spacing,  
So that all UI components use consistent design tokens with no hardcoded values.

---

## Acceptance Criteria

**AC1.**  
**Given** the project structure is set up with `src/theme/` directory  
**When** I create `src/theme/colors.ts`  
**Then** it exports `OpenMRSColors` with the full Teal palette (teal10–teal100)  
**And** it exports `ClinicalColors` with error `#da1e28`, success `#24a148`, warning `#f1c21b`, info `#0043ce`  
**And** it exports `BaseColors` with text, background, surface, and border tokens  

**AC2.**  
**Given** the colors file exists  
**When** I create `src/theme/typography.ts`  
**Then** it exports a `Typography` object with Material Design 3 type scale entries  
**And** each entry specifies `fontSize`, `lineHeight`, `fontWeight`, and `fontFamily` using IBM Plex Sans  
**And** entries cover: `displayLarge`, `headlineLarge`, `headlineMedium`, `titleLarge`, `bodyLarge`, `bodyMedium`, `labelLarge`  

**AC3.**  
**Given** the colors file exists  
**When** I create `src/theme/spacing.ts`  
**Then** it exports a `Spacing` object following the 8dp grid  
**And** values are: `xs:2`, `sm:4`, `md:8`, `lg:12`, `xl:16`, `xxl:24`, `xxxl:32`, `huge:48`, `massive:64`  

**AC4.**  
**Given** colors, typography, and spacing files exist  
**When** I create `src/theme/theme.ts`  
**Then** it exports `customTheme` extending `MD3LightTheme` from React Native Paper  
**And** `customTheme.colors.primary` is `#005d5d` (Teal 60)  
**And** `customTheme.colors.secondary` is `#007d79` (Teal 50)  
**And** `customTheme.colors.error` is `#da1e28`  

**AC5.**  
**Given** the theme is complete  
**When** I update `src/app/_layout.tsx`  
**Then** `PaperProvider` receives `customTheme` as its `theme` prop  
**And** the existing Hello World screen renders without errors  
**And** no hardcoded color, font size, or spacing values exist in any theme file  

---

## Tasks / Subtasks

- [ ] Task 1: Create `src/theme/colors.ts` (AC: #1)
  - [ ] Export `OpenMRSColors` with brand01/brand02/brand03 and full teal10–teal100 palette
  - [ ] Export `ClinicalColors` with error, success, warning, info, allergyAlert, medicationInfo, vitalsNormal, vitalsAbnormal, emptyState
  - [ ] Export `BaseColors` with textPrimary, textSecondary, textHelper, textDisabled, textInverse, background, surface, layer01–03, borderSubtle, borderStrong, borderInteractive

- [ ] Task 2: Create `src/theme/typography.ts` (AC: #2)
  - [ ] Define `FontFamily` constants for IBMPlexSans-Regular and IBMPlexSans-SemiBold
  - [ ] Export `Typography` object with all 7 MD3 type scale entries
  - [ ] Each entry typed as `{ fontSize: number; lineHeight: number; fontWeight: string; fontFamily: string }`

- [ ] Task 3: Create `src/theme/spacing.ts` (AC: #3)
  - [ ] Export `Spacing` object with all 9 scale values (xs through massive)
  - [ ] Add `SpacingKey` type for type-safe spacing references

- [ ] Task 4: Create `src/theme/theme.ts` (AC: #4)
  - [ ] Import `MD3LightTheme` from `react-native-paper`
  - [ ] Import `OpenMRSColors`, `ClinicalColors`, `BaseColors` from `./colors`
  - [ ] Export `customTheme` with full MD3 color mapping
  - [ ] Export `AppTheme` type: `typeof customTheme`

- [ ] Task 5: Create `src/theme/index.ts` barrel export (AC: #4, #5)
  - [ ] Re-export everything from colors, typography, spacing, theme

- [ ] Task 6: Wire theme into root layout (AC: #5)
  - [ ] Update `src/app/_layout.tsx` to pass `customTheme` to `PaperProvider`
  - [ ] Verify app still runs with no errors

- [ ] Task 7: Write unit tests (AC: #1–#4)
  - [ ] Test that all required color keys exist and are valid hex strings
  - [ ] Test that all spacing values are positive numbers on the 8dp grid (or sub-grid)
  - [ ] Test that typography entries have all required fields
  - [ ] Test that `customTheme.colors.primary === '#005d5d'`

---

## Dev Notes

### Architecture Requirements Addressed

| Req ID | Requirement | Implementation |
|--------|-------------|----------------|
| ARCH-REQ-12 | OpenMRS O3 brand colors | `OpenMRSColors` in `colors.ts` |
| ARCH-REQ-13 | Material Design 3 typography | `Typography` in `typography.ts` |
| ARCH-REQ-14 | 8dp grid spacing | `Spacing` in `spacing.ts` |
| ARCH-REQ-28 | React Native Paper MD3 theme | `customTheme` extending `MD3LightTheme` |
| ARCH-REQ-29 | No hardcoded design values in components | Enforced by mandatory rule below |

### Previous Story Context (Story 1.3)

Story 1.3 set up Jest + React Native Testing Library. The `src/theme/` directory already exists as an empty placeholder. Tests for this story go in `src/theme/__tests__/`.

**Established patterns to follow:**
- All source files in `src/` with `@/` import aliases
- TypeScript strict mode — no `any` types
- Named exports (not default) for utility/token files
- `__tests__/` folder colocated with source

### File Structure to Create

```
src/theme/
├── colors.ts          # OpenMRS O3 brand + clinical safety colors
├── typography.ts      # Material Design 3 type scale (IBM Plex Sans)
├── spacing.ts         # 8dp grid spacing scale
├── theme.ts           # Combined MD3 theme with O3 branding
├── index.ts           # Barrel export
└── __tests__/
    └── theme.test.ts  # Token validation tests
```

### Complete Implementation

#### `src/theme/colors.ts`

```typescript
// OpenMRS O3 Brand Colors — extracted from OpenMRS web app
export const OpenMRSColors = {
  // Primary brand shortcuts
  brand01: '#005d5d', // Teal 60 — Primary
  brand02: '#004144', // Teal 70 — Secondary (darker)
  brand03: '#007d79', // Teal 50 — Accent (lighter)

  // Full Teal palette
  teal10: '#d9fbfb',
  teal20: '#9ef0f0',
  teal30: '#3ddbd9',
  teal40: '#08bdba',
  teal50: '#009d9a',
  teal60: '#005d5d',
  teal70: '#004144',
  teal80: '#007d79',
  teal90: '#022b30',
  teal100: '#081a1c',
} as const;

// Clinical safety colors — Carbon Design System + UX spec
export const ClinicalColors = {
  error: '#da1e28',         // Allergy alerts, critical errors
  success: '#24a148',       // Vitals normal, positive states
  warning: '#f1c21b',       // Vitals abnormal, warnings
  info: '#0043ce',          // Medication info, informational

  // Semantic aliases
  allergyAlert: '#da1e28',
  medicationInfo: '#0f62fe',
  vitalsNormal: '#24a148',
  vitalsAbnormal: '#f1c21b',
  emptyState: '#8d8d8d',
} as const;

// Base text, background, and border colors — Carbon White theme
export const BaseColors = {
  // Text
  textPrimary: '#161616',
  textSecondary: '#525252',
  textHelper: '#6f6f6f',
  textDisabled: 'rgba(22,22,22,0.25)',
  textInverse: '#ffffff',

  // Backgrounds
  background: '#ffffff',
  surface: '#f4f4f4',
  layer01: '#f4f4f4',
  layer02: '#ffffff',
  layer03: '#e0e0e0',

  // Borders
  borderSubtle: '#e0e0e0',
  borderStrong: '#8d8d8d',
  borderInteractive: '#0f62fe',
} as const;
```

#### `src/theme/typography.ts`

```typescript
export const FontFamily = {
  regular: 'IBMPlexSans-Regular',
  semiBold: 'IBMPlexSans-SemiBold',
} as const;

export type TypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  fontFamily: string;
};

// Material Design 3 type scale — Carbon Design System adapted
export const Typography: Record<string, TypographyStyle> = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    fontFamily: FontFamily.regular,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400',
    fontFamily: FontFamily.regular,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
    fontFamily: FontFamily.regular,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: FontFamily.semiBold,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: FontFamily.regular,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: FontFamily.regular,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: FontFamily.semiBold,
  },
} as const;
```

#### `src/theme/spacing.ts`

```typescript
// 8dp grid spacing scale — aligned with Carbon Design System
export const Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export type SpacingKey = keyof typeof Spacing;
```

#### `src/theme/theme.ts`

```typescript
import { MD3LightTheme } from 'react-native-paper';
import { OpenMRSColors, ClinicalColors, BaseColors } from './colors';

export const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: OpenMRSColors.brand01,       // #005d5d
    secondary: OpenMRSColors.brand03,     // #007d79
    tertiary: OpenMRSColors.brand02,      // #004144
    error: ClinicalColors.error,          // #da1e28
    background: BaseColors.background,
    surface: BaseColors.surface,
    onPrimary: BaseColors.textInverse,
    onSecondary: BaseColors.textInverse,
    onBackground: BaseColors.textPrimary,
    onSurface: BaseColors.textPrimary,
    onError: BaseColors.textInverse,
  },
} as const;

export type AppTheme = typeof customTheme;
```

#### `src/theme/index.ts`

```typescript
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './theme';
```

#### Updated `src/app/_layout.tsx`

```typescript
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { customTheme } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

#### `src/theme/__tests__/theme.test.ts`

```typescript
import { OpenMRSColors, ClinicalColors, BaseColors } from '../colors';
import { Typography } from '../typography';
import { Spacing } from '../spacing';
import { customTheme } from '../theme';

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

describe('colors', () => {
  it('exports primary brand color as Teal 60', () => {
    expect(OpenMRSColors.brand01).toBe('#005d5d');
  });

  it('exports all clinical safety colors as valid hex', () => {
    Object.values(ClinicalColors).forEach((color) => {
      expect(color).toMatch(HEX_REGEX);
    });
  });

  it('exports all base colors', () => {
    expect(BaseColors.textPrimary).toBe('#161616');
    expect(BaseColors.background).toBe('#ffffff');
  });
});

describe('typography', () => {
  const REQUIRED_KEYS = [
    'displayLarge', 'headlineLarge', 'headlineMedium',
    'titleLarge', 'bodyLarge', 'bodyMedium', 'labelLarge',
  ];

  it.each(REQUIRED_KEYS)('%s has all required fields', (key) => {
    const entry = Typography[key];
    expect(entry).toBeDefined();
    expect(typeof entry.fontSize).toBe('number');
    expect(typeof entry.lineHeight).toBe('number');
    expect(typeof entry.fontWeight).toBe('string');
    expect(typeof entry.fontFamily).toBe('string');
  });
});

describe('spacing', () => {
  it('exports 9 spacing values', () => {
    expect(Object.keys(Spacing)).toHaveLength(9);
  });

  it('all values are positive numbers', () => {
    Object.values(Spacing).forEach((value) => {
      expect(value).toBeGreaterThan(0);
    });
  });

  it('md is 8 (base grid unit)', () => {
    expect(Spacing.md).toBe(8);
  });
});

describe('customTheme', () => {
  it('sets primary to OpenMRS Teal 60', () => {
    expect(customTheme.colors.primary).toBe('#005d5d');
  });

  it('sets secondary to OpenMRS Teal 50', () => {
    expect(customTheme.colors.secondary).toBe('#007d79');
  });

  it('sets error to clinical error red', () => {
    expect(customTheme.colors.error).toBe('#da1e28');
  });
});
```

---

## Architecture Compliance

**MANDATORY RULE:** All color, typography, and spacing values MUST reference theme tokens. No hardcoded values in components.

✅ Correct:
```typescript
import { useTheme } from 'react-native-paper';
import { Spacing } from '@/theme';

const theme = useTheme();
<Card style={{ backgroundColor: theme.colors.surface, padding: Spacing.xl }} />
```

❌ Wrong:
```typescript
<Card style={{ backgroundColor: '#f4f4f4', padding: 16 }} />
```

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use `as const` on all token objects**
   - Prevents accidental mutation and enables literal type inference
   - Required on `OpenMRSColors`, `ClinicalColors`, `BaseColors`, `Spacing`, `Typography`

2. **Named exports only — no default exports in theme files**
   - `colors.ts`, `typography.ts`, `spacing.ts`, `theme.ts` all use named exports
   - Barrel `index.ts` re-exports everything

3. **Import via `@/theme` alias**
   - Always: `import { Spacing, customTheme } from '@/theme'`
   - Never: `import { Spacing } from '../../theme/spacing'`

4. **TypeScript strict mode**
   - `AppTheme` type must be exported for use in typed `useTheme<AppTheme>()` calls in future stories
   - No `any` types

5. **IBM Plex Sans font family strings**
   - Use exact strings: `'IBMPlexSans-Regular'` and `'IBMPlexSans-SemiBold'`
   - Font loading (via `expo-font`) is deferred to a later story — these strings are placeholders that will resolve once fonts are loaded
   - React Native will fall back to system font until fonts are loaded; this is acceptable for this story

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** import from `react-native-paper` for color values — use `@/theme/colors`
2. **DO NOT** add font loading logic in this story — that is deferred
3. **DO NOT** create a `ThemeContext` — React Native Paper's `useTheme()` is sufficient
4. **DO NOT** add dark mode variants — single light theme only for MVP
5. **DO NOT** modify `app.json` or `babel.config.js` — no changes needed for this story

### ✅ DEFINITION OF DONE

1. ✅ `src/theme/colors.ts` exports `OpenMRSColors`, `ClinicalColors`, `BaseColors`
2. ✅ `src/theme/typography.ts` exports `Typography` and `FontFamily`
3. ✅ `src/theme/spacing.ts` exports `Spacing` and `SpacingKey`
4. ✅ `src/theme/theme.ts` exports `customTheme` and `AppTheme`
5. ✅ `src/theme/index.ts` barrel re-exports all tokens
6. ✅ `src/app/_layout.tsx` passes `customTheme` to `PaperProvider`
7. ✅ All tests in `src/theme/__tests__/theme.test.ts` pass
8. ✅ `npx tsc --noEmit` passes with no errors
9. ✅ App runs on Android emulator without errors
10. ✅ Code committed: `"feat: implement theme system with OpenMRS O3 colors, MD3 typography, and 8dp spacing (Story 1.4)"`

---

## Testing Requirements

**Test file:** `src/theme/__tests__/theme.test.ts`  
**Framework:** Jest (configured in Story 1.3)  
**Coverage target:** 100% of exported token values validated

**Test scope:**
- Color hex format validation for all `ClinicalColors`
- Exact value assertions for primary brand colors
- Typography entry completeness (all 7 entries, all 4 fields)
- Spacing count (9 values) and base unit (`md === 8`)
- `customTheme` MD3 color mapping correctness

**Run tests:**
```bash
yarn test src/theme
```

---

## References

**Source Documents:**
- [Epic 1: Project Foundation & Core Infrastructure](_bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md) — Story 1.4 definition
- [Architecture: Core Architectural Decisions](_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md) — Material Design 3 Theming section (ARCH-REQ-12, 13, 14, 28, 29)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md) — Naming and structure conventions
- [UX: Design System Foundation](_bmad-output/planning-artifacts/ux-design-specification/design-system-foundation.md)

**External Documentation:**
- [React Native Paper Theming](https://callstack.github.io/react-native-paper/docs/guides/theming/)
- [Material Design 3 Type Scale](https://m3.material.io/styles/typography/type-scale-tokens)
- [OpenMRS O3 Carbon Design System](https://zeroheight.com/23a080e38/p/880723--introduction)

---

## Dev Agent Record

*(To be filled in by the implementing agent)*

### Agent Model Used

_TBD_

### Implementation Notes

_TBD_

### Completion Checklist

- [ ] All tasks completed
- [ ] All acceptance criteria verified
- [ ] All tests pass
- [ ] TypeScript compilation passes with no errors
- [ ] App runs on Android emulator without errors

### Files Created/Modified

**To be created:**
- `src/theme/colors.ts`
- `src/theme/typography.ts`
- `src/theme/spacing.ts`
- `src/theme/theme.ts`
- `src/theme/index.ts`
- `src/theme/__tests__/theme.test.ts`

**To be modified:**
- `src/app/_layout.tsx` — add `theme={customTheme}` to `PaperProvider`

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** 1.5 (API Client), 1.7 (Base UI Components), all UI feature stories  
**Blocked By:** Story 1.3 (Testing Infrastructure — Jest must be configured)  
**Estimated Effort:** 1–2 hours
