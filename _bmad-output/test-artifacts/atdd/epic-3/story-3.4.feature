@smoke @regression @dashboard @navigation
Feature: Navigate to Patient Clinical Summary

  As a doctor
  I want to tap on a patient card to view their clinical information
  So that I can access detailed patient data for clinical decision-making

  Background:
    Given I am viewing the My Patients dashboard with patient cards

  @positive
  Scenario: Navigate to clinical summary on card tap
    When I tap on any patient card
    Then I am navigated to the Clinical Summary screen for that patient
    And the patient's UUID is passed to the Clinical Summary screen
    And a ripple effect appears on the card when tapped

  @negative
  Scenario: Navigation fails gracefully
    Given the clinical summary screen is not available
    When I tap on a patient card
    Then an error is handled appropriately
    And the user is not left in a broken state

  @boundary
  Scenario Outline: Different patient card interactions
    Given I have multiple patient cards displayed
    When I <interaction_method> on a patient card
    Then navigation occurs correctly

    Examples:
      | interaction_method |
      | tap quickly        |
      | tap and hold       |
      | double tap         |