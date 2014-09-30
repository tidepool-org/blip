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

var BasalUtil = require('../js/data/basalutil');

var dt = require('../js/data/util/datetime');
var patterns = require('../dev/testpage/patterns');

var MS_IN_HOUR = 3600000;
var MS_IN_DAY = 86400000;

describe('BasalUtil', function() {
  var bu = new BasalUtil([]);
  it('should be a function', function() {
    assert.isFunction(BasalUtil);
  });

  it('should be a (newable) constructor', function() {
    expect(bu).to.exist;
  });

  describe('totalBasal', function() {
    it('should be a function', function() {
      assert.isFunction(bu.totalBasal);
    });

    it('should return total of NaN when given invalid date range', function() {
      var res = bu.totalBasal('', '').total;
      expect(isNaN(res)).to.be.true;
    });

    it('should return total of NaN when passed a valid but not long enough date range', function() {
      var d = new Date().toISOString();
      var later = dt.addDuration(d, 10);
      var res = bu.totalBasal(d, later).total;
      expect(isNaN(res)).to.be.true;
    });

    it('should return a total of 24.0 on basal of rate 1.0 u/hr for 24 hours', function() {
      var data = patterns.basal.constant();
      var constant = new BasalUtil(data);
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY);
      expect(constant.totalBasal(start, end).total).to.equal(24.0);
    });

    it('should return a total of 24.0 on basal of rate 0.5 u/hr for 48 hours', function() {
      var data = patterns.basal.constant({days: 2, rate: 0.5, start: '2013-02-28T00:00:00'});
      var constant = new BasalUtil(data);
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY*2);
      expect(constant.totalBasal(start, end, {
        midnightToMidnight: true,
        exclusionThreshold: 2
      }).total).to.equal(24.0);
    });

    it('should return the same as subtotal on a 14-day span of data', function() {
      var data = patterns.basal.constant({days: 14, rate: 0.75, start: '2013-05-01T00:00:00'});
      var constant = new BasalUtil(data);
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY*14);
      expect(constant.totalBasal(start, end, {
        midnightToMidnight: true,
        exclusionThreshold: 7
      }).total).to.equal(constant.subtotal(constant.isContinuous(start, end)));
    });

    it('should return the same as subtotal on a 14-day span of data when not given midnight-to-midnight domain', function() {
      var data = patterns.basal.constant({days: 14, rate: 0.75});
      var constant = new BasalUtil(data);
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY*14);
      expect(constant.totalBasal(start, end, {
        exclusionThreshold: 7
      }).total).to.equal(constant.subtotal(constant.isContinuous(start, end)));
    });

    it('should have an excluded of length 8 when span of 7 days of data removed', function() {
      var data = patterns.basal.constant({days: 14});
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY*14);
      var toRemove = 7;
      data = data.slice(1, (14 - toRemove) * 4);
      var constant = new BasalUtil(data);
      var res = constant.totalBasal(start, end, {
        exclusionThreshold: 7
      });
      expect(res.excluded.length).to.equal(8);
    });

    it('should return total of NaN when a further day removed', function() {
      var data = patterns.basal.constant({days: 14});
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY*14);
      var toRemove = 8;
      data = data.slice(1, (14 - toRemove) * 4);
      var constant = new BasalUtil(data);
      var res = constant.totalBasal(start, end, {
        exclusionThreshold: 7
      });
      expect(res.excluded.length).to.equal(9);
      expect(isNaN(res.total)).to.be.true;
    });
  });

  describe('subtotal', function() {
    it('should be a function', function() {
      assert.isFunction(bu.subtotal);
    });

    it('should return 4.5 on basal of rate 0.75 u/hr from 6am to 12pm', function() {
      var endpoints = {
        start: {
          datetime: '2014-02-12T06:00:00.000Z',
          index: 1
        },
        end: {
          datetime: '2014-02-12T12:00:00.000Z',
          index: 2
        }
      };
      var data = patterns.basal.constant({rate: 0.75, start: '2014-06-01T00:00:00'});
      var constant = new BasalUtil(data);
      expect(constant.subtotal(endpoints)).to.equal(4.5);
    });
  });

  describe('isContinuous', function() {
    it('should be a function', function() {
      assert.isFunction(bu.isContinuous);
    });

    it('should return false when there is a gap between basal segments in a 24-hour period', function() {
      var data = patterns.basal.constant();
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY);
      data.splice(1,1);
      var gap = new BasalUtil(data);
      expect(gap.isContinuous(start, end)).to.be.false;
    });

    it('should return an endpoints object when there is no gap between basal segments in a 24-hour period', function() {
      var data = patterns.basal.constant();
      var start = data[0].normalTime, end = dt.addDuration(start, MS_IN_DAY);
      var noGap = new BasalUtil(data);
      var expected = {
        start: {
          datetime: start,
          index: 0
        },
        end: {
          datetime: end,
          index: 3
        }
      };
      expect(noGap.isContinuous(start, end)).to.eql(expected);
    });

    it('should return an endpoints object when a single basal segment contains (is a superset of) the given 24-hour period', function() {
      var now = new Date();
      var minusTen = new Date(now.valueOf() - MS_IN_HOUR);
      var data = [{
        duration: MS_IN_DAY*2,
        normalTime: minusTen.toISOString(),
        normalEnd: new Date(minusTen.valueOf() + MS_IN_DAY*2).toISOString()
      }];
      var start = now.toISOString(), end = new Date(now.valueOf() + MS_IN_DAY).toISOString();
      var expected = {
        start: {
          datetime: start,
          index: 0
        },
        end: {
          datetime: end,
          index: 0
        }
      };
      var singleSegment = new BasalUtil(data);
      expect(singleSegment.isContinuous(now.toISOString(), new Date(now.valueOf() + MS_IN_DAY).toISOString())).to.eql(expected);
    });
  });

  describe('segmentDose', function() {
    it('should be a function', function() {
      assert.isFunction(bu.segmentDose);
    });

    it('should return 0.0 on a zero rate', function() {
      expect(bu.segmentDose(MS_IN_HOUR, 0)).to.equal(0.0);
    });

    it('should return 1.0 on a rate of 1u for one hour', function() {
      expect(bu.segmentDose(MS_IN_HOUR, 1)).to.equal(1.0);
    });

    it('should return 1.2 on a rate of 0.8u for 1.5 hours', function() {
      expect(bu.segmentDose(MS_IN_HOUR * 1.5, 0.8)).to.equal(1.2);
    });
  });

  describe('scheduleTotal', function() {
    it('should be a function', function() {
      assert.isFunction(bu.scheduleTotal);
    });

    it('should return NaN on an empty array', function() {
      expect(isNaN(bu.scheduleTotal([]))).to.be.true;
    });

    it('should return 24 on a schedule of 1.0 U/hr for 24 hours', function() {
      var schedule = [{
        'start': 0,
        'rate': 1.0
      }];
      expect(bu.scheduleTotal(schedule)).to.equal(24.0);
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
      expect(bu.scheduleTotal(schedule)).to.equal(11.1);
    });
  });
});