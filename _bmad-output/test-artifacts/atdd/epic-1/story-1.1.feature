@smoke @setup @infrastructure
Feature: Initialize Expo Project with TypeScript and Expo Router

  As a developer
  I want a working Expo project with TypeScript and Expo Router configured
  So that I can start building features with type safety and file-based routing

  @positive
  Scenario: Successfully initialize Expo project
    Given I have Node.js 18+ installed
    When I run the Expo initialization command
    Then a new project is created with Expo SDK 55, TypeScript, and Expo Router
    And the project runs successfully on Android emulator with "Hello World" screen
    And hot reload works when I make code changes
    And project structure includes src/app/ directory for routes

  @negative
  Scenario: Initialization fails with incompatible Node.js version
    Given I have Node.js version below 18
    When I attempt to run the Expo initialization command
    Then the initialization fails with a clear error message about Node.js version requirement

  @boundary
  Scenario Outline: Handle different Expo SDK versions
    Given I specify <sdk_version> in the initialization command
    When I run the Expo initialization command
    Then the project is created with the specified SDK version
    And TypeScript and Expo Router are properly configured

    Examples:
      | sdk_version |
      | SDK 54      |
      | SDK 55      |
      | SDK 56      |