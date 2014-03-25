/**
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
 */

// Expose Tideline library on global `window` object
// Deprecate when Tideline introduces a distribution bundle

var _ = window._;
var bows = window.bows;

var tideline = require('../../bower_components/tideline/js');

window.tideline = tideline;

// Roll our own watson, until included in Tideline or deprecated
tideline.watson = {
  log: bows('Watson'),

  normalize: function(a) {
    this.log('Watson normalized the data.');
    return _.map(a, function(i) {
      i.normalTime = i.deviceTime + 'Z';
      if (i.utcTime) {
        var d = new Date(i.utcTime);
        var offsetMinutes = d.getTimezoneOffset();
        d.setMinutes(d.getMinutes() - offsetMinutes);
        i.normalTime = d.toISOString();
      }
      else if (i.type === 'basal-rate-segment') {
        i.normalTime = i.start + 'Z';
        i.normalEnd = i.end + 'Z';
      }
      return i;
    });
  },

  print: function(arg, d) {
    console.log(arg, d.toUTCString().replace(' GMT', ''));
    return;
  },

  strip: function(d) {
    return d.toUTCString().replace(' GMT', '');
  }
};

module.exports = tideline;
