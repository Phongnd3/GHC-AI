@smoke @setup @error-handling
Feature: Implement Centralized Error Handler

  As a developer
  I want a centralized error handler that maps API errors to user-friendly messages
  So that users see consistent, helpful error messages throughout the app

  @positive
  Scenario: Network error mapping
    Given an API call fails due to network connectivity
    When the error handler processes the error
    Then it returns "No internet connection. Please check your network and try again."
    And the error type is identified as NETWORK_ERROR

  @positive
  Scenario: Authentication error mapping
    Given an API call returns 401 Unauthorized
    When the error handler processes the error
    Then it returns "Session expired. Please log in again."
    And the error type is identified as AUTH_ERROR

  @positive
  Scenario: Server error mapping
    Given an API call returns 500 or 503 status
    When the error handler processes the error
    Then it returns "Server unavailable. Please try again later."
    And the error type is identified as SERVER_ERROR

  @positive
  Scenario: Timeout error mapping
    Given an API call exceeds the configured timeout (10 seconds)
    When the error handler processes the error
    Then it returns "Request timed out. Please try again."
    And the error type is identified as TIMEOUT_ERROR

  @positive
  Scenario: Generic error fallback
    Given an API call fails with an unrecognized error
    When the error handler processes the error
    Then it returns "An unexpected error occurred. Please try again."
    And the error type is identified as UNKNOWN_ERROR

  @boundary
  Scenario Outline: Handle various HTTP error codes
    Given an API call returns <status_code>
    When the error handler processes the error
    Then it returns an appropriate user-friendly message
    And the error type is correctly identified

    Examples:
      | status_code | error_type    |
      | 400         | CLIENT_ERROR  |
      | 401         | AUTH_ERROR    |
      | 403         | FORBIDDEN     |
      | 404         | NOT_FOUND     |
      | 500         | SERVER_ERROR  |
      | 503         | SERVER_ERROR  |