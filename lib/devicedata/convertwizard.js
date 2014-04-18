// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var Rx = (typeof window !== 'undefined' && typeof window.Rx !== 'undefined') ? window.Rx : require('rx');

function carbsFromWizard(datum) {
  if (datum.type === 'wizard') {
    return [
      datum,
      {
        _id: datum._id + 'carbs',
        type: 'carbs',
        deviceTime: datum.deviceTime,
        value: datum.payload.carbInput,
        units: datum.payload.carbUnits,
        deviceId: datum.deviceId,
        annotations: [{ code: 'generated-from-wizard' }].concat(datum.annotations || [])
      }
    ];
  }
  else {
    return [datum];
  }
}

if (Rx.Observable.prototype.tidepoolConvertWizard == null) {
  Rx.Observable.prototype.tidepoolConvertWizard = function () {
    return this.flatMap(function(e) {
      return Rx.Observable.fromArray(carbsFromWizard(e));
    });
  };
}

module.exports = function(eventStream) {
  return eventStream.tidepoolConvertWizard();
};
