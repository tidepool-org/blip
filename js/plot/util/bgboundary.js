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

var _ = require('lodash');

module.exports = function(classes) {
  if (Object.keys(classes).length > 3) {
    return function(datum) {
      if (datum.value < classes['very-low'].boundary) {
        return 'd3-bg-low';
      }
      else if ((datum.value >= classes['very-low'].boundary) && (datum.value < classes.low.boundary)) {
        return 'd3-bg-low d3-circle-open';
      }
      else if ((datum.value >= classes.low.boundary) && (datum.value <= classes.target.boundary)) {
        return 'd3-bg-target';
      }
      else if ((datum.value > classes.target.boundary) && (datum.value <= classes.high.boundary)) {
        return 'd3-bg-high d3-circle-open';
      }
      else if (datum.value > classes.high.boundary) {
        return 'd3-bg-high';
      }
    };
  }
  else {
    return function(datum) {
      if (datum.value < classes.low.boundary) {
        return 'd3-bg-low';
      }
      else if ((datum.value >= classes.low.boundary) && (datum.value <= classes.target.boundary)) {
        return 'd3-bg-target';
      }
      else if (datum.value > classes.target.boundary) {
        return 'd3-bg-high';
      }
    };
  }
};
