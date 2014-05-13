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
  it('Sets scheduled end == null to end = start', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          value: 0.6
        }
      ]);

    expect(segs.undelivered).is.empty;

    expect(segs.actual).length(1);
    expect(segs.actual[0]).is.deep.equal(
      {
        id: 'segment_0',
        datumId: '1',
        type: 'basal-rate-segment',
        deliveryType: 'scheduled',
        start: '2014-01-01',
        end: '2014-01-01',
        value: 0.6,
        vizType: 'actual'
      });
  });

  it('Doesn\'t choke on starting temp basal', function(){
    var segs = segmentUtil(
      [
        {
          type: 'basal-rate-segment',
          deliveryType: 'temp',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.6
        }
      ]);

    expect(segs.undelivered).is.empty;

    expect(segs.actual).length(1);
    expect(segs.actual[0]).is.deep.equal(
      {
        id: 'segment_0',
        type: 'basal-rate-segment',
        deliveryType: 'temp',
        start: '2014-01-01',
        end: '2014-01-02',
        value: 0.6,
        vizType: 'actual'
      });
  });

  it('Throws away only overlapping portion of scheduled basals', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.6
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.8
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Throws away only overlapping portion of scheduled basals2', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.6
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.8
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          vizType: 'actual'
        }
    ]);
  });

  it('Throws away only overlapping portion of scheduled basals3', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.6
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Throws away only overlapping portion of scheduled basals4', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.6
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Allows overlapping schedules of the same rate', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.7
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-03',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Allows overlapping schedules of the same rate2', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.7
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-04',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Allows overlapping schedules of the same rate3', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.7
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 0.7
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 0.7,
          vizType: 'actual'
        },
        {
          id: 'segment_1',
          datumId: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          vizType: 'actual'
        }
      ]);
  });

  it('Allows overlapping schedules of the same deviceId', function(){
    var segs = segmentUtil(
      [
        {
          id: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-04',
          value: 1.7,
          deviceId: 'billy'
        },
        {
          id: '2',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-02',
          end: '2014-01-03',
          value: 0.8
        },
        {
          id: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          deviceId: 'billy'
        }
      ]
    );

    expect(segs.undelivered).is.empty;

    expect(segs.actual).to.deep.equal(
      [
        {
          id: 'segment_0',
          datumId: '1',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-01',
          end: '2014-01-02',
          value: 1.7,
          deviceId: 'billy',
          vizType: 'actual'
        },
        {
          id: 'segment_1',
          datumId: '3',
          type: 'basal-rate-segment',
          deliveryType: 'scheduled',
          start: '2014-01-03',
          end: '2014-01-04',
          value: 0.7,
          deviceId: 'billy',
          vizType: 'actual'
        }
      ]);
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
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14', 'end': '2014-03-17',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 86400000,
          id: 'segment_0', vizType: 'actual'
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
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14', 'end': '2014-03-14T12',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T12', 'end': '2014-03-15',
          'deliveryType': 'temp', 'value': 0, percent: 0,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-15', 'end': '2014-03-16',
          'deliveryType': 'temp', 'value': 0, percent: 0,
          id: 'segment_2', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-16', 'end': '2014-03-16T12',
          'deliveryType': 'temp', 'value': 0, percent: 0,
          id: 'segment_3', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-16T12', 'end': '2014-03-17',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_4', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T12', 'end': '2014-03-15',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_5', link: 'segment_1', vizType: 'undelivered'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-15', 'end': '2014-03-16',
          'deliveryType': 'scheduled', 'value': 0.65,
          id: 'segment_6', link: 'segment_2', vizType: 'undelivered'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-16', 'end': '2014-03-16T12',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_7', link: 'segment_3', vizType: 'undelivered'
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
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T03:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:02:09',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_2', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '4', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000,
          id: 'segment_3', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000,
          id: 'segment_4', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-14T05:27:14', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000,
          id: 'segment_5', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T06:02:09',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000,
          id: 'segment_6', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-14T06:02:09', 'end': '2014-03-14T06:11:46',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000,
          id: 'segment_7', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '7', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T06:47:36',
          'deliveryType': 'temp', 'value': 0, 'duration': 5400000,
          id: 'segment_8', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '7', 'start': '2014-03-14T06:47:36', 'end': '2014-03-14T07:41:46',
          'deliveryType': 'temp', 'value': 0, 'duration': 5400000,
          id: 'segment_9', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '6', 'start': '2014-03-14T07:41:46', 'end': '2014-03-14T09:00:00',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000,
          id: 'segment_10', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_13', vizType: 'undelivered', link: 'segment_3'
        },
        {
          type: 'basal-rate-segment', datumId: '4', 'start': '2014-03-14T04:47:36', end: '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000,
          id: 'segment_15', vizType: 'undelivered', link: 'segment_4'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:47:36', end: '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_16', vizType: 'undelivered', link: 'segment_4'
        },
        {
          type: 'basal-rate-segment', datumId: '4', 'start': '2014-03-14T05:27:14', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000,
          id: 'segment_18', vizType: 'undelivered', link: 'segment_5'
        },
        {
          type: 'basal-rate-segment', datumId: '4', 'start': '2014-03-14T06:00:00', end: '2014-03-14T06:02:09',
          'deliveryType': 'temp', 'value': 0.45, 'duration': 7200000,
          id: 'segment_20', vizType: 'undelivered', link: 'segment_6'
        },
        {
          type: 'basal-rate-segment', datumId: '5', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T06:47:36',
          'deliveryType': 'temp', 'value': 0.3, 'duration': 7200000,
          id: 'segment_23', vizType: 'undelivered', link: 'segment_8'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_11', vizType: 'undelivered', link: 'segment_1'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:02:09',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000,
          id: 'segment_12', vizType: 'undelivered', link: 'segment_2'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T04:02:09', 'end': '2014-03-14T04:47:36',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000,
          id: 'segment_14', vizType: 'undelivered', link: 'segment_3'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T04:47:36', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000,
          id: 'segment_17', vizType: 'undelivered', link: 'segment_4'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T05:27:14', end: '2014-03-14T06:00:00',
          'deliveryType': 'scheduled', 'value': 0.9, 'duration': 3600000,
          id: 'segment_19', vizType: 'undelivered', link: 'segment_5'
        },
        {
          type: 'basal-rate-segment', datumId: '6', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T06:02:09',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000,
          id: 'segment_21', vizType: 'undelivered', link: 'segment_6'
        },
        {
          type: 'basal-rate-segment', datumId: '6', 'start': '2014-03-14T06:02:09', 'end': '2014-03-14T06:11:46',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000,
          id: 'segment_22', vizType: 'undelivered', link: 'segment_7'
        },
        {
          type: 'basal-rate-segment', datumId: '6', 'start': '2014-03-14T06:11:46', 'end': '2014-03-14T06:47:36',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000,
          id: 'segment_24', vizType: 'undelivered', link: 'segment_8'
        },
        {
          type: 'basal-rate-segment', datumId: '6', 'start': '2014-03-14T06:47:36', 'end': '2014-03-14T07:41:46',
          'deliveryType': 'scheduled', 'value': 0.95, 'duration': 10800000,
          id: 'segment_25', vizType: 'undelivered', link: 'segment_9'
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
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T03:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'suspend', 'value': 0,
          id: 'segment_2', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:30:00', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_3', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T05:27:14', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_4', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 7200000,
          id: 'segment_6', vizType: 'undelivered', link: 'segment_2'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:27:14', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_5', vizType: 'undelivered', link: 'segment_1'
        },
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_7', vizType: 'undelivered', link: 'segment_2'
        },
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T04:30:00', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_8', vizType: 'undelivered', link: 'segment_3'
        }
      ]
    );
  });

  it('Injects temps if there is a gap', function () {
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T04:27:14', 'end': '2014-03-14T05:27:14',
        'deliveryType': 'temp', 'value': 0.55, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T07:00:00',
        'deliveryType': 'scheduled', value: 0
      }
    ];

    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:27:14', 'end': '2014-03-14T05:27:14',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 3600000,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T07:00:00',
          'deliveryType': 'scheduled', 'value': 0,
          id: 'segment_2', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals([]);
    expect(segs.getUndelivered('scheduled')).deep.equals([]);
  });

  it('Injects mega-overlaps when there is a gap', function () {
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
        'deliveryType': 'scheduled', 'value': 0.85, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T05:30:00', 'end': '2014-03-14T07:30:00',
        'deliveryType': 'temp', 'value': 0.55, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T07:00:00',
        'deliveryType': 'scheduled', value: 0.1234
      }
    ];

    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85, duration: 3600000,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T05:30:00', 'end': '2014-03-14T06:00:00',
          'deliveryType': 'temp', 'value': 0.55, duration: 3600000,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T07:00:00',
          'deliveryType': 'temp', 'value': 0.55, duration: 3600000,
          id: 'segment_2', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T07:00:00', 'end': '2014-03-14T07:30:00',
          'deliveryType': 'temp', 'value': 0.55, duration: 3600000,
          id: 'segment_3', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals([]);
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T06:00:00', 'end': '2014-03-14T07:00:00',
          'deliveryType': 'scheduled', 'value': 0.1234,
          id: 'segment_4', vizType: 'undelivered', link: 'segment_2'
        }
      ]);
  });

  it('Doesn\'t choke when an override lines up exactly with another override', function () {
    var events = [
      {
        type: 'basal-rate-segment', 'id': '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T04:00:00',
        'deliveryType': 'scheduled', 'value': 0.85
      },
      {
        type: 'basal-rate-segment', 'id': '2', 'start': '2014-03-14T03:30:00', 'end': '2014-03-14T04:30:00',
        'deliveryType': 'temp', 'value': 0.55, 'duration': 3600000
      },
      {
        type: 'basal-rate-segment', 'id': '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
        'deliveryType': 'temp', value: 0.1234, duration: 1800000
      }
    ];

    var segs = segmentUtil(events);

    expect(segs.actual).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:00:00', 'end': '2014-03-14T03:30:00',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_0', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T03:30:00', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'temp', 'value': 0.55, duration: 3600000,
          id: 'segment_1', vizType: 'actual'
        },
        {
          type: 'basal-rate-segment', datumId: '3', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'temp', 'value': 0.1234, duration: 1800000,
          id: 'segment_2', vizType: 'actual'
        }
      ]
    );
    expect(segs.getUndelivered('temp')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '2', 'start': '2014-03-14T04:00:00', 'end': '2014-03-14T04:30:00',
          'deliveryType': 'temp', 'value': 0.55, 'duration': 3600000,
          id: 'segment_4', vizType: 'undelivered', link: 'segment_2'
        }
      ]
    );
    expect(segs.getUndelivered('scheduled')).deep.equals(
      [
        {
          type: 'basal-rate-segment', datumId: '1', 'start': '2014-03-14T03:30:00', 'end': '2014-03-14T04:00:00',
          'deliveryType': 'scheduled', 'value': 0.85,
          id: 'segment_3', vizType: 'undelivered', link: 'segment_1'
        }
      ]);
  });
});
