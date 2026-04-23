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
