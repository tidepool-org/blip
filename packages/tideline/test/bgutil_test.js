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

/* jshint esversion:6 */

var chai = require('chai');
var _ = require('lodash');
var assert = chai.assert;
var expect = chai.expect;

var BGUtil = require('../js/data/bgutil');

var dt = require('../js/data/util/datetime');
var patterns = require('../dev/testpage/patterns');

var { MMOLL_UNITS } = require('../js/data/util/constants');

var MS_IN_DAY = 86400000;

describe('BGUtil', function() {
  var bg = new BGUtil([], {DAILY_MIN: 10});
  var cbgMin = 0.75*288, smbgMin = 4;
  var cbgNaNObject = {
    'low': NaN,
    'target': NaN,
    'high': NaN,
    'total': NaN,
    'type': 'cbg'
  };
  var smbgNaNObject = {
    'low': NaN,
    'target': NaN,
    'high': NaN,
    'total': NaN,
    'type': 'smbg'
  };
  it('should be a function', function() {
    assert.isFunction(BGUtil);
  });

  it('should be a (newable) constructor', function() {
    expect(bg).to.exist;
  });

  describe('weightedCGMCount', function() {
    it('should return a count of 1 for every cgm datum by default', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'Dexcom_XXXXXXX',
        type: 'cbg',
      }));

      expect(bg.weightedCGMCount(data)).to.equal(data.length);
    });

    it('should return a count of 1 for every cgm datum by default when missing the deviceId property', () => {
      const data = _.map(_.range(0, 10), () => ({
        type: 'cbg',
      }));

      expect(bg.weightedCGMCount(data)).to.equal(data.length);
    });

    it('should return a count of 3 for every FreeStyle Libre cgm datum by default', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'AbbottFreeStyleLibre_XXXXXXX',
        type: 'cbg',
      }));

      expect(bg.weightedCGMCount(data)).to.equal(data.length * 3);
    });

    it('should properly handle a mix of FreeStyle Libre and Dexcom data', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'Dexcom_XXXXXXX',
        type: 'cbg',
      })).concat(_.map(_.range(0, 10), () => ({
        deviceId: 'AbbottFreeStyleLibre_XXXXXXX',
        type: 'cbg',
      })));

      expect(bg.weightedCGMCount(data)).to.equal(40);
    });
  });

  describe('filtered', function() {
    it('should be a function', function() {
      assert.isFunction(bg.filtered);
    });

    it('should return an object with two embedded arrays', function() {
      var res = bg.filtered('', '');
      assert.typeOf(res, 'object');
      assert.typeOf(res.data, 'array');
      assert.typeOf(res.excluded, 'array');
    });

    it('should return a non-empty array when passed a valid date range', function() {
      var cbgData = patterns.cbg.constantFull();
      var cbg = new BGUtil(cbgData, {DAILY_MIN: cbgMin});
      expect(cbg.filtered(cbgData[0].normalTime, cbgData[1].normalTime).data.length).to.be.above(0);
    });
  });

  describe('filter', function() {
    it('should be a function', function() {
      assert.isFunction(bg.filter);
    });

    it('should return an object with two embedded arrays', function() {
      var res = bg.filter('', '');
      assert.typeOf(res, 'object');
      assert.typeOf(res.data, 'array');
      assert.typeOf(res.excluded, 'array');
    });

    it('(on cbg data) should return an object with a data array with length 0 or >= cbgMin (216)', function() {
      var now = new Date();
      // b/c we strip off milliseconds when creating deviceTimes in testpage data
      now = new Date(now.setUTCMilliseconds(0)).toISOString();
      var nextDay = dt.addDuration(now, MS_IN_DAY);
      var cbgData = patterns.cbg.constantFull({start: now.slice(0, -5)});
      var cbg = new BGUtil(cbgData, {DAILY_MIN: cbgMin});
      var l1 = cbg.filter('', '').data.length;
      var l2 = cbg.filter(now, nextDay).data.length;
      expect(l1).to.equal(0);
      expect(l2).to.be.above(cbgMin);
    });

    it('(on smbg data) should return an object with a data array with length 0 or >= smbgMin (4)', function() {
      var now = new Date();
      now = new Date(now.setUTCMilliseconds(0)).toISOString();
      var nextDay = dt.addDuration(now, MS_IN_DAY);
      var smbgData = patterns.smbg.constantFull({start: now.slice(0, -5)});
      var smbg = new BGUtil(smbgData, {DAILY_MIN: smbgMin});
      var l1 = smbg.filter('', '').data.length;
      var l2 = smbg.filter(now, nextDay).data.length;
      expect(l1).to.equal(0);
      expect(l2).to.be.at.least(smbgMin);
    });
  });

  describe('rangeBreakdown', function() {
    it('should be a function', function() {
      assert.isFunction(bg.rangeBreakdown);
    });

    it('should return an object', function() {
      assert.typeOf(bg.rangeBreakdown([]), 'object');
    });

    it('(on cbg data) should return NaN for each component if less than threshold for complete day of data', function() {
      var d = new Date();
      d = new Date(d.setUTCMilliseconds(0)).toISOString();
      var nextDay = dt.addDuration(d, MS_IN_DAY);
      var cbgData = patterns.cbg.constantInadequate({start: d.slice(0, -5)});
      var cbg = new BGUtil(cbgData, {DAILY_MIN: cbgMin});
      expect(cbg.rangeBreakdown(cbg.filter(d, nextDay).data)).to.eql(cbgNaNObject);
    });

    it('(on smbg data) should return NaN for each component if less than threshold for complete day of data', function() {
      var d = new Date();
      d = new Date(d.setUTCMilliseconds(0)).toISOString();
      var nextDay = dt.addDuration(d, MS_IN_DAY);
      var smbgData = patterns.smbg.constantInadequate({start: d.slice(0, -5)});
      var smbg = new BGUtil(smbgData, {DAILY_MIN: smbgMin});
      expect(smbg.rangeBreakdown(smbg.filter(d, nextDay).data)).to.eql(smbgNaNObject);
    });

    it('should return same breakdown for date range including and excluding a day of incomplete data', function() {
      var d1 = new Date();
      d1 = new Date(d1.setUTCMilliseconds(0)).toISOString();
      var d2 = dt.addDuration(d1, MS_IN_DAY);
      var end = dt.addDuration(d1, MS_IN_DAY*2);
      var cbgFull = patterns.cbg.constantFull({start: d1.slice(0, -5)});
      var cbgInadequate = patterns.cbg.constantInadequate({start: d2.slice(0, -5)});
      var cbgData = cbgFull.concat(cbgInadequate);
      var cbg = new BGUtil(cbgData, {DAILY_MIN: cbgMin});
      var excluding = cbg.filter(d1, d2).data;
      var including = cbg.filter(d1, end).data;
      expect(cbg.rangeBreakdown(including)).to.eql(cbg.rangeBreakdown(excluding));
    });
  });

  describe('average', function() {
    it('should be a function', function() {
      assert.isFunction(bg.average);
    });

    it('should return value of NaN when passed a valid but not long enough date range', function() {
      var d = new Date().toISOString();
      var later = dt.addDuration(d, 10);
      expect(isNaN(bg.average(d, later))).to.be.true;
    });

    it('should return value of NaN when passed a valid and long enough date range but not enough data', function() {
      var d = new Date().toISOString();
      var nextDay = dt.addDuration(d, MS_IN_DAY);
      expect(isNaN(bg.average(d, nextDay))).to.be.true;
    });

    it('(on cbg data) should return a number value when passed a valid, long enough date range with enough data', function() {
      var cbgData = patterns.cbg.constantJustEnough();
      var expected = {
        value: 100,
        category: 'target'
      };
      expect(bg.average(cbgData)).to.eql(expected);
    });

    it('(on cbg data) should return a mmol/L number value, rounded to 1 decimal place, when passed a valid, long enough date range with enough data', function() {
      var bgMmoll = new BGUtil([], {
        DAILY_MIN: 10,
        bgUnits: MMOLL_UNITS,
        bgClasses: {
          low: { boundary: 5.5 },
          target: { boundary: 10 },
        }
      });
      var cbgData = patterns.cbg.constantJustEnoughMmoll();
      var expected = {
        value: '8.6',
        category: 'target'
      };
      expect(bgMmoll.average(cbgData)).to.eql(expected);
    });

    it('(on smbg data) should return a number value when passed a valid, long enough date range with enough data', function() {
      var smbgData = patterns.smbg.constantJustEnough();
      var expected = {
        value: 100,
        category: 'target'
      };
      expect(bg.average(smbgData)).to.eql(expected);
    });

    it('(on smbg data) should return a mmol/L number value, rounded to 1 decimal place, when passed a valid, long enough date range with enough data', function() {
      var bgMmoll = new BGUtil([], {
        DAILY_MIN: 10,
        bgUnits: MMOLL_UNITS,
        bgClasses: {
          low: { boundary: 5.5 },
          target: { boundary: 10 },
        }
      });
      var smbgData = patterns.smbg.constantJustEnoughMmoll();
      var expected = {
        value: '8.6',
        category: 'target'
      };
      expect(bgMmoll.average(smbgData)).to.eql(expected);
    });

    it('should return same average for date range including and excluding a day of incomplete data', function() {
      var d1 = new Date();
      d1 = new Date(d1.setUTCMilliseconds(0)).toISOString();
      var d2 = dt.addDuration(d1, MS_IN_DAY);
      var end = dt.addDuration(d1, MS_IN_DAY*2);
      var cbgFull = patterns.cbg.constantFull({start: d1.slice(0, -5)});
      var cbgInadequate = patterns.cbg.constantInadequate({start: d2.slice(0, -5)});
      var cbgData = cbgFull.concat(cbgInadequate);
      var cbg = new BGUtil(cbgData, {DAILY_MIN: cbgMin});
      var excluding = cbg.filter(d1, d2).data;
      var including = cbg.filter(d1, end).data;
      expect(cbg.average(including)).to.eql(cbg.average(excluding));
    });
  });

  describe('threshold', function() {
    var cbg = new BGUtil([], {DAILY_MIN: cbgMin});
    var smbg = new BGUtil([], {DAILY_MIN: smbgMin});
    it('should be a function', function() {
      assert.isFunction(bg.threshold);
    });

    it('should return a number', function() {
      var d = new Date().toISOString();
      var later = dt.addDuration(d, 10);
      assert.typeOf(bg.threshold(d, later), 'number');
    });

    it('should return 0 given a start and end five minutes apart or less', function() {
      var d = new Date().toISOString();
      var later = dt.addDuration(d, 10);
      expect(bg.threshold(d, later)).to.equal(0);
    });

    it('(on cbg data) should return cbgMin (216) given a start and end 24 hours apart', function() {
      var d = new Date().toISOString();
      var nextDay = dt.addDuration(d, MS_IN_DAY);
      expect(cbg.threshold(d, nextDay)).to.equal(cbgMin);
    });

    it('(on smbg data) should return 2 * smbgMin (8) given a start and end 48 hours apart', function() {
      var d = new Date().toISOString();
      var twoDaysLater = dt.addDuration(d, MS_IN_DAY*2);
      expect(smbg.threshold(d, twoDaysLater)).to.equal(smbgMin*2);
    });

    it('(on cbg data) should return 3024 given a start and end 14 days apart', function() {
      var d = new Date().toISOString();
      var fourteenDaysLater = dt.addDuration(d, MS_IN_DAY*14);
      expect(cbg.threshold(d, fourteenDaysLater)).to.equal(cbgMin*14);
    });

    it('(on smbg data) should return 56 given a start and end 14 days apart', function() {
      var d = new Date().toISOString();
      var fourteenDaysLater = dt.addDuration(d, MS_IN_DAY*14);
      expect(smbg.threshold(d, fourteenDaysLater)).to.equal(smbgMin*14);
    });
  });
});
