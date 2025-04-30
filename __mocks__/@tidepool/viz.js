// Mock for @tidepool/viz
const jest = require('jest-mock');
module.exports = {
  components: {
    Loader: () => null,
  },
  utils: {
    constants: {
      DEFAULT_BG_BOUNDS: {
        VERY_LOW: 54,
        LOW: 70,
        TARGET_LOWER: 80,
        TARGET_UPPER: 180,
        HIGH: 250,
        VERY_HIGH: 300,
      },
    },
    bg: {
      MGDL_UNITS: 'mg/dL',
      MMOLL_UNITS: 'mmol/L',
      MGDL_PER_MMOLL: 18.01559,
    },
    datetime: {
      formatDateRange: jest.fn(() => 'Jan 1 - Jan 31'),
      formatLocalizedFromUTC: jest.fn(() => 'Jan 1, 2023'),
    },
    format: {
      formatBgValue: jest.fn((val) => val.toString()),
      formatPercentage: jest.fn((val) => `${val}%`),
    },
  },
};
