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

var d3 = window.d3;
var _ = window._;

var scales = {
  bg: function(data, pool) {
    var scale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .range([pool.height(), 0]);
    return scale;
  },
  carbs: function(data, pool) {
    var scale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .range([0, 0.475 * pool.height()]);
    return scale;
  },
  bolus: function(data, pool) {
    var scale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .range([pool.height(), 0.525 * pool.height()]);
    return scale;
  },
  basal: function(data, pool) {
    var scale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.value; }) * 1.1])
      .rangeRound([pool.height(), 0]);
    return scale;
  }
};

module.exports = scales;