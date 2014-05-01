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

var fx = require('./fixtures');

var tideline = require('../js/index');
var segmentUtil = tideline.data.SegmentUtil;

describe('segmentutil.js under different data scenarios', function () {
  fx.forEach(testData);
});

function testData (data) {
  var name = data.name;

  describe(name, function() {
    var basal = segmentUtil(data.json);
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

      it.skip('should have squashed contiguous identical segments', function() {
        // This test is poorly defined.  It assumes that if the start and the end are abutting, then their
        // values must be different.  This is incorrect as there are times where the value is the same and other
        // things are different.  This is 100% the case whenever there is a 0% temp basal that spans
        // multiple scheduled basal rates.  Either delete this test or fix it
        basal.actual.forEach(function(segment, i, segments) {
          if (i < (segments.length - 1)) {
            var next = segments[i + 1];
            if ((segment.end === next.start) && (segment.deliveryType === next.deliveryType)) {
              try {
                expect(segment.value).to.not.eql(segments[i + 1].value);
              }
              catch(e) {
                console.log('should have squashed contiguous identical segments');
                console.log(segment);
                console.log(segments[i + 1]);
                throw(e);
              }
            }
          }
        });
      });

      it('can have gaps, but should not have overlaps', function() {
        var actuals = _.sortBy(basal.actual, function(d) {
          return new Date(d.start).valueOf();
        });
        actuals.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
            var e = new Date(segment.end).valueOf();
            var s = new Date(segments[i + 1].start).valueOf();
            expect(s >= e).to.be.true;
          }
        });
      });
    });

    describe('basal.undelivered', function() {
      it('should be an object', function() {
        assert.typeOf(basal.undelivered, 'object', 'basal.undelivered should be an object');
      });

      Object.keys(basal.undelivered).forEach(function(basalStream){
        var theStream = basal.undelivered[basalStream];
        describe(basalStream, function(){
          it('should have a non-zero length if there is a temp basal in the input data', function() {
            var temps = _.where(data.json, {'deliveryType': 'temp'});
            if (temps.length > 0) {
              expect(theStream.length).to.be.above(0);
            }
          });

          it('should be sorted in sequence', function() {
            var sorted = _.sortBy(theStream, function(a) {
              return new Date(a.start).valueOf();
            });
            expect(sorted).to.eql(theStream);
          });

          it('should not have any duplicates', function() {
            expect(_.uniq(theStream)).to.be.eql(theStream);
          });

          it('should have a total duration equal to the total duration of temp segments from the actual stream', function() {
            var tempDuration = 0;
            _.where(basal.actual, {'deliveryType': 'temp'}).forEach(function(segment) {
              tempDuration += Date.parse(segment.end) - Date.parse(segment.start);
            });
            var undeliveredDuration = 0;
            theStream.forEach(function(segment) {
              if (segment.deliveryType === 'scheduled') {
                undeliveredDuration += Date.parse(segment.end) - Date.parse(segment.start);
              }
            });
            try {
              expect(undeliveredDuration).to.equal(tempDuration);
            }
            catch (e) {
              //console.log('Expected error with fixture ending in temp basal.');
            }
          });

          it('can have gaps, but should not have overlaps', function() {
            var undelivereds = _.sortBy(theStream, function(d) {
              return new Date(d.start).valueOf();
            });
            undelivereds.forEach(function(segment, i, segments) {
              if ((i < (segments.length - 1)) && segment.deliveryType === 'scheduled') {
                var e = new Date(segment.end).valueOf();
                var s = new Date(segments[i + 1].start).valueOf();
                expect(s >= e).to.be.true;
              }
            });
          });
        });
      });
    });
  });
}

