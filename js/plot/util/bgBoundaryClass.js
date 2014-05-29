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

module.exports = function(opts) {
  return function(datum) {
    if (datum.value < opts.classes['very-low'].boundary) {
      return 'd3-bg-low';
    }
    else if ((datum.value >= opts.classes['very-low'].boundary) && (datum.value < opts.classes.low.boundary)) {
      return 'd3-bg-low d3-circle-open';
    }
    else if ((datum.value >= opts.classes.low.boundary) && (datum.value <= opts.classes.target.boundary)) {
      return 'd3-bg-target';
    }
    else if ((datum.value > opts.classes.target.boundary) && (datum.value <= opts.classes.high.boundary)) {
      return 'd3-bg-high d3-circle-open';
    }
    else if (datum.value > opts.classes.high.boundary) {
      return 'd3-bg-high';
    }
  };
};
