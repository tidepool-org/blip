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

/* jshint esversion:6 */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');
var d3 = require('d3');

var constants = require('../plugins/blip/basics/logic/constants');
var togglableState = require('../plugins/blip/basics/TogglableState');

var BasalUtil = require('../js/data/basalutil');

var { MMOLL_UNITS } = require('../js/data/util/constants');

var bgClasses = {
  'very-low': {boundary: 10},
  low: {boundary: 20},
  target: {boundary: 30},
  high: {boundary: 40},
  'very-high': {boundary: 50}
};
var bgClassesMmoll = {
  'very-low': {boundary: 2},
  low: {boundary: 3},
  target: {boundary: 4},
  high: {boundary: 10},
  'very-high': {boundary: 20}
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

var bu = new BasalUtil([]);
var dm = require('../plugins/blip/basics/logic/datamunger')(bgClasses);
var dmMmol = require('../plugins/blip/basics/logic/datamunger')(bgClassesMmoll, MMOLL_UNITS);

var types = require('../dev/testpage/types');

describe('basics datamunger', function() {
  it('should return an object', function() {
    assert.isObject(dm);
  });

  describe('getLatestPumpUploaded', function() {
    it('should be a function', function() {
      assert.isFunction(dm.getLatestPumpUploaded);
    });

    it('should return a pump with proper data', function() {
      var patientData = {
        grouped: {
          upload: [
            {
              deviceTags: ['bgm'],
              source: 'BGM',
            },
            {
              deviceTags: ['insulin-pump'],
              source: constants.TANDEM,
            },
            {
              deviceTags: ['insulin-pump', 'bgm'],
              source: constants.INSULET,
            },
            {
              deviceTags: ['cgm'],
              source: 'CGM',
            },
          ],
        },
      };
      expect(dm.getLatestPumpUploaded(patientData)).to.equal(constants.INSULET);
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

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      expect(dm.processInfusionSiteHistory(basicsData, null, patient, perms)).to.equal(null);
    });

    it('should return that a user has set their site change source settings', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.hasSiteChangeSourceSettings).to.equal(true);
    });

    it('should return that a user has not set their site change source settings', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {},
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.hasSiteChangeSourceSettings).to.equal(false);
    });

    it('should return that logged in user has permission to update patient settings', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.canUpdateSettings).to.equal(true);
    });

    it('should return that logged in user does not have permission to update patient settings', function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = {};

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.canUpdateSettings).to.equal(false);
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

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient, perms);
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

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_TUBING,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient, perms);
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

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_TUBING,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_RESERVOIR);
    });

    var pumps = [constants.ANIMAS, constants.MEDTRONIC, constants.TANDEM];
    pumps.forEach(function(pump) {
      it('should set siteChanges type to undeclared, and settings to be open, when no preference has been saved and pump is ' + pump, function() {
        var basicsData = {
          data: {
            [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
            [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        var perms = { root: { } };

        var patient = {
          profile: {
            fullName: 'Jill Jellyfish',
          },
          settings: {},
        };

        dm.processInfusionSiteHistory(basicsData, pump, patient, perms);
        expect(basicsData.sections.siteChanges.type).to.equal(constants.SECTION_TYPE_UNDECLARED);
        expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.open);
      });

      it('should set siteChanges type to undeclared, and settings to be open, when saved preference is not allowed for ' + pump, function() {
        var basicsData = {
          data: {
            [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
            [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        var perms = { root: { } };

        var patient = {
          profile: {
            fullName: 'Jill Jellyfish',
          },
          settings: {
            siteChangeSource: constants.SITE_CHANGE_RESERVOIR,
          },
        };

        dm.processInfusionSiteHistory(basicsData, pump, patient, perms);
        expect(basicsData.sections.siteChanges.type).to.equal(constants.SECTION_TYPE_UNDECLARED);
        expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.open);
      });
    });

    it('should set siteChanges type to reservoirChange, and settings to be off, when saved preference is ' + constants.SITE_CHANGE_CANNULA + ' and pump is ' + constants.INSULET, function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_RESERVOIR);
      expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.off);
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
      res.hasChangeHistory = true;
      expect(dm.infusionSiteHistory(bd, 'reservoirChange')).to.deep.equal(res);
    });

    it('should properly calculate the daysSince for the first infusion site change', function() {
      var res2 = {};
      oneWeekDates.forEach(function(d) {
        res2[d.date] = {type: d.type === 'future' ? d.type : 'noSiteChange'};
      });
      res2['2015-09-08'] = {type: 'siteChange', count: 1, daysSince: 7, data: 'a'};
      res2['2015-09-12'] = {type: 'siteChange', count: 1, daysSince: 4, data: 'b'};
      res2.hasChangeHistory = true;
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

    describe('countAutomatedBasalEventsForDay', function() {
      it('should count the number of `automatedStop` events and add them to the totals', function() {
        var then = '2015-01-01T00:00:00.000Z';
        var bd = {
          data: {
            basal: { data: [
              { type: 'basal', deliveryType: 'temp', normalTime: then, displayOffset: 0 },
              { type: 'basal', deliveryType: 'automated', normalTime: then, displayOffset: 0 },
            ] },
          },
          days: [{ date: '2015-01-01', type: 'mostRecent' }],
        };

        dm.reduceByDay(bd);

        expect(bd.data.basal.dataByDate['2015-01-01'].subtotals.automatedStop).to.equal(0);
        expect(bd.data.basal.dataByDate['2015-01-01'].subtotals.automatedStart).to.equal(1);
        expect(bd.data.basal.dataByDate['2015-01-01'].total).to.equal(2);

        // Add a scheduled basal to kick out of automode
        bd.data.basal.data.push({ type: 'basal', deliveryType: 'scheduled', normalTime: then, displayOffset: 0 });
        dm.reduceByDay(bd);

        expect(bd.data.basal.dataByDate['2015-01-01'].subtotals.automatedStop).to.equal(1);
        expect(bd.data.basal.dataByDate['2015-01-01'].total).to.equal(3);
      });
    });

    describe('countDistinctSuspendsForDay', function() {
      it('should count contiguous `suspend` events as 1 and add them to the totals', function() {
        var start1 = '2015-01-01T00:00:00.000Z';
        var start2 = '2015-01-01T00:01:00.000Z';
        var start3 = '2015-01-01T00:01:02.000Z';
        var start4 = '2015-01-01T00:01:06.000Z';
        var start5 = '2015-01-01T00:02:00.000Z';
        var bd = {
          data: {
            basal: { data: [
              { type: 'basal', deliveryType: 'scheduled', normalTime: start1, normalEnd: start2 },
              { type: 'basal', deliveryType: 'suspend', normalTime: start2, normalEnd: start3 },
              { type: 'basal', deliveryType: 'suspend', normalTime: start3, normalEnd: start4 },
              { type: 'basal', deliveryType: 'suspend', normalTime: start4, normalEnd: start5 },
              { type: 'basal', deliveryType: 'scheduled', normalTime: start5 },
            ] },
          },
          days: [{ date: '2015-01-01', type: 'mostRecent' }],
        };

        dm.reduceByDay(bd);

        // should only count the 3 suspends as 1, because they are contiguous
        expect(bd.data.basal.dataByDate['2015-01-01'].subtotals.suspend).to.equal(1);
        expect(bd.data.basal.dataByDate['2015-01-01'].total).to.equal(1);
      });

      it('should count non-contiguous `suspend` events as distict add them to the totals', function() {
        var start1 = '2015-01-01T00:00:00.000Z';
        var start2 = '2015-01-01T00:01:00.000Z';
        var start3 = '2015-01-01T00:01:02.000Z';
        var start4 = '2015-01-01T00:01:06.000Z';
        var start5 = '2015-01-01T00:02:00.000Z';
        var bd = {
          data: {
            basal: { data: [
              { type: 'basal', deliveryType: 'scheduled', normalTime: start1, normalEnd: start2 },
              { type: 'basal', deliveryType: 'suspend', normalTime: start2, normalEnd: start3 },
              { type: 'basal', deliveryType: 'scheduled', normalTime: start3, normalEnd: start4 },
              { type: 'basal', deliveryType: 'suspend', normalTime: start4, normalEnd: start5 },
              { type: 'basal', deliveryType: 'scheduled', normalTime: start5 },
            ] },
          },
          days: [{ date: '2015-01-01', type: 'mostRecent' }],
        };

        dm.reduceByDay(bd);

        // should only count the 2 suspends as 2, because they are non-contiguous
        expect(bd.data.basal.dataByDate['2015-01-01'].subtotals.suspend).to.equal(2);
        expect(bd.data.basal.dataByDate['2015-01-01'].total).to.equal(2);
      });
    });
  });
});
