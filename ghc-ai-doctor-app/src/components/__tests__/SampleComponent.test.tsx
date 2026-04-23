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
