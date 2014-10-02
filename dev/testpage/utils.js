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

var dt = require('../../js/data/util/datetime');
var APPEND = '.000Z';

function Cycler(increment, cycles) {
    var i = 0;

    return function() {
      if (i < cycles) {
        ++i;
      }
      else {
        i = 1;
      }
      return i * increment;
    };
  }

function Intervaler(datetime, millis) {
  datetime = dt.addDuration(datetime + APPEND, -millis).slice(0, -5);
  return function() {
    datetime = dt.addDuration(datetime + APPEND, millis).slice(0, -5);
    return datetime;
  };
}

module.exports = (function() {
  return {
    Cycler: Cycler,
    Intervaler: Intervaler
  };
}());