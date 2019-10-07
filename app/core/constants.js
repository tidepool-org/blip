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

import i18next from './language';

const t = i18next.t.bind(i18next);

export const URL_UPLOADER_CHROME_STORE = 'http://chrome.google.com/webstore/detail/tidepool-uploader/cabklgajffclbljkhmjphejemhpbghfb';
export const URL_TIDEPOOL_MOBILE_APP_STORE = 'https://itunes.apple.com/us/app/tidepool-mobile/id1026395200?mt=8';
export const URL_TERMS_OF_USE = 'https://tidepool.org/terms-of-use';
export const URL_PRIVACY_POLICY = 'https://tidepool.org/privacy-policy';
export const URL_BIG_DATA_DONATION_INFO = 'https://tidepool.org/announcing-the-tidepool-big-data-donation-project';
export const URL_DEXCOM_CONNECT_INFO = 'http://support.tidepool.org/article/73-connecting-dexcom-account-to-tidepool';
export const URL_UPLOADER_DOWNLOAD_PAGE = 'https://tidepool.org/products/tidepool-uploader/'

export const TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL = 'bigdata@tidepool.org';

export const DATA_DONATION_NONPROFITS = () => [
  { value: 'AADE', label: t('AADE Foundation') },
  { value: 'BT1', label: t('Beyond Type 1') },
  { value: 'CARBDM', label: t('CarbDM') },
  { value: 'CWD', label: t('Children with Diabetes') },
  { value: 'CDN', label: t('College Diabetes Network') },
  { value: 'DYF', label: t('Diabetes Youth Families (DYF)') },
  { value: 'DIABETESSISTERS', label: t('DiabetesSisters') },
  { value: 'DIATRIBE', label: t('The diaTribe Foundation') },
  { value: 'JDRF', label: t('JDRF') },
  { value: 'NSF', label: t('Nightscout Foundation') },
  { value: 'T1DX', label: t('T1D Exchange') },
];

export const DIABETES_TYPES = () => [
  { value: 'type1', label: t('Type 1') },
  { value: 'type2', label: t('Type 2') },
  { value: 'gestational', label: t('Gestational') },
  { value: 'prediabetes', label: t('Pre-diabetes') },
  { value: 'lada', label: t('LADA (Type 1.5)') },
  { value: 'other', label: t('Other') },
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
];

export const MGDL_UNITS = t('mg/dL');
export const MMOLL_UNITS = t('mmol/L');
export const MGDL_PER_MMOLL = 18.01559;
