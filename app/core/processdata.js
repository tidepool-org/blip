/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

/* global onmessage */

import _ from 'lodash';
import * as sync from '../redux/actions/sync';

// TODO: replace with the utility in viz which this is copied directly from!
function getTimezoneFromTimePrefs(timePrefs) {
  const { timezoneAware, timezoneName } = timePrefs;
  let timezone = 'UTC';
  if (timezoneAware) {
    timezone = timezoneName || 'UTC';
  }
  return timezone;
}

function toHammertime(d) {
  return {
    rawDisplayTimeMs: Date.parse(d.deviceTime + '.000Z'),
    hammertime: Date.parse(d.time),
  }
}

function cloneAndTransform(d) {
  return _.pick(
    Object.assign({}, d, toHammertime(d)),
    ['rawDisplayTimeMs', 'id', 'type', 'hammertime', 'value']
  );
}

onerror = (e) => {
  console.log('Web Worker ERRORED:', e.message);
  // TODO: figure out why this message isn't posting!
  postMessage(
    sync.workerProcessDataFailure(e.message)
  );
}

onmessage = ({ data: action }) => {
  const { data, timePrefs, userId } = action.payload;

  const tz = getTimezoneFromTimePrefs(timePrefs);

  const newData = data.map((d) => (cloneAndTransform(d)));
  postMessage(
    sync.workerProcessDataSuccess(userId, newData)
  );
}