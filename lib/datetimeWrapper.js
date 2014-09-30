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

'use strict';

var timezones = require('./timezones');
var detectTimezone = require('./timezoneDetect');

var datetimeWrapper = function(moment) {
  var DEFAULT_DISPLAY_MASK = 'MMMM D [at] h:mm a';

  return {
    /*
     * Format the given timestamp for display
     *
     * @ param {String} utc timestamp
     * @ param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @ return {String} the formatted date
     */
    formatForDisplay: function(timestamp,mask) {
      mask = mask || DEFAULT_DISPLAY_MASK;
      return moment(timestamp).format(mask);
    },
    /*
     * Format the given timestamp for storage
     *
     * @ param {String} timestamp
     * @ param {Number} offset mins from UTC
     *
     * @ return {String} an ISO8601-formatted timestamp
     */
    formatForStorage: function(timestamp, zone) {
      return moment(timestamp).zone(zone).format();
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
     * Get the offset from the given date
     *
     * @ return {String} number of minutes offset from GMT
     */
    getOffset: function() {
      return moment().zone();
    },
    /*
     * Get the offset from the given date
     *
     * @ return {String} number of minutes offset from GMT
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
    momentInstance: function() {
      return moment;
    },
    /*
     * Parses a string using the provided format into a moment of the provided timezone
     *
     * @param ts the timestamp string to parse
     * @param format the format to parse the string with
     * @param timezone a valid timezone specifier as per moment-timezone
     * @return {Object} a moment datetime object
     */
    parse: function(ts, format, timezone) {
      if (timezone == null) {
        return moment.utc(ts, format);
      } else {
        return moment.tz(ts, format, timezone);
      }
    },
    /*
     * How long ago is this date from now
     *
     * @ param {String} timestamp
     * @ param {String} period years, months, weeks, days, hours, minutes, and seconds
     *
     * @ return {Number}
     */
    timeAgo: function(timestamp,period) {
      if(period){
        var today = moment();
        return today.diff(timestamp, period);
      }
      return null;
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
