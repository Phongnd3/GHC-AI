import React from 'react';
import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { LoadingSkeleton } from '../LoadingSkeleton';

// Prevent Animated from connecting to the native renderer.
// The react@19.2.5 / react-native-renderer@19.1.0 version mismatch causes
// Animated.loop with useNativeDriver:true to throw when it tries to attach
// to the native renderer. Forcing JS-driven animations avoids that path.
jest.spyOn(Animated, 'loop').mockImplementation((_animation) => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
}));

describe('LoadingSkeleton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders default count (3 cards)', () => {
    const { toJSON } = render(<LoadingSkeleton />);
    const tree = toJSON();
    // Count Animated.View children (skeleton cards)
    expect(tree?.children?.length).toBe(3);
  });

  it('renders custom count', () => {
    const { toJSON } = render(<LoadingSkeleton count={5} />);
    const tree = toJSON();
    // Count Animated.View children (skeleton cards)
    expect(tree?.children?.length).toBe(5);
  });
});
