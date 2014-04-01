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

var _ = require('../lib/')._;
var log = require('../lib/').bows('SegmentUtil');

var Timeline = require('./util/timeline.js');

var keysForEquality = ['type', 'deliveryType', 'value', 'deviceId', 'scheduleName', 'source'];

function eventsSmooshable(lhs, rhs) {
  return _.isEqual(_.pick(lhs, keysForEquality), _.pick(rhs, keysForEquality));
}

function SegmentUtil(actual, undelivered) {
  this.actual = actual;
  this.undelivered = undelivered;
}

SegmentUtil.prototype.getUndelivered = function(type) {
  var retVal = this.undelivered[type];
  return retVal == null ? [] : retVal;
};

module.exports = function(data){
  var maxTimestamp = '0000-01-01T00:00:00';
  var actuals = new Timeline(eventsSmooshable);
  var undelivereds = {};
  var overlaps = [];

  function addToActuals(e) {
    return actuals.add(_.extend({}, e, {vizType: 'actual'}));
  }

  function addToUndelivered(e) {
    if (undelivereds[e.deliveryType] == null) {
      undelivereds[e.deliveryType] = new Timeline(eventsSmooshable);
    }
    undelivereds[e.deliveryType].add(_.extend({}, e, {vizType: 'undelivered'}));
  }

  function processElement(e) {
    if (e.deliveryType === 'temp' || e.deliveryType === 'scheduled') {
      if (maxTimestamp > e.start) {
        throw new Error('Unordered data, maxTimestamp[%s]', maxTimestamp, e);
      } else {
        maxTimestamp = e.start;
      }

      if (e.start != null && e.end == null) {
        // TODO: Jana, this is the point that sets the end equal to the start when end is null.
        // TODO: Please adjust the code to add the actual end timestamp of the stream instead of e.start.
        // TODO: If you are not named Jana and you are viewing this after April 30, 2014.
        // TODO: Please just delete this TODO comment
        e.end = e.start;
      }

      switch(e.deliveryType) {
        case 'scheduled':
          var lastActual = actuals.peek();
          if (lastActual == null) {
            addToActuals(e);
            return;
          }

          switch(lastActual.deliveryType) {
            case 'scheduled':
              if (lastActual.end <= e.start) {
                // No overlap!
                addToActuals(e).forEach(addToUndelivered);
              } else {
                // scheduled overlapping a scheduled, this is know to happen when a patient used multiple
                // pumps at the exact same time.  Which is rare, to say the least.
                return;
              }
              break;
            case 'temp':
              // A scheduled is potentially overlapping a temp, figure out what's going on.
              if (lastActual.end <= e.start) {
                // No overlap, yay!
                addToActuals(e).forEach(addToUndelivered);
              } else if (e.end <= lastActual.end) {
                // The scheduled is completely obliterated by the temp
                addToUndelivered(_.clone(e));
              } else {
                // There is overlap, the temp-covered portion goes directly to undelivered, the rest to actuals
                addToUndelivered(_.assign({}, e, { end: lastActual.end }));
                addToActuals(_.assign({}, e, { deviceTime: lastActual.end, start: lastActual.end })).forEach(addToUndelivered);
              }
              break;
            default:
              log('W-T-F, this should never happen, moving on.', e, lastActual);
          }
          break;
        case 'temp':
          addToActuals(e).forEach(addToUndelivered);
          break;
        default:
          log('Unknown deliveryType, ignoring', e);
      }
    }
  }

  data.forEach(processElement);

  log(overlaps.length, 'instances of scheduled overlapping a scheduled.');
  if (overlaps.length > 0) {
    log('First example', overlaps[0][0], overlaps[0][1]);
  }

  var actual = actuals.getArray();
  var undelivered = {};
  Object.keys(undelivereds).forEach(function(key){
    undelivered[key] = undelivereds[key].getArray();
  });
  return new SegmentUtil(actual, undelivered);
};
