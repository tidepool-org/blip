/**
 * Copyright (c) 2020, Diabeloop
 * Yourloops API client
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

declare const BUILD_CONFIG: string;

export interface AppConfig {
  VERSION: string;
  API_HOST: string;
  BRANDING: string;
  DEV: boolean;
  TEST: boolean;
  LATEST_TERMS?: string;
  PASSWORD_MIN_LENGTH?: number;
  PASSWORD_MAX_LENGTH?: number;
  ABOUT_MAX_LENGTH?: number;
  ALLOW_SIGNUP_PATIENT?: boolean;
  ALLOW_PATIENT_CHANGE_EMAIL?: boolean;
  ALLOW_PATIENT_CHANGE_PASSWORD?: boolean;
  CAN_SEE_PWD_LOGIN?: boolean;
  SUPPORT_EMAIL_ADDRESS?: string;
  SUPPORT_WEB_ADDRESS?: string;
  REGULATORY_WEB_ADDRESS?: string;
  HELP_LINK?: string | null; // TODO ++++++++++++++++++++++
  ASSETS_URL?: string | null;
  METRICS_SERVICE?: string | null;
  MAX_FAILED_LOGIN_ATTEMPTS?: number;
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT?: number;
  TERMS_PRIVACY_DATE?: string;
}

const DUMMY_DOMAIN = 'example.com';
const DUMMY_URL = `https://${DUMMY_DOMAIN}/`;

const defaultConfig: AppConfig = {
  VERSION: '0.0.0',
  API_HOST: `${window.location.protocol}//${window.location.hostname}:8009`,
  LATEST_TERMS: '1970-01-01',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
  ABOUT_MAX_LENGTH: 256,
  ALLOW_SIGNUP_PATIENT: false,
  ALLOW_PATIENT_CHANGE_EMAIL: false,
  ALLOW_PATIENT_CHANGE_PASSWORD: false,
  CAN_SEE_PWD_LOGIN: true,
  SUPPORT_EMAIL_ADDRESS: `support@${DUMMY_DOMAIN}`,
  SUPPORT_WEB_ADDRESS: DUMMY_URL,
  REGULATORY_WEB_ADDRESS: DUMMY_URL,
  HELP_LINK: null,
  ASSETS_URL: DUMMY_URL,
  BRANDING: 'diabeloop',
  METRICS_SERVICE: 'disabled',
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT: 10,
  TERMS_PRIVACY_DATE: '',
  DEV: true,
  TEST: false,
};
const appConfig = _.assign({}, defaultConfig);
if (_.has(window, 'config') && _.isObjectLike(_.get(window, 'config', null))) {
  const runConfig = _.get(window, 'config', null);
  _.assign(appConfig, runConfig);
} else {
  console.warn('Config not found, using build configuration');

  /** @type {defaultConfig} */
  const buildConfig = JSON.parse(BUILD_CONFIG);
  _.assign(appConfig, buildConfig);
}

_.defaults(appConfig, defaultConfig);

if (!_.isString(appConfig.API_HOST)) {
  appConfig.API_HOST = defaultConfig.API_HOST;
}

_.set(window, 'config', appConfig);

export { DUMMY_URL };
export default appConfig;
