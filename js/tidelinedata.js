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

var _ = require('./lib/')._;
var TidelineCrossFilter = require('./data/util/tidelinecrossfilter');
var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var SettingsUtil = require('./data/settingsutil');

var log = require('./lib/').bows('TidelineData');

function TidelineData(data, opts) {

  opts = opts || {};

  var defaults = {
    CBG_PERCENT_FOR_ENOUGH: 0.75,
    CBG_MAX_DAILY: 288,
    SMBG_DAILY_MIN: 4,
    diabetesDataTypes: [
      'smbg',
      'carbs',
      'bolus',
      'cbg',
      'settings',
      'basal-rate-segment'
    ]
  };

  _.defaults(opts, defaults);
  var that = this;

  function addAndResort(datum, a) {
    return _.sortBy((function() {
      a.push(datum);
      return a;
    }()), function(d) { return d.normalTime; });
  }

  function updateCrossFilters(data, types) {
    that.filterData = new TidelineCrossFilter(data);
    that.dataByDate = that.createCrossFilter('date');
    that.dataByType = that.createCrossFilter('datatype');
  }

  this.createCrossFilter = function(dim) {
    return this.filterData.addDimension(dim);
  };

  this.addDatum = function(datum) {
    this.grouped[datum.type] = addAndResort(datum, this.grouped[datum.type]);
    this.data = addAndResort(datum, this.data);
    updateCrossFilters(this.data);
    return this;
  };

  this.data = data;

  updateCrossFilters(data);

  this.grouped = _.groupBy(data, function(d) { return d.type; });

  this.diabetesData = _.sortBy(_.flatten([].concat(_.map(opts.diabetesDataTypes, function(type) {
    return this.grouped[type] || [];
  }, this))), function(d) {
    return d.normalTime;
  });

  this.basalUtil = new BasalUtil(this.grouped['basal-rate-segment']);
  this.bolusUtil = new BolusUtil(this.grouped.bolus);
  this.cbgUtil = new BGUtil(this.grouped.cbg, {DAILY_MIN: (opts.CBG_PERCENT_FOR_ENOUGH * opts.CBG_MAX_DAILY)});
  this.settingsUtil = new SettingsUtil(this.grouped.settings, [this.diabetesData[0].normalTime, this.diabetesData[this.diabetesData.length - 1].normalTime]);
  this.smbgUtil = new BGUtil(this.grouped.smbg, {DAILY_MIN: opts.SMBG_DAILY_MIN});

  return this;
}

module.exports = TidelineData;