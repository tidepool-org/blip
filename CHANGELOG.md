# Blip
Blip is the web front end for YourLoops system.
It is based on Tidepool Blip 1.27.

## Unreleased
### Added
- PT-880 Display Parameter object change in Daily view
- PT-1027 Inform the user when he has reach a max login attempt

### Fixed
- PT-1128 Refresh button is automatically switching to BGM 

### Changed
- PT-1112 Upgrade Viz to 0.10.4: change the color of RescueCarb tool tip to be consistent with the other tool tips
- PT-1135 Remove BGLog page
- PT-1140 Split the link to the terms of Use in the footer

## 0.12.0 - 2020-02-17
### Fixed
- PT-338 Fix some translations.
- PT-1115 Fix wrong display due to inconsitent timezone in upload object
- PT-1108 PT-1105 PT-1114 Make Diabeloop devices automated devices.

### Changed
- PT-1052 Rework sign up (direct link to clinician signup from home page + clinician option selected as default in signup page)
- PT-1100 Move message notes to the bottom of the daily page
- PT-1041 Rework invitation page for clinicals users
- PT-1111 Allow capacity to reset the search

### Added
- PT-875 Flexible period in Trending page
- PT-1008 Add a 3 months button in Trending page

## 0.11.0 - 2020-01-06
### Fixed
- PT-869 Fix labelling issue in validation errors

### Changed
 - PT-836 Display list of patients to clinician as a default behaviour

### Added
 - PT-883 Display reservoir change in daily BG section
 - PN-10 Add Show/hide password in Signup page
 - PN-9 Add Show/hide password in Login page
 - PT-412 Add option to display password when changing password
 - PT-865 Display physical activity in Bolus/Food section

## 0.10.0 - 2019-12-09 
### Added
 - PT-844 Integrate Tideline 1.4.0 with new logo/picto for insulin sites
 - PT-847 Integrate Viz 0.7.0 with new logo in pdf for infusion site. Fix date formats in pdf. 

## 0.9.1 - 2019-12-02  
### Fixed
 - PT-808 fix minor bugs identified after the release of blip 0.9.0
 - PT-814 distinguish matomo data origin (preview vs clinical vs commercial)

## 0.9.0 - 2019-11-08  
### Added
- PT-728 Analytics/metrics for Blip/Front usage
### Changed
- PT-755 Update naming for stopped loop mode

### Fixed
- PT-597 Blip does not display medical data for patients having no medical data in the last 2 months
- PT-774 Fix problems with translations in blip


## 0.8.0 - 2019-10-30  
### Other Notes
- PT-719 Update translations in Blip for parameters

## 0.7.1 - 2019-10-17  
### Fixed
- PT-738 Blip build in invalid due to missing config
- PT-746 Fix Zendesk script missing when running buildconfig

## 0.7.0 - 2019-10-15  
### Added
- PT-401 Display rescueCarbs with specific layout in Daily view
- PT-574 Integrate latest change from [Tidepool 1.27.0](https://github.com/tidepool-org/blip/releases/tag/v1.27.0)
- PT-415 Add german language

## 0.6.2 - 2019-09-16  
### Other Notes
- PT-640 Upgrade viz to dblp.0.4.3

## 0.6.1 - 2019-08-26  
### Fixed
- PT-426 Update Translations
- Using Tideline dblp.1.1.2
- Using Viz dblp.0.4.2
- PT-370 The same "B" was displayed in French in basal section for closed loop and open loop.

## 0.6.0 - 2019-08-09  
### Added
- PT-545 Display infusion site changes for Diabeloop Devices


### Fixed
- PT-532 One can create a patient even if the application is not allowing it

## 0.5.0 - 2019-07-29  
### Added
- PT-376 Integrate latest change from [Tidepool 1.20.2](https://github.com/tidepool-org/blip/releases/tag/v1.20.2)
- PT-513 Display history of parameters change in patient settings page.


### Fixed
- PT-304 Validation of the patient diagnostic date and date of birth uses the wrong format

## 0.4.0 - 2019-05-15  
### Added
- PT-365 Add Firefox, Chrome on iOS and edge as authorized browsers. A warning message is displayed for any other browser than Chrome.

## 0.3.1 - 2019-04-17  
### Changed
- PT-169: Review look & feel for PDF generated - review translations

## 0.3.0 - 2019-04-08  
### Added
 - Add favicon
 - Add HELP_LINK variable to configure external web widget for online help in the application.
    - widget gives access to helpCenter
    - once authenticated, the widget form is pre-filled with user name and email
 - Add ASSETS_URL variable to reference terms of use and data privacy documents.
 - Remove Support link from footer
 - Add Diabeloop link in footer
### Other Notes



## 0.2.2 - 2019-03-19  
### Added
- Add/Update translations
- Change e-mail & password can be disabled for patients. They cannot be disabled for clinical accounts.
- Disable the create patient account page

## 0.1.8 -   
### Added
- Based on [Tidepool 1.12.5](https://github.com/tidepool-org/blip/releases/tag/v1.12.5)
- MVP for Branding
- Add integration with external tool
- Fix couple of bugs
   - user automatically disconnected [PT-69]
   - Fix race condition [PT-17]
   - Fix Unknown DOM property class [PT-163]
