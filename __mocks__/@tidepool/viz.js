// Mock for @tidepool/viz

/* global jest */

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
      formatDateRange: jest.fn(() => 'FORMATTED_DATE'),
      formatLocalizedFromUTC: jest.fn(() => 'FORMATTED_DATE'),
    },
    format: {
      formatBgValue: jest.fn((val) => `${val}%`),
      formatPercentage: jest.fn((val) => `${val}%`),
    },
  },
};
