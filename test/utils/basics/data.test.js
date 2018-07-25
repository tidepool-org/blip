/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
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

/* eslint-disable max-len */

import _ from 'lodash';
import { utcDay } from 'd3-time';
import * as dataUtils from '../../../src/utils/basics/data';
import Types from '../../../data/types';

import {
  NO_CGM,
  CGM_CALCULATED,
  NOT_ENOUGH_CGM,
  MGDL_UNITS,
  MMOLL_UNITS,
  SITE_CHANGE_RESERVOIR,
  SITE_CHANGE_TUBING,
  SITE_CHANGE_CANNULA,
  ANIMAS,
  INSULET,
  MEDTRONIC,
  TANDEM,
  SECTION_TYPE_UNDECLARED,
} from '../../../src/utils/constants';

const bgBounds = {
  [MGDL_UNITS]: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 70,
    veryLowThreshold: 55,
  },
  [MMOLL_UNITS]: {
    veryHighThreshold: 16.7,
    targetUpperBound: 10.0,
    targetLowerBound: 3.9,
    veryLowThreshold: 3.1,
  },
};

const bgPrefs = {
  [MGDL_UNITS]: {
    bgBounds: bgBounds[MGDL_UNITS],
    bgUnits: MGDL_UNITS,
  },
  [MMOLL_UNITS]: {
    bgBounds: bgBounds[MMOLL_UNITS],
    bgUnits: MMOLL_UNITS,
  },
};

const oneWeekDates = [
  {
    date: '2015-09-07',
    type: 'past',
  },
  {
    date: '2015-09-08',
    type: 'past',
  },
  {
    date: '2015-09-09',
    type: 'past',
  },
  {
    date: '2015-09-10',
    type: 'past',
  },
  {
    date: '2015-09-11',
    type: 'past',
  },
  {
    date: '2015-09-12',
    type: 'dayOfUpload',
  },
  {
    date: '2015-09-13',
    type: 'future',
  },
];

const countSiteChangesByDay = {
  '2015-09-05': { count: 1 },
  '2015-09-08': { count: 1, data: 'a' },
  '2015-09-12': { count: 2, data: 'b' },
};

const siteChangeSections = {
  siteChanges: {
    id: 'siteChanges',
    selectorOptions: {
      primary: { key: SITE_CHANGE_RESERVOIR, label: 'Reservoir Change' },
      rows: [
        [
          { key: SITE_CHANGE_TUBING, label: 'Tube Primes' },
          { key: SITE_CHANGE_CANNULA, label: 'Cannula Fills' },
        ],
      ],
    },
    type: SITE_CHANGE_RESERVOIR,
  },
};

