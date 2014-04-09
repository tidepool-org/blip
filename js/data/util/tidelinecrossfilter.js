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

var crossfilter = require('../../lib/').crossfilter;
var _ = require('../../lib/')._;

var log = require('../../lib/').bows('TidelineCrossFilter');

function TidelineCrossFilter(data) {

  this.addDimension = function(key) {
    // define some common dimension accessors for tideline, so we don't have to keep writing the same ones
    var accessor;
    switch(key) {
    case 'date':
      accessor = function(d) { return new Date(d.normalTime).valueOf(); };
      break;
    }

    return this.cf.dimension(accessor);
  };

  this.getAll = function(dimension, ascending) {
    // default return ascending sort array
    if (!ascending) {
      return dimension.top(Infinity);
    }
    return dimension.top(Infinity).reverse();
  };

  this.getOne = function(dimension) {
    var res = dimension.top(Infinity);

    if (res.length > 1) {
      return undefined;
    }
    else {
      return res[0];
    }
  };

  this.cf = crossfilter(data);

  return this;
}

module.exports = TidelineCrossFilter;