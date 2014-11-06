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

var pkg = require('./package.json');

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
  value = parseInt(value, 10);
  if (isNaN(value)) {
    return defaultValue === undefined ? 0 : defaultValue;
  }
  return value;
}

module.exports = {
  VERSION: pkg.version,
  MOCK: booleanFromText(process.env.MOCK, false),
  MOCK_PARAMS: process.env.MOCK_PARAMS || '',
  UPLOAD_API: process.env.UPLOAD_API || 'https://devel-uploads.tidepool.io',
  API_HOST: process.env.API_HOST || 'https://devel-api.tidepool.io',
  SHOW_ACCEPT_TERMS: booleanFromText(process.env.SHOW_ACCEPT_TERMS, true),
  PASSWORD_MIN_LENGTH: integerFromText(process.env.PASSWORD_MIN_LENGTH, 8)
};
