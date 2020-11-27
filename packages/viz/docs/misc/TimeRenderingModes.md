## Time rendering modes

Tidepool supports two rendering "modes" for diabetes device data & notes visualized via the code in this repository (as well as legacy [tideline](https://github.com/tidepool-org/tideline 'GitHub: @tidepool-org/tideline') code): the default timezone-aware rendering and timezone-naïve rendering. This document explains and demonstrates the difference(s) between these and the utility of each.

### Background: `time` and `deviceTime`

Two of the time-related fields in the [Tidepool data model for diabetes device data](http://developer.tidepool.io/data-model/device-data/common.html 'Tidepool data model docs: common fields') are important to understand as background to the discussion presented in this document; these are [`time`](http://developer.tidepool.io/data-model/device-data/common.html#time 'Tidepool data model docs: time') and [`deviceTime`](http://developer.tidepool.io/data-model/device-data/common.html#devicetime 'Tidepool data model docs: deviceTime').

`deviceTime` is what it sounds like: the display time on the diabetes device at the time the event occurred. For almost every current Tidepool data source, this is *the* (only) time value that we extract directly from a device's memory.[^a] In the base case, this should be an accurate representation of the clock time for the user—that is, localized to the timezone the user is currently in or was in at the time of the event, assuming the user updates the device display time when switching timezones. Of course, since the display time settings on diabetes devices are subject to manual user control, user error can occur, occasionally with drastic results. We have seen cases where users have accidentally set the display time on their device to the wrong a.m. or p.m. (resulting in `deviceTime`s that are off by exactly twelve hours), to the wrong month, and—more often than one might expect!—to the wrong *year*.

[Bootstrapping to UTC (BtUTC)](http://developer.tidepool.io/chrome-uploader/docs/BootstrappingToUTC.html) is the algorithm we have developed to correct for these types of user errors (as well as the more common challenge of handling the switch between Daylight Saving time and standard time) by inferring the UTC time for each event so that we can plot all the data from a user's many diabetes devices on the same scale with all the data properly aligned. This is the value stored in the `time` field.

### Timezone-aware rendering

The default rendering mode is timezone-aware. This means that all events are rendered on a UTC time scale using the `time` value to determine the placement along this scale. Whenever a time-related value needs to be surfaced to the user, we apply a timezone to this `time` value and surface the result, as this is our best guess at the corresponding local display time for the user (the exception is if the user was traveling in a different timezone for a span of data). Currently (as of November, 2016) we use the `timezone` from the user's most recent [upload metadata](http://developer.tidepool.io/data-model/device-data/types/upload.html#timezone 'Tidepool data model docs: upload.timezone') as the timezone to be applied to the `time` values across the entire history of the user's diabetes device data. This *does* adjust as expected for Daylight Saving time, but does *not* adjust for travel across timezones if the user changed their device display time when switching timezones. In the future, instead of pulling the display timezone from the most recent upload metadata we plan to support a "default timezone for data display" along with other display settings for each user persisted to Tidepool's servers, including preferred blood glucose units (mg/dL or mmol/L) and a user-defined target range for blood glucose values.

Features of timezone-aware rendering:

- no gaps or overlaps in data
- all data aligns *except* BGM data in cases of user error setting the BGM time or travel across timezones (because no BGM is currently bootstrap-able)

### Timezone-naïve rendering

A second rendering mode is available (currently, as of November, 2016) by adding a query parameter to the URL: `?timezone=None` (any string that does not correspond to an actual [IANA timezone](https://www.iana.org/time-zones 'IANA: Time Zone Database') may take the place of `None` here as long as it is not a falsey value in JavaScript such as `null`). This rendering mode also renders the events on the same UTC time scale but using the `deviceTime` *as if it were a true UTC value*. In order to "spoof" a true UTC value from a `deviceTime`, we simply add the string suffix `Z` denoting UTC or "Zulu" time to the value—that is, a `deviceTime` of `2016-03-15T12:00:00` with no timezone offset information becomes the UTC string `2016-03-15T12:00:00Z`. (The technical reason for performing this string transformation is demonstrated below.)

To date, timezone-naïve mode has been most valuable as a debugging tool when investigating data quality issues reported by users. For users whose situations fall into edge cases that BtUTC does not handle, timezone-naïve rendering may also be the *only* method available to see all diabetes device data aligned.

Features of timezone-naïve rendering:

- gaps and overlaps appear in the data whenever the user has made a significant (i.e., non-["clock drift"](http://developer.tidepool.io/chrome-uploader/docs/BootstrappingToUTC.html#adjustments-for-clock-drift 'BtUTC documentation: Adjustments for clock drift')) change to the display time
- all data aligns as long as there were no user error(s) setting one or more device display times and the user consistently updated device display time across *all* devices when switching timezones and entering/exiting Daylight Saving time (if applicable)

* * * * *

[^a]: The exception is Dexcom G5 data imported from HealthKit through one of Tidepool's iOS applications; in this case, we have *no* `deviceTime`, only a true UTC timestamp—our `time` field—extracted from the iOS HealthKit data model.
