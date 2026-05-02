@smoke @regression @security @screenshot
Feature: Prevent Screenshots on Clinical Screens

  As a hospital administrator
  I want screenshots to be blocked on all screens after login
  So that patient data cannot be captured and shared inappropriately

  Background:
    Given a doctor is logged in

  @positive
  Scenario: Screenshots blocked on authenticated screens
    Given the doctor is viewing any screen after login
    When the doctor attempts to take a screenshot
    Then the screenshot is blocked (screen appears black in the capture)
    And this applies to all screens except the login screen
    And screenshot prevention is active on Android devices

  @positive
  Scenario: Screenshot prevention activates on login
    Given the doctor is on the login screen
    When the doctor logs in successfully
    Then screenshot prevention is activated
    And screenshots are blocked on subsequent screens

  @positive
  Scenario: Screenshot prevention deactivates on logout
    Given screenshot prevention is active
    When the doctor logs out
    Then screenshot prevention is deactivated
    And screenshots are allowed on the login screen

  @negative
  Scenario: Screenshots allowed on login screen
    Given the doctor is on the login screen
    When the doctor attempts to take a screenshot
    Then the screenshot is allowed
    And the login screen is captured normally

  @boundary
  Scenario Outline: Screenshot prevention on different screen types
    Given the doctor is viewing <screen_type>
    When the doctor attempts to take a screenshot
    Then the screenshot is <result>

    Examples:
      | screen_type       | result     |
      | patient dashboard | blocked    |
      | clinical summary  | blocked    |
      | login screen      | allowed    |