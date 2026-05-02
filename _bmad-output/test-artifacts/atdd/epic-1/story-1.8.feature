@smoke @setup @configuration
Feature: Configure Environment Variables and Constants

  As a developer
  I want environment configuration for different deployment environments
  So that API URLs and timeouts can be changed per environment without code changes

  @positive
  Scenario: Environment files created for different environments
    Given the project needs different configurations per environment
    When environment files are created
    Then .env.development, .env.staging, and .env.production files exist
    And each file contains API_BASE_URL, SESSION_TIMEOUT, CACHE_DURATION, REQUEST_TIMEOUT
    And .env.local is added to .gitignore for local overrides

  @positive
  Scenario: app.config.js loads environment variables
    Given environment files are created
    When app.config.js is configured
    Then it loads environment variables from .env files
    And it exports configuration with extra object containing typed environment values
    And it supports different app names per environment

  @positive
  Scenario: Typed environment configuration module
    Given environment variables are loaded in app.config.js
    When src/config/env.ts is created
    Then it exports typed environment variables using expo-constants
    And it provides API_BASE_URL, SESSION_TIMEOUT, CACHE_DURATION, REQUEST_TIMEOUT constants
    And it throws error if required environment variables are missing
    And TypeScript types ensure type safety

  @positive
  Scenario: API client uses environment variables
    Given environment configuration is available
    When API client from Story 1.5 is updated
    Then it uses API_BASE_URL from environment config
    And it uses REQUEST_TIMEOUT from environment config
    And no hardcoded URLs or timeouts remain in API client

  @positive
  Scenario: Environment switching works
    Given multiple environment configurations exist
    When I switch between development, staging, and production
    Then the app uses the correct configuration for each environment
    And API calls use the environment-specific base URL

  @negative
  Scenario: Missing required environment variable
    Given a required environment variable is missing
    When the app starts
    Then it throws a clear error indicating the missing variable
    And prevents the app from running with incomplete configuration

  @boundary
  Scenario Outline: Handle different environment configurations
    Given I have <environment> environment configured
    When the app loads configuration
    Then it uses the correct values for that environment

    Examples:
      | environment |
      | development |
      | staging     |
      | production  |