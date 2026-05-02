@smoke @regression @auth
Feature: Handle Invalid Login Credentials

  As a doctor
  I want to see a clear error message when I enter wrong credentials
  So that I know what went wrong and can try again

  Background:
    Given I am on the login screen

  @positive
  Scenario: Display error message for invalid credentials
    When I enter invalid username or password and tap "Login"
    Then I see the error message "Invalid username or password. Please try again."
    And the username and password fields remain editable
    And I can attempt to log in again
    And no session token is stored

  @positive
  Scenario: Clear error message on user interaction
    Given I have seen an error message for invalid credentials
    When I start typing in the username or password field
    Then the error message is cleared
    And I can attempt to log in again

  @negative
  Scenario: Multiple failed login attempts
    When I enter invalid credentials multiple times
    Then each attempt shows the same error message
    And the form remains functional

  @boundary
  Scenario Outline: Handle different invalid credential scenarios
    When I enter <invalid_credential> and tap "Login"
    Then I see the appropriate error message
    And the form remains usable

    Examples:
      | invalid_credential    |
      | wrong username       |
      | wrong password       |
      | both wrong           |
      | empty username       |
      | empty password       |