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

var watson = require('../plugins/data/watson');

describe('watson', function() {
  var APPEND = '.000Z';

  describe('APPEND', function() {
    it('should be a string', function() {
      expect(typeof watson.APPEND).to.equal('string');
    });

    it('should be .000Z', function() {
      expect(watson.APPEND).to.equal(APPEND);
    });
  });

  describe('normalize', function() {
    var d = '2014-03-06T06:32:45';
    var e = '2014-03-06T08:34:12';

    var now = new Date();
    var offset = now.getTimezoneOffset();
    var local = new Date(now);
    local.setUTCMinutes(now.getUTCMinutes() - offset);
    var nowUTC = now.toISOString().slice(0,19) + 'Z';
    var localStr = local.toISOString().slice(0,19);

    var segment = {
      'type': 'basal-rate-segment',
      'start': d,
      'end': e
    };

    it('should be a function', function() {
      assert.isFunction(watson.normalize);
    });

    it('should add a normalTime, where normalTime = deviceTime + APPEND', function() {
      expect(watson.normalize({'deviceTime': d}).normalTime).to.equal(d + APPEND);
    });

    it('should add a normalTime, where normalTime = utcTime + tzOffset + APPEND', function() {
      expect(watson.normalize({'utcTime': nowUTC}).normalTime).to.equal(localStr + APPEND);
    });

    it('should add a normalTime + APPEND when type is basal-rate-segment', function() {
      expect(watson.normalize(segment).normalTime).to.equal(segment.start + APPEND);
    });

    it('should add a normalEnd + APPEND when type is basal-rate-segment', function() {
      expect(watson.normalize(segment).normalEnd).to.equal(segment.end + APPEND);
    });

    it('should throw an exception if argument is undefined', function() {
      var fn = function() { watson.normalize(undefined); };
      expect(fn).to.throw('Watson choked on an undefined.');
    });
  });

  describe('normalizeAll', function() {
    var data = require('../example/data/device-data.json');

    it('should be a function', function() {
      assert.isFunction(watson.normalizeAll);
    });

    it('should return an array', function() {
      expect(watson.normalizeAll([])).to.be.instanceof(Array);
    });

    it('should return an array of length data.length', function() {
      expect(watson.normalizeAll(data).length).to.equal(data.length);
    });
  });
});
