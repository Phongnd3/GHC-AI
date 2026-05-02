@smoke @regression @auth @persistence
Feature: Session Persistence Across App Restarts

  As a doctor
  I want my session to persist when I close and reopen the app
  So that I don't have to log in again unless my session has expired

  @positive
  Scenario: Session persists within 30 minutes
    Given I am logged in with an active session
    When I close the app and reopen it within 30 minutes
    Then I am automatically taken to the My Patients dashboard
    And my session token is still valid

  @positive
  Scenario: Session expires after 30 minutes
    Given I was logged in but closed the app
    When I reopen the app after 30 minutes of inactivity
    Then I am taken to the login screen
    And I see the message "Session expired. Please log in again."

  @negative
  Scenario: Session does not persist beyond timeout
    Given my session has expired due to inactivity
    When I reopen the app
    Then I am required to log in again
    And the expired session is not restored

  @boundary
  Scenario: Session expires exactly at 30 minutes
    Given I closed the app exactly 30 minutes ago
    When I reopen the app
    Then the session is considered expired
    And I must log in again

  @boundary
  Scenario Outline: Different app closure scenarios
    Given I am logged in
    When I <closure_method> the app
    And reopen it within 30 minutes
    Then my session persists
    And I return to the dashboard

    Examples:
      | closure_method     |
      | close completely   |
      | background the app |
      | force quit         |