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

var common = require('./common.js');
var schema = require('./validator/schematron.js');

var bolusCommon = schema(
  {
    deviceTime: schema().ifExists().isDeviceTime(),
  }
);

module.exports = schema(schema().oneOf(
  schema(
      common,
      bolusCommon,
      {
        normal: schema().number().min(0),
        expectedNormal: schema().ifExists().number().min(0),
        duration: schema().banned(),
        extended: schema().banned(),
        expectedExtended: schema().banned(),
        subType: schema().string().in(['normal'])
      },
      schema.with('expectedNormal', 'normal')
    ),
  schema(
      common,
      bolusCommon,
      {
        duration: schema().number().min(0),
        expectedDuration: schema().ifExists().number().min(0),
        extended: schema().number().min(0),
        expectedExtended: schema().ifExists().number().min(0),
        normal: schema().ifExists().number().min(0),
        expectedNormal: schema().ifExists().number().min(0),
        subType: schema().string().in(['square', 'dual/square'])
      },
      schema.with('expectedNormal', 'normal'),
      schema.with('expectedExtended', ['extended', 'duration', 'expectedDuration'])
    ),
  schema(
      common,
      bolusCommon,
      {
        normal: schema().number().min(0),
        subType: schema().string().in(['pen'])
      }
    ),
  schema(
      common,
      bolusCommon,
      {
        normal: schema().number().min(0),
        expectedNormal: schema().ifExists().number().min(0),
        subType: schema().string().in(['biphasic'])
      },
      schema.with('expectedNormal', 'normal')
    )
  )
);