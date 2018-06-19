/* jshint esversion:6 */

const MGDL_UNITS = 'mg/dL';
const MMOLL_UNITS = 'mmol/L';
const MGDL_PER_MMOLL = 18.01559;

module.exports = {
  AUTOMATED_BASAL_DEVICE_MODELS: {
    Medtronic: ['1780'],
  },
  AUTOMATED_BASAL_LABELS: {
    Medtronic: 'Auto Mode',
    default: 'Automated',
  },
  SCHEDULED_BASAL_LABELS: {
    Medtronic: 'Manual',
    default: 'Manual',
  },
  MGDL_PER_MMOLL,
  MGDL_UNITS,
  MMOLL_UNITS,
  DEFAULT_BG_BOUNDS: {
    [MGDL_UNITS]: {
      veryLow: 54,
      targetLower: 70,
      targetUpper: 180,
      veryHigh:250,
    },
    [MMOLL_UNITS]: {
      veryLow: 3.0,
      targetLower: 3.9,
      targetUpper: 10.0,
      veryHigh: 13.9,
    },
  },
  BG_CLAMP_THRESHOLD: {
    [MGDL_UNITS]: 600,
    [MMOLL_UNITS]: 600/MGDL_PER_MMOLL,
  },
};
