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
var fx = require('./fixtures');

var tideline = require('../js/index');
var BasalUtil = tideline.data.BasalUtil;
var SegmentUtil = tideline.data.SegmentUtil;

var MS_IN_HOUR = 3600000.0;

describe('basal utilities', function() {
  describe('totalBasal', function() {
    var data = watson.normalize(_.findWhere(fx, {'name': 'current-demo'}).json);
    var basalSegments = new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'})).all;
    var basal = new BasalUtil(basalSegments);
    var templateSegments = watson.normalize(new SegmentUtil(_.findWhere(fx, {'name': 'template'}).json).all);
    var template = new BasalUtil(templateSegments);
    var tempSegments = watson.normalize(new SegmentUtil(_.findWhere(fx, {'name': 'contained'}).json).all);
    var temp = new BasalUtil(tempSegments);

    it('should be a function', function() {
      assert.isFunction(basal.totalBasal);
    });

    it('should return a number or NaN when given invalid date range', function() {
      var type = typeof basal.totalBasal('', '');
      expect(type === 'number').to.be.true;
    });

    it('should return a number when passed a valid date range', function() {
      var type = typeof basal.totalBasal(basal.data[0].normalTime, basal.data[1].normalTime);
      expect((type === 'number') && isNaN(basal.totalBasal(basal.data[0].normalTime, basal.data[1].normalTime))).to.be.true;
    });

    it('should return NaN if the start of data and start of basals do not align exactly or overlap', function() {
      var d = new Date(data[0].normalTime);
      var b = new Date(basal.data[0].normalTime);
      if (d < b) {
        var twentyFour = Duration.parse('24h');
        var endTwentyFour = new Date(d.valueOf() + twentyFour);
        expect(isNaN(basal.totalBasal(d.valueOf(), endTwentyFour.valueOf()))).to.be.true;
      }
    });

    it('should return NaN if the end of data and end of basals do not align exactly or overlap', function() {
      var d = new Date(data[data.length - 1].normalTime);
      var b = new Date(basal.data[basal.data.length - 1].normalEnd);
      if (b < d) {
        var twentyFour = Duration.parse('24h');
        var prevTwentyFour = new Date(d.valueOf() - twentyFour);
        expect(isNaN(basal.totalBasal(prevTwentyFour.valueOf(), d.valueOf()))).to.be.true;
      }
    });

    it('should return 20.0 on basal-template.json for twenty-four hours', function() {
      var start = new Date('2014-02-12T00:00:00.000Z').valueOf();
      var end = new Date('2014-02-13T00:00:00.000Z').valueOf();
      expect(template.totalBasal(start, end)).to.equal(20.0);
    });

    it('should return 1.45 on basal-template.json from 1 to 3 a.m.', function() {
      var start = new Date('2014-02-12T01:00:00.000Z').valueOf();
      var end = new Date('2014-02-12T03:00:00.000Z').valueOf();
      expect(template.totalBasal(start, end)).to.equal(1.45);
    });

    it('should return 5.35 on basal-contained.json from 8:30 a.m. to 3:30 p.m.', function() {
      var start = new Date('2014-02-12T08:30:00.000Z').valueOf();
      var end = new Date('2014-02-12T15:30:00.000Z').valueOf();
      expect(temp.totalBasal(start, end)).to.equal(5.35);
    });
  });

  describe('segmentDose', function() {
    var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);
    basal.normalizedActual = watson.normalize(basal.actual);

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
});

