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

module.exports = schema(
  common,
  {
    basalSchedules: schema().array(
      schema(
        {
          name: schema().string().minLength(1),
          value: schema().array(
            schema(
              {
                rate: schema().number().min(0),
                start: schema().number().min(0).max(86400000)
              }
            )
          )
        }
      )
    ),
    bgTarget: schema().array(schema().oneOf(
      schema(
          {
            low: schema().number(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().banned()
          }
        ),
      schema(
          {
            low: schema().number(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        ),
      schema(
          {
            low: schema().banned(),
            high: schema().banned(),
            range: schema().number(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        ),
      schema(
          {
            low: schema().banned(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        )
      )
    ),
    carbRatio: schema().array(
      schema(
        {
          amount: schema().number().min(0),
          start: schema().number().min(0).max(86400000)
        }
      )
    ),
    deviceTime: schema().ifExists().isDeviceTime(),
    insulinSensitivity: schema().array(
      schema(
        {
          amount: schema().number().min(0),
          start: schema().number().min(0).max(86400000)
        }
      )
    )
  }
);