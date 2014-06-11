/*
 * == BSD2 LICENSE ==
 */

var _ = require('../lib/')._;

var datetime = require('./util/datetime');

var log = require('../lib/').bows('SettingsUtil');

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

  function nextDatetime(start, dt) {
    if (start === 0) {
      return datetime.composeMsAndDateString(start, datetime.addDays(dt, 1));
    }
    else {
      return datetime.composeMsAndDateString(start, dt);
    }
  }

  function getSegmentsForSchedule(opts) {
    var sched = opts.schedule;
    var s = opts.start, e = opts.end;
    var starts = [];
    var ratesByStart = {};
    var segments;
    for (var i = 0; i < sched.value.length; ++i) {
      starts.push(sched.value[i].start);
      ratesByStart[sched.value[i].start] = sched.value[i].rate;
    }
    var startsObj = findStarts(datetime.getMsFromMidnight(s), starts);
    var startPair = startsObj.starts;
    var firstSegmentEnd = (startPair.length === 2) ?
      nextDatetime(startPair[1], s) : nextDatetime(starts[0], s);
    segments = [{
      type: 'basal-settings-segment',
      schedule: sched.name,
      normalTime: s,
      normalEnd: firstSegmentEnd,
      value: ratesByStart[startPair[0]],
      active: opts.active,
      confidence: opts.confidence
    }];
    var currentDatetime = firstSegmentEnd, currentIndex = startsObj.startIndex;
    while (currentDatetime < e) {
      var end = nextDatetime(starts[currentIndex], currentDatetime);
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
        confidence: opts.confidence
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

  this.getAllSchedules = function(s, e) {
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      var settingsIntervals = this.getIntervals(s, e);
      var segmentsBySchedule = {};
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
          else {
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
      return segmentsBySchedule;
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
      if (datetime.checkIfDateInRange(s, intervalEndpoints) &&
        datetime.checkIfDateInRange(e, intervalEndpoints)) {
        actualIntervals.push({
          start: s,
          end: e,
          settings: interval.settings
        });
      }
      else {
        if (datetime.checkIfDateInRange(s, intervalEndpoints)) {
          actualIntervals.push({
            start: s,
            end: interval.end,
            settings: interval.settings
          });
        }
        if (datetime.checkIfDateInRange(e, intervalEndpoints)) {
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
      log('Could not find a settings object for the given interval.');
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
          settings: d
        }];
      }
    }
    else {
      if (i !== data.length - 1) {
        return {
          start: d.normalTime,
          end: data[i + 1].normalTime,
          settings: d
        };
      }
      else {
        return {
          start: d.normalTime,
          end: this.endpoints[1],
          settings: d
        };
      }
    }
  }, this)), function(d) {
    return d.start === d.end;
  });
}

module.exports = SettingsUtil;