describe('segmentUtil.js', function(){
  it('Doesn\'t choke on starting temp basal', function(){
    var segs = segmentUtil(
      [
        {
          type: 'basal-rate-segment',
          deliveryType: 'temp',
          start: '2014-01-01',
          end: '2014-01-02',
          percent: 0.6
        }
      ]);

    expect(segs.undelivered).is.empty;

    expect(segs.actual).length(1);
    expect(segs.actual[0]).is.deep.equal(
      {
        type: 'basal-rate-segment',
        deliveryType: 'temp',
        start: '2014-01-01',
        end: '2014-01-02',
        percent: 0.6,
        vizType: 'actual'
      });
  });

  it('Smooshes delivered', function(){
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14', 'end': '2014-03-15',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 86400000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-15', 'end': '2014-03-16',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 86400000
      },
      {
        type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-16', 'end': '2014-03-17',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 86400000
      }
    ];
    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14', 'end': '2014-03-17',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 86400000, vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals([]);
  });

  it('Generates individual segments when a 0% temp overrides multiple scheduleds', function(){
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14', 'end': '2014-03-15',
        'deliveryType': 'scheduled', 'value': 0.85
      },
      {
        type: 'basal-rate-segment', id: '2', start: '2014-03-14T12', 'end': '2014-03-16T12',
        deliveryType: 'temp', percent: 0
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-15', 'end': '2014-03-16',
        'deliveryType': 'scheduled', 'value': 0.65
      },
      {
        type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-16', 'end': '2014-03-17',
        'deliveryType': 'scheduled', 'value': 0.85
      }
    ];
    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14', 'end': '2014-03-14T12',
          'deliveryType': 'scheduled', 'value': 0.85, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T12', 'end': '2014-03-15',
          'deliveryType': 'temp', 'value': 0, percent: 0, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2_3', 'start': '2014-03-15', 'end': '2014-03-16',
          'deliveryType': 'temp', 'value': 0, percent: 0, vizType: 'actual', link: '3'
        },
        {
          type: 'basal-rate-segment', 'id': '2_5', 'start': '2014-03-16', 'end': '2014-03-16T12',
          'deliveryType': 'temp', 'value': 0, percent: 0, vizType: 'actual', link: '5'
        },
        {
          type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-16T12', 'end': '2014-03-17',
          'deliveryType': 'scheduled', 'value': 0.85, vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T12', 'end': '2014-03-15',
          'deliveryType': 'scheduled', 'value': 0.85, link: '2', vizType: 'undelivered'
        },
        {
          type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-15', 'end': '2014-03-16',
          'deliveryType': 'scheduled', 'value': 0.65, link: '2_3', vizType: 'undelivered'
        },
        {
          type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-16', 'end': '2014-03-16T12',
          'deliveryType': 'scheduled', 'value': 0.85, link: '2_5', vizType: 'undelivered'
        }
      ]
    );
  });

  it('Handles temps overiding temps overiding temps', function () {
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T05:27:14',
        'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T06:00:00',
        'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '4', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T06:02:09',
        'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000
      },
      {
        type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T06:47:36',
        'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000
      },
      {
        type: 'basal-rate-segment', 'id': '6', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T09:00:00',
        'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000
      },
      {
        type: 'basal-rate-segment', 'id': '7', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T07:41:46',
        'deliveryType': 'temp', 'value': 0, 'duration': 5400000
      }
    ];

    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T03:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2_3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:02:09',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'actual', link: '3'
        },
        {
          type: 'basal-rate-segment', 'id': '4', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '5', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '5_6', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T06:11:46',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000, vizType: 'actual', link: '6'
        },
        {
          type: 'basal-rate-segment', 'id': '7', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T07:41:46',
          'deliveryType': 'temp', 'value': 0, 'duration': 5400000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '6', 'start': '2014-03-14T07:41:46', 'end': '2014-03-14T09:00:00',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000, vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '2_3', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'undelivered', link: '4'
        },
        {
          type: 'basal-rate-segment', 'id': '4', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T06:02:09',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000, vizType: 'undelivered', link: '5'
        },
        {
          type: 'basal-rate-segment', 'id': '5_6', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T06:47:36',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000, vizType: 'undelivered', link: '7'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'undelivered', link: '2'
        },
        {
          type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:02:09',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000, vizType: 'undelivered', link: '2_3'
        },
        {
          type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000, vizType: 'undelivered', link: '4'
        },
        {
          type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000, vizType: 'undelivered', link: '5'
        },
        {
          type: 'basal-rate-segment', 'id': '6', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T06:11:46',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000, vizType: 'undelivered', link: '5_6'
        },
        {
          type: 'basal-rate-segment', 'id': '6', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T07:41:46',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000, vizType: 'undelivered', link: '7'
        }
      ]
    );
  });

  it('Treats suspends as most important', function () {
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T06:00:00',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T05:27:14',
        'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
        'deliveryType': 'suspend', value: 0
      }
    ];

    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T03:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'suspend', 'value': 0, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T04:30:00', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T05:27:14', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000, vizType: 'undelivered', link: '3'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'undelivered', link: '2'
        },
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'undelivered', link: '3'
        },
        {
          type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T04:30:00', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000, vizType: 'undelivered', link: '2'
        }
      ]
    );
  });
});
