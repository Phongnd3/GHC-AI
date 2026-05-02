@smoke @regression @security @timeout
Feature: Automatic Session Timeout After 30 Minutes of Inactivity

  As a hospital administrator
  I want doctor sessions to automatically expire after 30 minutes of inactivity
  So that patient data remains secure if a device is left unattended

  Background:
    Given a doctor is logged in and using the app

  @positive
  Scenario: Session expires after 30 minutes of inactivity
    When 30 minutes pass with no user interaction
    Then the session automatically expires
    And the session token is cleared from secure storage
    And the doctor is redirected to the login screen
    And a message displays "Session expired due to inactivity. Please log in again."

  @positive
  Scenario: User interaction resets inactivity timer
    Given the inactivity timer is running
    When the doctor interacts with the app (tap, scroll, navigation)
    Then the 30-minute inactivity timer resets

  @negative
  Scenario: Session does not expire prematurely
    Given the doctor has been active within the last 29 minutes
    When 29 minutes have passed
    Then the session remains active
    And the doctor can continue using the app

  @boundary
  Scenario: Session expires exactly at 30 minutes
    When exactly 30 minutes pass with no activity
    Then the session expires immediately

  @boundary
  Scenario Outline: Different types of user interactions reset timer
    Given the inactivity timer is running
    When the doctor performs <interaction_type>
    Then the inactivity timer resets to 30 minutes

    Examples:
      | interaction_type |
      | screen tap       |
      | scrolling        |
      | navigation       |
      | button press     |