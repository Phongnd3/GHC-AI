@smoke @setup @api
Feature: Configure API Client (Axios with Interceptors)

  As a developer
  I want a configured Axios client with interceptors
  So that all API calls have consistent error handling and auth token injection

  Background:
    Given the project has theme system configured

  @positive
  Scenario: API client configured with base URL and timeout
    When I create API client in src/services/api/client.ts
    Then Axios instance is configured with base URL from environment variables
    And 10-second timeout is configured
    And default Content-Type application/json header is set

  @positive
  Scenario: Request interceptor adds session token
    Given the API client is configured
    When a request is made
    Then the request interceptor adds session token to Authorization header
    And the token is retrieved from secure storage

  @positive
  Scenario: Response interceptor handles 401 errors
    Given the API client is configured
    When a 401 Unauthorized response is received
    Then the response interceptor clears the session token from secure storage
    And redirects to the login screen

  @positive
  Scenario: Sample API call demonstrates client usage
    Given the API client is configured
    When I make a sample API call
    Then the call uses the configured base URL and timeout
    And interceptors are applied correctly

  @negative
  Scenario: API call fails with network error
    Given the API client is configured
    When a network error occurs during API call
    Then the error is properly handled
    And appropriate error information is provided

  @boundary
  Scenario Outline: Handle different HTTP status codes
    Given the API client is configured
    When an API call returns <status_code>
    Then the response interceptor handles it appropriately

    Examples:
      | status_code |
      | 200         |
      | 401         |
      | 404         |
      | 500         |