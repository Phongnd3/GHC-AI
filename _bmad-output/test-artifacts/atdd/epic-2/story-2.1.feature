@smoke @regression @auth
Feature: Doctor Login with OpenMRS Credentials

  As a doctor
  I want to log in using my existing OpenMRS username and password
  So that I can access my assigned patients on mobile without creating new credentials

  Background:
    Given I am on the login screen

  @positive
  Scenario: Successful login with valid credentials
    When I enter my valid OpenMRS username and password and tap "Login"
    Then the app authenticates me via OpenMRS REST API
    And I am redirected to the My Patients dashboard
    And my session token is stored securely
    And the login completes within 3 seconds

  @negative
  Scenario: Login fails with invalid credentials
    When I enter invalid username or password and tap "Login"
    Then the login fails
    And I remain on the login screen
    And I see an error message

  @negative
  Scenario: Login fails with network error
    Given I have no internet connection
    When I attempt to log in
    Then the login fails with network error
    And I see a retry option

  @boundary
  Scenario Outline: Handle different credential formats
    When I enter <credential_type> and tap "Login"
    Then the login is processed correctly

    Examples:
      | credential_type     |
      | standard credentials |
      | long username       |
      | special characters  |
      | numeric password    |