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

var dt = require('./util/datetime');

function SettingsUtil(data, endpoints) {

  function findStarts(ms, starts) {
    for (var i = 0; i < starts.length; ++i) {
      var start = starts[i];
      if (i !== starts.length - 1) {
        if (ms >= start && ms < starts[i + 1]) {
          return {starts: [start, starts[i + 1]], startIndex: i+1};
        }
      }
      else {
        return {starts:[start], startIndex: 0};
      }
    }
  }

  function getSegmentsForSchedule(opts) {
    var sched = opts.schedule;
    if (sched.value.length === 0) {
      return [];
    }
    var s = opts.start, e = opts.end;
    var starts = [];
    var ratesByStart = {};
    var segments;
    for (var i = 0; i < sched.value.length; ++i) {
      starts.push(sched.value[i].start);
      ratesByStart[sched.value[i].start] = sched.value[i].rate;
    }
    var startsObj = findStarts(dt.getMsFromMidnight(s), starts);
    var startPair = startsObj.starts;
    var firstSegmentEnd = (startPair.length === 2) ?
      dt.composeMsAndDateString(startPair[1], s) :
      dt.composeMsAndDateString(starts[0], dt.addDays(s, 1));
    segments = [{
      type: 'basal-settings-segment',
      schedule: sched.name,
      normalTime: s,
      normalEnd: firstSegmentEnd,
      value: ratesByStart[startPair[0]],
      active: opts.active,
      confidence: opts.confidence,
      id: sched.name.replace(' ', '_') + '_' + s.replace(/[^\w\s]|_/g, '')
    }];
    var currentDatetime = firstSegmentEnd, currentIndex = startsObj.startIndex;
    while (currentDatetime < e) {
      var end;
      if (currentIndex !== starts.length - 1) {
        end =  dt.composeMsAndDateString(starts[currentIndex + 1], currentDatetime);
      }
      else {
        end = dt.composeMsAndDateString(0, dt.addDays(currentDatetime, 1));
      }
      if (end > e) {
        end = e;
      }
      segments.push({
        type: 'basal-settings-segment',
        schedule: sched.name,
        normalTime: currentDatetime,
        normalEnd: end,
        value: ratesByStart[starts[currentIndex]],
        active: opts.active,
        confidence: opts.confidence,
        id: sched.name.replace(' ', '_') + '_' + currentDatetime.replace(/[^\w\s]|_/g, '')
      });
      if (currentIndex !== starts.length - 1) {
        currentIndex++;
      }
      else {
        currentIndex = 0;
      }
      currentDatetime = end;
    }
    return segments;
  }

  this.annotateBasalSettings = function(a) {
    // don't necessarily want unsquashing of midnights to propogate beyond this method
    // hence using _.cloneDeep() to copy the array
    var actuals = _.cloneDeep(a) || [];

    var actualsByInterval = {};

    for (var i = 0; i < actuals.length; ++i) {
      var actual = actuals[i];
      if (dt.isSegmentAcrossMidnight(actual.normalTime, dt.addDuration(actual.normalTime, actual.duration))) {
        var midnight = dt.getMidnight(actual.normalTime, true);
        var end = dt.addDuration(actual.normalTime, actual.duration);
        var firstDuration = Date.parse(midnight) - Date.parse(actual.normalTime);
        var newActual = _.clone(actual);
        newActual.normalTime = midnight;
        newActual.duration = actual.duration - firstDuration;
        actual.duration = firstDuration;
        actuals.splice(i + 1, 0, newActual);
        actual = actuals[i];
      }
      // Animas basal schedules have a resolution of thirty minutes
      var s = dt.roundToNearestMinutes(actual.normalTime, 30);
      var e = dt.roundToNearestMinutes(dt.addDuration(actual.normalTime, actual.duration), 30);
      actualsByInterval[s + '/' + e] = actual;
    }
    for (var key in this.segmentsBySchedule) {
      var currentSchedule = this.segmentsBySchedule[key];
      if (currentSchedule.length === 0) {
        return;
      }
      for (var j = 0; j < currentSchedule.length; ++j) {
        var segment = currentSchedule[j];
        var interval = segment.normalTime + '/' + segment.normalEnd;
        if (actualsByInterval[interval]) {
          var matchedActual = actualsByInterval[interval];
          if (segment.value === matchedActual.rate) {
            segment.actualized = true;
          }
        }
      }
    }
    return this.segmentsBySchedule;
  };

  this.getAllSchedules = function(s, e) {
    if (dt.verifyEndpoints(s, e, this.endpoints) && this.data.length !== 0) {
      var settingsIntervals = this.getIntervals(s, e);
      var segmentsBySchedule = {};
      if (settingsIntervals) {
        for (var i = 0; i < settingsIntervals.length; ++i) {
          var interval = settingsIntervals[i];
          for (var j = 0; j < interval.settings.basalSchedules.length; ++j) {
            var schedule = interval.settings.basalSchedules[j];
            if (segmentsBySchedule[schedule.name]) {
              segmentsBySchedule[schedule.name] = segmentsBySchedule[schedule.name].concat(getSegmentsForSchedule({
                schedule: schedule,
                start: interval.start,
                end: interval.end,
                active: schedule.name === interval.settings.activeBasalSchedule,
                confidence: interval.settings.confidence ? interval.settings.confidence : 'normal'
              }));
            }
            // there can be schedules in the settings with an empty array as their value
            else if (schedule.value.length > 0) {
              segmentsBySchedule[schedule.name] = getSegmentsForSchedule({
                schedule: schedule,
                start: interval.start,
                end: interval.end,
                active: schedule.name === interval.settings.activeBasalSchedule,
                confidence: interval.settings.confidence ? interval.settings.confidence : 'normal'
              });
            }
          }
        }
        this.segmentsBySchedule = segmentsBySchedule;
        return segmentsBySchedule;
      }
      else {
        return [];
      }
    }
    else {
      return [];
    }
  };

  this.getIntervals = function(s, e) {
    var actualIntervals = [];
    for (var i = 0; i < this.intervals.length; ++i) {
      var interval = this.intervals[i];
      var intervalEndpoints = [interval.start, interval.end];
      if (dt.checkIfDateInRange(s, intervalEndpoints) &&
        dt.checkIfDateInRange(e, intervalEndpoints)) {
        actualIntervals.push({
          start: s,
          end: e,
          settings: interval.settings
        });
      }
      else {
        if (dt.checkIfDateInRange(s, intervalEndpoints)) {
          actualIntervals.push({
            start: s,
            end: interval.end,
            settings: interval.settings
          });
        }
        if (dt.checkIfDateInRange(e, intervalEndpoints)) {
          actualIntervals.push({
            start: interval.start,
            end: e,
            settings: interval.settings
          });
        }
        if (s < interval.start && e > interval.end) {
          actualIntervals.push({
            start: interval.start,
            end: interval.end,
            settings: interval.settings
          });
        }
      }
    }
    if (actualIntervals.length === 0) {
      return undefined;
    }
    return actualIntervals;
  };

  this.data = data || [];
  // valid endpoints for settings are endpoints of all diabetes data
  this.endpoints = endpoints;
  // intervals of effectiveness of a settings object
  this.intervals = _.reject(_.flatten(_.map(this.data, function(d, i, data) {
    if (i === 0) {
      if (this.endpoints[1] === d.normalTime) {
        return {
          start: this.endpoints[0],
          end: this.endpoints[1],
          settings: _.defaults(_.clone(d), {confidence: 'uncertain'})
        };
      }
      else {
        return [{
          start: this.endpoints[0],
          end: d.normalTime,
          settings: _.defaults(_.clone(d), {confidence: 'uncertain'})
        },{
          start: d.normalTime,
          end: data[1] ? data[1].normalTime : this.endpoints[1],
          settings: _.clone(d)
        }];
      }
    }
    else {
      if (i !== data.length - 1) {
        return {
          start: d.normalTime,
          end: data[i + 1].normalTime,
          settings: _.clone(d)
        };
      }
      else {
        return {
          start: d.normalTime,
          end: this.endpoints[1],
          settings: _.clone(d)
        };
      }
    }
  }, this)), function(d) {
    return d.start === d.end;
  });
}

module.exports = SettingsUtil;