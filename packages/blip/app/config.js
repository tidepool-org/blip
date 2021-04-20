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

import _ from 'lodash';

const DUMMY_DOMAIN = 'example.com';
const DUMMY_URL = `https://${DUMMY_DOMAIN}/`;

const defaultConfig = {
  VERSION: '0.0.0',
  UPLOAD_API: 'https://tidepool.org/uploader',
  API_HOST: `${window.location.protocol}//${window.location.host}`,
  LATEST_TERMS: '1970-01-01',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
  ABOUT_MAX_LENGTH: 256,
  SUPPORT_WEB_ADDRESS: DUMMY_URL,
  HELP_SCRIPT_URL: null,
  HELP_PAGE_URL: null,
  ASSETS_URL: DUMMY_URL,
  BRANDING: 'tidepool',
  METRICS_SERVICE: 'disabled',
  METRICS_FORCED: false,
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT: 10,
  DEV: true,
  TEST: false,
};

/** @typedef {typeof defaultConfig} AppConfig */

/** @type {AppConfig} */
// @ts-ignore
const appConfig = _.clone(defaultConfig);

/**
 *
 * @param {AppConfig} newConfig The new config to use
 * @returns {AppConfig} The updated config
 */
function updateConfig(newConfig) {
  _.assign(appConfig, newConfig);
  return appConfig;
}

export { DUMMY_URL, updateConfig };
export default appConfig;
