/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import _ from 'lodash';
import moment from 'moment-timezone';
import types from '../types';
import { THREE_HRS } from '../../src/utils/datetime';

const days = [
  {
    date: '2017-09-18',
    type: 'past',
  },
  {
    date: '2017-09-19',
    type: 'past',
  },
  {
    date: '2017-09-20',
    type: 'past',
  },
  {
    date: '2017-09-21',
    type: 'past',
  },
  {
    date: '2017-09-22',
    type: 'past',
  },
  {
    date: '2017-09-23',
    type: 'past',
  },
  {
    date: '2017-09-24',
    type: 'past',
  },
  {
    date: '2017-09-25',
    type: 'past',
  },
  {
    date: '2017-09-26',
    type: 'past',
  },
  {
    date: '2017-09-27',
    type: 'past',
  },
  {
    date: '2017-09-28',
    type: 'past',
  },
  {
    date: '2017-09-29',
    type: 'past',
  },
  {
    date: '2017-09-30',
    type: 'past',
  },
  {
    date: '2017-10-01',
    type: 'past',
  },
  {
    date: '2017-10-02',
    type: 'past',
  },
  {
    date: '2017-10-03',
    type: 'past',
  },
  {
    date: '2017-10-04',
    type: 'past',
  },
  {
    date: '2017-10-05',
    type: 'past',
  },
  {
    date: '2017-10-06',
    type: 'past',
  },
  {
    date: '2017-10-07',
    type: 'mostRecent',
  },
  {
    date: '2017-10-08',
    type: 'future',
  },
];

export const basicsData = {
  timezone: 'America/Toronto',
  dateRange: [
    '2017-09-18T04:00:00.000Z',
    '2017-10-07T18:55:09.000Z',
  ],
  days,
  data: {
    basal: {
      data: [
        new types.Basal({
          deviceTime: '2017-09-18T07:01:00',
        }),
        new types.Basal({
          deviceTime: '2017-09-19T07:01:00',
        }),
        new types.Basal({
          deviceTime: '2017-09-20T07:01:00',
        }),
        new types.Basal({
          deviceTime: '2017-09-20T07:01:00',
          deliveryType: 'temp',
          duration: 180000,
        }),
      ],
    },
    bolus: {
      data: _.compact(_.flatten(_.map(days, day => {
        if (day.type === 'future') return null;

        return _.map(_.range(0, 3), index => {
          const deviceTime = moment
            .utc(day.date)
            .add(5 * index, 'hours')
            .toISOString()
            .slice(0, -5);

          return new types.Bolus({
            deviceTime,
          });
        });
      }))),
    },
    wizard: {
      data: _.compact(_.flatten(_.map(days, day => {
        if (day.type === 'future') return null;

        return _.map(_.range(0, 2), index => {
          const deviceTime = moment
            .utc(day.date)
            .add(5 * index, 'hours')
            .toISOString()
            .slice(0, -5);

          return new types.Wizard({
            deviceTime,
          });
        });
      }))),
    },
    cbg: {
      data: _.compact(_.flatten(_.map(days, day => {
        if (day.type === 'future') return null;

        return _.map(_.range(0, 150), index => {
          const deviceTime = moment
            .utc(day.date)
            .add(5 * index, 'minutes')
            .toISOString()
            .slice(0, -5);

          return new types.CBG({
            deviceTime,
          });
        });
      }))),
    },
    smbg: {
      data: _.compact(_.flatten(_.map(days, day => {
        if (day.type === 'future') return null;

        return _.map(_.range(0, 5), index => {
          const deviceTime = moment
            .utc(day.date)
            .add(1 * index, 'hours')
            .toISOString()
            .slice(0, -5);

          return new types.CBG({
            deviceTime,
          });
        });
      }))),
    },
    calibration: {
      data: _.compact(_.flatten(_.map(days, day => {
        if (day.type === 'future') return null;

        return _.map(_.range(0, 2), index => {
          const deviceTime = moment
            .utc(day.date)
            .add(5 * index, 'hours')
            .toISOString()
            .slice(0, -5);

          return new types.CBG({
            deviceTime,
          });
        });
      }))),
    },
    upload: {
      data: [
        new types.Upload({
          deviceTime: '2017-09-18T18:00:00',
          deviceTags: ['insulin-pump'],
          source: 'Animas',
        }),
        new types.Upload({
          deviceTime: '2017-09-26T18:00:00',
          deviceTags: ['insulin-pump'],
          source: 'Animas',
        }),
      ],
    },
    reservoirChange: {
      data: _.compact(_.map(days, (day, index) => {
        if (index % 15 !== 0) return null;

        const deviceTime = moment
          .utc(day.date)
          .add(12, 'hours')
          .toISOString()
          .slice(0, -5);

        return new types.DeviceEvent({
          deviceTime,
          subType: 'reservoirChange',
        });
      })),
    },
    tubingPrime: {
      data: _.compact(_.map(days, (day, index) => {
        if (index % 5 !== 0) return null;

        const deviceTime = moment
          .utc(day.date)
          .add(11, 'hours')
          .toISOString()
          .slice(0, -5);

        return new types.DeviceEvent({
          deviceTime,
          subType: 'prime',
          primeTarget: 'tubing',
        });
      })),
    },
    cannulaPrime: {
      data: _.compact(_.map(days, (day, index) => {
        if (index % 5 !== 0) return null;

        const deviceTime = moment
          .utc(day.date)
          .add(12, 'hours')
          .toISOString()
          .slice(0, -5);

        return new types.DeviceEvent({
          deviceTime,
          subType: 'prime',
          primeTarget: 'cannula',
          source: 'Animas',
        });
      })),
    },
  },
};

