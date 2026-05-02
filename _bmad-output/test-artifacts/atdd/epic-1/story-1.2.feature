@smoke @setup @quality
Feature: Configure Development Tooling (ESLint, Prettier, Husky)

  As a developer
  I want code quality tools configured with pre-commit hooks
  So that code style is consistent and errors are caught before commit

  Background:
    Given the Expo project is initialized

  @positive
  Scenario: Configure ESLint for TypeScript and React Native
    When I install and configure ESLint with TypeScript and React plugins
    Then ESLint catches TypeScript errors and code style issues
    And ESLint configuration is properly set up for the project

  @positive
  Scenario: Configure Prettier for automatic code formatting
    When I install and configure Prettier
    Then Prettier formats code automatically
    And code formatting follows the project standards

  @positive
  Scenario: Configure Husky pre-commit hooks
    When I install and configure Husky with lint-staged
    Then pre-commit hooks run linting and formatting on staged files
    And commits are blocked if linting fails

  @negative
  Scenario: Pre-commit hook blocks commit with linting errors
    Given I have staged files with linting errors
    When I attempt to commit the changes
    Then the commit is blocked by the pre-commit hook
    And I see the linting error messages

  @boundary
  Scenario Outline: Handle different file types in linting
    Given I have <file_type> files in the project
    When the linting tools are run
    Then the files are properly linted and formatted according to project rules

    Examples:
      | file_type    |
      | TypeScript   |
      | TSX          |
      | JavaScript   |
      | JSON         |