# Blip 

## [Unreleased]

### Fixed
- PT-532 One can create a patient even if the application is not allowing it

## [0.5.0] - 2019-07-29

### Added
- PT-376 Integrate latest change from [Tidepool 1.20.2](https://github.com/tidepool-org/blip/releases/tag/v1.20.2)
- PT-513 Display history of parameters change in patient settings page.

### Fixed
- PT-304 Validation of the patient diagnostic date and date of birth uses the wrong format

## [0.4.0] - 2019-05-15

### Added
- PT-365 Add Firefox, Chrome on iOS and edge as authorized browsers. A warning message is displayed for any other browser than Chrome.

## [0.3.1] - 2019-04-17

### Changed
- PT-169: Review look & feel for PDF generated - review translations

## [0.3.0] - 2019-04-08
Release candidate for pre-launch

### Added
 - Add favicon
 - Add HELP_LINK variable to configure external web widget for online help in the application. 
    - widget gives access to helpCenter
    - once authenticated, the widget form is pre-filled with user name and email
 - Add ASSETS_URL variable to reference terms of use and data privacy documents.
 - Remove Support link from footer
 - Add Diabeloop link in footer


# [0.2.2] - 2019-03-19 

### Added
- Add/Update translations
- Change e-mail & password can be disabled for patients. They cannot be disabled for clinical accounts.
- Disable the create patient account page

# [0.1.8]

### Added
- Based on [Tidepool 1.12.5](https://github.com/tidepool-org/blip/releases/tag/v1.12.5)
- MVP for Branding 
- Add integration with external tool
- Fix couple of bugs 
   - user automatically disconnected [PT-69]
   - Fix race condition [PT-17]
   - Fix Unknown DOM property class [PT-163]
