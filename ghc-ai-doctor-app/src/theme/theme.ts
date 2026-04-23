import { MD3LightTheme } from 'react-native-paper';
import { OpenMRSColors, ClinicalColors, BaseColors } from './colors';

export const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: OpenMRSColors.brand01,
    secondary: OpenMRSColors.brand03,
    tertiary: OpenMRSColors.brand02,
    error: ClinicalColors.error,
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
