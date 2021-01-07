# Blip
Blip is the web front end for YourLoops system.
It is based on Tidepool Blip 1.27.

## 1.7.0-rc5 2021-01-04
### Added
- YLP-215 Display Confidential mode on Daily view
- YLP-236 Display Zen mode activation on Daily view
- YLP-298 Enable Spanish and Italian languages
- YLP-317 Add Switzerland in country list
### Fixed
- YLP-216 Interrupted bolus is not correctly displayed
- YLP-289 RescueCarbs: recommendation is always set to 0 for automatic mode
- YLP-292 Error messages not translated when creating an account
- YLP-306 Change the language on login page may prevent the login
- YLP-318 Widget bolus / weight does not display result
- YLP-320 Matomo tracker is no longer active
- YLP-322 Units change after an update done in patient settings
- YLP-336 Block DBL settings display order
### Changed
- YLP-26 Make bolus graph more readable
- YLP-52 Review clinician direct signup flow
- YLP-267 Delete BG readings calendar from overview
- YLP-280 Make France as default country for existing users
- YLP-273 Translate units in DBL settings table and display depending on patient profile
- YLP-282 Simplify Basal/Bolus insulin ratio widget
- YLP-299 Change "parameters" for "settings" in English
- YLP-305 Change patient age to birthdate in their profile
- YLP-313 Create dedicated key for bolus graph title
- YLP-324 Pump and CGM information in DBL settings
- YLP-337 Update settings labels
- YLP-342 Add missing translation keys for CBG/SMBG tooltips
- YLP-415 Change "infusion site changes" calendar for "cartridge changes"
### Engineering Use
- YLP-147 Merge blip dependencies
- YLP-211 Rework Cloudfront deployment services to use an alternate domain name
- YLP-345 Add a "maintenance state" to our CloudFront config

## 1.6.0 - 2020-11-10
### Added
- YLP-247 Add Dutch language
### Changed
- YLP-59 Clean HCP profil setup form
- YLP-103 Pick country and language when signing up
- YLP-109 Block units
- YLP-111 Display localized CGU and data privacy
- YLP-173 Loop mode label
- YLP-203 Change menu item "System settings" to "DBL settings"
- YLP-205 Change menu item "print"
- YLP-206 Allow name edition for patient profile
- YLP-229 Make "Daily" view the homepage of YourLoops instead of "Overview"
- YLP-265 Prevent the edition of patient name on clinical environment
- YLP-272 Display data with correct units when user settings does not contain the bgTarget
- YLP-289 Block weight units
### Fixed
- YLP-262 Settings are not displayed in blip with updated pumpSettings uploads
- YLP-290 Trends calendar button and text is white
- Be sure to use the fallback language if the navigator one is not supported (YLP-111 related)
### Engineering Use
- YLP-221: move to Jenkins and automatically deploy our master branch (dblp) to cloudfront preview env.

## 1.5.0 - 2020-10-05  
### Changed
- YLP-152 Design update consent screen.
- YLP-158 Delete Consent banner from all environments.
- YLP-159 Upgrade blip, viz and tideline from react15 to react16
- YLP-180 Create separate string for bolus type


### Engineering Use
- YLP-128 Refactor to move to Cloudfront
- Prevent from security scan to run

## 1.4.2 - 2020-09-09  
### Fixed
- YLP-157 Add german locale to the list of available languages.

## 1.4.1 - 2020-08-31  
### Fixed
- Updating german translations

## 1.4.0 - 2020-08-26  
### Changed
- YLP-92 Block patient name edition in profile


### Fixed
- PT-1480 Tideline 1.12.1


### Engineering Use
- YLP-107 Create lambda edge generatation script for CloudFront

## 1.3.1 - 2020-08-19  
### Engineering Use
- PT-1470 Update blip docker image to run as Coreye user

## 1.3.0 - 2020-08-17  
### Changed
- PT-1444 Deduplicate Physical Activity events containing the new EventId field
- PT-1304 Display the new physical activity fields
- YLP-115 Add intermediate screen after login to renew consent

### Fixed
- YLP-15 Calculate coefficient of Variation with correct formula: 2 weeks CV displays the result of average daily CV of the 14 days

## 1.2.0 - 2020-07-31  
### Changed
- YLP-72 Have two distincts fields for first name and last name in profile page


### Engineering Use
- YLP-48 Change crowdin pseudo language from 'it' to 'lol'
- Externalize languages definition (out of code)

## 1.1.0 - 2020-07-21  
### Changed
- PT-1297 Display Bolus objects additional fields


### Fixed
- Translation update: English / French / German
- YLP-78 Don't let tests failed when we update a translation in Crowdin
- YLP-89 Infusion site icon missing in basics calendar

## 1.0.3 - 2020-07-15  
### Fixed
- PT-1395 Daily view: time of objects is displayed as UTC while timeline is displayed with locale time

