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
  return e.type === 'basal' && e.deliveryType === 'scheduled';
}

function makeNewBasalHandler() {
  var segmentStart = null;
  var eventBuffer = [];

  function makeSegment(event) {
    return _.assign(
      {},
      segmentStart,
      {
        type: 'basal-rate-segment',
        start: segmentStart.deviceTime,
        end: event == null ? null : event.deviceTime
      }
    );
  }

  return {
    completed: function() {
      return [makeSegment()].concat(eventBuffer);
    },
    handle: function (event) {
      if (! isScheduledBasal(event)) {
        eventBuffer.push(event);
        return null;
      }

      if (segmentStart == null) {
        segmentStart = event;
      } else if (segmentStart.deviceId !== event.deviceId) {
        eventBuffer.push(event);
        return null;
      } else {
        return [makeSegment(event)].concat(eventBuffer, [event]);
      }
    }
  };
}

function tempBasalMappingFn(event) {
  if (event.deliveryType !== 'temp') {
    return event;
  }

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
    ).tidepoolSelfJoin(
      [
        function(event) {
          if (! (event.type === 'basal' && event.deliveryType === 'temp')) {
            return null;
          }

          var temp = null;
          var eventBuffer = [];
          return {
            handle: function(e) {
              if (temp == null) {
                temp = _.assign({}, e, {
                  type: 'basal-rate-segment',
                  start: e.deviceTime,
                  end: moment(e.deviceTime).add('ms', e.duration).format('YYYY-MM-DDThh:mm:ss')
                });
                return null;
              }

              if (e.type === 'basal') {
                if (temp.end < e.deviceTime) {
                  // Exceeded the length of the temp, so just return
                  return [temp].concat(eventBuffer).concat([e]);
                } else if (e.deliveryType === 'temp-stop' && e.tempId === temp.id) {
                  // We have a canceled temp basal
                  temp.end = e.deviceTime;
                  return [temp].concat(eventBuffer);
                }
              }

              eventBuffer.push(e);
              return null;
            },
            completed: function() {
              return [temp].concat(eventBuffer);
            }
          };
        }
      ]);
  };
}

module.exports = function(eventStream) {
  return eventStream.tidepoolConvertBasal();
};