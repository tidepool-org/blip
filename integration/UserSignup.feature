Feature: User Signup
  As a person invited to the blip beta
  I want to to be able to sign up to blip
  So that I can begin using the service

  Scenario: Signup page with (valid) key and email set
    Given I am on the signup page with (valid) key and email set
    Then I should see a signup form

  Scenario: Signup page with (invalid) key and email set
    Given I am on the signup page with (invalid) key and email set
    Then I should see a signup form

  Scenario: Signup page with just (valid) key set
    Given I am on the signup page with just (valid) key set
    Then I should see a signup form

  Scenario: Signup page with just email set
    Given I am on the signup page with just email set
    Then I should see a signup form
