# Yourloops data visualization for diabetes device data
This node package is a dependency of Blip and was forked from tidepool/viz.

## 0.13.0 - 2020-07-01
### Engineering
- PT-1345 Fix packages vulnerabilities
  - Remove storybook (not used)
  - Update build system to match more closely tideline/blip
  - Use nexus repository for npm packages
  - Update eslint configuration to match more closely tideline/blip
  - Run the tests with Firefox, alongside Chrome

## 0.12.2 - 2020-06-11
### Fixe
- PT-1172 Display of parameter history in Device Settings page does not manage correctly the timezone information

## 0.12.1 - 2020-05-07
### Fixed
- PT-1249 Reduce blip & viz build time: Missing a change

## 0.12.0 - 2020-05-06
### Engineering use
- PT-1249 Reduce blip & viz build time.
### Changed
- PT-1256 Fix PDF generation
- PT-1205 Display data based on timezone objects
### Fixed
- PT-1244 Parameter names are not aligned in Daily tooltip
- PT-1245 Parameter values are not rounded in Daily tooltip and Device settings page

## 0.11.3 - 2020-04-17
### Fixed
- PT-1230 CGM / BGM labels don't change with language

## 0.11.2 - 2020-03-10
### Changed
- PT-1113 Change basal insulin colors in widget and graph

## 0.11.1 - 2020-03-09
### Fixed
- PT-1145 - Display of parameters changes is not consistent (fix react warnings, maybe it will fix the problem)
- PT-1103 Delete caps in legends (daily view)

## 0.11.0 - 2020-03-02
- PT-1121 display parameter change in daily view 

## 0.10.4 - 2020-02-20
- PT-1112 change the color of RescueCarb tool tip to be consistent with the other tool tips

## 0.10.3 - 2020-02-13
- PT-1114 Regression on viz widgets, some stats are nor displayed correctly

## 0.10.2 - 2020-02-11 
### Fixed
- PT-1105 All Diabeloop devices are considered as _automated basal_ models

## 0.10.1 - 2020-02-04 
### Fixed
- PT-570 Missing translations in viz

## 0.10.0 - 2020-01-30 
### Changed
- PT-874 TrendsContainer - Remove the fixed extendSizes limits

## 0.9.0 - 2020-01-06

### Added
- PT-884 Add ToolTip for reservoir change

## 0.8.0 - 2019-12-20 
### Added
- PT-865 Display physical activity in CGM section

## 0.7.0 - 2019-12-09
### Added
- PT-847 Change logo in pdf for infusion site. Fix date formats in pdf.

## 0.6.0 - 2019-10-30
### Added
- PT-131 Make Device Settings i18n compatible so that they will be displayed in blip in user language.

## 0.5.0 - 2019-10-14
### Added
- PT-573 Integrate latest changes from Tidepool Viz v1.8.0(https://github.com/tidepool-org/viz/releases/tag/v1.8.0)

## 0.4.4 - 2019-10-11 
### Fixed
- PT-703 Fix avg Daily insulin is not correct on Basics page
### Added 
- PT-710 Distinguish rescuecarbs in Viz

## 0.4.3
### Fixed
- PT-640 Fix display of parameter history is not accurate

## 0.4.2
### Fixed
- PT-590 Fix translations

## 0.4.1
### Fixed
- PT-549 Time in Closed Loop is not displayed anymore for Diabeloop device.

## 0.4.0 - 2019-08-07
### Added
- PT-509 Display reservoir changes in Print view (PDF) for Diabeloop devices.
- Add Diabeloop Profile
- PT-554 Start effort to make labels translatable in all languages.

## 0.3.1 - 2019-07-30
### Fixed
- Fix "Uncaught TypeError: Cannot read property 'returnEmptyString' of undefined". PRoblem discovered during

## 0.3.0 - 2019-07-29
### Added
- PT-511 Display parameters history in the system parameters screen (data comming from portal db)

## 0.2.0-rc01 - 2019-05-17
### Added
- Integrate latest changes from Tidepool Viz v1.3.0(https://github.com/tidepool-org/viz/releases/tag/v1.3.0)

## 0.1.3 - 2019-04-17
### Changed
- PT-169 Review look & feel for PDF generated - add a diabeloop specific image.

## 0.1.2 - 2019-03-14
- MVP for Yourloops Branding
