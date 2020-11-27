## Common props in Tidepool data visualization code

Several of the pieces of [the state common to most, if not all, of Tidepool's data visualization views](../FeatureOverview.md#shared-state) are most often encountered in the code as props passed to React components. This page provides a quick reference describing the canonical forms of these pieces of state since they occur and are used (for example: as a parameter in a utility function) **very** frequently.

- [`bgPrefs`](#bgPrefs)
- [`timePrefs`](#timePrefs)

### `bgPrefs`

`bgPrefs` is an object with two properties: `bgUnits` and `bgBounds`. Sometimes these component properties are passed around on their own, and sometimes `bgPrefs` is passed around as a whole. (As we increase our commitment to support for mmol/L as well as mg/dL blood glucose units, it will probably be necessary to access both `bgUnits` and `bgBounds` simultaneously most of the time, so it is probably a good idea to just get used to passing around `bgPrefs` as a whole.)

`bgUnits` is a String value that can be either `mg/dL` or `mmol/L`. To avoid typos and capitalization errors, we export a constant for each of these strings from src/utils/constants.js; use them with `import { MGDL_UNITS, MMOLL_UNITS } from 'path/to/utils/constants'`.

`bgBounds` is an Object with five numerical fields:
- `veryLowThreshold` encodes the threshold (logic is <) for encoding a blood glucose value as "very low"
- (a value >= `veryLowThreshold` and < `targetLowerBound` is "low")
- `targetLowerBound` encodes the lower bound for the user's target blood glucose range; logic is >= the threshold is "target"
- `targetUpperBound` encodes the upper bound for the user's target blood glucose range; logic is <= the threshold is "target"
- (a value > `targetUpperBound` and <= `veryHighThreshold` is "high")
- `veryHighThreshold` encodes the threshold (logic is >) for encoding a blood glucose value as "very high"
- `clampThreshold` encodes the value at which we clamp the blood glucose scale (logic is >); read about clamping scales in [the d3-scale documentation](https://github.com/d3/d3-scale#continuous_clamp 'd3-scale: clamp()')

The function `classifyBgValue` exported from the blood glucose utilities in `src/utils/bloodglucose.js` will return the classification for any blood glucose value given the `value` and the `bgBounds`. (See also [all the API documentation for blood glucose utility functions](../../src/utils/apidocs/bloodglucose.md).)

### `timePrefs`

`timePrefs` is an object with two properties: `timezoneAware` and `timezoneName`. The `timezoneAware` property is a simple Boolean indicating whether or not the user wants to view data in timezone-aware mode; `timezoneAware` defaults to `true`. Because the extraction of a named timezone depends in part on the value of `timezoneAware`[^a], `timePrefs` should **always** be passed around as an entire object, and the utility function `getTimezoneFromTimePrefs` exported from the datetime utilities in `src/utils/datetime.js` should be used to extract the timezone String when required. (See also [all the API documentation for datetime utility functions](../../src/utils/apidocs/datetime.md).)

`timezoneName` is a String timezone that the [Moment.js](https://momentjs.com/ 'Moment.js') datetime utility library recognizes. Moment.js in turn recognizes all timezones from the [IANA Time Zone Database](https://www.iana.org/time-zones 'IANA Time Zone Database).

[^a]: In brief, if `timezoneAware` is `false`, then `UTC` is used for the timezone String in all circumstances and methods where a timezoe String is required.
