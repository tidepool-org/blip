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
var fx = require('./fixtures');

var tideline = require('../js/index');
var BasalUtil = tideline.data.BasalUtil;
var SegmentUtil = tideline.data.SegmentUtil;
var format = tideline.data.util.format;

var MS_IN_HOUR = 3600000.0;

function all(segmentUtil) {
  var arraysToConcat = [];

  arraysToConcat.push(segmentUtil.actual);
  Object.keys(segmentUtil.undelivered).forEach(function(key){
    arraysToConcat.push(segmentUtil.undelivered[key]);
  });

  return Array.prototype.concat.apply([], arraysToConcat);
}

describe('basal utilities', function() {
  describe('totalBasal', function() {
    var data = _.findWhere(fx, {'name': 'current-demo'}).json;
    var basalSegments = all(new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'})));
    data = _.reject(data, function(d) {
      return d.type === 'basal-rate-segment';
    });
    data = data.concat(basalSegments);
    data = watson.normalizeAll(data);
    var basal = new BasalUtil(_.where(data, {'type': 'basal-rate-segment'}));
    var templateSegments = watson.normalizeAll(all(new SegmentUtil(_.findWhere(fx, {'name': 'template'}).json)));
    var template = new BasalUtil(templateSegments);
    var tempSegments = watson.normalizeAll(all(new SegmentUtil(_.findWhere(fx, {'name': 'contained'}).json)));
    var temp = new BasalUtil(tempSegments);
    var twoDaySegments = watson.normalizeAll(all(new SegmentUtil(_.findWhere(fx, {'name': 'two-days'}).json)));
    var twoDays = new BasalUtil(twoDaySegments);

    it('should be a function', function() {
      assert.isFunction(basal.totalBasal);
    });

    it('should return total of NaN when given invalid date range', function() {
      var type = typeof basal.totalBasal('', '').total;
      expect(type === 'number').to.be.true;
    });

    it('should return total of NaN when passed a valid but not long enough date range', function() {
      var type = typeof basal.totalBasal(basal.data[0].normalTime, basal.data[1].normalTime).total;
      expect((type === 'number') && isNaN(basal.totalBasal(basal.data[0].normalTime, basal.data[1].normalTime).total)).to.be.true;
    });

    it('should return total of NaN if the start of data and start of basals do not align exactly or overlap', function() {
      var d = new Date(data[0].normalTime);
      var b = new Date(basal.data[0].normalTime);
      if (d < b) {
        var twentyFour = Duration.parse('24h');
        var endTwentyFour = new Date(d.valueOf() + twentyFour);
        expect(isNaN(basal.totalBasal(d.valueOf(), endTwentyFour.valueOf()).total)).to.be.true;
      }
    });

    it('should return total of NaN if the end of data and end of basals do not align exactly or overlap', function() {
      var d = new Date(data[data.length - 1].normalTime);
      var b = new Date(basal.data[basal.data.length - 1].normalEnd);
      if (b < d) {
        var twentyFour = Duration.parse('24h');
        var prevTwentyFour = new Date(d.valueOf() - twentyFour);
        expect(isNaN(basal.totalBasal(prevTwentyFour.valueOf(), d.valueOf()))).to.be.true;
      }
    });

    it('should return total of 20.0 on basal-template.json for twenty-four hours', function() {
      var start = new Date('2014-02-12T00:00:00.000Z').valueOf();
      var end = new Date('2014-02-13T00:00:00.000Z').valueOf();
      expect(template.totalBasal(start, end).total).to.equal(20.0);
    });

    it('should return total of 19.6 on basal-contained.json for twenty-four hours', function() {
      var start = new Date('2014-02-12T00:00:00.000Z').valueOf();
      var end = new Date('2014-02-13T00:00:00.000Z').valueOf();
      expect(temp.totalBasal(start, end).total).to.equal(19.6);
    });

    it('should return 40.0 on basal-two-days.json for the extent of the data', function() {
      var start = new Date('2014-02-12T00:00:00.000Z').valueOf();
      var end = new Date('2014-02-14T00:00:00.000Z').valueOf();
      expect(twoDays.totalBasal('2014-02-12T00:00:00.000Z', '2014-02-14T00:00:00.000Z', {
        'midnightToMidnight': true,
        'exclusionThreshold': 2
      }).total).to.equal(40.0);
    });

    it('should return the same as subtotal on a 14-day span of data', function() {
      var first = _.find(data, {'type': 'basal-rate-segment'});
      var midnight = 'T00:00:00.000Z';
      var start = new Date(first.normalTime.slice(0,10) + midnight);
      start.setUTCDate(start.getUTCDate() + 1);
      var end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 14);
      var st = basal.subtotal(basal.isContinuous(start.toISOString(), end.toISOString()));
      var t = basal.totalBasal(start.toISOString(), end.toISOString(), {'exclusionThreshold': 7});
      expect(format.fixFloatingPoint(st)).to.equal(format.fixFloatingPoint(t.total));
    });

    it('should return the same as subtotal on a 14-day span of data when not given midnight-to-midnight domain', function() {
      var basals = _.where(data, {'type': 'basal-rate-segment'});
      var first = basals[12];
      var end = new Date(first.normalTime);
      end.setUTCDate(end.getUTCDate() + 14);
      var st = basal.subtotal(basal.isContinuous(first.normalTime, end.toISOString()));
      var t = basal.totalBasal(first.normalTime, end.toISOString(), {'exclusionThreshold': 7});
      expect(format.fixFloatingPoint(st)).to.equal(format.fixFloatingPoint(t.total));
    });

    it('should have an excluded of length 7 when span of 7 days of data removed', function() {
      var first = _.find(data, {'type': 'basal-rate-segment'});
      var midnight = 'T00:00:00.000Z';
      var start = new Date(first.normalTime.slice(0,10) + midnight);
      start.setUTCDate(start.getUTCDate() + 1);
      var end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 14);
      var gap = new Date(start);
      gap.setUTCDate(gap.getUTCDate() + 2);
      for (var i = 0; i < 7; i++) {
        var dateString = gap.toISOString().slice(0,10);
        basal.actual = _.reject(basal.actual, function(d) {
          return d.normalTime.slice(0,10) === dateString;
        });
        gap.setUTCDate(gap.getUTCDate() + 1);
      }
      var t = basal.totalBasal(start.toISOString(), end.toISOString(), {'exclusionThreshold': 7});
      expect(t.excluded.length).to.equal(7);
    });

    it('should return total of NaN when a further day removed', function() {
      var first = _.find(data, {'type': 'basal-rate-segment'});
      var midnight = 'T00:00:00.000Z';
      var start = new Date(first.normalTime.slice(0,10) + midnight);
      start.setUTCDate(start.getUTCDate() + 1);
      var end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 14);
      var gap = new Date(start);
      gap.setUTCDate(gap.getUTCDate() + 9);
      var dateString = gap.toISOString().slice(0,10);
      basal.actual = _.reject(basal.actual, function(d) {
        return d.normalTime.slice(0,10) === dateString;
      });
      var t = basal.totalBasal(start.toISOString(), end.toISOString(), {'exclusionThreshold': 7});
      expect(isNaN(t.total)).to.be.true;
    });
  });

  describe('subtotal', function() {
    var data = watson.normalizeAll(_.findWhere(fx, {'name': 'template'}).json);
    var basalSegments = all(new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'})));
    var basal = new BasalUtil(basalSegments);

    it('should be a function', function() {
      assert.isFunction(basal.subtotal);
    });

    it('should return 5.4 on basal-template.json from 6am to 12pm', function() {
      var endpoints = {
        'start': {
          'datetime': '2014-02-12T06:00:00.000Z',
          'index': 4
        },
        'end': {
          'datetime': '2014-02-12T12:00:00.000Z',
          'index': 5
        }
      };
      expect(basal.subtotal(endpoints)).to.equal(5.4);
    });
  });

  describe('isContinuous', function() {
    var data = watson.normalizeAll(_.findWhere(fx, {'name': 'template'}).json);
    var basalSegments = all(new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'})));
    var basal = new BasalUtil(basalSegments);
    var gapSegments = watson.normalizeAll(all(new SegmentUtil(_.findWhere(fx, {'name': 'gap'}).json)));
    var gap = new BasalUtil(gapSegments);

    it('should be a function', function() {
      assert.isFunction(basal.isContinuous);
    });

    it('should return false on basal-gap.json', function() {
      expect(gap.isContinuous('2014-02-12T00:00:00.000Z', '2014-02-13T00:00:00.000Z')).to.be.false;
    });

    it('should return true on basal-template.json', function() {
      var type = typeof basal.isContinuous('2014-02-12T00:00:00.000Z', '2014-02-13T00:00:00.000Z');
      expect(type === 'object').to.be.true;
    });
  });

  describe('segmentDose', function() {
    var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);
    basal.normalizedActual = watson.normalizeAll(basal.actual);

    it('should be a function', function() {
      assert.isFunction(basal.segmentDose);
    });

    it('should return 0.0 on a zero rate', function() {
      expect(basal.segmentDose(MS_IN_HOUR, 0)).to.equal(0.0);
    });

    it('should return 1.0 on a rate of 1U for one hour', function() {
      expect(basal.segmentDose(MS_IN_HOUR, 1)).to.equal(1.0);
    });

    it('should return 1.2 on a rate of 0.8U for 1.5 hours', function() {
      expect(basal.segmentDose(MS_IN_HOUR * 1.5, 0.8)).to.equal(1.2);
    });
  });

  describe('scheduleTotal', function() {
    var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);

    it('should be a function', function() {
      assert.isFunction(basal.scheduleTotal);
    });

    it('should return NaN on an empty array', function() {
      expect(isNaN(basal.scheduleTotal([]))).to.be.true;
    });

    it('should return 24 on a schedule of 1.0 U/hr for 24 hours', function() {
      var schedule = [{
        'start': 0,
        'rate': 1.0
      }];
      expect(basal.scheduleTotal(schedule)).to.equal(24.0);
    });

    it('should return 11.1 on given schedule', function() {
      var schedule = [{
        'start': 0,
        'rate': 0.450,
      },
      {
        'start': 2 * MS_IN_HOUR,
        'rate': 0.350
      },
      {
        'start': 4 * MS_IN_HOUR,
        'rate': 0.450
      },
      {
        'start': 5 * MS_IN_HOUR,
        'rate': 0.5
      },
      {
        'start': 6 * MS_IN_HOUR,
        'rate': 0.6
      },
      {
        'start': 9 * MS_IN_HOUR,
        'rate': 0.450
      }];
      expect(basal.scheduleTotal(schedule)).to.equal(11.1);
    });
  });
});

