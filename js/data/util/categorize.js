/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

/* jshint esversion:6 */

var _ = require('lodash');
var { MGDL_UNITS, DEFAULT_BG_BOUNDS } = require('../../data/util/constants');

var Categorizer = function(bgClasses = {}, bgUnits = MGDL_UNITS){
  var classes = _.cloneDeep(bgClasses);
  var defaults = {
    'very-low': { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow },
    low: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower },
    target: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper },
    high: { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh },
  };

  _.defaults(classes, defaults);

  // mg/dL values are converted to mmol/L and rounded to 5 decimal places on platform.
  // This can cause some discrepancies when converting back to mg/dL, and throw off the
  // categorization.
  // i.e. A 'target' value 180 gets stored as 9.99135, which gets converted back to 180.0000651465
  // which causes it to be classified as 'high'
  // Thus, we need to allow for our thresholds accordingly.
  if (bgUnits === MGDL_UNITS) {
    var roundingAllowance = 0.0001;
    classes['very-low'].boundary -= roundingAllowance;
    classes.low.boundary -= roundingAllowance;
    classes.target.boundary += roundingAllowance;
    classes.high.boundary += roundingAllowance;
  }

  return function(d) {
    if (d.value < classes['very-low'].boundary) {
      return 'verylow';
    }
    else if (d.value >= classes['very-low'].boundary &&
      d.value < classes.low.boundary) {
      return 'low';
    }
    else if (d.value >= classes.low.boundary &&
      d.value <= classes.target.boundary) {
      return 'target';
    }
    else if (d.value > classes.target.boundary &&
      d.value <= classes.high.boundary) {
      return 'high';
    }
    else if (d.value > classes.high.boundary) {
      return 'veryhigh';
    }
  };
};

module.exports = Categorizer;
