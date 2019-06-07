/* jshint esversion:6 */
const i18next = require('i18next');
const t = i18next.t.bind(i18next);

const MGDL_UNITS = t('mg/dL');
const MMOLL_UNITS = t('mmol/L');
const MGDL_PER_MMOLL = 18.01559;

module.exports = {
  AUTOMATED_BASAL_DEVICE_MODELS: {
    Medtronic: ['1580', '1581', '1582', '1780', '1781', '1782'],
  },
  AUTOMATED_BASAL_LABELS: {
    Medtronic: t('Auto Mode'),
    default: t('Automated'),
  },
  SCHEDULED_BASAL_LABELS: {
    Medtronic: t('Manual'),
    default: t('Manual'),
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
