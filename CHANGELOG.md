# Yourloops data visualization for diabetes device data
Library for Tidepool's timeline-style diabetes data visualization(s) used in Blip and was forked from tidepool/tideline.

## 1.12.1 2020-08-24
### Fixed
- PT-1480 Deduplicate PAs based on inputTime

## 1.12.0 2020-08-10
### Changed 
- PT-1444 Deduplicate Physical Activity events containing the new EventId field

## 1.11.1 - 2020-07-20
### Fixed
- YLP-88 Fix CSS for display infusion site change in the basics page

## 1.11.0 - 2020-07-10
### Changed
- PT-1297 Display Bolus objects additional fields 

## 1.10.4 - 2020-07-07
### Fixed
- PT-1405 portal-api data uploaded through V1 routes have UTC timezone generating timeChange events

## 1.10.3 - 2020-07-02
### Engineering
- PT-1345 Fix npm package vulnerabilities and align build for blip.

## 1.10.2 - 2020-05-12
### Fixed
- PT-1330 Tideline: bows not avail in prod build (regression)

## 1.10.1 - 2020-05-11
### Engineering use
- Fetch npm packages from nexus.ci.diabeloop.eu
### Fixed
- Bump acorn from 6.4.0 to 6.4.1 (security fix)

## 1.10.0 - 2020-05-06
### Fixed 
- PT-1205 Add timezone info on tooltips when necessary
- PT-1246 Basal loop mode is displayed as "automated" in daily view

## 1.9.2 - 2020-04-17
### Fixed
- PT-1231 Basics: Total basal events count does not give the correct total

## 1.9.1 - 2020-03-30
### Fixed
- PT-1206 PT-1127 Have notes in first position on the daily screen, reverting PT-1100

## 1.9.0 - 2020-03-30
### Changed
- PT-1198 remove unused items in Basics page

## 1.8.0 - 2020-03-20
### Changed
- PT-1203 More info in "No Data" message is null

## 1.7.3 - 2020-03-20
### Fixed 
- PT-1165 Device Parameters are not displayed when fetching a non default period

## 1.7.2 - 2020-03-10
### Changed
- PT-1104 Update graph legend with the right items (Remove delivered/scheduled, add loop mode)
- PT-1113 Change basal insulin colors in widget and graph

## 1.7.1 - 2020-03-06 
### Fixed
- PT-1155 Device Parameter change is not displayed if there is only one object in the fetched period

## 1.7.0 - 2020-03-02
### Added
- PT-1122 Display Parameter object in daily view

## 1.6.2 - 2020-02-11
### Fixed
- PT-1108 All Diabeloop devices are considered as _automated basal_ models

## 1.6.0 - 2020-01-06

### Added
- PT-882 Display reservoir change in Glycemia section

## 1.5.0 - 2019-12-20
### Added
- PT-865 Display physical activity in Glycemia section

## 1.4.0 - 2019-12-04
### Added
- PT-726 Review the logo/picto for insulin sites

## 1.3.0 - 2019-10-14
### Added
- PT-575 Integrate Tidepool changes until v1.14.0 https://github.com/tidepool-org/tideline/tree/v1.14.0

## 1.2.1 - 2019-10-11
### Fixed
- PT-704 Fix Daily View: widgets data does not match displayed data

## 1.2.0 - 2019-10-11
### Added
- PT-711 Display Rescucarbs with their own layout

## 1.1.2 - 2019-08-26
### Fixed
- PT-588 Fix translations

## 1.1.1 - 2019-08-14
### Fixed
- PT-571 Fix wording

## 1.1.0 - 2019-08-07
### Added
- PT-508 Display reservoir changes in main page for Diabeloop devices.

## 1.0.0 - 2019-08-05
### Added
- Integrate Tidepool changes until v1.12.0 https://github.com/tidepool-org/tideline/tree/v1.12.0
