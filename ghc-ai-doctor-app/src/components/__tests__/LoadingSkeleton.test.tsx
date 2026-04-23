import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
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
