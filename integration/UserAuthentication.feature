Feature: User Authentication
  As a user of Blip
  I want to to be able to log in and out of Blip
  So that I can have secured access to my data

  Scenario: Login Screen
    Given I am on the login page
    Then I should see a login form
    And I should see a forgot my password link

  Scenario: Go to Request Password
    Given I am on the login page
    When I click on the forgot password link
    Then I should see a request password form
    And I should be on the request password page

  Scenario: Login to App
    Given I am on the login page
    Then I should see a login form
    When I enter and submit my credentials
    Then I should be on the care team page