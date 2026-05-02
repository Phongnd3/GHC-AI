@smoke @regression @dashboard @empty-state
Feature: Handle Empty Patient List

  As a doctor
  I want to see a clear message when I have no assigned patients
  So that I know the app is working correctly and I simply have no patients today

  Background:
    Given I am logged in as a doctor

  @positive
  Scenario: Display empty state when no patients assigned
    Given I have no patients with active visits assigned to me
    When I view the My Patients dashboard
    Then I see the message "No active patients assigned to you"
    And an appropriate icon is displayed
    And no patient cards are shown

  @negative
  Scenario: Empty state not shown when patients exist
    Given I have assigned patients with active visits
    When I view the dashboard
    Then the empty state is not displayed
    And patient cards are shown instead

  @boundary
  Scenario: Transition from empty to populated list
    Given I have no assigned patients
    When new patients are assigned to me
    And I refresh the list
    Then the empty state disappears
    And patient cards are displayed