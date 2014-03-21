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

var watson = require('../example/watson');
var data = watson.normalize(require('../example/data/device-data.json'));

var tideline = require('../js/index');
var datetime = tideline.data.util.datetime;
var format = tideline.data.util.format;
var BolusUtil = tideline.data.BolusUtil;

describe('bolus utilities', function() {
  describe('totalBolus', function() {
    var bolus = new BolusUtil(_.where(data, {'type': 'bolus'}));
    var bolusData = _.where(data, {'type': 'bolus'});

    it('should be a function', function() {
      assert.isFunction(bolus.totalBolus);
    });

    it('should have two UTC endpoints', function() {
      expect(datetime.checkIfUTCDate(bolus.endpoints[0]) &&
        datetime.checkIfUTCDate(bolus.endpoints[1])).to.be.true;
    });

    it('should return a number or NaN when given invalid date range', function() {
      var type = typeof bolus.totalBolus('', '');
      expect(type).equals('number');
    });

    it('should return a number when given valid date range', function() {
      var type = typeof bolus.totalBolus(bolusData[0].normalTime, bolusData[1].normalTime);
      expect(type).equals('number');
    });

    it('should return b.value where b is the first bolus in the dataset and the date range is restricted to one bolus', function() {
      var value = bolusData[0].value;
      var d = Duration.parse('1ms');
      var next = new Date(bolusData[1].normalTime) - d;
      expect(bolus.totalBolus(bolusData[0].normalTime, next)).to.equal(value);
    });

    it('should return b1.value + b2.value where b1 & b2 are the first two boluses and the date range is set to their datetimes', function() {
      var v1 = bolusData[0].value;
      var v2 = bolusData[1].value;
      var res = format.fixFloatingPoint(v1 + v2);
      expect(bolus.totalBolus(bolusData[0].normalTime, bolusData[1].normalTime)).to.equal(res);
    });
  });
});