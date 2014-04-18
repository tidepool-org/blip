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

'use strict';

var Rx = window.Rx;

var convertBasal = require('./convertbasal.js');
var convertBolus = require('./convertbolus.js');

module.exports = function (theData,cb) {
  Rx.Observable.fromArray(theData)
    .tidepoolConvertBasal()
    .tidepoolConvertBolus()
    .flatMap(function(datum) {
    if (datum.type === 'wizard') {
      return Rx.Observable.fromArray(
      [ datum,
        { _id: datum._id + 'carbs',
        type: 'carbs',
        deviceTime: datum.deviceTime,
        value: datum.payload.carbInput,
        units: datum.payload.carbUnits,
        deviceId: datum.deviceId,
        annotations: [{ code: 'generated-from-wizard' }].concat(datum.annotations || [])
        }
      ]
      );
    } else {
      return Rx.Observable.return(datum);
    }
  })
  .toArray()
  .subscribe(
    function(data) {
      window.theData = data;
      cb(null, data);
    },
    cb
  );
};
