@smoke @regression @auth @bug
Feature: [BUG] Login Fails on First Attempt with "An error occurred"

  As a doctor
  I want my login to succeed on the first attempt
  So that I can access my patients without confusion or repeated login attempts

  Background:
    Given I am on the login screen after a fresh app launch

  @positive
  Scenario: Login succeeds on first attempt
    When I enter valid OpenMRS credentials and tap "Login"
    Then the login succeeds on the first attempt
    And I am redirected to the My Patients dashboard
    And no error message is shown

  @negative
  Scenario: Login no longer fails on first attempt
    Given the bug has been fixed
    When I attempt to reproduce the original bug
    Then the login succeeds on the first attempt
    And the bug is no longer reproducible

  @regression
  Scenario: Subsequent logins work normally
    Given I have logged in successfully
    When I log out and log in again
    Then the login succeeds on the first attempt
    And no regression of the bug occurs

  @boundary
  Scenario Outline: Different app launch scenarios
    Given I <launch_scenario>
    When I attempt to log in with valid credentials
    Then the login succeeds on the first attempt

    Examples:
      | launch_scenario          |
      | launch the app fresh     |
      | restart the app          |
      | return after backgrounding |
      | force quit and relaunch  |