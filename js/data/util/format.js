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

var d3 = require('d3');
var moment = require('moment');

var format = {

  MS_IN_24: 86400000,

  capitalize: function(s) {
    // transform the first letter of string s to uppercase
    return s[0].toUpperCase() + s.slice(1);
  },

  fixFloatingPoint: function(n) {
    return parseFloat(n.toFixed(3));
  },

  percentage: function(f) {
    if (isNaN(f)) {
      return '-- %';
    }
    else {
      return parseInt(Math.round(f * 100), 10) + '%';
    }
  },

  millisecondsAsTimeOfDay: function(i) {
    var d = new Date(i);
    return d3.time.format.utc('%-I:%M %p')(d);
  },

  xAxisDayText: function(i) {
    return moment(i).utc().format('dddd, MMMM Do');
  },

  xAxisTickText: function(i) {
    var d = new Date(i);
    return d3.time.format.utc('%-I %p')(d).toLowerCase();
  }

};

module.exports = format;
