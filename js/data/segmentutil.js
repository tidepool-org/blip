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

var _ = require('lodash');
var log = require('bows')('SegmentUtil');

var Timeline = require('./util/timeline.js');

var keysForEquality = ['type', 'deliveryType', 'value', 'percent', 'deviceId', 'scheduleName', 'source', 'link'];
function eventsSmooshable(lhs, rhs) {
  return _.isEqual(_.pick(lhs, keysForEquality), _.pick(rhs, keysForEquality));
}

var eventPriority = ['temp', 'suspend'];

function SegmentUtil(timeline) {
  this.timeline = timeline;
}

SegmentUtil.prototype.getUndelivered = function(type) {
  var retVal = this.undelivered[type];
  return retVal == null ? [] : retVal;
};

function insertSorted(array, startIndex, e, field) {
  if (array.length === 0) {
    array.push(e);
  } else {
    var index = startIndex;

    for (; index < array.length; ++index) {
      if (array[index][field] > e[field]) {
        array.splice(index, 0, e);
        return;
      }
    }

    if (array[array.length - 1][field] <= e[field]) {
      array.push(e);
    } else {
      insertSorted(array, 0, e, field);
    }
  }
}

module.exports = function(data){
  var scheduledTimeline = new Timeline();
  var otherEvents = {};

  for (var i = 0; i < data.length; ++i) {
    var e = _.clone(data[i]);
    if (e.type === 'basal-rate-segment') {
      var deliveryType = e.deliveryType;

      if (deliveryType === 'scheduled') {
        if (e.end == null) {
          // TODO: Jana, this is the point that sets the end equal to the start when end is null.
          // TODO: Please adjust the code to add the actual end timestamp of the stream instead of e.start.
          // TODO: If you are not named Jana and you are viewing this after April 30, 2014.
          // TODO: Please just delete this TODO comment
          e.end = e.start;
        }

        var overlap = scheduledTimeline.add(e);
        if (overlap.length > 0) {
          // A scheduled overlapped a scheduled, throw away the overlap and the initial event that git inserted. It generally
          // indicates multiple pumps in concurrent operation.

          overlap.forEach(function(overlapped){
            // Allow scheduled overlaps for the same device (schedule changes)
            if (overlapped.deviceId != null && overlapped.deviceId === e.deviceId) {
              return;
            }

            // Put the overlapped back in to chunk up the thing that did the overlapping
            var inserted = scheduledTimeline.add(overlapped)[0];
            if (inserted.value === overlapped.value) {
              return;
            }

            // Next, pop the stack until we find what we just inserted, throw that way and push stuff back on
            var collateralDamage = [];
            var popped = scheduledTimeline.pop();
            while (popped != null && popped.start !== overlapped.start && popped.end !== overlapped.end) {
              collateralDamage.push(popped);
              popped = scheduledTimeline.pop();
            }

            collateralDamage.forEach(scheduledTimeline.add.bind(scheduledTimeline));
          });
        }
      } else {
        if (otherEvents[deliveryType] == null) {
          otherEvents[deliveryType] = [];
        }
        insertSorted(otherEvents[deliveryType], otherEvents[deliveryType].length, e, 'start');
      }
    }
  }

  var unsmooshed = scheduledTimeline.getArray();
  scheduledTimeline = null; // let go of the memory

  var baseTimeline = [];
  for (i = 0; i < unsmooshed.length; ++i) {
    var next = unsmooshed[i];
    if (baseTimeline.length === 0) {
      baseTimeline.push(next);
    } else {
      var last = baseTimeline[baseTimeline.length - 1];

      if (last.end === next.start && eventsSmooshable(last, next)) {
        last.end = next.end;
      } else {
        baseTimeline.push(next);
      }
    }
  }

  function addToBaseTimeline(index, e) {
    if (e.value != null) {
      baseTimeline.splice(index, 0, e);
    }
  }

  eventPriority.forEach(function(eventType){
    var otherArray = otherEvents[eventType];
    delete otherEvents[eventType];

    if (otherArray == null) {
      return;
    }

    var timelineIndex = 0;
    for (var i = 0; i < otherArray.length; ++i) {
      var e = otherArray[i];
      while (timelineIndex > 0 && baseTimeline[timelineIndex].start > e.start) {
        --timelineIndex;
      }

      while (timelineIndex < baseTimeline.length && baseTimeline[timelineIndex].end <= e.start) {
        ++timelineIndex;
      }

      if (timelineIndex >= baseTimeline.length) {
        // We're at the end of the baseTimeline, but we have more events to insert, so attach them
        // as long as the delivery value isn't determined by a percentage
        addToBaseTimeline(baseTimeline.length, e);
      } else if (baseTimeline[timelineIndex].start > e.end) {
        // The item is completely before this one.  This means that there is a gap in the data,
        // so just insert the item as long as the delivery value isn't determined by a percentage
        addToBaseTimeline(timelineIndex, e);
      } else {
        // Split based on start if needed
        var baseItem = baseTimeline[timelineIndex];
        var clone = null;
        if (e.start > baseItem.start) {
          // Current event starts after the item in the base timeline,
          // so keep the first bit of the baseTimeline in tact
          clone = _.cloneDeep(baseItem);
          baseItem.end = e.start;
          clone.start = e.start;

          ++timelineIndex;
          addToBaseTimeline(timelineIndex, clone);
          baseItem = clone;
        } else if (e.start < baseItem.start) {
          // Current event starts even before the item in the base timeline, this means there was a gap
          // and we want to inject the portion from before the item in the base timeline
          clone = _.cloneDeep(e);

          e.start = baseItem.start;
          clone.end = baseItem.start;

          addToBaseTimeline(timelineIndex, clone);
          ++timelineIndex;
        }

        // Split based on end if needed
        if (e.end > baseItem.end) {
          // The current event ends after the item in the base timeline,
          // so keep the first bit of the current event and set aside the rest to be processed later
          clone = _.cloneDeep(e);

          e.end = baseItem.end;
          clone.start = baseItem.end;

          otherArray.splice(i+1, 0, clone); // Put clone back into the array
        } else if (e.end < baseItem.end) {
          // The current event ends before the item in the base timeline,
          // so keep the last bit of the item in the base timeline in tact
          clone = _.cloneDeep(baseItem);
          baseItem.end = e.end;
          clone.start = e.end;

          addToBaseTimeline(timelineIndex + 1, clone);
        }

        // Push now-supressed base item onto its stack of "supressed"
        var overlappingItem = _.clone(e);
        overlappingItem.suppressed = baseItem.suppressed == null ? [] : baseItem.suppressed;
        delete baseItem.suppressed;
        overlappingItem.suppressed.unshift(baseItem);

        if (overlappingItem.percent != null) {
          overlappingItem.value = overlappingItem.percent * baseItem.value;
        }

        // Replace split base item with current item
        baseTimeline[timelineIndex] = overlappingItem;
      }
    }
  });

  if (Object.keys(otherEvents).length > 1) {
    log('Unhandled basal-rate-segment objects of deliveryType:', Object.keys(otherEvents));
  }
  var newIdCounter = 0;

  function attachId(e) {
    if (e.id != null) {
      e.datumId = e.id;
    }
    e.id = 'segment_' + newIdCounter++;
    return e;
  }

  for (i = 0; i < baseTimeline.length; ++i) {
    attachId(baseTimeline[i]);
  }

  return new SegmentUtil(baseTimeline);
};