describe('basics data utils', () => {
  describe('determineBgDistributionSource', () => {
    context('has enough cbg data (Dexcom)', () => {
      it('should yield cgmStatus `calculatedCGM` and source `cbg`', () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumCBGRequiredPerDay = 144;

        for (let i = 0; i < minimumCBGRequiredPerDay; ++i) {
          cbg.push(new Types.CBG({
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'calculatedCGM',
          source: 'cbg',
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'notEnoughCGM',
          source: 'smbg',
        });
      });
    });

    context('has enough cbg data (FreeStyle Libre)', () => {
      it('should yield cgmStatus `calculatedCGM` and source `cbg`', () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumCBGRequiredPerDay = 48;

        for (let i = 0; i < minimumCBGRequiredPerDay; ++i) {
          cbg.push(new Types.CBG({
            deviceId: 'AbbottFreeStyleLibre-XXX-XXXX',
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'calculatedCGM',
          source: 'cbg',
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'notEnoughCGM',
          source: 'smbg',
        });
      });
    });

    context('has enough cbg data (Dexcom + FreeStyle Libre mix)', () => {
      it('should yield cgmStatus `calculatedCGM` and source `cbg`', () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumLibreCBGRequiredPerDay = 48;
        const minimumDexcomCBGRequiredPerDay = 144;

        for (let i = 0; i < minimumLibreCBGRequiredPerDay / 2; ++i) {
          cbg.push(new Types.CBG({
            deviceId: 'AbbottFreeStyleLibre-XXX-XXXX',
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        for (let i = 0; i < minimumDexcomCBGRequiredPerDay / 2; ++i) {
          cbg.push(new Types.CBG({
            deviceId: 'Dexcom-XXX-XXXX',
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'calculatedCGM',
          source: 'cbg',
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'notEnoughCGM',
          source: 'smbg',
        });
      });
    });

    context('smbg data present, no cbg data', () => {
      it('should yield cgmStatus `noCGM` and source `smbg`', () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 1 }),
          new Types.SMBG({ value: 25 }),
        ];
        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: [] } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'noCGM',
          source: 'smbg',
        });
      });
    });

    context('smbg data present, not enough cbg data', () => {
      it('should yield cgmStatus `notEnoughCGM` and source `smbg`', () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 1 }),
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [
          new Types.CBG({ value: 50 }),
        ];
        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'notEnoughCGM',
          source: 'smbg',
        });
      });
    });

    context('no smbg data present, not enough cbg data', () => {
      it('should yield cgmStatus `notEnoughCGM` and source `null`', () => {
        const now = new Date();
        const smbg = [];
        const cbg = [
          new Types.CBG({ value: 50 }),
        ];

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'notEnoughCGM',
          source: null,
        });
      });
    });

    context('no smbg data present, no cbg data either', () => {
      it('should yield cgmStatus `noCGM` and source `null`', () => {
        const now = new Date();
        const smbg = [];
        const cbg = [];

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: 'noCGM',
          source: null,
        });
      });
    });
  });

  describe('cgmStatusMessage', () => {
    it('should return an appropriate status message when provided a valid status string', () => {
      expect(dataUtils.cgmStatusMessage(NO_CGM)).to.equal('Showing BGM data (no CGM)');
      expect(dataUtils.cgmStatusMessage(NOT_ENOUGH_CGM)).to.equal('Showing BGM data (not enough CGM)');
      expect(dataUtils.cgmStatusMessage(CGM_CALCULATED)).to.equal('Showing CGM data');
    });

    it('should return an empty status message when not provided a valid status string', () => {
      expect(dataUtils.cgmStatusMessage('foo')).to.equal('');
    });
  });

  describe('calculateBasalBolusStats', () => {
    const wizard = [
      { type: 'wizard', carbInput: 100, normalTime: '2015-09-01T07:00:00Z' },
      { type: 'wizard', carbInput: 77, normalTime: '2015-09-01T10:30:00Z' },
      { type: 'wizard', carbInput: 33, normalTime: '2015-09-01T13:00:00Z' },
      { type: 'wizard', carbInput: 100, normalTime: '2015-09-02T07:00:00Z' },
      { type: 'wizard', carbInput: 77, normalTime: '2015-09-02T10:30:00Z' },
      { type: 'wizard', carbInput: 33, normalTime: '2015-09-02T13:00:00Z' },
      { type: 'wizard', carbInput: 100, normalTime: '2015-09-03T07:00:00Z' },
      { type: 'wizard', carbInput: 77, normalTime: '2015-09-03T10:30:00Z' },
      { type: 'wizard', carbInput: 33, normalTime: '2015-09-03T13:00:00Z' },
    ];

    const basal = [
      new Types.Basal({
        duration: 864e5,
        deviceTime: '2015-09-01T00:00:00',
        source: 'Medtronic',
        deviceModel: '1780',
        deliveryType: 'automated',
      }),
      new Types.Basal({
        duration: 864e5,
        deviceTime: '2015-09-02T00:00:00',
        source: 'Medtronic',
        deviceModel: '1780',
        deliveryType: 'scheduled',
      }),
      new Types.Basal({
        duration: 864e5,
        deviceTime: '2015-09-03T00:00:00',
        source: 'Medtronic',
        deviceModel: '1780',
        deliveryType: 'automated',
      }),
      new Types.Basal({
        duration: 864e5,
        deviceTime: '2015-09-04T00:00:00',
        source: 'Medtronic',
        deviceModel: '1780',
        deliveryType: 'automated',
      }),
    ];

    const bolus = [new Types.Bolus({
      value: 4.0,
      deviceTime: '2015-09-01T12:00:00',
    }), new Types.Bolus({
      value: 4.0,
      deviceTime: '2015-09-02T12:00:00',
    }), new Types.Bolus({
      value: 4.0,
      deviceTime: '2015-09-03T12:00:00',
    })];

    const anotherBolus = new Types.Bolus({
      value: 2.0,
      deviceTime: '2015-09-04T12:00:00',
    });

    const bd = {
      data: {
        basal: { data: basal },
        bolus: { data: bolus, dataByDate: {
          '2015-09-01': [],
          '2015-09-02': [],
          '2015-09-03': [],
          '2015-09-04': [],
        } },
        wizard: { data: wizard },
      },
      dateRange: [
        '2015-09-01T00:00:00.000Z',
        '2015-09-04T00:00:00.000Z',
      ],
      days: [{
        date: '2015-09-01',
        type: 'past',
      }, {
        date: '2015-09-02',
        type: 'past',
      }, {
        date: '2015-09-03',
        type: 'past',
      }, {
        date: '2015-09-04',
        type: 'past',
      }, {
        date: '2015-09-05',
        type: 'mostRecent',
      }],
    };

    describe('timeInAutoRatio', () => {
      it('should calculate percentage of time in automated basal delivery', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).timeInAutoRatio.automated).to.equal(2 / 3);
      });

      it('should calculate percentage of time in manual basal delivery', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).timeInAutoRatio.manual).to.equal(1 / 3);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', () => {
        const bd2 = {
          data: {
            basal: { data: basal },
            bolus: { data: bolus, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-02T06:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd2).timeInAutoRatio.automated).to.equal(0.75);
        expect(dataUtils.calculateBasalBolusStats(bd2).timeInAutoRatio.manual).to.equal(0.25);
      });

      it('should calculate a statistic even if there are 3 or more `past` days with no boluses', () => {
        const bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        delete bd4.data.bolus.dataByDate['2015-09-03'];
        delete bd4.data.bolus.dataByDate['2015-09-04'];
        bd4.data.bolus.dataByDate['2015-09-05'] = [];
        bd4.days.push({ date: '2015-09-05', type: 'mostRecent' });
        expect(dataUtils.calculateBasalBolusStats(bd4).timeInAutoRatio).to.be.an('object');
      });
    });

    describe('basalBolusRatio', () => {
      it('should calculate percentage of basal insulin', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).basalBolusRatio.basal).to.equal(0.75);
      });

      it('should calculate percentage of bolus insulin', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).basalBolusRatio.bolus).to.equal(0.25);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', () => {
        const bd2 = {
          data: {
            basal: { data: basal },
            bolus: { data: bolus, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd2).basalBolusRatio.basal).to.equal(0.5);
        expect(dataUtils.calculateBasalBolusStats(bd2).basalBolusRatio.bolus).to.equal(0.5);
      });

      it('should exclude any boluses falling outside basal date range', () => {
        const twoBoluses = [bolus[0], anotherBolus];
        const bd3 = {
          data: {
            basal: { data: basal },
            bolus: { data: twoBoluses, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd3).basalBolusRatio.basal).to.equal(0.6);
        expect(dataUtils.calculateBasalBolusStats(bd3).basalBolusRatio.bolus).to.equal(0.4);
      });

      it('should not calculate a statistic if there are 3 or more `past` days with no boluses', () => {
        const bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        delete bd4.data.bolus.dataByDate['2015-09-03'];
        delete bd4.data.bolus.dataByDate['2015-09-04'];
        bd4.data.bolus.dataByDate['2015-09-05'] = [];
        bd4.days.push({ date: '2015-09-05', type: 'mostRecent' });
        expect(dataUtils.calculateBasalBolusStats(bd4).basalBolusRatio).to.be.null;
      });
    });

    describe('averageDailyDose', () => {
      it('should calculate average daily amount of basal insulin', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).averageDailyDose.basal).to.equal(12.0);
      });

      it('should calculate average daily amount of bolus insulin', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).averageDailyDose.bolus).to.equal(4.0);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', () => {
        const bd2 = {
          data: {
            basal: { data: basal },
            bolus: { data: bolus, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd2).averageDailyDose.basal).to.equal(12.0);
        expect(dataUtils.calculateBasalBolusStats(bd2).averageDailyDose.bolus).to.equal(12.0);
      });

      it('should exclude any boluses falling outside basal date range', () => {
        const twoBoluses = [bolus[0], anotherBolus];
        const bd3 = {
          data: {
            basal: { data: basal },
            bolus: { data: twoBoluses, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd3).averageDailyDose.basal).to.equal(12.0);
        expect(dataUtils.calculateBasalBolusStats(bd3).averageDailyDose.bolus).to.equal(8.0);
      });

      it('should not calculate a statistic if there are 3 or more `past` days with no boluses', () => {
        const bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        delete bd4.data.bolus.dataByDate['2015-09-03'];
        delete bd4.data.bolus.dataByDate['2015-09-04'];
        bd4.data.bolus.dataByDate['2015-09-05'] = [];
        bd4.days.push({ date: '2015-09-05', type: 'mostRecent' });
        expect(dataUtils.calculateBasalBolusStats(bd4).averageDailyDose).to.be.null;
      });
    });

    describe('totalDailyDose', () => {
      it('should calculate average total daily dose', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).totalDailyDose).to.equal(16.0);
      });

      it('should exclude any portion of basal duration prior to or following basics date range', () => {
        const bd2 = {
          data: {
            basal: { data: basal },
            bolus: { data: bolus, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T12:00:00.000Z',
            '2015-09-01T20:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd2).totalDailyDose).to.equal(24.0);
      });

      it('should exclude any boluses falling outside basal date range', () => {
        const bd3 = {
          data: {
            basal: { data: basal },
            bolus: { data: bolus, dataByDate: { '2015-09-01': [] } },
            wizard: { data: wizard },
          },
          dateRange: [
            '2015-09-01T06:00:00.000Z',
            '2015-09-01T18:00:00.000Z',
          ],
          days: [{
            date: '2015-09-01',
            type: 'past',
          }, {
            date: '2015-09-02',
            type: 'mostRecent',
          }],
        };
        expect(dataUtils.calculateBasalBolusStats(bd3).totalDailyDose).to.equal(20.0);
      });

      it('should not calculate a statistic if there are 3 or more `past` days with no boluses', () => {
        const bd4 = _.cloneDeep(bd);
        delete bd4.data.bolus.dataByDate['2015-09-01'];
        delete bd4.data.bolus.dataByDate['2015-09-02'];
        delete bd4.data.bolus.dataByDate['2015-09-03'];
        bd4.data.bolus.dataByDate['2015-09-05'] = [];
        bd4.days.push({ date: '2015-09-05', type: 'mostRecent' });
        expect(dataUtils.calculateBasalBolusStats(bd4).totalDailyDose).to.be.null;
      });
    });
    describe('averageDailyCarbs', () => {
      it('should calculate average daily carbs', () => {
        expect(dataUtils.calculateBasalBolusStats(bd).averageDailyCarbs).to.equal(210);
      });
      it('should exclude any carbs falling outside the date range', () => {
        const wizardMore = [
          // in data range
          { type: 'wizard', carbInput: 100, normalTime: '2015-09-01T07:00:00Z' },
          { type: 'wizard', carbInput: 20, normalTime: '2015-09-01T10:30:00Z' },
          { type: 'wizard', carbInput: 100, normalTime: '2015-09-02T07:00:00Z' },
          { type: 'wizard', carbInput: 20, normalTime: '2015-09-02T10:30:00Z' },
          { type: 'wizard', carbInput: 100, normalTime: '2015-09-03T07:00:00Z' },
          { type: 'wizard', carbInput: 20, normalTime: '2015-09-03T10:30:00Z' },
          // out of data range
          { type: 'wizard', carbInput: 50, normalTime: '2015-09-04T07:00:00Z' },
          { type: 'wizard', carbInput: 50, normalTime: '2015-09-04T10:00:00Z' },
        ];

        const bdCarbs = _.cloneDeep(bd);
        delete bdCarbs.data.wizard;
        bdCarbs.data.wizard = { data: wizardMore };

        expect(dataUtils.calculateBasalBolusStats(bdCarbs).averageDailyCarbs).to.equal(120);
      });
      it('should not calculate a statistic if there are 3 or more `past` days with no carbs', () => {
        const bdCarbs = _.cloneDeep(bd);
        delete bdCarbs.data.bolus.dataByDate['2015-09-02'];
        delete bdCarbs.data.bolus.dataByDate['2015-09-03'];
        delete bdCarbs.data.bolus.dataByDate['2015-09-04'];
        bdCarbs.data.bolus.dataByDate['2015-09-05'] = [];
        bdCarbs.days.push({ date: '2015-09-05', type: 'mostRecent' });
        expect(dataUtils.calculateBasalBolusStats(bdCarbs).averageDailyCarbs).to.be.null;
      });
    });
  });

  describe('getLatestPumpUploaded', () => {
    it('should return the source of the latest pump uploaded', () => {
      const data = {
        upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: 'Insulet' })] },
      };

      expect(dataUtils.getLatestPumpUploaded({ data })).to.equal('Insulet');
    });

    it('should return null if there is no pump data uploaded', () => {
      const data = {
        upload: { data: [] },
      };

      expect(dataUtils.getLatestPumpUploaded({ data })).to.be.null;
    });
  });

  describe('getInfusionSiteHistory', () => {
    const bd = {
      data: { reservoirChange: { dataByDate: countSiteChangesByDay } },
      days: oneWeekDates,
    };

    it('should return an object keyed by date; value is object with attrs type, count, daysSince', () => {
      const res = {};
      _.forEach(oneWeekDates, d => {
        res[d.date] = { type: d.type === 'future' ? d.type : 'noSiteChange' };
      });
      res['2015-09-08'] = { type: 'siteChange', count: 1, daysSince: 3, data: 'a' };
      res['2015-09-12'] = { type: 'siteChange', count: 2, daysSince: 4, data: 'b' };
      res.hasChangeHistory = true;
      expect(dataUtils.getInfusionSiteHistory(bd, 'reservoirChange')).to.deep.equal(res);
    });

    it('should properly calculate the daysSince for the first infusion site change', () => {
      const res2 = {};
      _.forEach(oneWeekDates, d => {
        res2[d.date] = { type: d.type === 'future' ? d.type : 'noSiteChange' };
      });
      res2['2015-09-08'] = { type: 'siteChange', count: 1, daysSince: 7, data: 'a' };
      res2['2015-09-12'] = { type: 'siteChange', count: 1, daysSince: 4, data: 'b' };
      res2.hasChangeHistory = true;
      const countSiteChangesByDay2 = {
        '2015-09-01': { count: 1 },
        '2015-09-08': { count: 1, data: 'a' },
        '2015-09-12': { count: 1, data: 'b' },
      };
      const bd2 = {
        data: { reservoirChange: { dataByDate: countSiteChangesByDay2 } },
        days: oneWeekDates,
      };
      expect(dataUtils.getInfusionSiteHistory(bd2, 'reservoirChange')).to.deep.equal(res2);
    });
  });

  describe('processInfusionSiteHistory', () => {
    it('should return basics data unchanged without latest pump', () => {
      const basicsData = {
        data: {},
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: SITE_CHANGE_CANNULA,
        },
      };

      const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(result).to.deep.equal(basicsData);
    });

    it('should set siteChanges type to cannulaPrime', () => {
      const basicsData = {
        data: {
          [SITE_CHANGE_CANNULA]: { dataByDate: countSiteChangesByDay },
          [SITE_CHANGE_TUBING]: { dataByDate: countSiteChangesByDay },
          upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: TANDEM })] },
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: SITE_CHANGE_CANNULA,
        },
      };

      const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(result.sections.siteChanges.type).to.equal(SITE_CHANGE_CANNULA);
    });

    it('should set siteChanges type to tubingPrime', () => {
      const basicsData = {
        data: {
          [SITE_CHANGE_CANNULA]: { dataByDate: countSiteChangesByDay },
          [SITE_CHANGE_TUBING]: { dataByDate: countSiteChangesByDay },
          upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: TANDEM })] },
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: SITE_CHANGE_TUBING,
        },
      };

      const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(result.sections.siteChanges.type).to.equal(SITE_CHANGE_TUBING);
    });

    it('should default siteChanges type to reservoirChange', () => {
      const basicsData = {
        data: {
          [SITE_CHANGE_RESERVOIR]: { dataByDate: countSiteChangesByDay },
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: SITE_CHANGE_TUBING,
        },
      };

      dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(basicsData.sections.siteChanges.type).to.equal(SITE_CHANGE_RESERVOIR);
    });

    const pumps = [ANIMAS, MEDTRONIC, TANDEM];
    _.forEach(pumps, pump => {
      it(`should set siteChanges type to undeclared, when no preference has been saved and pump is ${pump}`, () => {
        const basicsData = {
          data: {
            [SITE_CHANGE_CANNULA]: { dataByDate: countSiteChangesByDay },
            [SITE_CHANGE_TUBING]: { dataByDate: countSiteChangesByDay },
            upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: pump })] },
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        const patient = {
          profile: {
            fullName: 'Jill Jellyfish',
          },
          settings: {},
        };

        const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
        expect(result.sections.siteChanges.type).to.equal(SECTION_TYPE_UNDECLARED);
      });

      it(`should set siteChanges type to undeclared, when saved preference is not allowed for ${pump}`, () => {
        const basicsData = {
          data: {
            [SITE_CHANGE_CANNULA]: { dataByDate: countSiteChangesByDay },
            [SITE_CHANGE_TUBING]: { dataByDate: countSiteChangesByDay },
            upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: pump })] },
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        const patient = {
          profile: {
            fullName: 'Jill Jellyfish',
          },
          settings: {
            siteChangeSource: SITE_CHANGE_RESERVOIR,
          },
        };

        const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
        expect(result.sections.siteChanges.type).to.equal(SECTION_TYPE_UNDECLARED);
      });
    });

    it(`should set siteChanges type to reservoirChange when saved preference is ${SITE_CHANGE_CANNULA} and pump is ${INSULET}`, () => {
      const basicsData = {
        data: {
          [SITE_CHANGE_RESERVOIR]: { dataByDate: countSiteChangesByDay },
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      const perms = { root: { } };

      const patient = {
        profile: {
          fullName: 'Jill Jellyfish',
        },
        settings: {
          siteChangeSource: SITE_CHANGE_CANNULA,
        },
      };

      dataUtils.processInfusionSiteHistory(basicsData, INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(SITE_CHANGE_RESERVOIR);
    });
  });

  describe('reduceByDay', () => {
    describe('crossfilter utils per datatype', () => {
      const then = '2015-01-01T00:00:00.000Z';
      const bd = {
        data: {
          basal: { data: [{ type: 'basal', deliveryType: 'temp', normalTime: then, displayOffset: 0 }] },
          bolus: { data: [{ type: 'bolus', normalTime: then, displayOffset: 0 }] },
          reservoirChange: { data: [{ type: 'deviceEvent', subType: 'reservoirChange', normalTime: then, displayOffset: 0 }] },
        },
        days: [{ date: '2015-01-01', type: 'past' }, { date: '2015-01-02', type: 'mostRecent' }],
      };
      const result = dataUtils.reduceByDay(bd, bgPrefs[MGDL_UNITS]);
      const types = ['bolus', 'reservoirChange', 'basal'];
      _.forEach(types, type => {
        it(`should build crossfilter utils for ${type}`, () => {
          expect(_.keys(result.data[type])).to.deep.equal(['data', 'cf', 'byLocalDate', 'dataByDate']);
        });

        it(`should build a \`dataByDate\` object for ${type} with *only* localDates with data as keys`, () => {
          expect(_.keys(result.data[type].dataByDate)).to.deep.equal(['2015-01-01']);
        });
      });
    });

    describe('crossfilter utils for fingerstick section', () => {
      const then = '2015-01-01T00:00:00.000Z';
      const bd = {
        data: {
          smbg: { data: [new Types.SMBG({ normalTime: then })] },
          calibration: { data: [{ type: 'deviceEvent', subType: 'calibration', normalTime: then, displayOffset: 0 }] },
        },
        days: [{ date: '2015-01-01', type: 'past' }, { date: '2015-01-02', type: 'mostRecent' }],
      };
      const result = dataUtils.reduceByDay(bd, bgPrefs[MGDL_UNITS]);
      const types = ['smbg', 'calibration'];
      _.forEach(types, type => {
        it(`should build crossfilter utils in fingerstick.${type}`, () => {
          expect(_.keys(result.data.fingerstick[type])).to.deep.equal(['cf', 'byLocalDate', 'dataByDate']);
        });

        it(`should build a \`dataByDate\` object for ${type} with *only* localDates with data as keys`, () => {
          expect(_.keys(result.data.fingerstick[type].dataByDate)).to.deep.equal(['2015-01-01']);
        });
      });
    });

    describe('summarizeTagFn', () => {
      it('should return a function that can be used with _.each to summarize tags from subtotals', () => {
        const dataObj = {
          dataByDate: {
            '2015-01-01': {
              subtotals: {
                foo: 2,
                bar: 3,
              },
            },
            '2015-01-02': {
              subtotals: {
                foo: 10,
                bar: 10,
              },
            },
            '2015-01-03': {
              subtotals: {
                foo: 0,
                bar: 0,
              },
            },
          },
        };

        const summary = { total: 25 };

        _.each(['foo', 'bar'], dataUtils.summarizeTagFn(dataObj, summary));

        expect(summary).to.deep.equal({
          total: 25,
          foo: { count: 12, percentage: 0.48 },
          bar: { count: 13, percentage: 0.52 },
        });
      });
    });

    describe('averageExcludingMostRecentDay', () => {
      it('should calculate an average excluding the most recent day if data exists for it', () => {
        const dataObj = {
          dataByDate: {
            '2015-01-01': {
              total: 2,
            },
            '2015-01-02': {
              total: 9,
            },
            '2015-01-03': {
              total: 16,
            },
            '2015-01-04': {
              total: 1,
            },
          },
        };
        expect(dataUtils.averageExcludingMostRecentDay(dataObj, 28, '2015-01-04')).to.equal(9);
      });
    });

    describe('countAutomatedBasalEventsForDay', () => {
      it('should count the number of `automatedStop` events and add them to the totals', () => {
        const then = '2015-01-01T00:00:00.000Z';
        const bd = {
          data: {
            basal: { data: [
              { type: 'basal', deliveryType: 'temp', normalTime: then, displayOffset: 0 },
              { type: 'basal', deliveryType: 'automated', normalTime: then, displayOffset: 0 },
            ] },
          },
          days: [{ date: '2015-01-01', type: 'mostRecent' }],
        };

        const result = dataUtils.reduceByDay(bd, bgPrefs[MGDL_UNITS]);

        expect(result.data.basal.dataByDate['2015-01-01'].subtotals.automatedStop).to.equal(0);
        expect(result.data.basal.dataByDate['2015-01-01'].total).to.equal(1);

        // Add a scheduled basal to kick out of automode
        bd.data.basal.data.push({ type: 'basal', deliveryType: 'scheduled', normalTime: then, displayOffset: 0 });
        const result2 = dataUtils.reduceByDay(bd, bgPrefs[MGDL_UNITS]);

        expect(result2.data.basal.dataByDate['2015-01-01'].subtotals.automatedStop).to.equal(1);
        expect(result2.data.basal.dataByDate['2015-01-01'].total).to.equal(2);
      });
    });
  });

  describe('defineBasicsSections', () => {
    const sectionNames = [
      'basals',
      'basalBolusRatio',
      'bgDistribution',
      'boluses',
      'fingersticks',
      'siteChanges',
      'totalDailyDose',
      'timeInAutoRatio',
      'averageDailyCarbs',
    ];

    it('should return an object with all required basics section keys with the default properties set', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      expect(result).to.have.all.keys(sectionNames);
    });

    it('should set titles for each section', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      _.forEach(sectionNames, (section) => {
        expect(result[section].title).to.be.a('string');
      });
    });

    it('should set the veryLow and veryHigh fingerstick filter labels correctly for mg/dL data', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      const veryHighFilter = _.find(result.fingersticks.dimensions, { key: 'veryHigh' });
      const veryLowFilter = _.find(result.fingersticks.dimensions, { key: 'veryLow' });
      expect(veryHighFilter.label).to.equal('Above 300 mg/dL');
      expect(veryLowFilter.label).to.equal('Below 55 mg/dL');
    });

    it('should set the veryLow and veryHigh fingerstick filter labels correctly for mmol/L data', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS]);
      const veryHighFilter = _.find(result.fingersticks.dimensions, { key: 'veryHigh' });
      const veryLowFilter = _.find(result.fingersticks.dimensions, { key: 'veryLow' });
      expect(veryHighFilter.label).to.equal('Above 16.7 mmol/L');
      expect(veryLowFilter.label).to.equal('Below 3.1 mmol/L');
    });

    it('should set the label for the `automatedStop` filter based on the manufacturer', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS], 'medtronic');
      const automatedStopFilter = _.find(result.basals.dimensions, { key: 'automatedStop' });
      expect(automatedStopFilter.label).to.equal('Auto Mode Exited');
    });

    it('should set default label for the `automatedStop` filter when missing manufacturer', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS]);
      const automatedStopFilter = _.find(result.basals.dimensions, { key: 'automatedStop' });
      expect(automatedStopFilter.label).to.equal('Automated Exited');
    });

    it('should set the active basal ratio to `basalBolusRatio` for non-automated-basal devices', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], MEDTRONIC, '723');
      expect(result.basalBolusRatio.active).to.be.true;
      expect(result.timeInAutoRatio.active).to.be.false;
    });

    it('should activate both `basalBolusRatio` and `timeInAutoRatio` for automated-basal devices', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], MEDTRONIC, '1780');
      expect(result.basalBolusRatio.active).to.be.true;
      expect(result.timeInAutoRatio.active).to.be.true;
    });

    it('should set the per-manufacturer labels for `timeInAutoRatio`, with default fallbacks when unavailable', () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], MEDTRONIC, '1780');
      expect(result.timeInAutoRatio.title).to.equal('Time in Auto Mode ratio');
      expect(result.timeInAutoRatio.dimensions[1].label).to.equal('Auto Mode');

      const fallbackResult = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], ANIMAS);
      expect(fallbackResult.timeInAutoRatio.title).to.equal('Time in Automated ratio');
      expect(fallbackResult.timeInAutoRatio.dimensions[1].label).to.equal('Automated');
    });
  });

  describe('generateCalendarDayLabels', () => {
    it('should generate an array of formatted day labels', () => {
      const result = dataUtils.generateCalendarDayLabels(oneWeekDates);
      expect(result).to.eql(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });
  });

  describe('disableEmptySections', () => {
    const basicsData = {
      data: {
        cbg: { data: [new Types.CBG()] },
        smbg: { data: [] },
        basal: { data: [] },
        bolus: { data: [] },
        fingerstick: {
          smbg: { data: [] },
          calibration: { data: [] },
        },
        cannulaPrime: { dataByDate: {} },
        tubingPrime: { dataByDate: {} },
        upload: { data: [new Types.Upload({ deviceTags: ['insulin-pump'], source: MEDTRONIC })] },
      },
      days: oneWeekDates,
      sections: dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], MEDTRONIC, '1780'),
    };

    it('should disable sections for which there is no data available', () => {
      // all sections (including timeInAutoRatio since it's an automated-basal device) active by default
      expect(basicsData.sections.basals.active).to.be.true;
      expect(basicsData.sections.boluses.active).to.be.true;
      expect(basicsData.sections.siteChanges.active).to.be.true;
      expect(basicsData.sections.fingersticks.active).to.be.true;
      expect(basicsData.sections.bgDistribution.active).to.be.true;
      expect(basicsData.sections.totalDailyDose.active).to.be.true;
      expect(basicsData.sections.basalBolusRatio.active).to.be.true;
      expect(basicsData.sections.timeInAutoRatio.active).to.be.true;
      expect(basicsData.sections.averageDailyCarbs.active).to.be.true;
      expect(_.find(basicsData.sections.fingersticks.filters, { path: 'calibration' })).to.be.defined;
      const processedBasicsData = dataUtils.processInfusionSiteHistory(basicsData, {});
      const result = dataUtils.disableEmptySections(processedBasicsData);

      // basals gets disabled when no data
      expect(result.sections.basals.disabled).to.be.true;

      // boluses gets disabled when no data
      expect(result.sections.boluses.disabled).to.be.true;

      // siteChanges gets disabled when no data
      expect(result.sections.siteChanges.disabled).to.be.true;

      // fingersticks gets disabled when no data
      expect(result.sections.fingersticks.disabled).to.be.true;

      // bgDistribution gets disabled when no data
      expect(result.sections.bgDistribution.disabled).to.be.true;

      // totalDailyDose gets disabled when no data
      expect(result.sections.totalDailyDose.disabled).to.be.true;

      // basalBolusRatio gets disabled when no data
      expect(result.sections.basalBolusRatio.disabled).to.be.true;

      // timeInAutoRatio gets disabled when no data
      expect(result.sections.timeInAutoRatio.disabled).to.be.true;

      // averageDailyCarbs gets disabled when no data
      expect(result.sections.averageDailyCarbs.disabled).to.be.true;

      // calibration filter in fingerstick section gets removed when no data
      expect(_.find(result.sections.fingersticks.filters, { path: 'calibration' })).to.be.undefined;
    });

    it('should set empty text for sections for which there is no data available', () => {
      // all sections emptyText undefined by default
      expect(basicsData.sections.basals.emptyText).to.be.undefined;
      expect(basicsData.sections.boluses.emptyText).to.be.undefined;
      expect(basicsData.sections.siteChanges.emptyText).to.be.undefined;
      expect(basicsData.sections.fingersticks.emptyText).to.be.undefined;
      expect(basicsData.sections.bgDistribution.emptyText).to.be.undefined;
      expect(basicsData.sections.totalDailyDose.emptyText).to.be.undefined;
      expect(basicsData.sections.basalBolusRatio.emptyText).to.be.undefined;
      expect(basicsData.sections.timeInAutoRatio.emptyText).to.be.undefined;
      expect(basicsData.sections.averageDailyCarbs.emptyText).to.be.undefined;
      expect(basicsData.sections.fingersticks.emptyText).to.be.undefined;

      const processedBasicsData = dataUtils.processInfusionSiteHistory(basicsData, {});
      const result = dataUtils.disableEmptySections(processedBasicsData);

      // basals gets emptyText set when no data
      expect(result.sections.basals.emptyText).to.be.a('string');

      // boluses gets emptyText set when no data
      expect(result.sections.boluses.emptyText).to.be.a('string');

      // siteChanges gets emptyText set when no data
      expect(result.sections.siteChanges.emptyText).to.be.a('string');

      // fingersticks gets emptyText set when no data
      expect(result.sections.fingersticks.emptyText).to.be.a('string');

      // bgDistribution gets emptyText set when no data
      expect(result.sections.bgDistribution.emptyText).to.be.a('string');

      // totalDailyDose gets emptyText set when no data
      expect(result.sections.totalDailyDose.emptyText).to.be.a('string');

      // basalBolusRatio gets emptyText set when no data
      expect(result.sections.basalBolusRatio.emptyText).to.be.a('string');

      // basalBolusRatio gets emptyText set when no data
      expect(result.sections.timeInAutoRatio.emptyText).to.be.a('string');

      // averageDailyCarbs gets emptyText set when no data
      expect(result.sections.averageDailyCarbs.emptyText).to.be.a('string');

      // fingersticks gets emptyText set when no data
      expect(result.sections.fingersticks.emptyText).to.be.a('string');
    });
  });
});
/* eslint-enable max-len */
