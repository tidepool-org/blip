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

var datetimeWrapper = function(moment) {

  moment = moment || require('moment');

  var DEFAULT_DISPLAY_MASK = 'MMMM D [at] h:mm a';

  return {
    /*
     * Get a UTC based string that represents the `now`
     *
     * @ return {String} an ISO8601 formated timestamp
     */
    utcDateString: function() {
      return moment.utc().toISOString();
    },
    /*
     * Format the given timestamp for display
     *
     * @ param {String} timestamp
     * @ param {String} mask [mask='MMMM D [at] h:mm a'] the date format mask to apply
     *
     * @ return {String} the formatted date
     */
    formatForDisplay: function(timestamp,mask) {
      mask = mask || DEFAULT_DISPLAY_MASK;
      return moment(timestamp).format(mask);
    },
    /*
     * Get an instance of moment that is used
     *
     * @ return {Object} an instance of moment
     */
    momentInstance: function() {
      return moment;
    }
  };
};

// CommonJS module is defined
if (typeof module != 'undefined' && module.exports) {
  module.exports = datetimeWrapper;
} else {
  return datetimeWrapper;
}