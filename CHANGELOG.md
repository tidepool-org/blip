# Blip 

## [Unreleased]

## [0.3.1] - 2019-04-17

### Changed
- PT-169: Review look & feel for PDF generated - review translations

## [0.3.0] - 2019-04-08
Release candidate for pre-launch

### ADDED
 - Add favicon
 - Add HELP_LINK variable to configure external web widget for online help in the application. 
    - widget gives access to helpCenter
    - once authenticated, the widget form is pre-filled with user name and email
 - Add ASSETS_URL variable to reference terms of use and data privacy documents.
 - Remove Support link from footer
 - Add Diabeloop link in footer


# [0.2.2] - 2019-03-19 

### ADDED
- Add/Update translations
- Change e-mail & password can be disabled for patients. They cannot be disabled for clinical accounts.
- Disable the create patient account page

# [0.1.8]

### ADDED
- Based on [Tidepool 1.12.5](https://github.com/tidepool-org/blip/releases/tag/v1.12.5)
- MVP for Branding 
- Add integration with external tool
- Fix couple of bugs 
   - user automatically disconnected [PT-69]
   - Fix race condition [PT-17]
   - Fix Unknown DOM property class [PT-163]
