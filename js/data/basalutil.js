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
try {
  var log = require('../lib/bows')('BasalUtil');
}
catch (Error) {
  log = function() {
    return function() {};
  };
}

var keysToOmit = ['id', 'start', 'end', 'vizType'];

var MS_IN_HOUR = 3600000.0;

function BasalUtil(data) {
  var actuals = [];
  var undelivereds = [];

  function addToActuals(e) {
    actuals.push(_.extend({}, e, {vizType: 'actual'}));
  }

  function addToUndelivered(e) {
    undelivereds.push(_.extend({}, e, {vizType: 'undelivered'}));
  }

  function processElement(e) {
    if (e.deliveryType === 'temp' || e.deliveryType === 'scheduled') {
      if (actuals.length === 0) {
        addToActuals(e);
      } else {
        var lastActual = actuals[actuals.length - 1];
        if (e.start === lastActual.end) {
          if (_.isEqual(_.omit(e, keysToOmit), _.omit(lastActual, keysToOmit))) {
            lastActual.end = e.end;
          } else {
            addToActuals(e);
          }
        } else if (e.start < lastActual.end) {
          // It is overlapping, so let's see how we should deal with it.

          if (e.start < lastActual.start) {
            // The current element is completely newer than the last actual, so we have to rewind a bit.
            var removedActual = actuals.pop();
            processElement(e);
            processElement(removedActual);
          } else if (e.deliveryType === 'temp') {
            // It's a temp, which wins no matter what it was before.
            // Start by setting up shared adjustments to the segments (clone lastActual and reshape it)
            var undeliveredClone = _.clone(lastActual);
            lastActual.end = e.start;

            if (e.end >= undeliveredClone.end) {
              // The temp segment is longer than the current, throw away the rest of the current
              undeliveredClone.start = e.start;
              addToUndelivered(undeliveredClone);
              addToActuals(e);
            } else {
              // The current exceeds the temp, so replace the current "chunk" and re-attach the schedule
              var endingSegment = _.clone(undeliveredClone);
              undeliveredClone.start = e.start;
              undeliveredClone.end = e.end;
              addToUndelivered(undeliveredClone);
              addToActuals(_.clone(e));

              // Re-attach the end of the schedule
              endingSegment.start = e.end;
              addToActuals(endingSegment);
            }
          } else {
            // e.deliveryType === 'scheduled'
            if (lastActual.deliveryType === 'scheduled') {
              // Scheduled overlapping a scheduled, this should not happen.
              log('Scheduled overlapped a scheduled.  Should never happen.', lastActual, e);
            } else {
              // Scheduled overlapping a temp, this can happen and the schedule should be skipped
              
              var undeliveredClone = _.clone(e);

              if (e.end > lastActual.end) {
                // Scheduled is longer than the temp, so preserve the tail
                var deliveredClone = _.clone(e);
                undeliveredClone.end = lastActual.end;
                deliveredClone.start = lastActual.end;
                addToUndelivered(undeliveredClone);
                addToActuals(deliveredClone);
              } else {
                // Scheduled is shorter than the temp, so completely skip it
                addToUndelivered(undeliveredClone);
              }
            }
          }
        } else {
          // e.start > lastActual.end
          log('e.start[' + e.start + '] > lastActual.end[' + lastActual.end + '].  ' +
            'BAD!!!! AAAHHHHHHH.  Sort input data plz, thx, cheezburger');
        }
      }
    }
  }

  function fixFloatingPoint (n) {
    return parseFloat(n.toFixed(3));
  }

  this.segmentDose = function(duration, rate) {
    var hours = duration / MS_IN_HOUR;
    return fixFloatingPoint(hours * rate);
  };

  this.totalBasal = function(s, e) {
    // return the total basal dose between two arbitrary datetimes
    var dose = 0.0;
    var firstSegment = _.find(this.normalizedActual, function(segment) {
      return (new Date(segment.normalTime).valueOf() <= s) && (s <= new Date(segment.normalEnd).valueOf());
    });
    if (firstSegment) {
      var index = this.normalizedActual.indexOf(firstSegment) + 1;
      var lastSegment = _.find(this.normalizedActual, function(segment) {
        return (new Date(segment.normalTime).valueOf() <= e) && (e <= new Date(segment.normalEnd).valueOf());
      });
      var lastIndex = this.normalizedActual.indexOf(lastSegment);
      dose += this.segmentDose(new Date(firstSegment.normalEnd) - s, firstSegment.value);
      while (index < lastIndex) {
        var segment = this.normalizedActual[index];
        dose += this.segmentDose((new Date(segment.normalEnd) - new Date(segment.normalTime)), segment.value);
        index++;
      }
      if (lastSegment) {
        dose += this.segmentDose(e - new Date(lastSegment.normalTime), lastSegment.value);
      }
    }
    return fixFloatingPoint(dose);
  };

  data.forEach(processElement);

  this.actual = actuals;
  this.undelivered = undelivereds;
}

module.exports = BasalUtil;