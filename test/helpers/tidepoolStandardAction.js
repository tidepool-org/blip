/**
 * Copyright (c) 2016, Tidepool Project
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

const allowedKeys = ['type', 'error', 'payload', 'meta'];

function isAllowedKey(key) {
  return allowedKeys.indexOf(key) !== -1;
}

function isTSA(action) {
  const actionIsPlainObject = _.isPlainObject(action);

  const actionContainsOnlyAllowedKeys = _.every(
    Object.keys(action),
    function(key) { return isAllowedKey(key); }
  );

  const typeIsString = _.isString(action.type);

  // default to true since `error` is optional
  let errorIsJSError = true;
  if (action.error) {
    errorIsJSError = _.isError(action.error);
  }

  // default to true since `payload` and `meta` are optional
  let payloadIsPlainObject = true;
  if (action.payload) {
    payloadIsPlainObject = _.isPlainObject(action.payload);
  }
  let metaIsPlainObject = true;
  if (action.meta) {
    metaIsPlainObject = _.isPlainObject(action.meta);
  }

  const propertiesAreValid = typeIsString && errorIsJSError && payloadIsPlainObject && metaIsPlainObject;

  return actionIsPlainObject && actionContainsOnlyAllowedKeys && propertiesAreValid;
}

export default isTSA;
