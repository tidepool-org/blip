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

function determinePriority(e) {
  switch(e.deliveryType) {
    case 'scheduled':
      return 1;
    case 'temp':
      return 10;
    case 'suspend':
      return 100;
    default:
      return 0;
  }
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
  var undelivereds = { };
  var overlaps = [];

  function addToActuals(e) {
    if (e.start === e.end) {
      return [];
    }

    var theActual = _.extend({}, e, {vizType: 'actual'});
    return actuals.add(theActual);
  }

  function addToUndelivered(e) {
    if (undelivereds[e.deliveryType] == null) {
      undelivereds[e.deliveryType] = new Timeline(eventsSmooshable);
    }

    if (e.deliveryType === 'temp' && undelivereds.scheduled != null) {
      // If we have an undelivered temp, then that temp most likely kicked out a scheduled before.  That scheduled
      // is going to still be associated with the temp that has now been kicked out, so we need to pull it out
      // of the scheduled undelivereds and re-process it.
      var scheduledArray = undelivereds.scheduled.add(e);
      if (scheduledArray.length > 1) {
        log('Should only get one scheduled out of the undelivereds.', scheduledArray);
        scheduledArray.forEach(function(putBack){ undelivereds.scheduled.add(putBack); });
      } else if (scheduledArray.length === 1) {
        var scheduledItem = scheduledArray[0];
        scheduledItem.link = e.link;
        undelivereds.scheduled.add(scheduledItem);
      }

      while (undelivereds.scheduled.peek().deliveryType !== 'scheduled') {
        undelivereds.scheduled.pop();
      }
    }

    undelivereds[e.deliveryType].add(_.extend({}, e, {vizType: 'undelivered'}));
  }

  function addLinkFn(e) {
    return function(event) {
      event.link = e.id;
      return event;
    };
  }

  function addToActualsAndLink(e) {
    var overflow = addToActuals(e);

    var lastActual = actuals.peek();
    var addLink;
    if (lastActual.start <= e.start && lastActual.end >= e.end) {
      // The event was smooshed into the last actual, so use the last actual's id for linking
      addLink = addLinkFn(lastActual);
    } else {
      addLink = addLinkFn(e);
    }

    return overflow.map(addLink);
  }

  function processElement(e) {
    if (e.type === 'basal-rate-segment') {
      if (maxTimestamp > e.start) {
        log('Unordered data', maxTimestamp, e);
        throw new Error('Unordered data');
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

      var eventPriority = determinePriority(e);
      var incumbentPriority = determinePriority(lastActual);

      if (eventPriority === incumbentPriority) {
        if (lastActual.end <= e.start) {
          // No overlap!
          addToActualsAndLink(e).forEach(addToUndelivered);
          return;
        }

        if (e.deliveryType === 'scheduled' && lastActual.deliveryType === 'scheduled') {
          // scheduled overlapping a scheduled, this is known to happen when a patient used multiple
          // pumps at the exact same time.  Which is rare, to say the least.  We want to just eliminate
          // both data points and act like we know nothing when this happens
          overlaps.push(e);
          overlaps.push(actuals.pop());
          return;
        }
      } else if (eventPriority < incumbentPriority) {
        // For example, a scheduled is potentially overlapping a temp, figure out what's going on.
        if (lastActual.end <= e.start) {
          // No overlap, yay!
          addToActualsAndLink(e).forEach(addToUndelivered);
          return;
        }

        // The scheduled is overlapped by the temp.  In this case, what we actually want
        // to do is chunk up the temp into invididual chunks to line up with the scheduled.
        // We accomplish this by
        // 1. Add the scheduled to the actuals timeline, this will return the temp matching our scheduled.
        // 2. Adjust the returned temp's value if it specifies a percent.
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

        var adjustments = { id : tempMatchingScheduled.id + '_' + e.id, link: e.id };
        if (tempPercent != null) {
          adjustments.value = e.value * tempPercent;
        }
        tempMatchingScheduled = _.assign({}, tempMatchingScheduled, adjustments);

        var arrayWithOriginalScheduled = addToActuals(tempMatchingScheduled);
        if (arrayWithOriginalScheduled.length !== 1) {
          throw new Error('Should\'ve gotten just the original scheduled, didn\'t.', arrayWithOriginalScheduled);
        }

        var theUndelivered = _.clone(arrayWithOriginalScheduled[0]);
        theUndelivered.link = tempMatchingScheduled.id;
        addToUndelivered(theUndelivered);
        return;
      }

      var eventToAdd = e;
      if (eventToAdd.percent != null) {
        eventToAdd = _.assign({}, e, {value: e.percent * lastActual.value});
      }
      var overflow = addToActualsAndLink(eventToAdd);

      while (overflow.length > 0) {
        var event = overflow.pop();
        if (eventToAdd.id != null && eventToAdd.id === event.id) {
          // If the timeline kicks back out an event with an equivalent id as we just put in, then there
          // is another event in there that is overriding us.  We want what we just put in to win,
          // so put it back in.
          delete event.link;
          overflow = addToActualsAndLink(event).concat(overflow);
        } else {
          addToUndelivered(event);
        }
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
