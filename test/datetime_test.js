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

var _ = require('lodash');

var dt = require('../js/data/util/datetime');

describe('datetime utility', function() {
  describe('MS_IN_24', function() {
    it('should equal 86400000', function() {
      expect(dt.MS_IN_24).to.equal(24*60*60*1000);
    });
  });

  describe('addDays', function() {
    it('should be a function', function() {
      assert.isFunction(dt.addDays);
    });

    it('should return a string', function() {
      var type = typeof dt.addDays(new Date(), 1);
      expect(type).to.equal('string');
    });

    it('should return a datestring that parses as MS_IN_24 from the date arg', function() {
      var d = new Date();
      var passed = new Date(dt.addDays(d, 1));
      expect(passed - d).to.equal(dt.MS_IN_24);
    });
  });

  describe('addDuration', function(){
    it('should add a duration', function(){
      expect(dt.addDuration('2014-01-01T01:00:00.003Z', 60 * 60 * 1000)).equals('2014-01-01T02:00:00.003Z');
    });
  });

  describe('adjustToInnerEndpoints', function() {
    var endLonger = ['2014-03-06T00:00:00.000Z', '2014-03-08T00:00:00.000Z'];
    var startEarlier = ['2014-03-05T00:00:00.000Z', '2014-03-07T00:00:00.000Z'];
    var wide = ['2014-01-01T00:00:00.000Z', '2014-06-01T00:00:00.000Z'];
    var endpoints = [new Date('2014-03-06T00:00:00.000Z').valueOf(), new Date('2014-03-07T00:00:00.000Z').valueOf()];

    it('should be a function', function() {
      assert.isFunction(dt.adjustToInnerEndpoints);
    });

    it('should return 2014-03-06T00:00:00.000Z to 2014-03-07T00:00:00.000Z given an earlier start point', function() {
      expect(dt.adjustToInnerEndpoints(startEarlier[0], startEarlier[1], endpoints)).to.eql(endpoints);
    });

    it('should return 2014-03-06T00:00:00.000Z to 2014-03-07T00:00:00.000Z given a later end point', function() {
      expect(dt.adjustToInnerEndpoints(endLonger[0], endLonger[1], endpoints)).to.eql(endpoints);
    });

    it('should return 2014-03-06T00:00:00.000Z to 2014-03-07T00:00:00.000Z when this date range is completely contained within endpoints', function() {
      expect(dt.adjustToInnerEndpoints(endpoints[0], endpoints[1], wide)).to.eql(endpoints);
    });
  });

  describe('checkIfDateInRange', function() {
    var s = '2014-03-06T00:00:00.005Z';
    var endpoints = ['2014-03-06T00:00:00.000Z', '2014-03-07T00:00:00.000Z'];

    it('should be a function', function() {
      assert.isFunction(dt.checkIfDateInRange);
    });

    it('should return false when passed a date less than the start point', function() {
      expect(dt.checkIfDateInRange('2014-03-05T00:00:00.000Z', endpoints)).to.be.false;
    });

    it('should return false when passed a date greater than the end point', function() {
      expect(dt.checkIfDateInRange('2014-03-08T00:00:00.000Z', endpoints)).to.be.false;
    });

    it('should return true when passed a date equal to the start point', function() {
      expect(dt.checkIfDateInRange('2014-03-06T00:00:00.000Z', endpoints)).to.be.true;
    });

    it('should return true when passed a date equal to the end point', function() {
      expect(dt.checkIfDateInRange('2014-03-07T00:00:00.000Z', endpoints)).to.be.true;
    });

    it('should return true when passed a date between the end points', function() {
      expect(dt.checkIfDateInRange(s, endpoints)).to.be.true;
    });

    it('should also perform on POSIX integer timestamps', function() {
      var inRange = dt.checkIfDateInRange(1394107200000, [1394064000000, 1394150400000]);
      var outOfRange = dt.checkIfDateInRange(1394020800000, [1394064000000, 1394150400000]);
      expect(inRange && !outOfRange).to.be.true;
    });
  });

  describe('checkIfUTCDate', function() {
    it('should be a function', function() {
      assert.isFunction(dt.checkIfUTCDate);
    });

    it('should return false when passed empty string instead of date', function() {
      expect(dt.checkIfUTCDate('')).to.be.false;
    });

    it('should false when passed invalid date string', function() {
      expect(dt.checkIfUTCDate('2014-03-06x12:00:00')).to.be.false;
    });

    it('should return false when passed timezone-naive date string', function() {
      expect(dt.checkIfUTCDate('2014-03-06T12:00:00')).to.be.false;
    });

    it('should return false when passed a POSIX integer timestamp earlier than 2008-01-01T00:00:00', function() {
      expect(dt.checkIfUTCDate(1199145599000)).to.be.false;
    });

    it('should return true when passed a POSIX integer timestamp 2008-01-01T00:00:00 or later', function() {
      expect(dt.checkIfUTCDate(1199145600000)).to.be.true;
    });

    it('should return true when passed an ISO-formatted UTC date string', function() {
      expect(dt.checkIfUTCDate('2014-03-06T12:00:00.000Z')).to.be.true;
    });
  });

  describe('composeMsAndDateString', function() {
    it('should be a function', function() {
      assert.isFunction(dt.composeMsAndDateString);
    });

    it('should return 2014-03-06T00:00:00.001Z when given 1ms and 2014-03-06T00:00:00.000Z', function() {
      expect(dt.composeMsAndDateString(1, '2014-03-06T00:00:00.000Z')).to.equal('2014-03-06T00:00:00.001Z');
    });
  });

  describe('difference', function() {
    it('should be a function', function() {
      assert.isFunction(dt.difference);
    });

    it('should return the difference (in milliseconds) between two timestamps', function() {
      expect(dt.difference('2014-03-06T00:00:00.001Z', '2014-03-06T00:00:00.000Z')).to.equal(1);
    });
  });

  describe('getDuration', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getDuration);
    });

    it('should return 0 when given the same timestamp for d1 and d2', function() {
      expect(dt.getDuration('2014-03-06T00:00:00.000Z', '2014-03-06T00:00:00.000Z')).to.equal(0);
    });

    it('should return 1 when given two timestamps a millisecond apart', function() {
      expect(dt.getDuration('2014-03-06T00:00:00.000Z', '2014-03-06T00:00:00.001Z')).to.equal(1);
    });

    it('should return 86400000 when given two timestamps a day apart', function() {
      expect(dt.getDuration('2014-03-06T00:00:00.012Z', '2014-03-07T00:00:00.012Z')).to.equal(86400000);
    });
  });

  describe('getNumDays', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getNumDays);
    });

    it('should return a number', function() {
      var type = typeof dt.getNumDays('','');
      expect(type === 'number').to.be.true;
    });

    it('should return 1 when passed two timestamps exactly 24 hours apart', function() {
      expect(dt.getNumDays('2014-03-06T00:00:00.000Z', '2014-03-07T00:00:00.000Z')).to.equal(1);
    });

    it('should return 2 when passed two timestamps minimally more than 24 hours apart', function() {
      expect(dt.getNumDays('2014-03-06T00:00:00.000Z', '2014-03-07T00:00:00.001Z')).to.equal(2);
    });

    it('should return 14 when passed two timestamps exactly 14 days apart', function() {
      expect(dt.getNumDays('2014-03-06T00:00:00.000Z', '2014-03-20T00:00:00.000Z')).to.equal(14);
    });
  });

  describe('getMidnight', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getMidnight);
    });

    it('should return 2014-03-06T00:00:00.000Z when given 2014-03-06T12:00:00.000Z', function() {
      expect(dt.getMidnight('2014-03-06T12:00:00.000Z')).to.equal('2014-03-06T00:00:00.000Z');
    });

    it('should return 2014-03-07T00:00:00.000Z when given 2014-03-06T12:00:00.000Z and `next` is true', function() {
      expect(dt.getMidnight('2014-03-06T12:00:00.000Z', true)).to.equal('2014-03-07T00:00:00.000Z');
    });
  });

  describe('getMsFromMidnight', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getMsFromMidnight);
    });

    it('should return 1 when passed a timestamp 1ms after midnight', function() {
      expect(dt.getMsFromMidnight('2014-03-06T00:00:00.001Z')).to.equal(1);
    });
  });

  describe('isLessThanTwentyFourHours', function() {
    it('should be a function', function() {
      assert.isFunction(dt.isLessThanTwentyFourHours);
    });

    it('should return true on two timestamps less than 24 hours apart', function() {
      expect(dt.isLessThanTwentyFourHours('2014-03-06T00:00:00.000Z', '2014-03-06T01:00:00.000Z')).to.be.true;
    });

    it('should return false on two timestamps greater than 24 hours apart', function() {
      expect(dt.isLessThanTwentyFourHours('2014-03-06T00:00:00.000Z', '2014-03-07T01:00:00.000Z')).to.be.false;
    });

    it('should return false on two timestamps exactly 24 hours apart', function() {
      expect(dt.isLessThanTwentyFourHours('2014-03-06T00:00:00.013Z', '2014-03-07T00:00:00.013Z')).to.be.false;
    });
  });

  describe('isNearRightEdge', function() {
    it('should be a function', function() {
      assert.isFunction(dt.isNearRightEdge);
    });

    it('should return true when t1 is less than six hours before t2', function() {
      var t1 = {'normalTime': '2014-01-01T21:00:01.000Z'};
      var t2 = new Date('2014-01-02T00:00:00.000Z');
      expect(dt.isNearRightEdge(t1, t2)).to.be.true;
    });

    it('should return false when t1 is greater than six hours before t2', function() {
      var t1 = {'normalTime': '2014-01-01T05:59:59.999Z'};
      var t2 = new Date('2014-01-02T00:00:00.000Z');
      expect(dt.isNearRightEdge(t1, t2)).to.be.false;
    });
  });

  describe('isSegmentAcrossMidnight', function() {
    it('should be a function', function() {
      assert.isFunction(dt.isSegmentAcrossMidnight);
    });

    it('should return false on a segment starting and ending on same day', function() {
      expect(dt.isSegmentAcrossMidnight('2014-01-02T00:00:00.000Z', '2014-01-02T01:00:00.000Z')).to.be.false;
    });

    it('should return false on a segment ending two days after start date', function() {
      expect(dt.isSegmentAcrossMidnight('2014-01-02T00:00:00.000Z', '2014-01-04T01:00:00.000Z')).to.be.false;
    });

    it('should return false on a segment ending the day after it starts, if end is midnight', function() {
      expect(dt.isSegmentAcrossMidnight('2014-01-02T21:00:00.000Z', '2014-01-03T00:00:00.000Z')).to.be.false;
    });

    it('should return true on a segment ending the day after it started', function() {
      expect(dt.isSegmentAcrossMidnight('2014-01-02T12:00:00.000Z', '2014-01-03T01:00:00.000Z')).to.be.true;
    });
  });

  describe('isTwentyFourHours', function() {
    it('should be a function', function() {
      assert.isFunction(dt.isTwentyFourHours);
    });

    it('should return false on two timestamps less than 24 hours apart', function() {
      expect(dt.isTwentyFourHours('2014-03-06T00:00:00.000Z', '2014-03-06T01:00:00.000Z')).to.be.false;
    });

    it('should return false on two timestamps greater than 24 hours apart', function() {
      expect(dt.isTwentyFourHours('2014-03-06T00:00:00.000Z', '2014-03-07T01:00:00.000Z')).to.be.false;
    });

    it('should return true on two timestamps exactly 24 hours apart', function() {
      expect(dt.isTwentyFourHours('2014-03-06T00:00:00.000Z', '2014-03-07T00:00:00.000Z')).to.be.true;
    });
  });

  describe('roundToNearestMinutes', function() {
    it('should be a function', function() {
      assert.isFunction(dt.roundToNearestMinutes);
    });

    it('should return 2014-03-06T00:00:00.000Z when given 2014-03-06T00:29:00.000Z, resolution of sixty minutes', function() {
      expect(dt.roundToNearestMinutes('2014-03-06T00:29:00.000Z', 60)).to.equal('2014-03-06T00:00:00.000Z');
    });

    it('should return 2014-03-06T00:30:00.000Z when given 2014-03-06T00:29:00.000Z, resolution of thirty minutes', function() {
      expect(dt.roundToNearestMinutes('2014-03-06T00:29:00.000Z', 30)).to.equal('2014-03-06T00:30:00.000Z');
    });

    it('should return 2014-03-06T00:30:00.000Z when given 2014-03-06T00:15:00.000Z, resolution of thirty minutes', function() {
      expect(dt.roundToNearestMinutes('2014-03-06T00:15:00.000Z', 30)).to.equal('2014-03-06T00:30:00.000Z');
    });

    it('should return 2014-03-06T00:00:00.000Z when given 2014-03-06T00:14:00.000Z, resolution of thirty minutes', function() {
      expect(dt.roundToNearestMinutes('2014-03-06T00:14:00.000Z', 30)).to.equal('2014-03-06T00:00:00.000Z');
    });

    it('should return 2014-03-06T01:00:00.000Z when given 2014-03-06T00:45:00.000Z, resolution of thirty minutes', function() {
      expect(dt.roundToNearestMinutes('2014-03-06T00:45:00.000Z', 30)).to.equal('2014-03-06T01:00:00.000Z');
    });
  });

  describe('verifyEndpoints', function() {
    it('should be a function', function() {
      assert.isFunction(dt.verifyEndpoints);
    });

    it('should return true on a set of endpoints', function() {
      var endpoints = ['2014-03-06T00:00:00.000Z', '2014-03-07T00:00:00.000Z'];
      expect(dt.verifyEndpoints(endpoints[0], endpoints[1], endpoints)).to.be.true;
    });
  });
});
