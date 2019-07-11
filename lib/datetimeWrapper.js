// == BDS2 LICENSE ==
// Copyright (C) 2014 Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one at http://tidepool.org/licenses/
// == BDS2 LICENSE ==

/* * * * */
// NB: DO NOT RETURN MOMENT OBJECTS FROM ANY METHOD IN THIS MODULE
// DO NOT PASS GO, DO NOT COLLECT $200
/* * * * */

'use strict';
var format = require('util').format;

var datetimeWrapper = function(moment) {
  var DEFAULT_DISPLAY_MASK = 'MMMM D [at] h:mm a';

  function _applyMask(moment, mask) {
    return moment.format(mask);
  }

  var timezoneNames = {};
  moment.tz.names().forEach(function(name) {
    timezoneNames[name] = true;
  });

  return {
    /*
     * Apply an offset to a timestamp (timezone-naive or Zulu)
     *
     * @param {String} timestamp
     * @param {Number} offset mins ~from~ UTC
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    applyOffset: function(timestamp, offset) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      return moment.utc(timestamp).add(offset, 'minutes').toDate();
    },
    /*
     * Apply a timezone to a timezone-naive timestamp
     *
     * @param {String} timestamp
     * @param {String} timezone a valid timezone name as per moment-timezone
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    applyTimezone: function(timestamp, timezone) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      this.checkTimezoneName(timezone);
      // NB: the result of this method will *not* yield the correct timezone offset from .getTimezoneOffset()
      // that is, the offset corresponding to the passed in timezone
      // because JavaScript Date doesn't do arbitrary timezones, only browser local
      if (timezone == null) {
        // some browsers assume no timezone offset means local time and others assume it means UTC
        // we explicitly make them all act like it is UTC
        return moment.utc(timestamp).toDate();
      } else {
        if (timestamp instanceof Date) {
          return moment.tz(timestamp.toISOString().slice(0,-5), timezone).toDate();
        }
        return moment.tz(timestamp, timezone).toDate();
      }
    },
    /*
     * Apply a timezone and a conversionOffset to a timezone-naive timestamp
     *
     * @param {String} timestamp
     * @param {String} timezone a valid timezone name as per moment-timezone
     * @param {Number} conversionOffset milliseconds ~from~ UTC
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    applyTimezoneAndConversionOffset: function(timestamp, timezone, conversionOffset) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      this.checkTimezoneName(timezone);
      // NB: the result of this method will *not* yield the correct timezone offset from .getTimezoneOffset()
      // that is, the offset corresponding to the passed in timezone
      // because JavaScript Date doesn't do arbitrary timezones, only browser local
      if (timezone == null) {
        // some browsers assume no timezone offset means local time and others assume it means UTC
        // we explicitly make them all act like it is UTC
        return moment.utc(timestamp).toDate();
      } else {
        if (timestamp instanceof Date) {
          return moment.tz(timestamp.toISOString().slice(0,-5), timezone)
            .subtract(conversionOffset, 'milliseconds').toDate();
        }
        return moment.tz(timestamp, timezone)
          .subtract(conversionOffset, 'milliseconds').toDate();
      }
    },
    /*
     * Construct a Date from canonically-named time fields in the provided object
     *
     * @param {Object} with time fields 'year', 'month', 'day', etc.
     * @return {Object} JavaScript Date
     */
    buildTimestamp: function(o) {
      // months are (annoyingly) zero-indexed in JavaScript (i.e., January is 0, not 1)
      var d = Date.UTC(o.year, o.month - 1, o.day, o.hours, o.minutes, o.seconds);
      if (isNaN(d)) {
        return null;
      }
      return new Date(d);
    },
    /*
     * Get the ceiling for a date (see D3's time functions)
     *
     * @param {String} timestamp
     * @param {String} units a valid units identifier per moment
     * @param {String} timezone a valid timezone name as per moment-timezone
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    ceil: function(time, units, timezone) {
      this.checkTimezoneName(timezone);
      if (timezone == null) {
        timezone = 'UTC';
      }
      return moment.utc(time).tz(timezone).startOf(units).add(1, units).toDate();
    },
    /*
     * Check a timezone name against moment's database
     *
     * @param {String} timezone timezone name
     */
    checkTimezoneName: function(timezone) {
      // actually want truthiness here; all of null, undefined, and '' should *not* throw Error
      // only check actual strings to see if recognized by moment
      if (timezone && timezoneNames[timezone] !== true) {
        throw new Error('Unrecognized timezone name!');
      }
    },
    /*
     * Get the difference between two dates in the asked for units
     *
     * @param {String} timestampA
     * @param {String} timestampB
     * @param {String} units, a valid units identifier per moment e.g. days, hours, years ...
     *
     * @return {string} the difference between the two timestamps (which will be rounded down)
     */
    dateDifference: function(timestampA, timestampB, units) {
      return moment.utc(timestampA).diff(moment.utc(timestampB), units);
    },
    /*
     * Apply Tidepool timezoneOffset and conversionOffset to a JavaScript Date
     *
     * @param {Object} JavaScript Date formed from a deviceTime
     * @param {Number} timezoneOffset mins ~from~ UTC
     * @param {Number} conversionOffset milliseconds ~from~ UTC
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    findTimeFromDeviceTimeAndOffsets: function(dt, timezoneOffset, conversionOffset) {
      if (!dt) {
        throw new Error('No Date provided as first argument!');
      }
      return moment.utc(dt)
        .subtract(timezoneOffset, 'minutes')
        .subtract(conversionOffset, 'milliseconds')
        .toDate();
    },
    /*
     * Get the floor for a date (see D3's time functions)
     *
     * @param {String} timestamp
     * @param {String} units a valid units identifier per moment
     * @param {String} timezone a valid timezone name as per moment-timezone
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    floor: function(time, units, timezone) {
      this.checkTimezoneName(timezone);
      if (timezone == null) {
        timezone = 'UTC';
      }
      return moment.utc(time).tz(timezone).startOf(units).toDate();
    },
    /*
     * Format the input datetime as a deviceTime
     *
     * @param {Object|String|Number} JavaScript Date object, string timestamp, or integer timestamp
     *
     * @return {String} timezone-naive timestamp
     */
    formatDeviceTime: function(dt) {
      if (!dt) {
        throw new Error('No datetime provided as first argument!');
      }
      // use of .utc() here is for cross-browser consistency
      return _applyMask(moment.utc(dt), 'YYYY-MM-DDTHH:mm:ss');
    },
    /*
     * Format the given timestamp for display after applying the given offset
     *
     * @param {String} UTC timestamp
     * @param {Number} offset mins ~from~ UTC
     * @param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @return {String} the formatted datetime
     */
    formatFromOffset: function(timestamp, offset, mask) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      mask = mask || DEFAULT_DISPLAY_MASK;
      return _applyMask(moment(timestamp).utcOffset(offset), mask);
    },
    /*
     * Format the given timestamp or Date obj with moment's "calendar time"
     *
     * @param {String|Object} timestamp or JavaScript Date object
     *
     * @return {String} the formatted "calendar time"
     */
    formatCalendarTime: function(dt) {
      if (!dt) {
        throw new Error('No datetime provided as first argument!');
      }
      return moment(dt).calendar();
    },
    /*
     * Format the given timestamp for storage
     *
     * @param {String} timestamp
     * @param {Number} offset mins ~from~ UTC
     *
     * @return {String} an ISO8601-formatted timestamp
     */
    formatForStorage: function(timestamp, offset) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      return moment(timestamp).utcOffset(offset).format();
    },
    /*
     * Format the given timestamp for display in the given named timezone
     *
     * @param {String} UTC timestamp
     * @param {String} timezone a valid timezone name as per moment-timezone
     * @param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @return {String} the formatted datetime
     */
    formatInTimezone: function(timestamp, timezone, mask) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      this.checkTimezoneName(timezone);
      timezone = timezone || '';
      mask = mask || DEFAULT_DISPLAY_MASK;
      return _applyMask(moment(timestamp).tz(timezone), mask);
    },
    /*
     * Get a date N days into the future
     *
     * @return {string} an ISO-8601-formatted zulu timestamp N days from now
     */
    futureDate: function(ndays) {
      return moment().utc().add(ndays, 'days').toISOString();
    },
    /*
     * Get how many milliseconds you are into a day
     *
     * @param {Object|String} JavaScript Date object or string timestamp
     * @param {Number} offset mins ~from~ UTC
     *
     * @return {Number} milliseconds in current day
     */
    getMsFromMidnight: function(dt, offset) {
      if (!dt) {
        throw new Error('No datetime provided as first argument!');
      }
      // this function is used mainly for deciding when an event matches a device setting
      // since devices report setting start times in milliseconds from midnight, device's local time
      // i.e., a basal rate that starts at midnight device local time has a `start` of 0
      // since we translate device local time into a UTC `time` and a `timezoneOffset` ~from~ UTC
      // we need to translate back to local time then subtract midnight in local time
      // to yield the number of milliseconds from midnight for the event
      dt = moment(dt);
      if (offset == null) {
        offset = 0;
      }
      // we use -offset here because moment deals in offsets that are ~to~ UTC
      // but we store JavaScript Date-style offsets that are ~from~ UTC
      return dt.utcOffset(offset) - dt.clone().utcOffset(offset).startOf('day');
    },
    /*
     * Get the offset from the current date
     *
     * @return {String} number of minutes offset ~from~ UTC
     */
    getOffset: function() {
      return moment().utcOffset();
    },
    /*
     * Get the offset from the given date
     *
     * @return {String} number of minutes offset ~from~ UTC
     */
    getOffsetFromTime: function(timestamp) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      function containsZone() {
        var zonePattern = /^([+-][0-2]\d:[0-5]\d)$/;
        return zonePattern.test(timestamp.slice(-6));
      }
      if (containsZone()) {
        return moment.parseZone(timestamp).utcOffset();
      }
      return moment(timestamp).utcOffset();
    },
    /*
     * Get the offset from the given UTC date plus named timezone
     *
     * @return {String} number of minutes offset ~from~ UTC
     */
    getOffsetFromZone: function(timestamp, timezone) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      this.checkTimezoneName(timezone);
      return moment.utc(timestamp).tz(timezone).utcOffset();
    },
    /*
     * Get all timezone objects
     *
     * @return {Object} a hash of arrays of timezone objects
     * in convenient categories for displaying in a searchable dropdown
     */
    getTimezones: function() {
      var tzNames = moment.tz.names();
      var timezones = {
        // main timezones of the U.S. lower 48
        bigFour: [],
        // remainder of U.S. timezones
        unitedStates: [],
        // the English-speaking world + Europe
        hoisted: [],
        // everywhere else
        theRest: []
      };
      var big4 = {
        'US/Eastern': true,
        'US/Central': true,
        'US/Mountain': true,
        'US/Pacific': true
      };
      var newZealand = {
        'Pacific/Auckland': true,
        'Pacific/Chatham': true
      };
      var now = new Date().valueOf();
      for (var i = 0; i < tzNames.length; ++i) {
        var zone = moment.tz.zone(tzNames[i]);
        // we use the current epoch time to determine the current UTC
        // offset for each timezone (i.e., adjust for DST or not)
        // the offset is part of the `label` attribute
        var offsetInHours = moment.duration(zone.utcOffset(now), 'minutes')
          .asMilliseconds()/(1000*60*60);

        // because moment signs offsets the opposite way from the ISO 8601 standard
        // the standard is negative for N. American timezones
        // but moment (and JavaScript in general) represent them as positive
        var offsetAsString = offsetInHours > 0 ?
          '-' + offsetInHours : '+' + Math.abs(offsetInHours);

        var timezone = {
          label: format('%s (UTC%s)', tzNames[i], offsetAsString),
          value: tzNames[i],
          offset: Number(offsetAsString)
        };

        if (big4[tzNames[i]]) {
          timezones.bigFour.push(timezone);
        }
        else if (tzNames[i].search('US/') === 0) {
          timezones.unitedStates.push(timezone);
        }
        else if (tzNames[i].search('Canada/') === 0) {
          timezones.hoisted.push(timezone);
        }
        else if (tzNames[i].search('Europe/') === 0) {
          timezones.hoisted.push(timezone);
        }
        else if (tzNames[i].search('Australia/') === 0) {
          timezones.hoisted.push(timezone);
        }
        else if (newZealand[tzNames[i]]) {
          timezones.hoisted.push(timezone);
        }
        // reformat these a tiny bit so that 'New Zealand' is searchable
        else if (tzNames[i].search('NZ') === 0) {
          timezone.label = timezone.label.replace('NZ', 'New Zealand');
          timezones.hoisted.push(timezone);
        }
        // there's a whole bunch of timezones listed as "Etc/GMT+1"
        // that clutter things up a lot...
        else if (tzNames[i].search('GMT') !== -1) {}
        else {
          timezones.theRest.push(timezone);
        }
      }
      return timezones;
    },
    /*
     * Get the UTC time for a timezone-naive timestamp and timezone
     *
     * @param {String} timezone-naive timestamp
     *
     * @param {String} timezone name
     *
     * @return {Integer} UTC time
     */
    getUTCFromLocalTimeAndTimezone: function(timestamp, timezone) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      if (!timezone) {
        throw new Error('A timezone is required!');
      }
      return moment.tz(timestamp, timezone).valueOf();
    },
    /*
     * Is this an ISO8601-formatted timestamp?
     *
     * @param {String} timestamp
     *
     * @return {Boolean}
     */
    isISODate: function(timestamp) {
      return (/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/).test(timestamp);
    },
    /*
     * Is this a valid date?
     *
     * @param {String} timestamp
     *
     * @return {Boolean}
     */
    isValidDate: function(timestamp) {
      var m = moment(timestamp);
      // Be careful, if `value` is empty, `m` can be null
      return m && m.isValid();
    },
    /*
     * Is this a valid date that matches the given date mask
     * This is STRONGER validation than isValidDate and should be used
     * e.g., when validating dates entered in forms
     *
     * @param {String} timestamp
     * @param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @return {Boolean}
     */
    isValidDateForMask: function(timestamp, mask) {
      var m = moment(timestamp, mask, true);
      // Be careful, if `value` is empty, `m` can be null
      return m && m.isValid();
    },
    /*
     * Parse a timestamp string using provided format and (optionally) timezone into a JavaScript Date
     *
     * @param {String} timestamp
     * @param {String} format to parse the string with
     * @param {String} timezone a valid timezone specifier as per moment-timezone
     *
     * @return {Object} JavaScript Date yielding accurate UTC string from .toISOString()
     */
    parseFromFormat: function(timestamp, format, timezone) {
      if (!timestamp) {
        throw new Error('No timestamp provided as first argument!');
      }
      this.checkTimezoneName(timezone);
      if (timezone == null) {
        // some browsers assume no timezone offset means local time and others assume it means UTC
        // we explicitly make them all act like it is UTC
        return moment.utc(timestamp, format).toDate();
      } else {
        return moment.tz(timestamp, format, timezone).toDate();
      }
    },
    /*
     * Translate a datetime string from one format mask to another
     *
     * @param {String} Input date and/or time string
     * @param {String} Input's format mask
     * @param {String} Desired output format mask
     *
     * @return {String} Reformatted date and/or time string
     */
    translateMask: function(timestr, inputMask, outputMask) {
      if (!timestr) {
        throw new Error('No datetime provided as first argument!');
      }
      var res = moment(timestr, inputMask).format(outputMask);
      if (res !== 'Invalid date') {
        return res;
      }
      else {
        var e = new Error('Input datetime ' + timestr + ' did not match input mask ' + inputMask);
        console.error(e);
        throw e;
      }
    },
    /*
     * Get a UTC based string that represents `now`
     *
     * @return {String} an ISO8601-formatted timestamp with the offset from UTC specified
     */
    utcDateString: function() {
      return moment().format();
    },
    /*
     *== CONSTANTS ==*
     */
    SEC_TO_MSEC: 1000,
    MIN_TO_MSEC: 60 * 1000,
    MIN30_TO_MSEC: 30 * 60 * 1000
  };
};

// CommonJS module is defined
if(typeof module != 'undefined' && module.exports){
  module.exports = datetimeWrapper;
}
