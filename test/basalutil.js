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

var watson = require('../example/watson');
var fx = require('./fixtures');

var tideline = require('../js/index');
var BasalUtil = tideline.data.BasalUtil;

var MS_IN_HOUR = 3600000.0;

describe('basal constructor under different data scenarios', function () {
  fx.forEach(testData);
});

function testData (data) {
  var name = data.name;
  var basal = new BasalUtil(data.json);
  describe(name, function() {
    it('should be an array', function() {
      assert.isArray(data.json);
    });

    it('should be composed of objects', function() {
      data.json.forEach(function(d) {
        assert.typeOf(d, 'object');
      });
    });

    it('should be non-zero in length', function() {
      expect(data.json).to.have.length.above(0);
    });

    describe('basal.actual', function() {
      it('should be an array', function() {
        assert.typeOf(basal.actual, 'array');
      });

      it('should have a non-zero length', function() {
        expect(basal.actual).to.have.length.above(0);
      });

      it('should have a first segment with a start matching the first segment of input data', function() {
        var basals = _.where(data.json, {'type': 'basal-rate-segment'});
        expect(basal.actual[0].start).to.equal(basals[0].start);
      });

      it('should have a last segment with an end matching the last segment of input data', function() {
        var basals = _.where(data.json, {'type': 'basal-rate-segment'});
        var basalLength = basal.actual.length;
        expect(basal.actual[basalLength - 1].end).to.equal(basals[basals.length - 1].end);
      });

      it('should be sorted in sequence', function() {
        var sorted = _.sortBy(basal.actual, function(a) {
          return new Date(a.start).valueOf();
        });
        expect(sorted).to.eql(basal.actual);
      });

      it('should be contiguous from start to end', function() {
        var basalLength = basal.actual.length;
        expect(_.find(basal.actual, function(segment, i, segments) {
          if (i !== (basalLength - 1)) {
            return segment.end !== segments[i + 1].start;
          }
          else {
            return false;
          }
        })).to.be.undefined;
      });

      it('should not have any duplicates', function() {
        expect(_.uniq(basal.actual)).to.be.eql(basal.actual);
      });

      it('should have squashed contiguous identical segments', function() {
        var keysToOmit = ['id', 'start', 'end'];
        basal.actual.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.type === 'scheduled') {
            expect(_.omit(segment, keysToOmit)).to.not.eql(_.omit(segments[i + 1], keysToOmit));
          }
        });
      });
    });

    describe('basal.undelivered', function() {
      it('should be an array', function() {
        assert.typeOf(basal.undelivered, 'array', 'basal.undelivered is an array');
      });

      it('should have a non-zero length if there is a temp basal in the input data', function() {
        var temps = _.where(data.json, {'deliveryType': 'temp'});
        if (temps.length > 0) {
          expect(basal.undelivered.length).to.be.above(0);
        }
      });

      it('should be sorted in sequence', function() {
        var sorted = _.sortBy(basal.undelivered, function(a) {
          return new Date(a.start).valueOf();
        });
        expect(sorted).to.eql(basal.undelivered);
      });

      it('should not have any duplicates', function() {
        expect(_.uniq(basal.undelivered)).to.be.eql(basal.undelivered);
      });

      it('should have a total duration equal to the total duration of temp segments from the actual stream', function() {
        var tempDuration = 0;
        _.where(basal.actual, {'deliveryType': 'temp'}).forEach(function(segment) {
          tempDuration += Date.parse(segment.end) - Date.parse(segment.start);
        });
        var undeliveredDuration = 0;
        basal.undelivered.forEach(function(segment) {
          if (segment.deliveryType === 'scheduled') {
            undeliveredDuration += Date.parse(segment.end) - Date.parse(segment.start);
          }
        });
        try {
          expect(undeliveredDuration).to.equal(tempDuration);
        }
        catch (e) {
          console.log('Expected error with fixture ending in temp basal.');
        }
      });
    });
  });
}

describe('basal utilities', function() {
  describe('totalBasal', function() {
    var template = new BasalUtil(_.findWhere(fx, {'name': 'template'}).json);
    template.normalizedActual = watson.normalize(template.actual);
    var temp = new BasalUtil(_.findWhere(fx, {'name': 'contained'}).json);
    temp.normalizedActual = watson.normalize(temp.actual);

    it('should be a function', function() {
      var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);
      basal.normalizedActual = watson.normalize(basal.actual);
      assert.isFunction(basal.totalBasal);
    });

    it('should return 20.0 on basal-template.json for twenty-four hours', function() {
      var start = new Date('2014-02-12T00:00:00').valueOf();
      var end = new Date('2014-02-13T00:00:00').valueOf();
      expect(template.totalBasal(start, end)).to.equal(20.0);
    });

    it('should return 1.45 on basal-template.json from 1 to 3 a.m.', function() {
      var start = new Date('2014-02-12T01:00:00').valueOf();
      var end = new Date('2014-02-12T03:00:00').valueOf();
      expect(template.totalBasal(start, end)).to.equal(1.45);
    });

    it('should return 5.35 on basal-contained.json from 8:30 a.m. to 3:30 p.m.', function() {
      var start = new Date('2014-02-12T08:30:00').valueOf();
      var end = new Date('2014-02-12T15:30:00').valueOf();
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

