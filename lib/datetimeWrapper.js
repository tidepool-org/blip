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

var datetimeWrapper = function(givenMoment) {

  var usedMoment = givenMoment;

  var DEFAULT_DISPLAY_MASK = 'MMMM D [at] h:mm a';

  return {
    /*
     * Get a UTC based string that represents `now`
     *
     * @ return {String} an ISO8601-formatted timestamp with the offset from UTC specified
     */
    utcDateString: function() {
      return usedMoment().format();
    },
    /*
     * Get the offset from the given date
     *
     * @ return {String} number of minutes offset from GMT
     */
    getOffsetFromTime: function(timestamp) {
      return usedMoment.parseZone(timestamp).zone();
    },
    /*
     * Get the offset from the given date
     *
     * @ return {String} number of minutes offset from GMT
     */
    getOffset: function() {
      return usedMoment().zone();
    },
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
      return usedMoment(timestamp).format(mask);
    },
    /*
     * Format the given timestamp for storage
     *
     * @ param {String} timestamp
     *
     * @ return {String} an ISO8601-formatted timestamp
     */
    formatForStorage: function(timestamp) {

      if(usedMoment.parseZone(timestamp).zone() === 0){
        var theZone = usedMoment.zone();
        return usedMoment(timestamp).zone(theZone).toISOString();
      }

      return usedMoment(timestamp).toISOString();
    },
    /*
     * Get an instance of moment that is used
     *
     * @ return {Object} an instance of moment
     */
    momentInstance: function() {
      return usedMoment;
    }
  };
};

// CommonJS module is defined
if(typeof module != 'undefined' && module.exports){
  module.exports = datetimeWrapper;
}