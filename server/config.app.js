/**
 * Copyright (c) 2020, Diabeloop
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
 */
/* eslint-disable lodash/prefer-lodash-typecheck */

function booleanFromText(value, defaultValue) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return !!defaultValue;
}

function integerFromText(value, defaultValue) {
  let intValue = 0;
  if (typeof value === 'number') {
    intValue = value;
  } else {
    intValue = parseInt(value, 10);
  }
  if (Number.isNaN(intValue)) {
    if (typeof(defaultValue) === 'number' && !Number.isNaN(defaultValue)) {
      intValue = defaultValue;
    } else {
      intValue = 0;
    }
  }
  return intValue;
}

/**
 *
 * @param {string | undefined} value env var value
 * @param {string} defaultValue returned value if value is undefined
 * @returns {string}
 */
function stringOption(value, defaultValue) {
  if (typeof value === 'string' && value !== 'disabled') {
    return value;
  }
  return defaultValue;
}

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');
const config = {
  VERSION: stringOption(process.env.APP_VERSION, '0.1.0'),
  UPLOAD_API: stringOption(process.env.UPLOAD_API, 'https://tidepool.org/uploader'),
  API_HOST: stringOption(process.env.API_HOST, null),
  LATEST_TERMS: stringOption(process.env.LATEST_TERMS, '1970-01-01'),
  PASSWORD_MIN_LENGTH: integerFromText(process.env.PASSWORD_MIN_LENGTH, 8),
  PASSWORD_MAX_LENGTH: integerFromText(process.env.PASSWORD_MAX_LENGTH, 72),
  ABOUT_MAX_LENGTH: integerFromText(process.env.ABOUT_MAX_LENGTH, 256),
  I18N_ENABLED: booleanFromText(process.env.I18N_ENABLED, false),
  ALLOW_SIGNUP_PATIENT: booleanFromText(process.env.ALLOW_SIGNUP_PATIENT, true),
  ALLOW_PATIENT_CHANGE_EMAIL: booleanFromText(process.env.ALLOW_PATIENT_CHANGE_EMAIL, true),
  ALLOW_PATIENT_CHANGE_PASSWORD: booleanFromText(process.env.ALLOW_PATIENT_CHANGE_PASSWORD, true),
  CAN_SEE_PWD_LOGIN: booleanFromText(process.env.CAN_SEE_PWD_LOGIN, false),
  SUPPORT_EMAIL_ADDRESS: stringOption(process.env.SUPPORT_EMAIL_ADDRESS, 'support@example.com'),
  SUPPORT_WEB_ADDRESS: stringOption(process.env.SUPPORT_WEB_ADDRESS, 'https://example.com/'),
  HELP_LINK: stringOption(process.env.HELP_LINK, null),
  ASSETS_URL: stringOption(process.env.ASSETS_URL, 'https://example.com/'),
  HIDE_DONATE: booleanFromText(process.env.HIDE_DONATE, false),
  HIDE_DEXCOM_BANNER: booleanFromText(process.env.HIDE_DEXCOM_BANNER, false),
  HIDE_UPLOAD_LINK: booleanFromText(process.env.HIDE_UPLOAD_LINK, false),
  BRANDING: stringOption(process.env.BRANDING, 'tidepool'),
  METRICS_SERVICE: stringOption(process.env.METRICS_SERVICE, 'disabled'),
  MAX_FAILED_LOGIN_ATTEMPTS: integerFromText(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 5),
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT: integerFromText(process.env.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT, 10),
  DEV: isDev || isTest,
  TEST: isTest,
};

module.exports = config;
