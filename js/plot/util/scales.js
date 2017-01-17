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

var commonbolus = require('./commonbolus');

var scales = function(opts) {
  opts = _.assign({}, opts) || {};

  var GLUCOSE_MM = 18.01559;

  var defaults = {
    bgUnits: 'mg/dL',
    bolusRatio: 0.35,
    MIN_CBG: 39,
    MAX_CBG: 401,
    carbRadius: 14
  };
  _.defaults(opts, defaults);

  if (opts.bgUnits === 'mmol/L') {
    opts.MIN_CBG = opts.MIN_CBG/GLUCOSE_MM;
    opts.MAX_CBG = opts.MAX_CBG/GLUCOSE_MM;
  }

  return {
    MIN_CBG: opts.MIN_CBG,
    MAX_CBG: opts.MAX_CBG,
    bgClamped: function(domain, pool, pad) {
      return d3.scale.linear()
        .domain(domain)
        .range([pool.height() - pad, pad])
        .clamp(true);
    },
    bg: function(data, pool, pad) {
      var ext = d3.extent(data, function(d) { return d.value; });
      if (ext[1] > this.MAX_CBG || ext[0] === ext[1]) {
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
      else if (ext[0] === ext[1]) {
        return d3.scale.log()
          .domain([this.MIN_CBG, this.MAX_CBG])
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
      var defaultTicks = _.map(_.values(_.omit(opts.bgClasses, ['very-high', 'very-low'])), function(n) {
        return _.get(n, 'boundary');
      }).sort(function (a, b) { return a - b; });

      var ext = d3.extent(data, function(d) { return d.value; });
      if (ext[0] === ext[1]) {
        return defaultTicks;
      }
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
        .domain([0, d3.max(data, function(d) { return d.carbInput ? d.carbInput : 0; })])
        .range([opts.carbRadius, opts.carbRadius + ((1 - opts.bolusRatio) * pool.height())/4]);
      return scale;
    },
    bolus: function(data, pool) {
      var scale = d3.scale.linear()
        // for boluses the recommended can exceed the value
        .domain([0, d3.max(data, function(d) {
          return commonbolus.getMaxValue(d);
        })])
        .range([pool.height(), opts.bolusRatio * pool.height()]);
      return scale;
    },
    basal: function(data, pool) {
      var scale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {
          return d.rate;
        }) * 1.1])
        .rangeRound([pool.height(), 0]);
      return scale;
    }
  };
};

module.exports = scales;
