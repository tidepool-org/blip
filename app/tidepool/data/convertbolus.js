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
/* jshint -W015 */

var util = require('util');
var Rx = window.Rx;

// Require it so that it gets registered
var selfJoin = require('../rx/selfjoin.js');

/**
 * A map of "builders".  Builders factories for handlers, which know how to handle joining a specific type of event.
 *
 * A builder is a `function()`.  It returns a handler, which is an object of two methods:
 *
 * 1. `canHandle(event)` -- returns boolean if the handler can handle the message
 * 2. `handle(event)` -- "handles" the event and returns either `null` for "not done joining" or an array of events
 * that should be emitted.  Returning an array is an indication that this handler is done handling things and should
 * be thrown away.
 */
var builders = {
  'dual/normal': function () {
    var eventBuffer = [];
    var normal = null;
    var square = null;
    return {
      completed: function() {
        return [normal, square].filter(function(e) { return e != null; }).concat(eventBuffer);
      },
      handle: function(event) {
        if (event.type !== 'bolus') {
          eventBuffer.push(event);
          return null;
        }

        switch (event.subType) {
          case 'dual/normal':
            normal = event;
            break;
          case 'dual/square':
            square = event;
            break;
          default:
            eventBuffer.push(event);
            return null;
        }

        if (normal == null || square == null) {
          return null;
        }

        if (normal.groupId !== square.groupId) {
          throw new Error(
            util.format('Mismatched joinKeys[%s][%s] at ts[%s]', normal.groupId, square.groupId, normal.deviceTime)
          );
        }

        return [
          {
            _id: normal._id,
            initialDelivery: normal.value,
            extendedDelivery: square.value,
            value: normal.value + square.value,
            deviceTime: normal.deviceTime,
            duration: square.duration,
            extended: true,
            type: 'bolus'
          }
        ].concat(eventBuffer);
      }
    };
  }
};

if (Rx.Observable.prototype.tidepoolConvertBolus == null) {
  /**
   * A function that does a self-join on the provided eventStream (an Observable) in order to join together
   * bolus records.
   *
   * The idea is basically to intercept a bolus record and if it is of a subType that needs to be joined with
   * other records, we set it aside and start buffering up all other events while we wait for the joined event
   * to be completed.  Once completed, the joined event is emitted and all buffered events are also emitted.

   * @param eventStream an Observable to have its bolus events self-joined.
   */
  Rx.Observable.prototype.tidepoolConvertBolus = function () {
    return this.tidepoolSelfJoin(
      [function(e){
        if (e.type === 'bolus') {
          var builder = builders[e.subType];
          if (builder == null) {
            return null;
          }
          return builder();
        }
      }]
    );
  };
}

module.exports = function(eventStream) {
  return eventStream.tidepoolConvertBolus();
};