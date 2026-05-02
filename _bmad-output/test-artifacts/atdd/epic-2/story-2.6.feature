@smoke @regression @auth @logout
Feature: Doctor Logout with Confirmation

  As a doctor
  I want to log out of the app with a confirmation dialog
  So that I don't accidentally log out and lose my session

  Background:
    Given I am logged in and on the My Patients dashboard

  @positive
  Scenario: Logout confirmation dialog appears
    When I press the Android back button or tap the logout menu
    Then a confirmation dialog appears asking "Are you sure you want to log out?"

  @positive
  Scenario: Confirm logout clears session
    Given the logout confirmation dialog is displayed
    When I tap "Yes"
    Then my session token is cleared from secure storage
    And I am redirected to the login screen

  @positive
  Scenario: Cancel logout keeps session
    Given the logout confirmation dialog is displayed
    When I tap "No"
    Then the dialog closes and I remain on the dashboard

  @negative
  Scenario: Logout without confirmation not allowed
    When I attempt to log out without going through confirmation
    Then the logout is not processed
    And I remain logged in

  @boundary
  Scenario Outline: Different logout triggers
    When I initiate logout via <trigger_method>
    Then the confirmation dialog appears
    And I can choose to confirm or cancel

    Examples:
      | trigger_method     |
      | Android back button |
      | logout menu button  |
      | logout menu item    |