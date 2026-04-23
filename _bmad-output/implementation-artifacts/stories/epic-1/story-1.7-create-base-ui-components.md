# Story 1.7: Create Base UI Components (EmptyState, LoadingSkeleton)

**Status:** ready-for-dev  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.7  
**Priority:** P0 - Blocking all UI feature work  
**Depends On:** Story 1.4 (Implement Theme System) ✅ ready-for-dev

---

## Story

As a developer,  
I want reusable base UI components for common patterns,  
So that loading and empty states are consistent across the app.

---

## Acceptance Criteria

**AC1. EmptyState component displays correctly**  
**Given** a screen has no data to display  
**When** the EmptyState component is rendered  
**Then** it displays an icon, message, and optional action button  
**And** all styling uses theme tokens (no hardcoded colors or spacing)  
**And** the component is centered vertically and horizontally

**AC2. EmptyState accepts customization props**  
**Given** different screens need different empty state messages  
**When** EmptyState is used with custom props  
**Then** it accepts `icon`, `message`, `actionLabel`, and `onActionPress` props  
**And** the action button is only shown when `actionLabel` and `onActionPress` are provided

**AC3. LoadingSkeleton component displays correctly**  
**Given** data is being fetched from the API  
**When** the LoadingSkeleton component is rendered  
**Then** it displays grey placeholder cards matching real content layout  
**And** all styling uses theme tokens (colors, spacing, border radius)  
**And** the skeleton has a subtle shimmer/pulse animation

**AC4. LoadingSkeleton accepts count prop**  
**Given** different screens need different numbers of skeleton items  
**When** LoadingSkeleton is used with `count` prop  
**Then** it renders the specified number of skeleton cards  
**And** default count is 3 if not specified

**AC5. Component tests verify rendering**  
**Given** both components are implemented  
**When** unit tests are run  
**Then** EmptyState renders with all props correctly  
**And** LoadingSkeleton renders correct number of items  
**And** test coverage is 80%+ for both components

**AC6. Demo screen shows components in action**  
**Given** components are implemented  
**When** a demo screen is created  
**Then** it shows EmptyState with and without action button  
**And** it shows LoadingSkeleton with different counts  
**And** developers can see both components working

---

## Tasks / Subtasks

- [ ] Create EmptyState component (AC: 1-2)
  - [ ] Create `src/components/EmptyState.tsx`
  - [ ] Define props interface: `icon`, `message`, `actionLabel?`, `onActionPress?`
  - [ ] Use React Native Paper `Icon` component for icon
  - [ ] Use React Native Paper `Text` component for message
  - [ ] Use React Native Paper `Button` component for action (if provided)
  - [ ] Center content vertically and horizontally using flexbox
  - [ ] Use theme tokens from `src/theme/` (colors, spacing, typography)
  - [ ] Export component from `src/components/index.ts`

- [ ] Create LoadingSkeleton component (AC: 3-4)
  - [ ] Create `src/components/LoadingSkeleton.tsx`
  - [ ] Define props interface: `count?: number` (default 3)
  - [ ] Create skeleton card with grey background and rounded corners
  - [ ] Use theme tokens for colors (`BaseColors.surface`), spacing, and border radius
  - [ ] Render `count` number of skeleton cards
  - [ ] Add subtle pulse/shimmer animation using React Native Animated API
  - [ ] Export component from `src/components/index.ts`

- [ ] Write component tests (AC: 5)
  - [ ] Create `src/components/__tests__/EmptyState.test.tsx`
  - [ ] Test EmptyState renders icon and message
  - [ ] Test EmptyState shows action button when props provided
  - [ ] Test EmptyState hides action button when props not provided
  - [ ] Test EmptyState calls onActionPress when button pressed
  - [ ] Create `src/components/__tests__/LoadingSkeleton.test.tsx`
  - [ ] Test LoadingSkeleton renders default count (3)
  - [ ] Test LoadingSkeleton renders custom count
  - [ ] Verify 80%+ coverage with `yarn test:coverage`

- [ ] Create demo screen (AC: 6)
  - [ ] Create `src/app/demo-components.tsx` (Expo Router screen)
  - [ ] Show EmptyState with icon, message, and action button
  - [ ] Show EmptyState with icon and message only (no action)
  - [ ] Show LoadingSkeleton with default count
  - [ ] Show LoadingSkeleton with custom count (5)
  - [ ] Add navigation link from home screen to demo screen

---

## Dev Notes

### Architecture Compliance

**UX-DR4: Loading States**
- LoadingSkeleton provides consistent loading experience
- Grey placeholder cards match real content layout
- Subtle animation indicates loading in progress

**UX-DR5: Empty States**
- EmptyState provides helpful feedback when no data available
- Icon + message + optional action pattern
- Consistent across all screens

**ARCH-REQ-22: Component Reusability**
- Base components are reusable across all features
- Props allow customization for different use cases
- Exported from central `src/components/index.ts`

**ARCH-REQ-12, ARCH-REQ-13, ARCH-REQ-14: Theme System**
- All components use theme tokens (no hardcoded values)
- Colors from `src/theme/colors.ts`
- Spacing from `src/theme/spacing.ts`
- Typography from `src/theme/typography.ts`

### Technical Requirements

