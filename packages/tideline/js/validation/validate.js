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

import _ from 'lodash';
import bows from 'bows';

import schema from './validator/schematron';
import commonSchema from './common';
import basal from './basal';
import bolus from './bolus';
import bg from './bg';
import message from './message';
import pumpSettings from './pumpSettings';
import upload from './upload';
import wizard from './wizard';

const log = bows('validate');

const getSchemas = () => {
  const common = commonSchema();
  const cbg = bg(common);
  return {
    common,
    basal: basal(common),
    bolus: bolus(common),
    cbg,
    deviceEvent: schema(common),
    food: schema(common),
    message: message(common),
    pumpSettings: pumpSettings(common),
    physicalActivity: schema(common),
    reservoirChange: schema(common),
    smbg: cbg,
    upload: upload(common),
    wizard: wizard(common),
  };
};

export function validateOne(datum, result, schemas = getSchemas()) {
  result = result || {valid: [], invalid: []};
  const handler = schemas[datum.type];
  if (!_.isFunction(handler)) {
    datum.errorMessage = `No schema defined for data.type[${datum.type}]`;
    log.error(new Error(datum.errorMessage), datum);
    result.invalid.push(datum);
  } else {
    try {
      handler(datum);
      result.valid.push(datum);
    }
    catch(e) {
      datum.errorMessage = e.message;
      result.invalid.push(datum);
    }
  }
}

export function validateAll(data) {
  const result = {valid: [], invalid: []};
  const schemas = getSchemas();
  for (let i = 0; i < data.length; ++i) {
    validateOne(data[i], result, schemas);
  }
  return result;
}
