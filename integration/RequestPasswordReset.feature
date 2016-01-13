Feature: Request Password Reset
  As a user of blip
  I want to be able to request a password reset

  Scenario: Request password reset page
    Given I am on the request password page
    Then I should see a request password form
    And I should be on the request password page

# TODO: check for error message if try to submit form without valid e-mail
# TODO: check for ability to submit form with valid e-mail?
