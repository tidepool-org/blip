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
