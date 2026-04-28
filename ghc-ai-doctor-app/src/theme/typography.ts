import type { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'IBMPlexSans-Regular',
  semiBold: 'IBMPlexSans-SemiBold',
} as const;

export type TypographyStyle = {
  fontSize: TextStyle['fontSize'];
  lineHeight: TextStyle['lineHeight'];
  fontWeight: TextStyle['fontWeight'];
  fontFamily: TextStyle['fontFamily'];
};

export const Typography: Record<string, TypographyStyle> = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400', fontFamily: FontFamily.regular },
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
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600', fontFamily: FontFamily.semiBold },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400', fontFamily: FontFamily.regular },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400', fontFamily: FontFamily.regular },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '600', fontFamily: FontFamily.semiBold },
} as const;
