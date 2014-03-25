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
var CBGUtil = tideline.data.CBGUtil;

describe('cbg utilities', function() {
  var cbg = new CBGUtil(_.where(data, {'type': 'cbg'}));
  var cbgData = _.where(data, {'type': 'cbg'});
  var NaNObject = {
    'low': NaN,
    'target': NaN,
    'high': NaN,
    'total': NaN
  };
  var startTime = new Date();
  var random = function() { return Math.floor((Math.random() * 400) + 1); };
  var inadequateData = [{
    'normalTime': startTime.toISOString(),
    'value': random()
  }], i = 0;
  var fiveMin = Duration.parse('5m');
  while (i < cbg.threshold()) {
    var next = new Date(startTime.valueOf() + fiveMin);
    inadequateData.push({
      'normalTime': next.toISOString(),
      'value': random()
    });
    i++;
    startTime = next;
  }
  var endTime = new Date(startTime.valueOf() + Duration.parse('24h'));
  inadequateData.push({
    'normalTime': endTime.toISOString()
  });
  var cbgInadequate = new CBGUtil(inadequateData);

  describe('filter', function() {
    it('should be a function', function() {
      assert.isFunction(cbg.filter);
    });

    it('should return an array', function() {
      assert.typeOf(cbg.filter('', ''), 'array');
    });

    it('should return a non-empty array when passed a valid date range', function() {
      expect(cbg.filter(cbgData[0].normalTime, cbgData[1].normalTime).length).to.be.above(0);
    });
  });

  describe('rangeBreakdown', function() {
    it('should be a function', function() {
      assert.isFunction(cbg.rangeBreakdown);
    });

    it('should return an object', function() {
      assert.typeOf(cbg.rangeBreakdown('', ''), 'object');
    });

    it('should return NaN for each component if less than threshold for complete day of data', function() {
      expect(cbgInadequate.rangeBreakdown(startTime.valueOf(), endTime.valueOf())).to.eql(NaNObject);
    });
  });

  describe('average', function() {
    var start = new Date (cbgData[0].normalTime);
    var day = Duration.parse('1d');
    it('should be a function', function() {
      assert.isFunction(cbg.average);
    });

    it('should return value of NaN when passed a valid but not long enough date range', function() {
      expect(isNaN(cbg.average(cbgData[0].normalTime, cbgData[1].normalTime).value)).to.be.true;
    });

    it('should return value of NaN when passed a valid and long enough date range', function() {
      expect(isNaN(cbgInadequate.average(cbgData[0].normalTime, new Date(start.valueOf() + day).toISOString()).value)).to.be.true;
    });

    it('should return a number value when passed a valid, long enough date range with enough data', function() {
      var res = cbg.average(cbgData[0].normalTime, new Date(start.valueOf() + day).toISOString()).value;
      expect((typeof res === 'number') && !isNaN(res)).to.be.true;
    });
  });

  describe('threshold', function() {
    var start = new Date (cbgData[0].normalTime);
    var d = new Date();
    it('should return a number', function() {
      assert.typeOf(cbg.threshold(cbg.endpoints[0], cbg.endpoints[1]), 'number');
    });

    it('should return 0 given a start and end five minutes apart or less', function() {
      var five = Duration.parse('5m');
      expect(cbg.threshold(d, new Date(d.valueOf() + five))).to.equal(0);
    });

    it('should return 216 given a start and end 24 hours apart', function() {
      var day = Duration.parse('1d');
      expect(cbg.threshold(d, new Date(d.valueOf() + day))).to.equal(216);
    });

    it('should return 3024 given a start and end 14 days apart', function() {
      var fourteen = Duration.parse('14d');
      expect(cbg.threshold(d, new Date(d.valueOf() + fourteen))).to.equal(3024);
    });
  });
});