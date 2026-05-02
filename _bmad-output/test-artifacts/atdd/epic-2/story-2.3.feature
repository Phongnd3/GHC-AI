@smoke @regression @network
Feature: Handle Network Errors During Login

  As a doctor
  I want to see helpful messages when login fails due to network issues
  So that I know the problem is with connectivity, not my credentials

  Background:
    Given I am on the login screen

  @positive
  Scenario: Display network error message when offline
    Given I have no internet connection
    When I attempt to log in with valid credentials
    Then I should see the error message "No internet connection. Please check your WiFi."
    And I should see a "Retry" button

  @positive
  Scenario: Retry login after connection is restored
    Given I have seen a network error message
    And my internet connection has been restored
    When I tap the "Retry" button
    Then the login attempt should be retried automatically
    And I should be logged in successfully

  @negative
  Scenario: Network error persists after retry
    Given I have no internet connection
    And I have tapped the "Retry" button
    When the retry attempt fails
    Then I should still see the network error message
    And the "Retry" button should remain available

  @boundary
  Scenario Outline: Handle different network failure types
    Given I experience a <network_issue>
    When I attempt to log in
    Then I should see an appropriate network error message
    And I should be able to retry the login

    Examples:
      | network_issue          |
      | complete offline       |
      | DNS resolution failure |
      | timeout after 10 seconds |