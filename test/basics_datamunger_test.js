/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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
var d3 = require('d3');

var bgClasses = {
  'very-low': {boundary: 10},
  low: {boundary: 20},
  target: {boundary: 30},
  high: {boundary: 40},
  'very-high': {boundary: 50}
};
var dm = require('../plugins/blip/basics/logic/datamunger')(bgClasses);

var types = require('../dev/testpage/types');

describe('basics datamunger', function() {
  it('should return an object', function() {
    assert.isObject(dm);
  });

  describe('bgDistribution', function() {
    var zeroes = {
      veryhigh: 0,
      high: 0,
      target: 0,
      low: 0,
      verylow: 0
    };
    it('should be a function', function() {
      assert.isFunction(dm.bgDistribution);
    });

    it('should always calculate a BG distribution for smbg data, should calculate a BG distribution for cbg data if averages >= 144 readings per day, and should yield cgmStatus `calculatedCGM` when have calculated a BG distribution for cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 25})
      ];
      var cbg = [];
      for (var i = 0; i < 144; ++i) {
        cbg.push(new types.CBG({
          deviceTime: new Date(now.valueOf() + i*2000).toISOString().slice(0,-5),
          value: 50
        }));
      }
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}, cbg: {data: cbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      })).to.deep.equal({
        cbg: _.defaults({veryhigh: 1}, zeroes),
        cgmStatus: 'calculatedCGM',
        smbg: _.defaults({target: 1}, zeroes)
      });
    });

    it('should yield cgmStatus `noCGM` if no cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 1}),
        new types.SMBG({value: 25})
      ];
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      })).to.deep.equal({
        cgmStatus: 'noCGM',
        smbg: _.defaults({target: 0.5, verylow: 0.5}, zeroes)
      });
    });

    it('should yield cgmStatus `notEnoughCGM` if not enough cbg data', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: 1}),
        new types.SMBG({value: 25})
      ];
      var cbg = [
        new types.CBG({value: 50})
      ];
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}, cbg: {data: cbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      })).to.deep.equal({
        cgmStatus: 'notEnoughCGM',
        smbg: _.defaults({target: 0.5, verylow: 0.5}, zeroes)
      });
    });

    it('should categorize all BG values correctly!', function() {
      var now = new Date();
      var smbg = [
        new types.SMBG({value: bgClasses['very-low'].boundary - 1}),
        new types.SMBG({value: bgClasses.low.boundary - 1}),
        new types.SMBG({value: bgClasses.target.boundary - 1}),
        new types.SMBG({value: bgClasses.high.boundary - 1}),
        new types.SMBG({value: bgClasses['very-high'].boundary - 1})
      ];
      expect(dm.bgDistribution({
        data: {smbg: {data: smbg}},
        dateRange: [d3.time.day.utc.floor(now), d3.time.day.utc.ceil(now)]
      }).smbg).to.deep.equal({
          verylow: 0.2,
          low: 0.2,
          target: 0.2,
          high: 0.2,
          veryhigh: 0.2
      });
    });
  });

  describe('calculateBasalBolusStats', function() {
    var basal = [new types.Basal({
      duration: 864e5,
      deviceTime: '2015-09-01T00:00:00'
    }), new types.Basal({
      duration: 864e5,
      deviceTime: '2015-09-02T00:00:00'
    })];
    var bolus = [new types.Bolus({
      value: 4.0,
      deviceTime: '2015-09-01T12:00:00'
    })];
    var anotherBolus = new types.Bolus({
      value: 2.0,
      deviceTime: '2015-09-02T12:00:00'
    });
    var bd = {
      data: {
        basal: {data: basal},
        bolus: {data: bolus}
      },
      dateRange: [
        '2015-09-01T00:00:00.000Z',
        '2015-09-02T00:00:00.000Z'
      ]
    };

    it('should be a function', function() {
      assert.isFunction(dm.calculateBasalBolusStats);
    });

    describe('basalBolusRatio', function() {
      it('should calculate percentage of basal insulin', function() {
        expect(dm.calculateBasalBolusStats(bd).basalBolusRatio.basal).to.equal(0.75);
      });

      it('should calculate percentage of bolus insulin', function() {
        expect(dm.calculateBasalBolusStats(bd).basalBolusRatio.bolus).to.equal(0.25);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', function() {
        var bd2 = {
          data: {
            basal: {data: basal},
            bolus: {data: bolus}
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z'
          ]
        };
        expect(dm.calculateBasalBolusStats(bd2).basalBolusRatio.basal).to.equal(0.5);
        expect(dm.calculateBasalBolusStats(bd2).basalBolusRatio.bolus).to.equal(0.5);
      });

      it('should exclude any boluses falling outside basal date range', function() {
        var twoBoluses = [bolus[0], anotherBolus];
        var bd3 = {
          data: {
            basal: {data: basal},
            bolus: {data: twoBoluses}
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z'
          ]
        };
        expect(dm.calculateBasalBolusStats(bd3).basalBolusRatio.basal).to.equal(0.6);
        expect(dm.calculateBasalBolusStats(bd3).basalBolusRatio.bolus).to.equal(0.4);
      });
    });

    describe('totalDailyDose', function() {
      it('should calculate average total daily dose', function() {
        expect(dm.calculateBasalBolusStats(bd).totalDailyDose).to.equal(16.0);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', function() {
        var bd2 = {
          data: {
            basal: {data: basal},
            bolus: {data: bolus}
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z'
          ]
        };
        expect(dm.calculateBasalBolusStats(bd2).totalDailyDose).to.equal(24.0);
      });

      it('should exclude any boluses falling outside basal date range', function() {
        var twoBoluses = [bolus[0], anotherBolus];
        var bd3 = {
          data: {
            basal: {data: basal},
            bolus: {data: twoBoluses}
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z'
          ]
        };
        expect(dm.calculateBasalBolusStats(bd3).totalDailyDose).to.equal(20.0);
      });
    });
  });

  describe('infusionSiteHistory', function() {
    var oneWeekDates = [{
      date: '2015-09-07',
      type: 'past'
    }, {
      date: '2015-09-08',
      type: 'past'
    }, {
      date: '2015-09-09',
      type: 'past'
    }, {
      date: '2015-09-10',
      type: 'past'
    }, {
      date: '2015-09-11',
      type: 'past'
    }, {
      date: '2015-09-12',
      type: 'dayOfUpload'
    }, {
      date: '2015-09-13',
      type: 'future'
    }];
    var countSiteChangesByDay = {
      '2015-09-05': {count: 1},
      '2015-09-08': {count: 1, data: 'a'},
      '2015-09-12': {count: 2, data: 'b'}
    };
    var bd = {
      data: {reservoirChange: {dataByDate: countSiteChangesByDay}},
      days: oneWeekDates
    };
    it('should be a function', function() {
      assert.isFunction(dm.infusionSiteHistory);
    });

    it('should return an object keyed by date; value is object with attrs type, count, daysSince', function() {
      var res = {};
      oneWeekDates.forEach(function(d) {
        res[d.date] = {type: d.type === 'future' ? d.type : 'noSiteChange'};
      });
      res['2015-09-08'] = {type: 'siteChange', count: 1, daysSince: 3, data: 'a'};
      res['2015-09-12'] = {type: 'siteChange', count: 2, daysSince: 4, data: 'b'};
      expect(dm.infusionSiteHistory(bd)).to.deep.equal(res);
    });

    it('should properly calculate the daysSince for the first infusion site change', function() {
      var res2 = {};
      oneWeekDates.forEach(function(d) {
        res2[d.date] = {type: d.type === 'future' ? d.type : 'noSiteChange'};
      });
      res2['2015-09-08'] = {type: 'siteChange', count: 1, daysSince: 7, data: 'a'};
      res2['2015-09-12'] = {type: 'siteChange', count: 1, daysSince: 4, data: 'b'};
      var countSiteChangesByDay2 = {
        '2015-09-01': {count: 1},
        '2015-09-08': {count: 1, data: 'a'},
        '2015-09-12': {count: 1, data: 'b'}
      };
      var bd2 = {
        data: {reservoirChange: {dataByDate: countSiteChangesByDay2}},
        days: oneWeekDates
      };
      expect(dm.infusionSiteHistory(bd2)).to.deep.equal(res2);
    });
  });

  describe('_summarizeTagFn', function() {
    it('should be a function', function() {
      assert.isFunction(dm._summarizeTagFn);
    });

    it('should return a function that can be used with _.each to summarize tags from subtotals', function() {
      var dataObj = {
        dataByDate: {
          '2015-01-01': {
            subtotals: {
              foo: 2,
              bar: 3
            }
          },
          '2015-01-02': {
            subtotals: {
              foo: 10,
              bar: 10
            }
          },
          '2015-01-03': {
            subtotals: {
              foo: 0,
              bar: 0
            }
          }
        }
      };
      var summary = {total: 25};
      _.each(['foo', 'bar'], dm._summarizeTagFn(dataObj, summary));
      expect(summary).to.deep.equal({
        total: 25,
        foo: {count: 12, percentage: 0.48},
        bar: {count: 13, percentage: 0.52}
      });
    });
  });

  describe('_averageExcludingMostRecentDay', function() {
    it('should be a function', function() {
      assert.isFunction(dm._averageExcludingMostRecentDay);
    });

    it('should calculate an average excluding the most recent day if data exists for it', function() {
      var dataObj = {
        dataByDate: {
          '2015-01-01': {
            total: 2
          },
          '2015-01-02': {
            total: 9
          },
          '2015-01-03': {
            total: 16
          },
          '2015-01-04': {
            total: 1
          }
        }
      };
      expect(dm._averageExcludingMostRecentDay(dataObj, 28, '2015-01-04')).to.equal(9);
    });
  });

  describe('reduceByDay', function() {
    it('should be a function', function() {
      assert.isFunction(dm.reduceByDay);
    });

    describe('crossfilter utils per datatype', function() {
      var then = '2015-01-01T00:00:00.000Z';
      var bd = {
        data: {
          basal: {data: [{type: 'basal', deliveryType: 'temp', time: then, displayOffset: 0}]},
          bolus: {data: [{type: 'bolus', time: then, displayOffset: 0}]},
          reservoirChange: {data: [{type: 'deviceEvent', subType: 'reservoirChange', time: then, displayOffset: 0}]}
        },
        days: [{date: '2015-01-01', type: 'past'}, {date: '2015-01-02', type: 'mostRecent'}]
      };
      dm.reduceByDay(bd);
      var types = ['bolus', 'reservoirChange', 'basal'];
      types.forEach(function(type) {
        it('should build crossfilter utils for ' + type, function() {
          expect(Object.keys(bd.data[type])).to.deep.equal(['data', 'cf', 'byLocalDate', 'dataByDate']);
        });
      });
    });

    describe('crossfilter utils for fingerstick section', function() {
      var then = '2015-01-01T00:00:00.000Z';
      var bd = {
        data: {
          smbg: {data: [{type: 'smbg', time: then, displayOffset: 0}]},
          calibration: {data: [{type: 'deviceEvent', subType: 'calibration', time: then, displayOffset: 0}]}
        },
        days: [{date: '2015-01-01', type: 'past'}, {date: '2015-01-02', type: 'mostRecent'}]
      };
      dm.reduceByDay(bd);
      var types = ['smbg', 'calibration'];
      types.forEach(function(type) {
        it('should build crossfilter utils in fingerstick.' + type, function() {
          expect(Object.keys(bd.data.fingerstick[type])).to.deep.equal(['cf', 'byLocalDate', 'dataByDate']);
        });
      });
    });
  });
});
