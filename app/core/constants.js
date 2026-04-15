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

import { map } from 'lodash';
import i18next from './language';

const t = i18next.t.bind(i18next);

export const URL_UPLOADER_CHROME_STORE = 'http://chrome.google.com/webstore/detail/tidepool-uploader/cabklgajffclbljkhmjphejemhpbghfb';
export const URL_TIDEPOOL_MOBILE_APP_STORE = 'https://itunes.apple.com/us/app/tidepool-mobile/id1026395200?mt=8';
export const URL_TERMS_OF_USE = 'https://tidepool.org/terms-of-use';
export const URL_PRIVACY_POLICY = 'https://tidepool.org/privacy-policy';
export const URL_BIG_DATA_DONATION_INFO = 'https://tidepool.org/blog/announcing-the-tidepool-big-data-donation-project';
export const URL_UPLOADER_DOWNLOAD_PAGE = 'https://tidepool.org/products/tidepool-uploader/';
export const URL_SHARE_DATA_INFO = 'https://support.tidepool.org/hc/en-us/articles/360029684951-Share-your-Data';
export const URL_TIDEPOOL_PLUS_PLANS = 'https://tidepool.org/providers/tidepoolplus/plans';
export const URL_TIDEPOOL_PLUS_CONTACT_SALES = 'https://app.cronofy.com/add_to_calendar/scheduling/-hq0nDA6';
export const URL_TIDEPOOL_EXTERNAL_DATA_CONNECTIONS = 'https://support.tidepool.org/hc/en-us/articles/34686287140884';

export const TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL = 'bigdata@tidepool.org';
export const DATA_DONATION_CONSENT_TYPE = 'big_data_donation_project';

export const SUPPORTED_ORGANIZATIONS_OPTIONS = map([
  'ADCES Foundation',
  'Beyond Type 1',
  'Breakthrough T1D',
  'Children With Diabetes',
  'DiabetesSisters',
  'Diabetes Youth Families (DYF)',
  'The Diabetes Link',
  'The diaTribe Foundation',
], (name) => ({ value: name, label: t(name) }));

export const DIABETES_TYPES = () => [
  { value: 'type1', label: t('Type 1') },
  { value: 'type2', label: t('Type 2') },
  { value: 'type3c', label: t('Type 3c') },
  { value: 'gestational', label: t('Gestational') },
  { value: 'prediabetes', label: t('Pre-diabetes') },
  { value: 'lada', label: t('LADA (Type 1.5)') },
  { value: 'mody', label: t('MODY/Monogenic') },
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
  'insulin',
  'wizard',
  'food',
];

export const ALL_FETCHED_DATA_TYPES = [
  ...DIABETES_DATA_TYPES,
  'cgmSettings',
  'deviceEvent',
  'dosingDecision',
  'physicalActivity',
  'pumpSettings',
  'reportedState',
  'upload',
  'water',
];

export const MGDL_UNITS = t('mg/dL');
export const MMOLL_UNITS = t('mmol/L');
export const MGDL_PER_MMOLL = 18.01559;

export const MS_IN_DAY = 864e5;
export const MS_IN_HOUR = 864e5 / 24;
export const MS_IN_MIN = MS_IN_HOUR / 60;

export const LBS_PER_KG = 2.2046226218;

export const DEFAULT_CLINIC_TIER = 'tier0100';
export const DEFAULT_CLINIC_PATIENT_COUNT_HARD_LIMIT = 250;
export const CLINIC_REMAINING_PATIENTS_WARNING_THRESHOLD = 40;

export const DEFAULT_CGM_SAMPLE_INTERVAL = 5 * MS_IN_MIN;
export const DEFAULT_CGM_SAMPLE_INTERVAL_RANGE = [DEFAULT_CGM_SAMPLE_INTERVAL, Infinity];
export const ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE = [MS_IN_MIN, MS_IN_MIN];
