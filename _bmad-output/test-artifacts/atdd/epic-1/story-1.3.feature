@smoke @setup @testing
Feature: Set Up Testing Infrastructure (Jest + React Native Testing Library)

  As a developer
  I want testing infrastructure configured with Jest and React Native Testing Library
  So that I can write and run unit, component, and integration tests with coverage reporting

  Background:
    Given the project has development tooling configured

  @positive
  Scenario: Test runner executes all test files
    When I run the test command
    Then Jest runs all .test.ts and .test.tsx files
    And the run exits with code 0 when all tests pass
    And a sample component test passes demonstrating RNTL usage

  @positive
  Scenario: Watch mode re-runs tests on file changes
    Given Jest is configured
    When I run the test watch command
    Then Jest starts in interactive watch mode
    And re-runs affected tests on file save

  @positive
  Scenario: Coverage reporting generates multiple formats
    Given Jest is configured with coverage thresholds
    When I run the test coverage command
    Then a coverage report is generated in coverage/ directory
    And the report includes text, lcov, and html formats
    And Jest fails if coverage falls below configured thresholds

  @positive
  Scenario: TypeScript tests work with proper type checking
    Given the project uses TypeScript strict mode
    When I write a test file with .test.tsx extension
    Then TypeScript types are checked in test files
    And React Native Testing Library types are available
    And jest-native matchers are available

  @positive
  Scenario: Module aliases resolve correctly in tests
    Given the project uses @/ import aliases
    When a test file imports using @/ alias
    Then the module resolves correctly
    And the test can access the imported components

  @negative
  Scenario: Tests fail when coverage threshold not met
    Given tests have coverage below the configured threshold
    When I run the test coverage command
    Then Jest fails with coverage error
    And shows which thresholds were not met

  @boundary
  Scenario Outline: Handle different test file patterns
    Given I have test files with <extension> extension
    When I run the test command
    Then all test files are discovered and executed
    And results are reported correctly

    Examples:
      | extension |
      | .test.ts  |
      | .test.tsx |
      | .spec.ts  |
      | .spec.tsx |