/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

//
// 'Good old Watson! You are the one fixed point in a changing age.' - Sherlock Holmes, "His Last Bow"
//
// This mini module is for containing anything done to Tidepool data to make it possible to plot timezone-naive
// data reliably and consistently across different browsers and in different timezones. It is named after the
// quotation listed above as well as the fact that Watson is one of literature's ur-examples of the loyal
// assistant.
//
// Watson is a tideline *plugin*. Try as hard as you can to keep Watson out of main library code - i.e., in
// this repository, Watson should only be a requirement within other files in the plugins/ directory, not in
// the main js/ directory.
//

if ((typeof window !== 'undefined') && (typeof window._ !== 'undefined')) {
  var _ = window._;
}
else {
  var _ = require('lodash');
}

try {
  var log = window.bows('Watson');
}
catch (ReferenceError) {
  var log = require('../../../js/lib/').bows('Watson');
}

module.exports = {
  APPEND: '.000Z',

  normalize: function(i) {
    try {
      if (i.utcTime) {
        var d = new Date(i.utcTime);
        var offsetMinutes = d.getTimezoneOffset();
        d.setUTCMinutes(d.getUTCMinutes() - offsetMinutes);
        i.normalTime = d.toISOString();
      }
      else if (i.type === 'basal-rate-segment') {
        i.normalTime = i.start + this.APPEND;
        if (i.end) {
          i.normalEnd = i.end + this.APPEND;
        }
        else {
          i.normalEnd = null;
        }
      }
      else if (i.normalTime == null) {
        i.normalTime = i.deviceTime + this.APPEND;
      }
      return i;
    }
    catch(e) {
      throw new TypeError('Watson choked on an undefined.');
    }

  },

  normalizeAll: function(a) {
    log('Watson normalized the data.');
    return _.map(a, function(d) {
      return this.normalize(d);
    }, this);
  }
};