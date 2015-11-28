Feature: User Signup
  As a person
  I want to to be able to sign up to Blip
  So that I can begin using the service

  Scenario: Signup Screen with no key or email set
    Given I am on the signup page with no key or email set
    Then I should see a waitlist form

  Scenario: Signup Screen with key and email set
    Given I am on the signup page with key and email set
    Then I should see a signup form