export const dailyData = {
  dataByDate: {
    '2016-12-28': {
      bounds: [1482883200000, 1482969600000],
      date: '2016-12-28',
      data: {
        basal: [],
        bolus: [],
        cbg: [],
        smbg: [],
        basalSequences: [],
      },
    },
    '2016-12-29': {
      bounds: [1482969600000, 1483056000000],
      date: '2016-12-29',
      data: {
        basal: [],
        bolus: [],
        cbg: [],
        smbg: [],
        basalSequences: [],
      },
    },
    '2016-12-30': {
      bounds: [1483056000000, 1483142400000],
      date: '2016-12-30',
      data: {
        basal: [],
        bolus: [],
        cbg: [],
        smbg: [],
        basalSequences: [],
      },
    },
    '2016-12-31': {
      bounds: [1483142400000, 1483228800000],
      date: '2016-12-31',
      data: {
        basal: [],
        bolus: [],
        cbg: [],
        smbg: [],
        basalSequences: [],
      },
    },
    '2017-01-01': {
      bounds: [1483228800000, 1483315200000],
      date: '2017-01-01',
      data: {
        basal: [],
        bolus: [
          {
            type: 'bolus',
            utc: 1483313400000,
            threeHrBin: 21,
          },
          {
            type: 'bolus',
            utc: 1483313400000,
            threeHrBin: 21,
          },
        ],
        cbg: [],
        smbg: [],
        basalSequences: [],
      },
    },
    '2017-01-02': {
      bounds: [1483315200000, 1483401600000],
      date: '2017-01-02',
      data: {
        basal: [
          {
            type: 'basal',
            utc: 1483313400000,
            duration: 1483314400000,
            rate: 0.625,
            subType: 'scheduled',
          },
          {
            type: 'basal',
            utc: 1483314400000,
            duration: 1483315400000,
            rate: 0.7,
            subType: 'automated',
          },
        ],
        bolus: [
          {
            type: 'bolus',
            subType: 'normal',
            normal: 0.925,
            utc: 1483313400000,
            threeHrBin: 21,
          },
          {
            type: 'bolus',
            normal: 0.925,
            subType: 'normal',
            utc: 1483315200000,
            threeHrBin: 0,
          },
          {
            type: 'wizard',
            carbInput: 80,
            recommended: {
              carb: 8,
              correction: 1.25,
              net: 8.75,
            },
            bolus: {
              type: 'bolus',
              normal: 5.75,
              extended: 2.5,
              expectedExtended: 5,
              duration: 3600 * 2,
              expectedDuration: 3600 * 4,
              utc: 1483315200000,
            },
          },
        ],
        cbg: [
          {
            type: 'cbg',
            value: 75,
            utc: 1483353000000,
          },
        ],
        smbg: [
          {
            type: 'smbg',
            value: 92,
            utc: 1483353000000,
          },
        ],
        basalSequences: [
          [
            {
              type: 'basal',
              utc: 1483313400000,
              duration: 1483314400000,
              rate: 0.6,
              subType: 'scheduled',
            },
            {
              type: 'basal',
              utc: 1483314400000,
              duration: 1483315400000,
              rate: 0.7,
              subType: 'scheduled',
            },
          ],
        ],
        timeInAutoRatio: {
          automated: 1483314400000,
          manual: 1483314400000,
        },
        food: [
          {
            nutrition: {
              carbohydrate: {
                net: 65,
              },
            },
          },
        ],
      },
    },
  },
  bgRange: [undefined, undefined],
  bolusRange: [undefined, undefined],
  basalRange: [0, 0],
};

