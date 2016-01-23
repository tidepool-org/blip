Feature: Terms of Use
  As a (random) person
  I want to be able to view the Terms of Use
  So that I can make a decision about signing up

  Scenario: View Terms of Use
    Given I am on the terms of use page without being authenticated
    Then I should see the terms of service

  Scenario: New user should see the Terms of Use on login
    Given I am on the login page
    Then I should see a login form
    When I enter and submit my credentials
    Then I should be on my care team memberships page
    Then I should be on the terms of use page
    Then I should see the age selection screen
