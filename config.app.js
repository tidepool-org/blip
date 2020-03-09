/**
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
 */

/* global __DEV__ */
/* global __UPLOAD_API__ */
/* global __API_HOST__ */
/* global __INVITE_KEY__ */
/* global __LATEST_TERMS__ */
/* global __PASSWORD_MIN_LENGTH__ */
/* global __PASSWORD_MAX_LENGTH__ */
/* global __ABOUT_MAX_LENGTH__ */
/* global __I18N_ENABLED__ */
/* global __ALLOW_SIGNUP_PATIENT__ */
/* global __ALLOW_PATIENT_CHANGE_EMAIL__ */
/* global __ALLOW_PATIENT_CHANGE_PASSWORD__ */
/* global __CAN_SEE_PWD_LOGIN__ */
/* global __HELP_LINK__ */
/* global __ASSETS_URL__ */
/* global __HIDE_UPLOAD_LINK__ */
/* global __MAX_FAILED_LOGIN_ATTEMPTS__ */
/* global __DELAY_BEFORE_NEXT_LOGIN_ATTEMPT__ */

const pkg = require('./package.json');

function booleanFromText(value, defaultValue) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return defaultValue || false;
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

const config = {
  VERSION: pkg.version,
  UPLOAD_API: __UPLOAD_API__ || 'https://tidepool.org/uploader',
  API_HOST: __API_HOST__ || `${window.location.protocol}//${window.location.host}`,
  INVITE_KEY: __INVITE_KEY__ || '',
  LATEST_TERMS: __LATEST_TERMS__ || null,
  PASSWORD_MIN_LENGTH: integerFromText(__PASSWORD_MIN_LENGTH__, 8),
  PASSWORD_MAX_LENGTH: integerFromText(__PASSWORD_MAX_LENGTH__, 72),
  ABOUT_MAX_LENGTH: integerFromText(__ABOUT_MAX_LENGTH__, 256),
  I18N_ENABLED: booleanFromText(__I18N_ENABLED__, false),
  ALLOW_SIGNUP_PATIENT: booleanFromText(__ALLOW_SIGNUP_PATIENT__, true),
  ALLOW_PATIENT_CHANGE_EMAIL: booleanFromText(__ALLOW_PATIENT_CHANGE_EMAIL__, true),
  ALLOW_PATIENT_CHANGE_PASSWORD: booleanFromText(__ALLOW_PATIENT_CHANGE_PASSWORD__, true),
  CAN_SEE_PWD_LOGIN: booleanFromText(__CAN_SEE_PWD_LOGIN__, true),
  HELP_LINK: __HELP_LINK__ || null,
  ASSETS_URL: __ASSETS_URL__ || null,
  HIDE_DONATE: booleanFromText(__HIDE_DONATE__ , false),
  HIDE_DEXCOM_BANNER: booleanFromText(__HIDE_DEXCOM_BANNER__ , false),
  HIDE_UPLOAD_LINK: booleanFromText(__HIDE_UPLOAD_LINK__, false),
  BRANDING: __BRANDING__ || 'tidepool',
  MAX_FAILED_LOGIN_ATTEMPTS: integerFromText(__MAX_FAILED_LOGIN_ATTEMPTS__, 5),
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT: integerFromText(__DELAY_BEFORE_NEXT_LOGIN_ATTEMPT__, 10),
}

if (__DEV__) {
  window.config = config;
}

// the constants below are defined in webpack.config.js -- they're aliases for
// environment variables.
module.exports = config;
