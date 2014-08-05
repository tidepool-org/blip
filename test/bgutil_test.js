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

var dt = require('../js/data/util/datetime');
var BGUtil = require('../js/data/bgutil');

describe('bg utilities', function() {
  var cbgData = _.where(data, {'type': 'cbg'});
  var smbgData = _.where(data, {'type': 'smbg'});
  var cbgMin = 0.75 * 288;
  var smbgMin = 4;
  var cbg = new BGUtil(cbgData, {'DAILY_MIN': cbgMin});
  var smbg = new BGUtil(smbgData, {'DAILY_MIN': smbgMin});
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


  var generateDayOfData = function(startTime, n, datatype) {
    var random = function() { return Math.floor((Math.random() * 400) + 1); };
    var data = [{
      'normalTime': startTime.toISOString(),
      'value': random(),
      'type': datatype
    }], i = 0;
    var fiveMin = Duration.parse('5m');
    while (i < n) {
      var next = new Date(startTime.valueOf() + fiveMin);
      data.push({
        'normalTime': next.toISOString(),
        'value': random(),
        'type': datatype
      });
      i++;
      startTime = next;
    }

    return data;
  };
  var startTime = new Date();
  var endTime = new Date(startTime.valueOf() + Duration.parse('24h'));

  var inadequateData = generateDayOfData(startTime, 50, 'cbg');
  var cbgInadequate = new BGUtil(inadequateData, {'DAILY_MIN': cbgMin});

  var tooLittleSMBG = generateDayOfData(startTime, 2, 'smbg');
  var smbgInadequate = new BGUtil(tooLittleSMBG, {'DAILY_MIN': smbgMin});

  var dayData = generateDayOfData(endTime, 287, 'cbg');
  var cbgDay = new BGUtil(dayData, {'DAILY_MIN': cbgMin});

  var mixData = inadequateData.concat(dayData);
  mixData = _.sortBy(mixData, function(d) {
    return new Date(d.normalTime).valueOf();
  });
  var cbgMix = new BGUtil(mixData, {'DAILY_MIN': cbgMin});

  describe('filtered', function() {
    it('should be a function', function() {
      assert.isFunction(cbg.filtered);
    });

    it('should return an object', function() {
      assert.typeOf(cbg.filtered('', ''), 'object');
    });

    it('should return an object with two embedded arrays', function() {
      var res = cbg.filtered('', '');
      assert.typeOf(res.data, 'array');
      assert.typeOf(res.excluded, 'array');
    });

    it('should return a non-empty array when passed a valid date range', function() {
      expect(cbg.filtered(cbgData[0].normalTime, cbgData[1].normalTime).data.length).to.be.above(0);
    });
  });

  describe('filter', function() {
    it('should be a function', function() {
      assert.isFunction(cbg.filter);
    });

    it('should return an object', function() {
      assert.typeOf(cbg.filter('', ''), 'object');
    });

    it('should return an object with two embedded arrays', function() {
      var res = cbg.filter('', '');
      assert.typeOf(res.data, 'array');
      assert.typeOf(res.excluded, 'array');
    });

    it('(on cbg data) should return an object with a data array with length 0 or >= cbgMin (216)', function() {
      var l1 = cbg.filter('', '').data.length;
      var l2 = cbg.filter(cbgData[0].normalTime, dt.addDays(cbgData[0].normalTime, 1)).data.length;
      expect((l1 === 0) && (l2 >= 216)).to.be.true;
    });

    it('(on smbg data) should return an object with a data array with length 0 or >= smbgMin (4)', function() {
      var l1 = smbg.filter('', '').data.length;
      var l2 = smbg.filter(smbgData[0].normalTime, dt.addDays(smbgData[0].normalTime, 1)).data.length;
      expect((l1 === 0) && (l2 >= 4)).to.be.true;
    });

    it('should return a non-empty array when passed a valid date range', function() {
      expect(cbg.filter(cbgData[0].normalTime, dt.addDays(cbgData[0].normalTime, 1)).data.length).to.be.above(0);
    });
  });

  describe('rangeBreakdown', function() {
    it('should be a function', function() {
      assert.isFunction(cbg.rangeBreakdown);
    });

    it('should return an object', function() {
      assert.typeOf(cbg.rangeBreakdown(cbg.filter('', '').data), 'object');
    });

    it('(on cbg data) should return NaN for each component if less than threshold for complete day of data', function() {
      var res = cbgInadequate.rangeBreakdown(cbgInadequate.filter(startTime.valueOf(), endTime.valueOf()).data);
      expect(res).to.eql(cbgNaNObject);
    });

    it('(on smbg data) should return NaN for each component if less than threshold for complete day of data', function() {
      var res = smbgInadequate.rangeBreakdown(smbgInadequate.filter(startTime.valueOf(), endTime.valueOf()).data);
      expect(res).to.eql(smbgNaNObject);
    });

    it('should return same breakdown for date range including and excluding a day of incomplete data', function() {
      var res1 = cbgMix.rangeBreakdown(cbgMix.filter(startTime.toISOString(), dt.addDays(startTime, 2)).data);
      var res2 = cbgMix.rangeBreakdown(cbgMix.filter(dt.addDays(startTime, 1), dt.addDays(startTime, 2)).data);
      expect(res1).to.eql(res2);
    });
  });

  describe('average', function() {
    var start = new Date (cbgData[0].normalTime);
    var day = Duration.parse('1d');
    it('should be a function', function() {
      assert.isFunction(cbg.average);
    });

    it('should return value of NaN when passed a valid but not long enough date range', function() {
      expect(isNaN(cbg.average(cbg.filter(cbgData[0].normalTime, cbgData[1].normalTime).data).value)).to.be.true;
    });

    it('should return value of NaN when passed a valid and long enough date range', function() {
      expect(isNaN(cbgInadequate.average(cbgInadequate.filter(cbgData[0].normalTime, new Date(start.valueOf() + day).toISOString()).data).value)).to.be.true;
    });

    it('(on cbg data) should return a number value when passed a valid, long enough date range with enough data', function() {
      var res = cbg.average(cbg.filter(cbgData[0].normalTime, new Date(start.valueOf() + day).toISOString()).data).value;
      expect((typeof res === 'number') && !isNaN(res)).to.be.true;
    });

    it('(on smbg data) should return a number value when passed a valid, long enough date range with enough data', function() {
      var res = smbg.average(smbg.filter(smbgData[0].normalTime, dt.addDays(smbgData[0].normalTime, 1)).data).value;
      expect((typeof res === 'number') && !isNaN(res)).to.be.true;
    });

    it('should return same average for date range including and excluding a day of incomplete data', function() {
      var res1 = cbgMix.average(cbgMix.filter(startTime.toISOString(), dt.addDays(startTime, 2)).data);
      var res2 = cbgMix.average(cbgMix.filter(dt.addDays(startTime, 1), dt.addDays(startTime, 2)).data);
      expect(res1).to.eql(res2);
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

    it('(on cbg data) should return cbgMin (216) given a start and end 24 hours apart', function() {
      var day = Duration.parse('1d');
      expect(cbg.threshold(d, new Date(d.valueOf() + day))).to.equal(216);
    });

    it('(on smbg data) should return 2 * smbgMin (8) given a start and end 48 hours apart', function() {
      var day = Duration.parse('2d');
      expect(smbg.threshold(d, new Date(d.valueOf() + day))).to.equal(8);
    });

    it('(on cbg data) should return 3024 given a start and end 14 days apart', function() {
      var fourteen = Duration.parse('14d');
      expect(cbg.threshold(d, new Date(d.valueOf() + fourteen))).to.equal(3024);
    });

    it('(on smbg data) should return 56 given a start and end 14 days apart', function() {
      var fourteen = Duration.parse('14d');
      expect(smbg.threshold(d, new Date(d.valueOf() + fourteen))).to.equal(56);
    });
  });
});
