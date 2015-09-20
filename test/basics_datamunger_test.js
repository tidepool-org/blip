/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');
var d3 = require('d3');

var dm = require('../plugins/blip/basics/logic/datamunger');

var types = require('../dev/testpage/types');

describe('basics datamunger', function() {
  it('should be an object', function() {
    assert.isObject(dm);
  });

  describe('bgDistribution', function() {
    var bgClasses = {
      'very-low': {boundary: 10},
      low: {boundary: 20},
      target: {boundary: 30},
      high: {boundary: 40},
      'very-high': {boundary: 50}
    };
    var zeroes = {
      veryhigh: 0,
      high: 0,
      target: 0,
      low: 0,
      verylow: 0
    };
    it('should be a function', function() {
      assert.isFunction(dm.bgDistribution);
    });

    it('should always calculate a BG distribution for smbg data, should calculate a BG distribution for cbg data if averages >= 144 readings per day, and should yield cgmStatus `calculatedCGM` when have calculated a BG distribution for cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 25})
      ];
      var cbg = [];
      for (var i = 0; i < 144; ++i) {
        cbg.push(new types.CBG({
          deviceTime: new Date(now.valueOf() + i*2000).toISOString().slice(0,-5),
          value: 50
        }));
      }
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}, cbg: {data: cbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      }, bgClasses)).to.deep.equal({
        cbg: _.defaults({veryhigh: 1}, zeroes),
        cgmStatus: 'calculatedCGM',
        smbg: _.defaults({target: 1}, zeroes)
      });
    });

    it('should yield cgmStatus `noCGM` if no cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 1}),
        new types.SMBG({value: 25})
      ];
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      }, bgClasses)).to.deep.equal({
        cgmStatus: 'noCGM',
        smbg: _.defaults({target: 0.5, verylow: 0.5}, zeroes)
      });
    });

    it('should yield cgmStatus `notEnoughCGM` if not enough cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 1}),
        new types.SMBG({value: 25})
      ];
      var cbg = [
        new types.CBG({value: 50})
      ];
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}, cbg: {data: cbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      }, bgClasses)).to.deep.equal({
        cgmStatus: 'notEnoughCGM',
        smbg: _.defaults({target: 0.5, verylow: 0.5}, zeroes)
      });

    });
  });

  describe('calculateBasalBolusStats', function() {
    it('should be a function', function() {
      assert.isFunction(dm.calculateBasalBolusStats);
    });

    describe('basalBolusRatio', function() {
      it('should calculate percentage of basal insulin');

      it('should calculate percentage of bolus insulin');

      it('should exclude any portion of basal duration prior to or following basics date range');
    });

    describe('totalDailyDose', function() {
      it('should calculate average total daily dose');

      it('should exclude any portion of basal duration prior to or following basics date range');
    });
  });

  describe('infusionSiteHistory', function() {
    var oneWeekDates = {
      '2015-09-07': 'past',
      '2015-09-08': 'past',
      '2015-09-09': 'past',
      '2015-09-10': 'past',
      '2015-09-11': 'past',
      '2015-09-12': 'dayOfUpload',
      '2015-09-13': 'future'
    };
    var countSiteChangesByDay = {
      '2015-09-08': 1,
      '2015-09-12': 1
    };
    it('should be a function', function() {
      assert.isFunction(dm.infusionSiteHistory);
    });

    it('should return an object keyed by date; value is object with attrs type, daysSince');

    it('should properly calculate the daysSince for the first infusion site change');
  });
});