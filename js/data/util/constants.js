/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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

const i18next = require('i18next');

const t = i18next.t.bind(i18next);

const MGDL_UNITS = 'mg/dL';
const MMOLL_UNITS = 'mmol/L';
const MGDL_PER_MMOLL = 18.01559;

const MMMM_D_FORMAT = 'MMMM D';
const DDDD_MMMM_D_FORMAT = 'dddd, MMMM D';
const H_MM_A_FORMAT = 'h:mm a'; // 3:25 pm
const HOUR_FORMAT = '%-I %p';
const DAY_SHORT_FORMAT= '%b %-d';
const DDD_FORMAT = 'ddd';
const DD_FORMAT = 'DD';
const MMM_FORMAT = 'MMM';
const MMM_D_FORMAT = 'MMM D';
// not used for now
// const YYYY_MM_DD_FORMAT = t('YYYY-MM-DD');
const MMM_D_YYYY_H_MM_A_FORMAT = 'MMM D, YYYY h:mm a';
const MMM_D_H_MM_A_FORMAT = 'MMM D, h:mm a';
const DDDD_H_MM_A = 'dddd, h:mm a'; // Sunday, 3:25:50 pm

/**
 * Used to regroup device parameters in one tooltip, when the changes are too close.
 * This is to avoid superpositions of the icons in the daily view.
 * Format: Duration in milliseconds.
 */
const DEVICE_PARAMS_OFFSET = 30 * 60 * 1000;
const MS_IN_DAY = 864e5;

module.exports = {
  AUTOMATED_BASAL_DEVICE_MODELS: {
    Medtronic: ['1580', '1581', '1582', '1780', '1781', '1782'],
    Diabeloop: true,
  },
  AUTOMATED_BASAL_LABELS: {
    get Medtronic() { return t('Auto Mode'); },
    get Diabeloop() { return t('Loop mode'); },
    get default() { return t('Automated'); },
  },
  SCHEDULED_BASAL_LABELS: {
    get Medtronic() { return t('Manual'); },
    get Diabeloop() { return t('Loop mode off'); },
    get default() { return t('Manual'); },
  },
  MGDL_PER_MMOLL,
  MGDL_UNITS,
  MMOLL_UNITS,
  DEFAULT_BG_BOUNDS: {
    [MGDL_UNITS]: {
      veryLow: 54,
      targetLower: 70,
      targetUpper: 180,
      veryHigh: 250,
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
  /** @returns {string} translated 'MMMM D' format */
  get MMMM_D_FORMAT() { return t(MMMM_D_FORMAT); },
  /** @returns {string} translated 'dddd, MMMM D' format */
  get DDDD_MMMM_D_FORMAT() { return t(DDDD_MMMM_D_FORMAT); },
  /** @returns {string} translated 'MMM D, YYYY h:mm a' format */
  get MMM_D_YYYY_H_MM_A_FORMAT() { return t(MMM_D_YYYY_H_MM_A_FORMAT); },
  /** @returns {string} translated 'MMM D, h:mm a' format */
  get MMM_D_H_MM_A_FORMAT() { return t(MMM_D_H_MM_A_FORMAT); },
  /** @returns {string} translated '%-I %p' format for d3.time */
  get HOUR_FORMAT() { return t(HOUR_FORMAT); },
  /** @returns {string} translated 'dddd, h:mm a' format */
  get DDDD_H_MM_A() { return t(DDDD_H_MM_A); },
  /** @returns {string} translated 'h:mm a' format */
  get H_MM_A_FORMAT() { return t(H_MM_A_FORMAT); },
  /** @returns {string} translated ' %b %-d' format (d3 format) */
  get DAY_SHORT_FORMAT() { return t(DAY_SHORT_FORMAT)},
  /** @returns {string} translated 'ddd' format */
  get DDD_FORMAT() { return t(DDD_FORMAT); },
  /** @returns {string} translated 'DD' format */
  get DD_FORMAT() { return t(DD_FORMAT); },
  /** @returns {string} translated 'MMM' format */
  get MMM_FORMAT() { return t(MMM_FORMAT); },
  /** @returns {string} translated 'MMM D' format */
  get MMM_D_FORMAT() { return t(MMM_D_FORMAT); },
  DEVICE_PARAMS_OFFSET,
  MS_IN_DAY,
};
