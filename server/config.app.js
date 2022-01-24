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
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return Boolean(defaultValue);
}

function integerFromText(value, defaultValue) {
  let intValue = 0;
  if (typeof value === "number") {
    intValue = value;
  } else {
    intValue = Number.parseInt(value, 10);
  }
  if (Number.isNaN(intValue)) {
    if (typeof(defaultValue) === "number" && !Number.isNaN(defaultValue)) {
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
 * @param {string | null} defaultValue returned value if value is undefined
 * @returns {string | null}
 */
function stringOption(value, defaultValue) {
  if (typeof value === "string" && value !== "disabled") {
    return value;
  }
  return defaultValue;
}

const isDev = (process.env.NODE_ENV === "development");
const isTest = (process.env.NODE_ENV === "test");
const config = {
  TARGET_ENVIRONMENT: stringOption(process.env.TARGET_ENVIRONMENT, "dev"),
  DOMAIN_NAME: stringOption(process.env.DOMAIN_NAME, "www.preview.your-loops.dev"),
  ALLOW_SEARCH_ENGINE_ROBOTS: booleanFromText(process.env.ALLOW_SEARCH_ENGINE_ROBOTS, false),
  VERSION: stringOption(process.env.APP_VERSION, "0.1.0"),
  API_HOST: stringOption(process.env.API_HOST, null),
  LATEST_TERMS: stringOption(process.env.LATEST_TERMS, "1970-01-01"),
  PWD_MIN_LENGTH: integerFromText(process.env.PWD_MIN_LENGTH, 8),
  PWD_MAX_LENGTH: integerFromText(process.env.PWD_MAX_LENGTH, 72),
  ABOUT_MAX_LENGTH: integerFromText(process.env.ABOUT_MAX_LENGTH, 256),
  SUPPORT_WEB_ADDRESS: stringOption(process.env.SUPPORT_WEB_ADDRESS, "https://example.com/"),
  HELP_SCRIPT_URL: stringOption(process.env.HELP_SCRIPT_URL, null),
  HELP_PAGE_URL: stringOption(process.env.HELP_PAGE_URL, null),
  ASSETS_URL: stringOption(process.env.ASSETS_URL, "https://example.com/"),
  BRANDING: stringOption(process.env.BRANDING, "diabeloop/blue"),
  METRICS_SERVICE: stringOption(process.env.METRICS_SERVICE, "disabled"),
  STONLY_WID: stringOption(process.env.STONLY_WID, "disabled"),
  MAX_FAILED_LOGIN_ATTEMPTS: integerFromText(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 5),
  DELAY_BEFORE_NEXT_LOGIN_ATTEMPT: integerFromText(process.env.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT, 10),
  COOKIE_BANNER_CLIENT_ID: stringOption(process.env.COOKIE_BANNER_CLIENT_ID, "disabled"),
  YLP820_BASAL_TIME: integerFromText(process.env.YLP820_BASAL_TIME, 5000),
  SESSION_TIMEOUT: integerFromText(process.env.SESSION_TIMEOUT, 30 * 60 * 1000), // default: 30min
  DEV: isDev || isTest,
  TEST: isTest,
};

module.exports = config;
