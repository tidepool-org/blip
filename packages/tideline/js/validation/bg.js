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

/* jshint esversion:6 */

var common = require('./common.js');
var schema = require('./validator/schematron.js');
var { MGDL_UNITS, MMOLL_UNITS } = require('../data/util/constants');

module.exports = schema(
  common,
  {
    deviceTime: schema().ifExists().isDeviceTime(),
    units: schema().in([MGDL_UNITS, MMOLL_UNITS]),
    value: schema().number().positive(),
    localDate: schema().ifExists().isDate(),
    localDayOfWeek: schema().ifExists().in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  }
);
