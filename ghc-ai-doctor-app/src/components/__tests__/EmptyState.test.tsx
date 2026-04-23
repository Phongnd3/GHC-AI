import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders icon and message', () => {
    const { getByText } = render(<EmptyState icon="inbox" message="No items found" />);
    expect(getByText('No items found')).toBeTruthy();
  });

  it('shows action button when props provided', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState icon="inbox" message="No items" actionLabel="Add Item" onActionPress={onPress} />
    );
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('hides action button when props not provided', () => {
    const { queryByText } = render(<EmptyState icon="inbox" message="No items" />);
    expect(queryByText('Add Item')).toBeNull();
  });

  it('calls onActionPress when button pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState icon="inbox" message="No items" actionLabel="Add Item" onActionPress={onPress} />
    );
    fireEvent.press(getByText('Add Item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
