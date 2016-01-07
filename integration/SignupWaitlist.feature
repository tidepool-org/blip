Feature: Signup Waitlist
  As a (random) person
  I want to be able to join the blip waitlist
  So that I may be invited to use blip if my devices are compatible

  Scenario: Signup page with no key or email set
    Given I am on the signup page with no key or email set
    Then I should see a waitlist form

  Scenario: Signup page with invalid key
    Given I am on the signup page with an invalid key set
    Then I should see a waitlist form