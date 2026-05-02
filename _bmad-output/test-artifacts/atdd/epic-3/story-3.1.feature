@smoke @regression @dashboard @patients
Feature: View List of Assigned Patients

  As a doctor
  I want to see a list of only my assigned patients with active visits
  So that I can quickly identify which patients I need to see today

  Background:
    Given I am logged in as a doctor

  @positive
  Scenario: Display assigned patients with active visits
    When I view the My Patients dashboard
    Then I see a list of patients with active visits where I am the primary provider
    And each patient card displays: Name, Patient ID, Age, Gender
    And the list loads within 2 seconds

  @positive
  Scenario: Scrollable list for many patients
    Given I have more than 10 assigned patients
    When I view the dashboard
    Then the list is scrollable to view all patients

  @negative
  Scenario: No patients displayed when none assigned
    Given I have no assigned patients with active visits
    When I view the dashboard
    Then an empty state is displayed
    And no patient cards are shown

  @boundary
  Scenario Outline: Handle different patient counts
    Given I have <patient_count> assigned patients
    When I view the dashboard
    Then <expected_behavior>

    Examples:
      | patient_count | expected_behavior                  |
      | 0             | empty state is displayed           |
      | 1             | single patient card is shown       |
      | 10            | all patients are visible           |
      | 50            | list is scrollable                 |