## 1.0.2 - 2020-07-10  
### Fixed
- PT-1168 Fix display bug when updating user profile
- PT-1125 Add missing calendar translation


### Engineering Use
- PT-1345 Fix vulnerabilities and update build system
  - Remove hakken and other deprecated stuffs
  - Update documentation
  - Upgrade most of the SOUP packages
  - Update eslint
  - Support CloudFront deployment
  - Fix route when using index.html as an entry
  - Allow to deploy in production a smaller server package (without webpack)
  - Fix problems when running the dblp target server for dev (config not set)
  - Allow to run test in docker
  - Speed up build

## 1.0.1 - 2020-06-12  
### Fixed
- PT-1172 Display of parameter history in Device Settings page does not manage correctly the timezone information

## 1.0.0 - 2020-05-25  
### Added
- Blip Medical Device published as major version.



### Fixed
- Fix regression introduced in PT-1309
- Disable German language

## 0.17.0 - 2020-05-20  
### Changed
- PT-1309 Ensure Blip SOUP list includes viz and tideline SOUPs
- PT-1335 Display legal stuff in YourLoops (such as CE mark)

## 0.16.0 - 2020-05-14  
### Added
 - PT-1251 Display TIR result of last 24 hours in patients search page.



### Changed
- PT-1205 Add timezone info on tooltips when necessary
- PT-1254 Disable Highwater from Blip
- PT-1256 Improve PDF generation



### Engineering Use
- PT-1249 Reduce blip & viz build time.

## 0.15.1 - 2020-04-17  
### Changed
- Upgrade to Tideline 1.9.2
  - PT-1231 Basics: Total basal events count does not give the correct total
- Upgrade to Viz 0.11.3
  - PT-1230 CGM / BGM labels don't change with language



### Fixed
- PT-1218 Zendesk Contact form is not offloaded
- PT-419 Manage Language in Zendesk widget

## 0.15.0 - 2020-04-14  
### Changed
- PT-1093 Search Page: remove date of birth as filter
- PT-1094 Search Page: remove the persona icon next to the patient name
- PT-1194 Search Page: add a way to open the patient page in a new tab



### Fixed
- PT-1157 Revert temporary fix PT-1115



### Other Notes
- PT-1215 Integration with Crowdin live preview (localization management saas)

## 0.14.1 - 2020-03-31  
### Fixed
- Integrate parameters translations

## 0.14.0 - 2020-03-30  
### Changed
- PT-1224 Remove useless link in Device Settings screen
- Upgrade tideline to 1.9.1
  - PT-1206 PT-1127 Have notes in first position on the daily screen, reverting PT-1100
- Upgrade tideline to 1.9.0
  - PT-1198 remove unused items from Basics screen
- Upgrade tideline to 1.8.0
  - PT-1203 Remove moreInfo message in noData section from Basics screen

## 0.13.0 - 2020-03-20  
### Added
- PT-880 Display Parameter object change in Daily view
- PT-1027 Inform the user when he has reach a max login attempt



### Changed
- PT-1189 Review support email to be yourloops@diabeloop.com
- PT-1113 Upgrade Viz to 0.11.2 and Tideline to 1.7.2: Change basal insulin colors in widget and graph 
- PT-1112 Upgrade Viz to 0.10.4: change the color of RescueCarb tool tip to be consistent with the other tool tips
- PT-1135 Remove BGLog page
- PT-1140 Split the link to the terms of Use in the footer
- PT-1009 Manage the update of the data privacy
- PT-1197 Basics screen wording update



### Fixed
- PT-1128 Refresh button is automatically switching to BGM
- PT-1103 Delete caps in legends (daily view)

## 0.12.0 - 2020-02-17  
### Added
- PT-875 Flexible period in Trending page
- PT-1008 Add a 3 months button in Trending page



### Changed
- PT-1052 Rework sign up (direct link to clinician signup from home page + clinician option selected as default in signup page)
- PT-1100 Move message notes to the bottom of the daily page
- PT-1041 Rework invitation page for clinicals users
- PT-1111 Allow capacity to reset the search



### Fixed
- PT-338 Fix some translations.
- PT-1115 Fix wrong display due to inconsitent timezone in upload object
- PT-1108 PT-1105 PT-1114 Make Diabeloop devices automated devices.

## 0.11.0 - 2020-01-06  
### Added
 - PT-883 Display reservoir change in daily BG section
 - PN-10 Add Show/hide password in Signup page
 - PN-9 Add Show/hide password in Login page
 - PT-412 Add option to display password when changing password
 - PT-865 Display physical activity in Bolus/Food section



### Changed
 - PT-836 Display list of patients to clinician as a default behaviour



### Fixed
- PT-869 Fix labelling issue in validation errors

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
 Other Notes

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
