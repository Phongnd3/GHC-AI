@smoke @regression @dashboard @network @error-handling
Feature: Handle Network Errors on Dashboard

  As a doctor
  I want to see a helpful error message when the patient list fails to load
  So that I understand what went wrong and can retry

  Background:
    Given I am viewing the My Patients dashboard

  @positive
  Scenario: Display network error message
    When the patient list fails to load due to network error
    Then I see the message "Unable to load patients. Tap to retry."
    And a retry button is displayed

  @positive
  Scenario: Retry functionality works
    Given I see the network error message
    When I tap the retry button
    Then the app attempts to load the patient list again

  @positive
  Scenario: Display server error message
    When the patient list fails to load due to a server error (not network)
    Then I see "Unable to load patients. Please try again later."
    And a retry button is displayed

  @negative
  Scenario: Error state not shown when successful
    When the patient list loads successfully
    Then no error message is displayed
    And the patient list is shown

  @boundary
  Scenario Outline: Different error types
    Given the patient list fails to load due to <error_type>
    When I view the dashboard
    Then I see the appropriate error message
    And a retry option is available

    Examples:
      | error_type       |
      | network timeout  |
      | server 500 error |
      | connection lost  |