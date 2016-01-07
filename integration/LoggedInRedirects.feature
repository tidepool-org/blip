Feature: Redirects from No-Auth Routes
  As a user of blip
  If I logged in with 'Remember Me'
  And I try to navigate to a no-auth route
  I want to be redirected to my care team memberships page
  Else if I logged in without 'Remember Me' 
  And I try to navigate to a no-auth route
  I should land at the no-auth route
  
  Scenario: Navigate to Login Page after Logging in with 'Remember Me'
    Given I am logged in with 'Remember Me' checked
    When I navigate to the login page
    Then I should be on my care team memberships page
  
  Scenario: Navigate to Login Page after Logging in w/o 'Remember Me'
    Given I am logged in without 'Remember Me'
    When I navigate to the login page
    Then I should be on the login page