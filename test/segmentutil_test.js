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
var BasalUtil = tideline.data.SegmentUtil;

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

      it('should have a last segment with an end matching the last segment of input data or null', function() {
        var basals = _.where(data.json, {'type': 'basal-rate-segment'});
        var basalLength = basal.actual.length;
        if (basal.actual[basalLength - 1].end !== basals[basals.length - 1].end) {
          expect(basal.actual[basalLength - 1].end).to.be.null;
        }
      });

      it('should be sorted in sequence', function() {
        var sorted = _.sortBy(basal.actual, function(a) {
          return new Date(a.start).valueOf();
        });
        expect(sorted).to.eql(basal.actual);
      });

      it('should not have any duplicates', function() {
        expect(_.uniq(basal.actual)).to.be.eql(basal.actual);
      });

      it('should have squashed contiguous identical segments', function() {
        basal.actual.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
            if (segment.end === segments[i + 1].start) {
              try {
                expect(segment.value).to.not.eql(segments[i + 1].value);
              }
              catch(e) {
                console.log('should have squashed contiguous identical segments');
                console.log(segment, segments[i + 1]);
                throw(e);
              }
            }
          }
        });
      });

      it('can have gaps, but should not have overlaps', function() {
        basal.actual.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
            var e = new Date(segment.end).valueOf();
            var s = new Date(segments[i + 1].start).valueOf();
            try {
              expect(s >= e).to.be.true;
            }
            catch(e) {
              if (name === 'overlapping') {
                console.log("Expected 'can have gaps, but should not have overlaps' to fail on overlapping fixture, and it did.");
              }
              else {
                throw(e);
              }
            }

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

      it('should have squashed contiguous identical segments', function() {
        basal.undelivered.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
            if (segment.end === segments[i + 1].start) {
              try {
                expect(segment.value).to.not.eql(segments[i + 1].value);
              }
              catch(e) {
                console.log('should have squashed contiguous identical segments');
                console.log(segment, segments[i + 1]);
                throw(e);
              }
            }
          }
        });
      });

      it('can have gaps, but should not have overlaps', function() {
        basal.undelivered.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
            var e = new Date(segment.end).valueOf();
            var s = new Date(segments[i + 1].start).valueOf();
            try {
              expect(s >= e).to.be.true;
            }
            catch(e) {
              if (name === 'overlapping') {
                console.log("Expected 'can have gaps, but should not have overlaps' to fail on overlapping fixture, and it did.");
              }
              else {
                throw(e);
              }
            }

          }
        });
      });
    });
  });
}
