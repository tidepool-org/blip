/* jshint esversion:6 */
const i18next = require('i18next');
const t = i18next.t.bind(i18next);

const MGDL_UNITS = t('mg/dL');
const MMOLL_UNITS = t('mmol/L');
const MGDL_PER_MMOLL = 18.01559;

const MMMM_D_FORMAT = t('MMMM D');
const DDDD_MMMM_D_FORMAT = t('dddd, MMMM D');
const H_MM_A_FORMAT = t('h:mm a');
const HOUR_FORMAT= t('%-I %p');
const DAY_SHORT_FORMAT= t('%b %-d');
const WEEKDAY_SHORT_FORMAT = t('%a');
const DDD_FORMAT = t('ddd');
const MMM_FORMAT = t('MMM');
const MMM_D_FORMAT = t('MMM D');
// not used for now
const YYYY_MM_DD_FORMAT = t('YYYY-MM-DD');
const MMM_D_YYYY_H_MM_A_FORMAT = t('MMM D, YYYY h:mm a');
const MMM_D_H_MM_A_FORMAT = t('MMM D, h:mm a');

const DEVICE_PARAMS_OFFSET = 30 * 60 * 1000;

module.exports = {
  AUTOMATED_BASAL_DEVICE_MODELS: {
    Medtronic: ['1580', '1581', '1582', '1780', '1781', '1782'],
    Diabeloop: true,
  },
  AUTOMATED_BASAL_LABELS: {
    Medtronic: t('Auto Mode'),
    Diabeloop: t('Loop mode'),
    default: t('Automated'),
  },
  SCHEDULED_BASAL_LABELS: {
    Medtronic: t('Manual'),
    Diabeloop: t('Loop mode off'),
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
  MMMM_D_FORMAT,
  DDDD_MMMM_D_FORMAT,
  H_MM_A_FORMAT,
  MMM_D_YYYY_H_MM_A_FORMAT,
  MMM_D_H_MM_A_FORMAT,
  HOUR_FORMAT,
  DAY_SHORT_FORMAT,
  WEEKDAY_SHORT_FORMAT,
  DDD_FORMAT,
  MMM_FORMAT,
  MMM_D_FORMAT,
  DEVICE_PARAMS_OFFSET,
};
