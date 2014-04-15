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

var keysForEquality = ['type', 'deliveryType', 'value', 'percent', 'deviceId', 'scheduleName', 'source', 'link'];

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

  function addLinkFn(e) {
    return function(event) {
      event.link = e.id;
      return event;
    }
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

      var lastActual = actuals.peek();
      if (lastActual == null) {
        addToActuals(e);
        return;
      }

      switch(e.deliveryType) {
        case 'scheduled':
          switch(lastActual.deliveryType) {
            case 'scheduled':
              if (lastActual.end <= e.start) {
                // No overlap!
                addToActuals(e).map(addLinkFn(e)).forEach(addToUndelivered);
              } else {
                // scheduled overlapping a scheduled, this is known to happen when a patient used multiple
                // pumps at the exact same time.  Which is rare, to say the least.  We want to just eliminate
                // both data points and act like we know nothing when this happens
                overlaps.push(e);
                overlaps.push(actuals.pop());
                return;
              }
              break;
            case 'temp':
              // A scheduled is potentially overlapping a temp, figure out what's going on.
              if (lastActual.end <= e.start) {
                // No overlap, yay!
                addToActuals(e).map(addLinkFn(e)).forEach(addToUndelivered);
              } else /*if (e.end <= lastActual.end)*/ {
                // The scheduled is completely obliterated by the temp.  In this case, what we actually want
                // to do is chunk up the temp into invididual chunks to line up with the scheduled.
                // We accomplish this by
                // 1. Add the scheduled to the actuals timeline, this will return the temp matching our scheduled.
                // 2. Adjust the returned temp's value if it is a percent temp.
                // 3. Push it back in, this will return the scheduled that we originally put in.
                // 4. Push the scheduled into the undelivereds
                var arrayWithTemp = addToActuals(e);
                if (arrayWithTemp.length !== 1) {
                  if (arrayWithTemp.length > 1) {
                    // This is a very special case indeed.  If a patient uses 2 pumps at the same time, and
                    // they have a temp basal that overrides a long chunk of schedules, it is possible that
                    // one of those scheduleds overlaps another scheduled that was already overlapped by the
                    // temp.  So, we make sure that all of the excess events are scheduleds, and if they are
                    // we assume that is why we are here.  If they aren't, we got other problems.  The proper
                    // thing to do in this case is to throw away these events, which is what the code will
                    // naturally do
                    while (arrayWithTemp.length > 1) {
                      var element = arrayWithTemp.pop();
                      if (element.deliveryType !== 'scheduled') {
                        log('Expected these events to be scheduled, one wasn\'t', element, e);
                        throw new Error('Expected these events to be scheduled, one wasn\'t');
                      } else {
                        overlaps.push(element);
                      }
                    }
                  } else {
                    log('Should\'ve gotten just the chunked temp, didn\'t.', arrayWithTemp, e);
                    throw new Error('Should\'ve gotten just the chunked temp, didn\'t.');
                  }
                }

                var tempMatchingScheduled = arrayWithTemp[0];
                var tempPercent = tempMatchingScheduled.percent;
                if (tempPercent != null) {
                  tempMatchingScheduled = _.assign({}, tempMatchingScheduled, {value: e.value * tempPercent});
                }

                var arrayWithOriginalScheduled = addToActuals(tempMatchingScheduled);
                if (arrayWithOriginalScheduled.length !== 1) {
                  throw new Error('Should\'ve gotten just the original scheduled, didn\'t.', arrayWithOriginalScheduled);
                }

                var theUndelivered = _.clone(arrayWithOriginalScheduled[0]);
                theUndelivered.link = tempMatchingScheduled.id;
                addToUndelivered(theUndelivered);
              }
              break;
            default:
              log('W-T-F, this should never happen, moving on.', e, lastActual);
          }
          break;
        case 'temp':
          var eventToAdd = e;
          if (eventToAdd.percent != null) {
            eventToAdd = _.assign({}, e, {value: e.percent * lastActual.value});
          }
          addToActuals(eventToAdd).map(addLinkFn(eventToAdd)).forEach(addToUndelivered);
          break;
        default:
          log('Unknown deliveryType, ignoring', e);
      }
    }
  }

  data.forEach(processElement);

  log(overlaps.length, 'instances of scheduled overlapping a scheduled.');
  if (overlaps.length > 0) {
    log('First example', overlaps[0], overlaps[1]);
  }

  var actual = actuals.getArray();
  var undelivered = {};
  Object.keys(undelivereds).forEach(function(key){
    undelivered[key] = undelivereds[key].getArray();
  });
  return new SegmentUtil(actual, undelivered);
};
