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
    'displayLarge',
    'headlineLarge',
    'headlineMedium',
    'titleLarge',
    'bodyLarge',
    'bodyMedium',
    'labelLarge',
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
