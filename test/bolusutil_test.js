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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var BolusUtil = require('../js/data/bolusutil');

var dt = require('../js/data/util/datetime');
var patterns = require('../dev/testpage/patterns');

var MS_IN_DAY = 86400000;

describe('BolusUtil', function() {
  var bu = new BolusUtil([]);

  it('should be a function', function() {
    assert.isFunction(BolusUtil);
  });

  it('should be a (newable) constructor', function() {
    expect(bu).to.exist;
  });

  describe('totalBolus', function() {
    it('should be a function', function() {
      assert.isFunction(bu.totalBolus);
    });

    it('should return total of NaN when given invalid date range', function() {
      var res = bu.totalBolus('', '');
      expect(isNaN(res)).to.be.true;
    });

    it('should return total of NaN when passed a valid but not long enough date range', function() {
      var d = new Date().toISOString();
      var later = dt.addDuration(d, 10);
      var res = bu.totalBolus(d, later);
      expect(isNaN(res)).to.be.true;
    });

    it('should return a number when passed a valid and long enough date range', function() {
      var now = new Date();
      // b/c we strip off milliseconds when creating deviceTimes in testpage data
      now = new Date(now.setUTCMilliseconds(0)).toISOString();
      var nextDay = dt.addDuration(now, MS_IN_DAY);
      var bolusData = patterns.bolus.constantFour({start: now.slice(0, -5)});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.totalBolus(now, nextDay);
      expect(res).to.equal(10.0);
    });

    it('should accurately compute a total with exclusion, exclusion at left edge', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var end = dt.addDuration(start, MS_IN_DAY*14);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5), days: 14, value: 0.25});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.totalBolus(start, end, {excluded: [start]});
      expect(res).to.equal(13.0);
    });

    it('should accurately compute a total with exclusion, exclusion at right edge', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var notQuite = dt.addDuration(start, MS_IN_DAY*13);
      var end = dt.addDuration(start, MS_IN_DAY*14);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5), days: 14, value: 0.25});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.totalBolus(start, end, {excluded: [notQuite]});
      expect(res).to.equal(13.0);
    });

    it('should accurately compute a total with exclusion, exclusion in the middle', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var middle = dt.addDuration(start, MS_IN_DAY*7);
      var middlePlus = dt.addDuration(start, MS_IN_DAY*8);
      var end = dt.addDuration(start, MS_IN_DAY*14);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5), days: 14, value: 0.5});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.totalBolus(start, end, {excluded: [middle, middlePlus]});
      expect(res).to.equal(24.0);
    });

    it('should compute a total exclusive of endpoint', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var nextDay = dt.addDuration(start, MS_IN_DAY);
      var end = dt.addDuration(start, MS_IN_DAY*2);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5), days: 2});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.totalBolus(start, nextDay);
      expect(res).to.equal(10.0);
    });
  });

  describe('subtotal', function() {
    it('should be a function', function() {
      assert.isFunction(bu.subtotal);
    });

    it('should return b.value where b is the first bolus in the dataset and the date range is restricted to one bolus', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var nextDay = dt.addDuration(start, MS_IN_DAY);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5)});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.subtotal(start, dt.addDuration(bolusData[1].normalTime, -1));
      expect(res).to.equal(bolusData[0].normal);
    });

    it('should return b1.value where b1 & b2 are the first two boluses and the date range is set to their datetimes', function() {
      var start = '2014-06-01T00:00:00.000Z';
      var nextDay = dt.addDuration(start, MS_IN_DAY);
      var bolusData = patterns.bolus.constantFour({start: start.slice(0, -5)});
      var bolus = new BolusUtil(bolusData);
      var res = bolus.subtotal(bolusData[0].normalTime, bolusData[1].normalTime);
      expect(res).to.equal(bolusData[0].normal);
    });
  });
});