**EmptyState Component Structure:**
```typescript
// src/components/EmptyState.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';
import { BaseColors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

interface EmptyStateProps {
  icon: string; // Material Design icon name
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={BaseColors.textSecondary} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onActionPress && (
        <Button mode="contained" onPress={onActionPress}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  message: {
    ...Typography.bodyLarge,
    color: BaseColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
```

**LoadingSkeleton Component Structure:**
```typescript
// src/components/LoadingSkeleton.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BaseColors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.skeletonCard, { opacity }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  skeletonCard: {
    height: 80,
    backgroundColor: BaseColors.surface,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
});
```

**Component Export:**
```typescript
// src/components/index.ts

export { EmptyState } from './EmptyState';
export { LoadingSkeleton } from './LoadingSkeleton';
```

### Testing Requirements

**Test Framework:** Jest + React Native Testing Library (from Story 1.3)

**Coverage Target:** 80%+ for UI components (per ARCH-REQ-8)

**EmptyState Test Scenarios:**
1. Renders icon and message correctly
2. Shows action button when props provided
3. Hides action button when props not provided
4. Calls onActionPress when button pressed
5. Uses theme tokens (verify no hardcoded values)

**LoadingSkeleton Test Scenarios:**
1. Renders default count (3 cards)
2. Renders custom count (5 cards)
3. Animation starts on mount
4. Uses theme tokens (verify no hardcoded values)

**Example Test Structure:**
```typescript
// src/components/__tests__/EmptyState.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders icon and message', () => {
    const { getByText } = render(
      <EmptyState icon="inbox" message="No items found" />
    );
    expect(getByText('No items found')).toBeTruthy();
  });

  it('shows action button when props provided', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="inbox"
        message="No items"
        actionLabel="Add Item"
        onActionPress={onPress}
      />
    );
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('calls onActionPress when button pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="inbox"
        message="No items"
        actionLabel="Add Item"
        onActionPress={onPress}
      />
    );
    fireEvent.press(getByText('Add Item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Latest Technical Information (Context7)

**React Native Paper v5 Best Practices:**

1. **Icon Component:**
   - Use `Icon` component from React Native Paper
   - Accepts `source` prop with Material Design icon name
   - Requires `@react-native-vector-icons/material-design-icons` package
   - Example: `<Icon source="inbox" size={64} color="#666" />`

2. **Text Component:**
   - Use `Text` component from React Native Paper
   - Automatically applies Material Design 3 typography
   - Can override with custom styles from theme

3. **Button Component:**
   - Use `Button` component from React Native Paper
   - Modes: `contained`, `outlined`, `text`
   - Automatically uses theme colors
   - Example: `<Button mode="contained" onPress={...}>Label</Button>`

4. **Theme Integration:**
   - Components automatically use theme from `PaperProvider`
   - Can access theme in components using `useTheme()` hook
   - Custom colors and properties can be added to theme

5. **Animation:**
   - Use React Native's `Animated` API for skeleton shimmer
   - `useNativeDriver: true` for better performance
   - Loop animation for continuous pulse effect

### File Structure

```
src/
├── components/
│   ├── EmptyState.tsx           # Empty state component
│   ├── LoadingSkeleton.tsx      # Loading skeleton component
│   ├── index.ts                 # Component exports
│   └── __tests__/
│       ├── EmptyState.test.tsx  # EmptyState tests
│       └── LoadingSkeleton.test.tsx # LoadingSkeleton tests
├── app/
│   └── demo-components.tsx      # Demo screen (Expo Router)
└── theme/
    ├── colors.ts                # From Story 1.4
    ├── spacing.ts               # From Story 1.4
    └── typography.ts            # From Story 1.4
```

### Integration with Story 1.4 (Theme System)

Both components use theme tokens from Story 1.4:

1. **Colors:**
   - `BaseColors.surface` for skeleton background
   - `BaseColors.textSecondary` for empty state text and icon
   - `BaseColors.primary` for action button (via React Native Paper)

2. **Spacing:**
   - `Spacing.md`, `Spacing.lg`, `Spacing.xl` for consistent padding/margins
   - 8dp grid system from theme

3. **Typography:**
   - `Typography.bodyLarge` for empty state message
   - Material Design 3 type scale

**Usage Example:**
```typescript
// In a screen component
import { EmptyState, LoadingSkeleton } from '@/components';

// Loading state
if (isLoading) {
  return <LoadingSkeleton count={5} />;
}

// Empty state
if (data.length === 0) {
  return (
    <EmptyState
      icon="inbox"
      message="No patients assigned"
      actionLabel="Refresh"
      onActionPress={handleRefresh}
    />
  );
}

// Data state
return <PatientList data={data} />;
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md#Story 1.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#ARCH-REQ-22, UX-DR4, UX-DR5]
- [Context7: React Native Paper Components - https://callstack.github.io/react-native-paper/]
- [Context7: React Native Paper Theming - https://github.com/callstack/react-native-paper/blob/main/docs/docs/guides/02-theming.mdx]

---

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

- [ ] EmptyState component created with all props
- [ ] LoadingSkeleton component created with animation
- [ ] Component tests written with 80%+ coverage
- [ ] Demo screen created and accessible
- [ ] All acceptance criteria verified

### File List

_To be filled by dev agent_

---

**Story Status:** ready-for-dev  
**Next Step:** Run `bmad-dev-story` to implement this story
