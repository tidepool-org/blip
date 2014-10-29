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

var timezones = require('./timezones');
var detectTimezone = require('./timezoneDetect');

var datetimeWrapper = function(moment) {
  var DEFAULT_DISPLAY_MASK = 'MMMM D [at] h:mm a';

  return {
    /*
     * Apply a timezone offset in mins ~from~ UTC to a UTC timestamp
     *
     * @param {String} UTC timestamp
     * @param {Number} offset in mins ~from~ UTC
     *
     * @return {Object} JavaScript Date object
     */
    applyOffset: function(timestamp, offset) {
      if (offset == null) {
        return new Date(timestamp);
      } else {
        return moment(timestamp).zone(-offset).toDate();
      }
    },
    /*
     * Transform a timestamp string into an ISO8601-formatted timestamp with timezone applied
     *
     * @param {String} timestamp
     * @param {String} timezone a valid timezone specifier as per moment-timezone
     *
     * @return {String} an ISO8601-formatted timestamp in UTC time
     */
    applyTimezone: function(timestamp, timezone) {
      if (timezone == null) {
        // assume timezone-naive timestamp is meant to be UTC
        // this is v. important for cross-browser compatibility!
        return moment.utc(timestamp).toDate();
      } else {
        return moment.tz(timestamp, timezone).toDate();
      }
    },
    /*
     * Format the input datetime as a deviceTime
     *
     * @param {Object|String} JavaScript Date object or string timestamp
     *
     * @return {String} timezone-naive timestamp
     */
    formatDeviceTime: function(dt) {
      return moment.utc(dt).format('YYYY-MM-DDTHH:mm:ss');
    },
    /*
     * Format the given timestamp for display in the browser's local timezone
     *
     * @ param {String} utc timestamp
     * @ param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @ return {String} the formatted date
     */
    formatForDisplay: function(timestamp, mask) {
      mask = mask || DEFAULT_DISPLAY_MASK;
      return moment(timestamp).format(mask);
    },
    /*
     * Format the given timestamp for storage
     *
     * @ param {String} timestamp
     * @ param {Number} offset mins ~to~ UTC
     *
     * @ return {String} an ISO8601-formatted timestamp
     */
    formatForStorage: function(timestamp, offset) {
      return moment(timestamp).zone(offset).format();
    },
    /*
     * Try to detect current device's timezone
     *
     * @ return {Object} a timezone object
     */
    getDeviceTimezone: function() {
      return detectTimezone();
    },
    /*
     * Get how many milliseconds you are into a day
     *
     * @param {Object|String} JavaScript Date object or string timestamp
     *
     * @ return {Number} milliseconds in current day
     */
    getMsFromMidnight: function(dt) {
      // here the UTC is not because we are actually getting midnight from current UTC day
      // we are agnostic about whether the day were are looking at is UTC
      // the .utc() here is to prevent moment from interpreting the `dt` in the local environment's timezone
      // when it is actually a datetime in an arbitrary timezone
      dt = moment.utc(dt);
      return dt - moment.utc(dt).startOf('day');
    },
    /*
     * Get the offset from the current date
     *
     * @ return {String} number of minutes offset from UTC
     */
    getOffset: function() {
      return moment().zone();
    },
    /*
     * Get the offset from the given date
     *
     * @ return {String} number of minutes offset ~to~ UTC
     */
    getOffsetFromTime: function(timestamp) {
      return moment.parseZone(timestamp).zone();
    },
    /*
     * Get all timezone objects
     *
     * @ return {Array} a list of available timezone objects
     */
    getTimezones: function() {
      return timezones;
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
     * @ param {String} timestamp
     *
     * @ return {Boolean}
     */
    isValidDate: function(timestamp) {
      var m = moment(timestamp);
      // Be careful, if `value` is empty, `m` can be null
      return m && m.isValid();
    },
    /*
     * Get an instance of moment that is used
     *
     * @ return {Object} an instance of moment
     */
    // TODO: we'll be removing this as soon as we've removed
    // all other moment dependencies aside from sundial
    momentInstance: function() {
      return moment;
    },
    /*
     * Parse a timestamp string using provided format into an ISO8601-formatted timestamp with timezone applied
     *
     * @param {String} timestamp
     * @param {String} to parse the string with
     * @param {String} timezone a valid timezone specifier as per moment-timezone
     *
     * @return {String} an ISO8601-formatted timestamp in UTC time
     */
    parseAndApplyTimezone: function(timestamp, format, timezone) {
      if (timezone == null) {
        // assume timezone-naive timestamp is meant to be UTC
        // this is v. important for cross-browser compatibility!
        return moment.utc(timestamp, format).toDate();
      } else {
        return moment.tz(timestamp, format, timezone).toDate();
      }
    },
    /*
     * Get a UTC based string that represents `now`
     *
     * @ return {String} an ISO8601-formatted timestamp with the offset from UTC specified
     */
    utcDateString: function() {
      return moment().format();
    }
  };
};

// CommonJS module is defined
if(typeof module != 'undefined' && module.exports){
  module.exports = datetimeWrapper;
}
