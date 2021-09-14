/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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
/* eslint-disable no-underscore-dangle */

import i18next from 'i18next';
import { MGDL_UNITS, MMOLL_UNITS } from 'tideline';
import config from '../config';

export const URL_TIDEPOOL_MOBILE_APP_STORE = 'https://itunes.apple.com/us/app/tidepool-mobile/id1026395200?mt=8';
export const URL_BIG_DATA_DONATION_INFO = 'https://tidepool.org/announcing-the-tidepool-big-data-donation-project';
export const URL_DEXCOM_CONNECT_INFO = 'http://support.tidepool.org/article/73-connecting-dexcom-account-to-tidepool';
export const URL_UPLOADER_DOWNLOAD_PAGE = 'https://tidepool.org/products/tidepool-uploader/';

export const TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL = 'bigdata@tidepool.org';
// BRANDING
export const CONFIG = {
  'tidepool': {
    name: 'Tidepool',
    support:'http://support.tidepool.org/',
    legal:'http://tidepool.org/legal/',
    termsURL: 'https://tidepool.org/terms-of-use',
    get termsText() { return i18next.t('Tidepool Applications Terms of Use'); },
    dataPrivacyURL: 'https://tidepool.org/privacy-policy',
    get dataPrivacyText() { return i18next.t('Privacy Policy'); }
  },
  diabeloop: {
    name: 'YourLoops',
    supportURL: 'https://www.diabeloop.com',
    get supportText() { return i18next.t('Diabeloop'); },
    _termsURL: `${config.ASSETS_URL}terms.pdf`,
    get termsURL() { return this._termsURL; },
    set termsURL(value) { this._termsURL = value; },
    get termsText() { return i18next.t('Diabeloop Applications Terms of Use'); },
    _dataPrivacyURL: `${config.ASSETS_URL}data-privacy.pdf`,
    get dataPrivacyURL() { return this._dataPrivacyURL; },
    set dataPrivacyURL(value) { this._dataPrivacyURL = value; },
    get dataPrivacyText() { return i18next.t('Privacy Policy'); },
    _intendedUseURL: `${config.ASSETS_URL}intendedUse.pdf`,
    get intendedUseURL() { return this._intendedUseURL; },
    set intendedUseURL(value) { this._intendedUseURL = value; },
    get intendedUseText() { return i18next.t('Regulatory Information'); },
  }
};

export const DATA_DONATION_NONPROFITS = () => [
  { value: 'AADE', label: i18next.t('AADE Foundation') },
  { value: 'BT1', label: i18next.t('Beyond Type 1') },
  { value: 'CARBDM', label: i18next.t('CarbDM') },
  { value: 'CWD', label: i18next.t('Children with Diabetes') },
  { value: 'CDN', label: i18next.t('College Diabetes Network') },
  { value: 'DYF', label: i18next.t('Diabetes Youth Families (DYF)') },
  { value: 'DIABETESSISTERS', label: i18next.t('DiabetesSisters') },
  { value: 'DIATRIBE', label: i18next.t('The diaTribe Foundation') },
  { value: 'JDRF', label: i18next.t('JDRF') },
  { value: 'NSF', label: i18next.t('Nightscout Foundation') },
  { value: 'T1DX', label: i18next.t('T1D Exchange') },
];

export const DIABETES_TYPES = () => [
  { value: 'type1', get label() { return i18next.t('Type 1'); } },
  { value: 'type2', get label() { return i18next.t('Type 2'); } },
  { value: 'gestational', get label() { return i18next.t('Gestational'); } },
  { value: 'prediabetes', get label() { return i18next.t('Pre-diabetes'); } },
  { value: 'lada', get label() { return i18next.t('LADA (Type 1.5)'); } },
  { value: 'other', get label() { return i18next.t('Other'); } },
];

export const BG_DATA_TYPES = [
  'cbg',
  'smbg',
];

export const DIABETES_DATA_TYPES = [
  ...BG_DATA_TYPES,
  'basal',
  'bolus',
  'wizard',
  'food',
  'physicalActivity',
];

export const DEFAULT_BG_TARGETS = {
  [MGDL_UNITS]: {
    low: 70,
    high: 180,
  },
  [MMOLL_UNITS]: {
    low: 3.9,
    high: 10.0,
  },
};

export const DEFAULT_BG_SETTINGS = {
  bgTarget: DEFAULT_BG_TARGETS[MGDL_UNITS],
  units: {
    bg: MGDL_UNITS,
  },
};
