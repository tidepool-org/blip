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

/*jshint expr: true */
/*global describe, it */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');
var Duration = require('duration-js');

var watson = require('../plugins/data/watson');
var data = watson.normalizeAll(require('../example/data/device-data.json'));

var tideline = require('../js/index');
var datetime = tideline.data.util.datetime;
var format = tideline.data.util.format;
var BolusUtil = tideline.data.BolusUtil;

describe('bolus utilities', function() {
  var bolus = new BolusUtil(_.where(data, {'type': 'bolus'}));
  var bolusData = _.where(data, {'type': 'bolus'});

  describe('totalBolus', function() {
    it('should be a function', function() {
      assert.isFunction(bolus.totalBolus);
    });

    it('should return a number or NaN when given invalid date range', function() {
      var type = typeof bolus.totalBolus('', '');
      expect(type).equals('number');
    });

    it('should return total of NaN when passed a valid but not long enough date range', function() {
      expect(isNaN(bolus.totalBolus(bolusData[0].normalTime, bolusData[1].normalTime))).to.be.true;
    });

    it('should return a number when passed a valid and long enough date range', function() {
      var res = bolus.totalBolus(bolusData[0].normalTime, datetime.addDays(bolusData[0].normalTime, 1));
      expect((typeof res === 'number') && !(isNaN(res))).to.be.true;
    });

    it('should accurately compute a total with exclusion, exclusion at left edge', function() {
      var start = bolusData[0].normalTime;
      var res1 = bolus.totalBolus(start, datetime.addDays(start, 14));
      var res2 = bolus.totalBolus(start, datetime.addDays(start, 1));
      var res3 = bolus.totalBolus(start, datetime.addDays(start, 14), {'excluded': [start]});
      expect(res3).to.equal(format.fixFloatingPoint(res1 - res2));
    });

    it('should accurately compute a total with exclusion, exclusion at right edge', function() {
      var start = bolusData[0].normalTime;
      var notQuite = datetime.addDays(start, 13);
      var end = datetime.addDays(start, 14);
      var res1 = bolus.totalBolus(start, end);
      var res2 = bolus.totalBolus(notQuite, end);
      var res3 = bolus.totalBolus(start, end, {'excluded': [notQuite]});
      expect(res3).to.equal(format.fixFloatingPoint(res1 - res2));
    });

    it('should accurately compute a total with exclusion, exclusion somewhere in the middle', function() {
      var start = bolusData[0].normalTime;
      var s2 = datetime.addDays(start, 3);
      var e2 = datetime.addDays(s2, 4);
      var end = datetime.addDays(start, 14);
      var res1 = bolus.totalBolus(start, end);
      var res2 = bolus.totalBolus(s2, e2);
      var res3 = bolus.totalBolus(start, end, {'excluded': [s2, datetime.addDays(s2, 1), datetime.addDays(s2, 2), datetime.addDays(s2, 3)]});
      expect(res3).to.equal(format.fixFloatingPoint(res1 - res2));
    });

    it('should compute a total exclusive of endpoint', function() {
      var tEnd = bolusData[bolusData.length - 2].normalTime;
      var b = bolusData[bolusData.length - 2].value;
      var d = Duration.parse('1ms');
      var tPlus = new Date(tEnd).valueOf() + d;
      var res1 = bolus.totalBolus(datetime.addDays(tEnd, -1), tEnd);
      var res2 = bolus.totalBolus(datetime.addDays(tPlus, -1), tPlus);
      expect(format.fixFloatingPoint(res1)).to.equal(format.fixFloatingPoint(res2 - b));
    });
  });

  describe('subtotal', function() {
    it('should be a function', function() {
      assert.isFunction(bolus.subtotal);
    });

    it('should return b.value where b is the first bolus in the dataset and the date range is restricted to one bolus', function() {
      var value = bolusData[0].value;
      var d = Duration.parse('1ms');
      var next = new Date(bolusData[1].normalTime) - d;
      expect(bolus.subtotal(bolusData[0].normalTime, next)).to.equal(value);
    });

    it('should return b1.value where b1 & b2 are the first two boluses and the date range is set to their datetimes', function() {
      var v1 = bolusData[0].value;
      expect(bolus.subtotal(bolusData[0].normalTime, bolusData[1].normalTime)).to.equal(v1);
    });
  });
});