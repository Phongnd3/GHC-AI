@smoke @setup @ui
Feature: Implement Theme System (Colors, Typography, Spacing)

  As a developer
  I want a complete theme system with OpenMRS O3 brand colors, Material Design 3 typography, and 8dp grid spacing
  So that all UI components use consistent design tokens with no hardcoded values

  Background:
    Given the project structure is set up with src/theme/ directory

  @positive
  Scenario: Colors theme exports OpenMRS and clinical color palettes
    When I create src/theme/colors.ts
    Then it exports OpenMRSColors with the full Teal palette (teal10–teal100)
    And it exports ClinicalColors with error, success, warning, info colors
    And it exports BaseColors with text, background, surface, and border tokens

  @positive
  Scenario: Typography theme follows Material Design 3 scale
    Given the colors file exists
    When I create src/theme/typography.ts
    Then it exports a Typography object with Material Design 3 type scale entries
    And each entry specifies fontSize, lineHeight, fontWeight, and fontFamily using IBM Plex Sans
    And entries cover displayLarge, headlineLarge, headlineMedium, titleLarge, bodyLarge, bodyMedium, labelLarge

  @positive
  Scenario: Spacing theme follows 8dp grid system
    Given the colors file exists
    When I create src/theme/spacing.ts
    Then it exports a Spacing object following the 8dp grid
    And values are xs:2, sm:4, md:8, lg:12, xl:16, xxl:24, xxxl:32, huge:48, massive:64

  @positive
  Scenario: Complete theme extends React Native Paper MD3 theme
    Given colors, typography, and spacing files exist
    When I create src/theme/theme.ts
    Then it exports customTheme extending MD3LightTheme from React Native Paper
    And customTheme.colors.primary is #005d5d (Teal 60)
    And customTheme.colors.secondary is #007d79 (Teal 50)
    And customTheme.colors.error is #da1e28

  @positive
  Scenario: Theme integration prevents hardcoded values
    Given the theme is complete
    When UI components are created
    Then all styling uses theme tokens
    And no hardcoded color or spacing values are used

  @negative
  Scenario: Missing theme token causes TypeScript error
    Given the theme is complete
    When I attempt to use a non-existent theme token
    Then TypeScript compilation fails with error

  @boundary
  Scenario Outline: Theme supports different color variants
    Given the theme is complete
    When I access <color_type> colors
    Then all variants are available and correctly defined

    Examples:
      | color_type     |
      | OpenMRSColors  |
      | ClinicalColors |
      | BaseColors     |