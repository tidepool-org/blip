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

var tideline = require('../js/index');
var dt = tideline.data.util.datetime;

describe('datetime utility', function() {
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
    var s = '2014-03-06T12:00:00.000Z';
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