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
            utc: NaN,
            duration: NaN,
            subType: undefined,
          },
        ],
        bolus: [
          {
            type: 'bolus',
            utc: 1483313400000,
            threeHrBin: 21,
          },
          {
            type: 'bolus',
            utc: 1483315200000,
            threeHrBin: 0,
          },
          {
            type: 'bolus',
            utc: NaN,
            threeHrBin: NaN,
          },
        ],
        cbg: [
          {
            type: 'cbg',
            utc: 1483353000000,
          },
        ],
        smbg: [
          {
            type: 'smbg',
            utc: 1483353000000,
          },
        ],
        basalSequences: [
          [
            {
              type: 'basal',
              utc: NaN,
              duration: NaN,
              subType: undefined,
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
