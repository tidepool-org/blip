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

var constants = require('../plugins/blip/basics/logic/constants');
var togglableState = require('../plugins/blip/basics/TogglableState');

var bgClasses = {
  'very-low': {boundary: 10},
  low: {boundary: 20},
  target: {boundary: 30},
  high: {boundary: 40},
  'very-high': {boundary: 50}
};
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
var siteChangeSections = {
  'siteChanges': {
    id: 'siteChanges',
    togglable: togglableState.off,
    settingsTogglable: togglableState.closed,
    selectorOptions: {
      primary: { key: constants.SITE_CHANGE_RESERVOIR, label: 'Reservoir Change' },
      rows: [
        [
          { key: constants.SITE_CHANGE_TUBING, label: 'Tube Primes' },
          { key: constants.SITE_CHANGE_CANNULA, label: 'Cannula Fills' },
        ],
      ],
    },
    type: constants.SITE_CHANGE_RESERVOIR,
  },
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
        data: {smbg: {data: smbg}, cbg: {data: []}},
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
    var wizard = [
      { type: 'wizard', carbInput: 100, normalTime: '2015-09-01T07:00:00Z' },
      { type: 'wizard', carbInput: 77, normalTime: '2015-09-01T10:30:00Z' },
      { type: 'wizard', carbInput: 33, normalTime: '2015-09-01T13:00:00Z' },
    ];
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
        bolus: {data: bolus, dataByDate: {'2015-09-01': [], '2015-09-02': []}},
        wizard: {data: wizard}
      },
      dateRange: [
        '2015-09-01T00:00:00.000Z',
        '2015-09-02T00:00:00.000Z'
      ],
      days: [{
        date: '2015-09-01',
        type: 'past',
      }, {
        date: '2015-09-02',
        type: 'past',
      }, {
        date: '2015-09-03',
        type: 'mostRecent',
      }]
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
            bolus: {data: bolus, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd2).basalBolusRatio.basal).to.equal(0.5);
        expect(dm.calculateBasalBolusStats(bd2).basalBolusRatio.bolus).to.equal(0.5);
      });

      it('should exclude any boluses falling outside basal date range', function() {
        var twoBoluses = [bolus[0], anotherBolus];
        var bd3 = {
          data: {
            basal: {data: basal},
            bolus: {data: twoBoluses, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd3).basalBolusRatio.basal).to.equal(0.6);
        expect(dm.calculateBasalBolusStats(bd3).basalBolusRatio.bolus).to.equal(0.4);
      });

      it('should not calculate a statistic if there are `past` days with no boluses', function() {
        var bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        bd4.data.bolus.dataByDate['2015-09-03'] = [];
        bd4.days.push({date: '2015-09-03', type: 'mostRecent'});
        expect(dm.calculateBasalBolusStats(bd4).basalBolusRatio).to.be.null;
      });
    });

    describe('averageDailyDose', function() {
      it('should calculate average daily amount of basal insulin', function() {
        expect(dm.calculateBasalBolusStats(bd).averageDailyDose.basal).to.equal(12.0);
      });

      it('should calculate average daily amount of bolus insulin', function() {
        expect(dm.calculateBasalBolusStats(bd).averageDailyDose.bolus).to.equal(4.0);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', function() {
        var bd2 = {
          data: {
            basal: {data: basal},
            bolus: {data: bolus, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd2).averageDailyDose.basal).to.equal(12.0);
        expect(dm.calculateBasalBolusStats(bd2).averageDailyDose.bolus).to.equal(12.0);
      });

      it('should exclude any boluses falling outside basal date range', function() {
        var twoBoluses = [bolus[0], anotherBolus];
        var bd3 = {
          data: {
            basal: {data: basal},
            bolus: {data: twoBoluses, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd3).averageDailyDose.basal).to.equal(12.0);
        expect(dm.calculateBasalBolusStats(bd3).averageDailyDose.bolus).to.equal(8.0);
      });

      it('should not calculate a statistic if there are `past` days with no boluses', function() {
        var bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        bd4.data.bolus.dataByDate['2015-09-03'] = [];
        bd4.days.push({date: '2015-09-03', type: 'mostRecent'});
        expect(dm.calculateBasalBolusStats(bd4).averageDailyDose).to.be.null;
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
            bolus: {data: bolus, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd2).totalDailyDose).to.equal(24.0);
      });

      it('should exclude any boluses falling outside basal date range', function() {
        var twoBoluses = [bolus[0], anotherBolus];
        var bd3 = {
          data: {
            basal: {data: basal},
            bolus: {data: bolus, dataByDate: {'2015-09-01': []}},
            wizard: { data: wizard }
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z'
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }]
        };
        expect(dm.calculateBasalBolusStats(bd3).totalDailyDose).to.equal(20.0);
      });

      it('should not calculate a statistic if there are `past` days with no boluses', function() {
        var bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-01'];
        bd4.data.bolus.dataByDate['2015-09-03'] = [];
        bd4.days.push({date: '2015-09-03', type: 'mostRecent'});
        expect(dm.calculateBasalBolusStats(bd4).totalDailyDose).to.be.null;
      });
    });
    describe('averageDailyCarbs', function() {
      it('should calculate average daily carbs', function() {
        expect(dm.calculateBasalBolusStats(bd).averageDailyCarbs).to.equal(210);
      });
      it('should exclude any carbs falling outside the date range', function() {
        var wizardMore = [
          { type: 'wizard', carbInput: 100, normalTime: '2015-09-01T07:00:00Z' },
          { type: 'wizard', carbInput: 20, normalTime: '2015-09-01T10:30:00Z' },
          { type: 'wizard', carbInput: 15, normalTime: '2015-09-01T13:00:00Z' },
          { type: 'wizard', carbInput: 50, normalTime: '2015-09-02T07:00:00Z' },
          { type: 'wizard', carbInput: 50, normalTime: '2015-09-02T10:00:00Z' }
        ];

        var bdCarbs = _.cloneDeep(bd);
        delete bdCarbs.data.wizard;
        bdCarbs.data.wizard = { data: wizardMore };

        expect(dm.calculateBasalBolusStats(bdCarbs).averageDailyCarbs).to.equal(135);
      });
      it('should not calculate a statistic if there are `past` days with no carbs', function() {
        var bdCarbs = _.cloneDeep(bd);
        delete bdCarbs.data.bolus.dataByDate['2015-09-02'];
        bdCarbs.data.bolus.dataByDate['2015-09-03'] = [];
        bdCarbs.days.push({date: '2015-09-03', type: 'mostRecent'});
         expect(dm.calculateBasalBolusStats(bdCarbs).averageDailyCarbs).to.be.null;
      });
    });
  });

  describe('getLatestPumpUploaded', function() {
    it('should be a function', function() {
      assert.isFunction(dm.getLatestPumpUploaded);
    });

    it('should return a pump with proper data', function() {
      var patientData = {
        grouped: {
          pumpSettings: [
            {
              source: constants.TANDEM,
            },
          ],
        },
      };
      expect(dm.getLatestPumpUploaded(patientData)).to.equal(constants.TANDEM);
    });

    it('should return null without proper data', function() {
      var patientData = {
        grouped: {
          pumpSettings: [],
        },
      };
      expect(dm.getLatestPumpUploaded(patientData)).to.equal(null);
    });
  });

  describe('processInfusionSiteHistory', function() {
    it('should be a function', function() {
      assert.isFunction(dm.processInfusionSiteHistory);
    });

    it('should return null without latest pump', function() {
      var basicsData = {
        data: {},
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_CANNULA,
          },
        },
      };

      expect(dm.processInfusionSiteHistory(basicsData, null, patient)).to.equal(null);
    });

    it('should return upload permission true', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_CANNULA,
          },
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.OMNIPOD, patient);
      expect(basicsData.data.reservoirChange.summary.canUpdateSettings).to.equal(true);
    });

    it('should return upload permission false', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {},
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_CANNULA,
          },
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.OMNIPOD, patient);
      expect(basicsData.data.reservoirChange.summary.canUpdateSettings).to.equal(false);
    });

    it('should set siteChanges type to cannulaPrime', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
          [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_CANNULA,
          },
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_CANNULA);
    });

    it('should set siteChanges type to tubingPrime', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
          [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_TUBING,
          },
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_TUBING);
    });

    it('should set siteChanges type to reservoirChange', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {
            siteChangeSource: constants.SITE_CHANGE_TUBING,
          },
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.OMNIPOD, patient);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_RESERVOIR);
    });

    it('should set siteChanges type to undeclared, and settings to be open', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
          [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var patient = {
        permissions: {
          'root': {},
        },
        profile: {
          fullName: 'Jill Jellyfish',
          settings: {},
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.TYPE_UNDECLARED);
      expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.open);
    });
  });

  describe('infusionSiteHistory', function() {
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
      res['hasChangeHistory'] = true;
      expect(dm.infusionSiteHistory(bd, 'reservoirChange')).to.deep.equal(res);
    });

    it('should properly calculate the daysSince for the first infusion site change', function() {
      var res2 = {};
      oneWeekDates.forEach(function(d) {
        res2[d.date] = {type: d.type === 'future' ? d.type : 'noSiteChange'};
      });
      res2['2015-09-08'] = {type: 'siteChange', count: 1, daysSince: 7, data: 'a'};
      res2['2015-09-12'] = {type: 'siteChange', count: 1, daysSince: 4, data: 'b'};
      res2['hasChangeHistory'] = true;
      var countSiteChangesByDay2 = {
        '2015-09-01': {count: 1},
        '2015-09-08': {count: 1, data: 'a'},
        '2015-09-12': {count: 1, data: 'b'}
      };
      var bd2 = {
        data: {reservoirChange: {dataByDate: countSiteChangesByDay2}},
        days: oneWeekDates
      };
      expect(dm.infusionSiteHistory(bd2, 'reservoirChange')).to.deep.equal(res2);
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
          basal: {data: [{type: 'basal', deliveryType: 'temp', normalTime: then, displayOffset: 0}]},
          bolus: {data: [{type: 'bolus', normalTime: then, displayOffset: 0}]},
          reservoirChange: {data: [{type: 'deviceEvent', subType: 'reservoirChange', normalTime: then, displayOffset: 0}]}
        },
        days: [{date: '2015-01-01', type: 'past'}, {date: '2015-01-02', type: 'mostRecent'}]
      };
      dm.reduceByDay(bd);
      var types = ['bolus', 'reservoirChange', 'basal'];
      types.forEach(function(type) {
        it('should build crossfilter utils for ' + type, function() {
          expect(Object.keys(bd.data[type])).to.deep.equal(['data', 'cf', 'byLocalDate', 'dataByDate']);
        });

        it('should build a `dataByDate` object for ' + type + ' with *only* localDates with data as keys', function() {
          expect(Object.keys(bd.data[type].dataByDate)).to.deep.equal(['2015-01-01']);
        });
      });
    });

    describe('crossfilter utils for fingerstick section', function() {
      var then = '2015-01-01T00:00:00.000Z';
      var bd = {
        data: {
          smbg: {data: [{type: 'smbg', normalTime: then, displayOffset: 0}]},
          calibration: {data: [{type: 'deviceEvent', subType: 'calibration', normalTime: then, displayOffset: 0}]}
        },
        days: [{date: '2015-01-01', type: 'past'}, {date: '2015-01-02', type: 'mostRecent'}]
      };
      dm.reduceByDay(bd);
      var types = ['smbg', 'calibration'];
      types.forEach(function(type) {
        it('should build crossfilter utils in fingerstick.' + type, function() {
          expect(Object.keys(bd.data.fingerstick[type])).to.deep.equal(['cf', 'byLocalDate', 'dataByDate']);
        });

        it('should build a `dataByDate` object for ' + type + ' with *only* localDates with data as keys', function() {
          expect(Object.keys(bd.data.fingerstick[type].dataByDate)).to.deep.equal(['2015-01-01']);
        });
      });
    });
  });
});
