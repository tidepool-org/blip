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

var moment = window.moment;
var _ = window._;
var Rx = window.Rx;

// Require it so that it gets registered
var selfJoin = require('../rx/selfjoin.js');

function isScheduledBasal(e) {
  return e.type === 'basal-rate-change' && e.deliveryType === 'scheduled';
}

function makeNewBasalHandler() {
  var segmentStart = null;
  var eventBuffer = [];
  return {
    completed: function(event) {
      return [
        _.assign(
          {},
          _.omit(segmentStart, 'deviceTime'),
          { type: 'basal-rate-segment',
            start: segmentStart.deviceTime,
            end: null,
            interval: segmentStart.deviceTime + '/' + segmentStart.deviceTime
          }
        )
      ];
    },
    handle: function (event) {
      if (! isScheduledBasal(event)) {
        eventBuffer.push(event);
        return null;
      }

      if (segmentStart == null) {
        segmentStart = event;
      } else {
        return [
          {
            _id: segmentStart._id,
            type: 'basal-rate-segment',
            start: segmentStart.deviceTime,
            end: event.deviceTime,
            interval: segmentStart.deviceTime + '/' + event.deviceTime,
            deliveryType: 'scheduled',
            scheduleName: segmentStart.scheduleName,
            value: segmentStart.value
          }
        ].concat(eventBuffer, [event]);
      }
    }
  };
}

function tempBasalMappingFn(event) {
  if (event.deliveryType !== 'temp') {
    return event;
  }

  var end = moment(event.deviceTime).add('ms', event.duration).format('YYYY-MM-DDThh:mm:ss');
  return {
    _id: event._id,
    type: 'basal-rate-segment',
    start: event.deviceTime,
    end: end,
    interval: event.deviceTime + '/' + end,
    deliveryType: 'temp',
    value: event.value
  };
}

if (Rx.Observable.prototype.tidepoolConvertBasal == null) {
  /**
   * A function that does a self-join on the provided eventStream (an Observable) in order to join together
   * basal records.

   * @param eventStream an Observable to have its bolus events self-joined.
   */
  Rx.Observable.prototype.tidepoolConvertBasal = function () {
    return this.tidepoolSelfJoin(
      [
        function(e){
          return isScheduledBasal(e) ? makeNewBasalHandler() : null;
        }
      ]
    ).map(tempBasalMappingFn);
  };
}

module.exports = function(eventStream) {
  return eventStream.tidepoolConvertBasal();
};