export const bgLogData = {
  dateRange: ['2017-12-31', '2018-01-29'],
  timezone: 'America/Toronto',
  dataByDate: {
    '2017-12-31': { data: { smbg: [
      { value: 50, msPer24: THREE_HRS * 0.5 },
      { value: 70, msPer24: THREE_HRS * 1.5 },
      { value: 90, msPer24: THREE_HRS * 2.5 },
      { value: 150, msPer24: THREE_HRS * 3.5 },
      { value: 170, msPer24: THREE_HRS * 4.5 },
      { value: 190, msPer24: THREE_HRS * 5.5 },
      { value: 210, msPer24: THREE_HRS * 6.5 },
      { value: 260, msPer24: THREE_HRS * 7.5 },
    ] } },
    '2018-01-01': { data: { smbg: [{ value: 60 }] } },
    '2018-01-02': { data: { smbg: [{ value: 100 }] } },
    '2018-01-03': { data: { smbg: [{ value: 200 }] } },
    '2018-01-04': { data: { smbg: [{ value: 300 }] } },
    '2018-01-05': { data: { smbg: [{ value: 50 }] } },
    '2018-01-06': { data: { smbg: [{ value: 60 }] } },
    '2018-01-07': { data: { smbg: [{ value: 100 }] } },
    '2018-01-08': { data: { smbg: [{ value: 200 }] } },
    '2018-01-09': { data: { smbg: [{ value: 300 }] } },
    '2018-01-10': { data: { smbg: [{ value: 50 }] } },
    '2018-01-11': { data: { smbg: [{ value: 60 }] } },
    '2018-01-12': { data: { smbg: [{ value: 100 }] } },
    '2018-01-13': { data: { smbg: [{ value: 200 }] } },
    '2018-01-14': { data: { smbg: [{ value: 300 }] } },
    '2018-01-15': { data: { smbg: [{ value: 50 }] } },
    '2018-01-16': { data: { smbg: [{ value: 60 }] } },
    '2018-01-17': { data: { smbg: [{ value: 100 }] } },
    '2018-01-18': { data: { smbg: [{ value: 200 }] } },
    '2018-01-19': { data: { smbg: [{ value: 300 }] } },
    '2018-01-20': { data: { smbg: [{ value: 50 }] } },
    '2018-01-21': { data: { smbg: [{ value: 60 }] } },
    '2018-01-22': { data: { smbg: [{ value: 100 }] } },
    '2018-01-23': { data: { smbg: [{ value: 200 }] } },
    '2018-01-24': { data: { smbg: [{ value: 300 }] } },
    '2018-01-25': { data: { smbg: [{ value: 50 }] } },
    '2018-01-26': { data: { smbg: [{ value: 60 }] } },
    '2018-01-27': { data: { smbg: [{ value: 100 }] } },
    '2018-01-28': { data: { smbg: [{ value: 200 }] } },
    '2018-01-29': { data: { smbg: [{ value: 300 }] } },
  },
};
