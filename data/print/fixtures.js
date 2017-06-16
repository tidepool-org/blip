export const data = {
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
      },
    },
  },
  bgRange: [undefined, undefined],
  bolusRange: [undefined, undefined],
  basalRange: [0, 0],
};
