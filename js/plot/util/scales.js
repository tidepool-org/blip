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

var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var scales = function(opts) {
  opts = opts || {};

  var defaults = {
    bolusRatio: 0.35,
    MAX_CBG: 401,
    carbRadius: 14
  };

  _.defaults(opts, defaults);

  return {
    MAX_CBG: opts.MAX_CBG,
    bg: function(data, pool, pad) {
      var ext = d3.extent(data, function(d) { return d.value; });
      if (ext[1] > this.MAX_CBG) {
        return d3.scale.linear()
          .domain([0, this.MAX_CBG])
          .range([pool.height() - pad, pad])
          .clamp(true);
      }
      else {
        return d3.scale.linear()
          .domain([0, ext[1]])
          .range([pool.height() - pad, pad]);
      }
    },
    bgLog: function(data, pool, pad) {
      var ext = d3.extent(data, function(d) { return d.value; });
      if (ext[1] > this.MAX_CBG) {
        return d3.scale.log()
          .domain([ext[0], this.MAX_CBG])
          .range([pool.height() - pad, pad])
          .clamp(true);
      }
      else {
        return d3.scale.log()
          .domain(ext)
          .range([pool.height() - pad, pad]);
      }
    },
    bgTicks: function(data) {
      if ((!data) || (data.length === 0)) {
        return [];
      }
      var defaultTicks = [40, 80, 120, 180, 300];
      var ext = d3.extent(data, function(d) { return d.value; });
      // if the min of our data is greater than any of the defaultTicks, remove that tick
      defaultTicks.forEach(function(tick) {
        if (ext[0] > tick) {
          defaultTicks.shift();
        }
      });
      defaultTicks.reverse();
      // same thing for max
      defaultTicks.forEach(function(tick) {
        if (ext[1] < tick) {
          defaultTicks.shift();
        }
      });
      return defaultTicks.reverse();
    },
    carbs: function(data, pool) {
      var scale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.carbs ? d.carbs.value : 0; })])
        .range([carbRadius, carbRadius + ((1 - opts.bolusRatio) * pool.height())/4]);
      return scale;
    },
    bolus: function(data, pool) {
      var scale = d3.scale.linear()
        // for boluses the recommended can exceed the value
        .domain([0, d3.max(data, function(d) { return d3.max([d.value, d.recommended]); })])
        .range([pool.height(), opts.bolusRatio * pool.height()]);
      return scale;
    },
    basal: function(data, pool) {
      var scale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.value; }) * 1.1])
        .rangeRound([pool.height(), 0]);
      return scale;
    }
  }
};

module.exports = scales;
