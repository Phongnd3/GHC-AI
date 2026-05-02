@smoke @regression @dashboard @timestamp
Feature: Display Last Updated Timestamp

  As a doctor
  I want to see when the patient list was last updated
  So that I know how current the information is

  Background:
    Given I am viewing the My Patients dashboard

  @positive
  Scenario: Display timestamp after successful load
    When the patient list loads successfully
    Then I see "Last updated: X min ago" below the top bar
    And the timestamp updates automatically as time passes

  @negative
  Scenario: No timestamp during initial loading
    Given I am viewing the dashboard for the first time (no cached data)
    When the patient list is still loading
    Then no timestamp is displayed

  @negative
  Scenario: No timestamp when load fails
    When the patient list fails to load
    Then no timestamp is displayed

  @boundary
  Scenario Outline: Timestamp updates over time
    Given the patient list was last updated <time_ago>
    When I view the dashboard
    Then the timestamp shows "<expected_display>"

    Examples:
      | time_ago    | expected_display     |
      | 1 minute    | 1 minute ago         |
      | 30 minutes  | 30 minutes ago       |
      | 2 hours     | 2 hours ago          |