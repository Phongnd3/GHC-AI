@smoke @regression @dashboard @refresh
Feature: Refresh Patient List

  As a doctor
  I want to refresh the patient list to see the latest assignments
  So that I have up-to-date information about my patients

  Background:
    Given I am viewing the My Patients dashboard with patients loaded

  @positive
  Scenario: Pull-to-refresh functionality
    When I pull down from the top of the screen
    Then the patient list refreshes with the latest data from the server
    And a loading indicator appears during refresh
    And the refresh completes within 2 seconds

  @positive
  Scenario: Manual refresh via icon
    When I tap the refresh icon in the top bar
    Then the patient list refreshes with the latest data

  @negative
  Scenario: Refresh fails gracefully
    Given the network is unavailable
    When I attempt to refresh the patient list
    Then an error message is displayed
    And the previous patient list remains visible

  @boundary
  Scenario Outline: Refresh timing scenarios
    Given the patient list is loaded
    When I <refresh_method> after <time_elapsed>
    Then the refresh completes within 2 seconds

    Examples:
      | refresh_method    | time_elapsed     |
      | pull down         | no delay         |
      | tap refresh icon  | 1 minute         |
      | pull down         | 5 minutes        |