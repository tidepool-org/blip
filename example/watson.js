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
// Try as hard as you can to keep Watson out of library code - i.e., in this repository, Watson should only be a
// requirement in files in the example/ folder (as these are blip-specific), not in the main tideline files:
// one-day.js, two-week.js, and pool.js.
//

module.exports = function() {

  var log = require('bows')('Watson');

  function watson() {
    log("Start her up, Watson, for it's time that we were on our way.");
  }

  watson.normalize = function(a) {
    log('Watson normalized the data.');
    return _.map(a, function(i) {
      i.normalTime = i.deviceTime + 'Z';
      if (i.utcTime) {
        var d = new Date(i.utcTime);
        var offsetMinutes = d.getTimezoneOffset();
        d.setMinutes(d.getMinutes() - offsetMinutes);
        i.normalTime = d.toISOString();
      }
      else if (i.type === 'basal-rate-segment') {
        i.normalTime = i.start;
      }
      return i;
    });
  };

  watson.print = function(arg, d) {
    console.log(arg, d.toUTCString().replace(' GMT', ''));
    return;
  };

  watson.strip = function(d) {
    return d.toUTCString().replace(' GMT', '');
  };

  return watson;
};