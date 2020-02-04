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
var crossfilter = require('crossfilter2');

var commonbolus = require('../plot/util/commonbolus');
var format = require('./util/format');

function BolusUtil(data) {
  var dataByDate;
  this.subtotal = function(s, e) {
    var dose = 0.0;
    var start = new Date(s).toISOString(), end = new Date(e).toISOString();
    dataByDate.filter([start, end]);
    var currentData = dataByDate.top(Infinity).reverse();
    var firstBolus = _.findIndex(currentData, function(bolus) {
      var d = bolus.normalTime;
      return (d >= start) && (d <= end);
    });
    if (firstBolus !== -1) {
      _.forEach(currentData, function(d) {
        dose += commonbolus.getDelivered(d);
      });
    }
    return format.fixFloatingPoint(dose);
  };

  this.data = data || [];
  var filterData = crossfilter(this.data);
  dataByDate = filterData.dimension(function(d) { return d.normalTime; });
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalTime];
  }
}

module.exports = BolusUtil;
