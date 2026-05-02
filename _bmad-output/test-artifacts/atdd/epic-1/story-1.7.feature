@smoke @setup @ui
Feature: Create Base UI Components (EmptyState, LoadingSkeleton)

  As a developer
  I want reusable base UI components for common patterns
  So that loading and empty states are consistent across the app

  @positive
  Scenario: EmptyState component displays correctly
    Given a screen has no data to display
    When the EmptyState component is rendered
    Then it displays an icon, message, and optional action button
    And all styling uses theme tokens (no hardcoded colors or spacing)
    And the component is centered vertically and horizontally

  @positive
  Scenario: EmptyState accepts customization props
    Given different screens need different empty state messages
    When EmptyState is used with custom props
    Then it accepts icon, message, actionLabel, and onActionPress props
    And the action button is only shown when actionLabel and onActionPress are provided

  @positive
  Scenario: LoadingSkeleton component displays correctly
    Given data is being fetched from the API
    When the LoadingSkeleton component is rendered
    Then it displays grey placeholder cards matching real content layout
    And all styling uses theme tokens (colors, spacing, border radius)
    And the skeleton has a subtle shimmer/pulse animation

  @positive
  Scenario: LoadingSkeleton accepts count prop
    Given different screens need different numbers of skeleton items
    When LoadingSkeleton is used with count prop
    Then it renders the specified number of skeleton cards
    And default count is 3 if not specified

  @positive
  Scenario: Component tests verify rendering
    Given both components are implemented
    When unit tests are run
    Then EmptyState renders with all props correctly
    And LoadingSkeleton renders with animation

  @boundary
  Scenario Outline: EmptyState handles different configurations
    When EmptyState is rendered with <configuration>
    Then it displays correctly according to the configuration

    Examples:
      | configuration          |
      | icon and message only  |
      | with action button     |
      | custom icon            |
      | long message text      |

  @boundary
  Scenario Outline: LoadingSkeleton handles different counts
    When LoadingSkeleton is rendered with count <count>
    Then it displays <count> skeleton items

    Examples:
      | count |
      | 1     |
      | 3     |
      | 5     |
      | 10    |