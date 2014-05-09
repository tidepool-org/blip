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

var eventPriority = ['temp', 'suspend'];

function SegmentUtil(actual, undelivered) {
  this.actual = actual;
  this.undelivered = undelivered;
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
  var scheduledTimeline = new Timeline(eventsSmooshable);
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

        if (scheduledTimeline.add(e).length > 0) {
          // A scheduled overlapped a scheduled, throw things away when this happens.  It generally
          // indicates multiple pumps in concurrent operation.
          scheduledTimeline.pop();
        }
      } else {
        if (otherEvents[deliveryType] == null) {
          otherEvents[deliveryType] = [];
        }
        insertSorted(otherEvents[deliveryType], otherEvents[deliveryType].length, e, 'start');
      }
    }
  }

  var baseTimeline = scheduledTimeline.getArray();
  scheduledTimeline = null; // let go of the memory

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
        if (e.percent == null) {
          baseTimeline.push(e);
        }
      } else if (baseTimeline[timelineIndex].start > e.end) {
        // The item is completely before this one.  This means that there is a gap in the data,
        // so just insert the item as long as the delivery value isn't determined by a percentage
        if (e.percent == null) {
          baseTimeline.splice(timelineIndex, 0, e);
        }
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
          baseTimeline.splice(timelineIndex, 0, clone);
          baseItem = clone;
        } else if (e.start < baseItem.start) {
          // Current event starts even before the item in the base timeline, this means there was a gap
          // and we want to inject the portion from before the item in the base timeline
          clone = _.cloneDeep(e);

          e.start = baseItem.start;
          clone.end = baseItem.start;

          baseTimeline.splice(timelineIndex, 0, clone);
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

          baseTimeline.splice(timelineIndex + 1, 0, clone);
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

  var actuals = new Array(baseTimeline.length);
  var undelivered = {};

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
    baseTimeline[i].vizType = 'actual';
  }

  for (i = 0; i < baseTimeline.length; ++i) {
    if (baseTimeline[i].suppressed != null) {
      for (var j = 0; j < baseTimeline[i].suppressed.length; ++j) {
        var theUn = baseTimeline[i].suppressed[j];
        attachId(theUn);
        theUn.link = baseTimeline[i].id;
        theUn.start = baseTimeline[i].start;
        theUn.end = baseTimeline[i].end;
        theUn.vizType = 'undelivered';

        if (undelivered[theUn.deliveryType] == null) {
          undelivered[theUn.deliveryType] = [];
        }
        undelivered[theUn.deliveryType].push(theUn);
      }
    }

    delete baseTimeline[i].suppressed;
    actuals[i] = baseTimeline[i];
  }

  return new SegmentUtil(actuals, undelivered);
};
