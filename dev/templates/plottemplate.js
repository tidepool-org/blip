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
var _ = require('lodash');

var log = require('bows').bows('Datatype');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {};

  opts = _.defaults(opts, defaults);

  // refers to the relevant top-level SVG element for the view you're in
  var mainGroup = pool.parent();

  function datatype(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {

      // TIPS:
      // do not use d3.select() or d3.selectAll()!
      // always chain your selections from `selection` instead
      // e.g., selection.select(), selection.selectAll()

      // make sure you capture the exit selection and remove stale DOM elements
      // e.g., mySelection.exit().remove()

    });
  }

  datatype.addTooltip = function() {

  };

  datatype.addAnnotations = function() {

  };

  return datatype;
};
