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

/* global sinon */

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

  describe('findBasicsDays', function() {
    it('should be a function', function() {
      assert.isFunction(dt.findBasicsDays);
    });

    it('should always return at least 7 days, Monday thru Friday', function() {
      expect(_.map(dt.findBasicsDays([
        '2015-09-07T07:00:00.000Z',
        '2015-09-07T12:00:00.000Z'
      ], 'US/Pacific'), 'date')).to.deep.equal([
        '2015-09-07',
        '2015-09-08',
        '2015-09-09',
        '2015-09-10',
        '2015-09-11',
        '2015-09-12',
        '2015-09-13',
      ]);
    });

    it('should return a multiple of 7 days, Monday thru Friday', function() {
      expect(_.map(dt.findBasicsDays([
        '2015-09-07T05:00:00.000Z',
        '2015-09-24T12:00:00.000Z'
      ], 'US/Central'), 'date')).to.deep.equal([
        '2015-09-07',
        '2015-09-08',
        '2015-09-09',
        '2015-09-10',
        '2015-09-11',
        '2015-09-12',
        '2015-09-13',
        '2015-09-14',
        '2015-09-15',
        '2015-09-16',
        '2015-09-17',
        '2015-09-18',
        '2015-09-19',
        '2015-09-20',
        '2015-09-21',
        '2015-09-22',
        '2015-09-23',
        '2015-09-24',
        '2015-09-25',
        '2015-09-26',
        '2015-09-27',
      ]);
    });

    it('should use UTC for the timezone when none provided', function() {
      expect(_.map(dt.findBasicsDays([
        '2015-09-07T00:00:00.000Z',
        '2015-09-07T12:00:00.000Z'
      ]), 'date')).to.deep.equal([
        '2015-09-07',
        '2015-09-08',
        '2015-09-09',
        '2015-09-10',
        '2015-09-11',
        '2015-09-12',
        '2015-09-13',
      ]);
    });

    it('should categorize each date as past, mostRecent or future', function() {
      expect(dt.findBasicsDays([
        '2015-09-07T00:00:00.000Z',
        '2015-09-10T12:00:00.000Z'
      ], 'Pacific/Auckland')).to.deep.equal([
        {date: '2015-09-07', type: 'past'},
        {date: '2015-09-08', type: 'past'},
        {date: '2015-09-09', type: 'past'},
        {date: '2015-09-10', type: 'past'},
        {date: '2015-09-11', type: 'mostRecent'},
        {date: '2015-09-12', type: 'future'},
        {date: '2015-09-13', type: 'future'},
      ]);
    });
  });

  describe('findBasicsStart', function() {
    it('should be a function', function() {
      assert.isFunction(dt.findBasicsStart);
    });

    it('should find the timezone-local midnight of the Monday >= 14 days prior to provided datetime', function() {
      // exactly 28 days
      expect(dt.findBasicsStart('2015-09-07T05:00:00.000Z', 'US/Central'))
        .to.equal('2015-08-24T05:00:00.000Z');
      // almost but not quite 35 days
      expect(dt.findBasicsStart('2015-09-13T09:00:00.000Z', 'Pacific/Honolulu'))
        .to.equal('2015-08-24T10:00:00.000Z');
      // just over threshold into new local week
      expect(dt.findBasicsStart('2015-09-14T06:01:00.000Z', 'US/Mountain'))
        .to.equal('2015-08-31T06:00:00.000Z');
    });

    it('should find UTC midnight of the Monday >= 14 days prior to provided UTC datetime (when no timezone provided)', function() {
      // exactly 28 days
      expect(dt.findBasicsStart('2015-09-07T00:00:00.000Z'))
        .to.equal('2015-08-24T00:00:00.000Z');
      // almost but not quite 35 days
      expect(dt.findBasicsStart('2015-09-13T23:55:00.000Z'))
        .to.equal('2015-08-24T00:00:00.000Z');
      // just over threshold into new UTC week
      expect(dt.findBasicsStart('2015-09-14T00:01:00.000Z'))
        .to.equal('2015-08-31T00:00:00.000Z');
    });
  });

  describe('getBrowserTimezone', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getBrowserTimezone);
    });

    it('should return the browser timezone', function() {
      var DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
        resolvedOptions: function() {
          return { timeZone: 'browserTimezone' };
        },
      });
      expect(dt.getBrowserTimezone()).to.equal('browserTimezone');
      DateTimeFormatStub.restore();
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

  describe('getLocalDate', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getLocalDate);
    });

    it('should return `2015-01-01` for UTC midnight January 1st, 2015, no timezoneName', function() {
      expect(dt.getLocalDate('2015-01-01T00:00:00.000Z')).to.equal('2015-01-01');
    });

    it('should return `2014-12-31` for UTC midnight January 1st, 2015, Pacific/Honolulu', function() {
      expect(dt.getLocalDate('2015-01-01T00:00:00.000Z', 'Pacific/Honolulu')).to.equal('2014-12-31');
    });
  });

  describe('getLocalDayOfWeek', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getLocalDayOfWeek);
    });

    it('should return Thursday for UTC midnight January 1st, 2015, no timezoneName', function() {
      expect(dt.getLocalDayOfWeek('2015-01-01T00:00:00.000Z')).to.equal('thursday');
    });

    it('should return Wednesday for UTC midnight January 1st, 2015, Pacific/Honolulu', function() {
      expect(dt.getLocalDayOfWeek('2015-01-01T00:00:00.000Z', 'Pacific/Honolulu')).to.equal('wednesday');
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

  describe('getMsPer24', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getMsPer24);
    });

    it('should return 1 when passed a timestamp 1ms after midnight', function() {
      expect(dt.getMsPer24('2014-03-06T00:00:00.001Z')).to.equal(1);
    });

    it('should return 1 when passed a timestamp 1ms after midnight Pacific time', function() {
      expect(dt.getMsPer24('2014-03-06T08:00:00.001Z', 'US/Pacific')).to.equal(1);
    });

    it('should return a value less than 864e5 even when past 11 p.m. on switch to DST', function() {
      expect(dt.getMsPer24('2014-11-03T07:25:00.000Z', 'US/Pacific')).to.equal(84300000);
    });

    it('should return same value as above when past 11 p.m. on switch to non-DST', function() {
      expect(dt.getMsPer24('2014-03-10T06:25:00.000Z', 'US/Pacific')).to.equal(84300000);
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

  describe('getUTCOfLocalPriorMidnight', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getUTCOfLocalPriorMidnight);
    });

    it('should return the input if given a UTC midnight and no timezone', function() {
      var priorMidnight = new Date().toISOString().slice(0,10) + 'T00:00:00.000Z';
      expect(dt.getUTCOfLocalPriorMidnight(priorMidnight)).to.equal(priorMidnight);
    });

    it('should return the UTC equivalent of the prior local midnight given a timezone', function() {
      var datetime = '2015-03-06T14:00:00.000Z';
      // NB: Hawaii doesn't do DST so we can hardcode the +10 offset for this test
      var priorMidnight = '2015-03-06T10:00:00.000Z';
      expect(dt.getUTCOfLocalPriorMidnight(datetime, 'Pacific/Honolulu')).to.equal(priorMidnight);
    });
  });

  describe('getUTCOfLocalNextMidnight', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getUTCOfLocalNextMidnight);
    });

    it('should return the input if given a UTC midnight and no timezone', function() {
      var thisMidnight = new Date().toISOString().slice(0,10) + 'T00:00:00.000Z';
      var nextMidnight = new Date(thisMidnight);
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      expect(dt.getUTCOfLocalNextMidnight(thisMidnight)).to.equal(nextMidnight.toISOString());
    });

    it('should return the UTC equivalent of the prior local midnight given a timezone', function() {
      var datetime = '2015-03-06T14:00:00.000Z';
      // NB: Hawaii doesn't do DST so we can hardcode the +10 offset for this test
      var nextMidnight = '2015-03-07T10:00:00.000Z';
      expect(dt.getUTCOfLocalNextMidnight(datetime, 'Pacific/Honolulu')).to.equal(nextMidnight);
    });
  });

  describe('getOffset', function() {
    it('should be a function', function() {
      assert.isFunction(dt.getOffset);
    });

    it('should return 480 given a non-DST datetime in Pacific', function() {
      expect(dt.getOffset(new Date('2014-03-08T08:00:00.000Z'), 'US/Pacific')).to.equal(480);
    });

    it('should return 420 given a DST datetime in Pacific', function() {
      expect(dt.getOffset(new Date('2014-03-10T07:00:00.000Z'), 'US/Pacific')).to.equal(420);
    });
  });

  describe('isATimestamp', function() {
    it('should be a function', function() {
      assert.isFunction(dt.isATimestamp);
    });

    it('should return `false` when passed `Invalid date`', function() {
      expect(dt.isATimestamp('Invalid date')).to.be.false;
    });

    it('should return `true` when passed an ISO-formatted date string', function() {
      expect(dt.isATimestamp(new Date().toISOString())).to.be.true;
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

  describe('weekdayLookup', function() {
    it('should be a function', function() {
      assert.isFunction(dt.weekdayLookup);
    });

    it('should return null if given invalid int', function() {
      expect(dt.weekdayLookup(-1)).to.equal(null);
      expect(dt.weekdayLookup(7)).to.equal(null);
    });

    it('should return `monday` when given 1', function() {
      var d = new Date('2014-11-17T00:00:00.000Z');
      expect(dt.weekdayLookup(d.getUTCDay())).to.equal('monday');
      expect(dt.weekdayLookup(1)).to.equal('monday');
    });
  });
});
