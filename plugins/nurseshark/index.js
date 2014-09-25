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
var crossfilter = require('crossfilter');
var util = require('util');

// TODO: eventually this will be a Sundial dependency
// not a tideline-internal dependency
// which is inappropriate for a "plugin" like this
var dt = require('../../js/data/util/datetime');

function translateBg(value) {
  var GLUCOSE_MM = 18.01559;
  return Math.round(GLUCOSE_MM * value);
}

function isBadStatus(d) {
  if (d.annotations == null) {
    return false;
  }
  else {
    var numAnnotations = d.annotations.length;
    for (var i = 0; i < numAnnotations; ++i) {
      var code = d.annotations[i].code;
      if (code === 'status/incomplete-tuple' || code === 'status/unknown-previous') {
        return true;
      }
    }
  }
}

function basalSchedulesToArray(basalSchedules) {
  var standard = [], schedules = [];
  for (var key in basalSchedules) {
    if (key === 'standard') {
      standard.push({
        name: key,
        value: basalSchedules[key]
      });
    }
    else {
      schedules.push({
        name: key,
        value: basalSchedules[key]
      });
    }
  }
  return standard.concat(schedules);
}

// TODO: remove after we've got tideline using timezone-aware timestamps
function watson(d) {
  d.normalTime = d.deviceTime + '.000Z';
}

function cloneDeep(d) {
  var newObj = {}, keys = Object.keys(d);
  var numKeys = keys.length;
  for (var i = 0; i < numKeys; ++i) {
    var key =  keys[i];
    if (typeof d[key] === 'object') {
      newObj[key] = _.cloneDeep(d[key]);
    }
    else {
      newObj[key] = d[key];
    }
  }
  return newObj;
}

function getHandlers() {
  var lastEnd, lastBasal;

  return {
    basal: function(d) {
      // TODO: determine which, if any, annotations to filter out
      d = cloneDeep(d);
      lastEnd = lastEnd || null;
      lastBasal = lastBasal || {};
      if (lastEnd > d.time) {
        var err = new Error('Basal overlaps with previous.');
        d.errorMessage = err.message;
        d.overlapsWith = lastBasal;
      }
      lastBasal = d;
      lastEnd = dt.addDuration(d.time, d.duration);
      watson(d);
      if (d.suppressed) {
        watson(d.suppressed);
      }
      return d;
    },
    bolus: function(d, collections) {
      d = cloneDeep(d);
      if (d.joinKey != null) {
        collections.bolusesToJoin[d.joinKey] = d;
      }
      if (d.duration != null) {
        collections.extendedIntervals[d.time + '/' + dt.addDuration(d.time, d.duration)] = d;
      }
      watson(d);
      return d;
    },
    cbg: function(d) {
      d = cloneDeep(d);
      if (d.units === 'mg/dL') {
        d.value = translateBg(d.value);
      }
      watson(d);
      return d;
    },
    deviceMeta: function(d) {
      d = cloneDeep(d);
      if (isBadStatus(d)) {
        var err = new Error('Bad pump status deviceMeta.');
        d.errorMessage = err.message;
      }
      watson(d);
      return d;
    },
    message: function(d) {
      d = cloneDeep(d);
      // TODO: remove after we've got tideline using timezone-aware timestamps
      var dt = new Date(d.time);
      var offsetMinutes = dt.getTimezoneOffset();
      dt.setUTCMinutes(dt.getUTCMinutes() - offsetMinutes);
      d.normalTime = dt.toISOString();
      return d;
    },
    smbg: function(d) {
      d = cloneDeep(d);
      if (d.units === 'mg/dL') {
        d.value = translateBg(d.value);
      }
      watson(d);
      return d;
    },
    settings: function(d) {
      d = cloneDeep(d);
      if (d.units.bg === 'mg/dL') {
        if (d.bgTarget) {
          for (var j = 0; j < d.bgTarget.length; ++j) {
            var current = d.bgTarget[j];
            for (var key in current) {
              if (key !== 'range' && key !== 'start') {
                current[key] = translateBg(current[key]);
              }
            }
          }
        }
        if (d.insulinSensitivity) {
          var isfLen = d.insulinSensitivity.length;
          for (var i = 0; i < isfLen; ++i) {
            var item = d.insulinSensitivity[i];
            item.amount = translateBg(item.amount);
          }
        }      
      }
      d.basalSchedules = basalSchedulesToArray(d.basalSchedules);
      watson(d);
      return d;
    },
    wizard: function(d) {
      d = cloneDeep(d);
      if (d.units === 'mg/dL') {
        if (d.bgInput) {
          d.bgInput = translateBg(d.bgInput);
        }
        if (d.bgTarget) {
          for (var key in d.bgTarget) {
            if (key !== 'range') {
              d.bgTarget[key] = translateBg(d.bgTarget[key]);
            }
          }
        }
        if (d.insulinSensitivity) {
          d.insulinSensitivity = translateBg(d.insulinSensitivity);
        }
      }
      watson(d);
      return d;
    }
  };
}

module.exports = {
  mergeSuspendsIntoBasals: function(basals, suspends, allData) {
    var crossBasals = crossfilter(basals);
    var basalsByTime = crossBasals.dimension(function(d) {
      return d.time + '/' + dt.addDuration(d.time, d.duration || 0);
    });
    var numSuspends = suspends.length;
    function getIntervalFilterFn(suspendStart, suspendEnd) {
      return function(d) {
        var interval = d.split('/');
        var basalStart = interval[0], basalEnd = interval[1];
        // suspend is a (possibly improper) subset of basal segment
        if (suspendStart >= basalStart && suspendEnd <= basalEnd) {
          return true;
        }
        // suspend start intersects with basal segment
        else if (suspendStart > basalStart && suspendStart < basalEnd) {
          return true;
        }
        // suspend end intersects with basal segment
        else if (suspendEnd > basalStart && suspendEnd < basalEnd) {
          return true;
        }
        // suspend is superset of basal segment
        else if (suspendStart <= basalStart && suspendEnd >= basalEnd) {
          return true;
        }
        else {
          return false;
        }
      };
    }
    function handleIntersection(match, suspend) {
      var suspendEnd = dt.addDuration(suspend.time, suspend.duration);
      var matchEnd = dt.addDuration(match.time, match.duration);
      var originalEnd = dt.addDuration(match.time, match.duration);
      var originalBeg = match.time;
      var newBasal;
      // start intersection
      if (suspend.time > match.time && suspendEnd > matchEnd) {
        newBasal = cloneDeep(match);
        newBasal.suppressed = cloneDeep(match);
        newBasal.suppressed.id += '_scheduled';

        match.expectedDuration = match.duration;
        match.duration = dt.difference(suspend.time, match.time);

        newBasal.time = suspend.time;
        newBasal.duration = dt.difference(originalEnd, suspend.time);
        newBasal.rate = 0.0;
        newBasal.deliveryType = 'suspend';
        newBasal.id += '_suspended';
        basals.push(newBasal);
        allData.push(newBasal);
      }
      // end intersection
      else if (suspendEnd < matchEnd && suspend.time < match.time) {
        newBasal = cloneDeep(match);
        newBasal.suppressed = cloneDeep(match);
        newBasal.suppressed.id += '_scheduled';

        match.time = suspendEnd;
        match.expectedDuration = match.duration;
        match.duration = dt.difference(matchEnd, suspendEnd);

        newBasal.duration = dt.difference(suspendEnd, originalBeg);
        newBasal.rate = 0.0;
        newBasal.deliveryType = 'suspend';
        newBasal.id += '_suspended';
        basals.push(newBasal);
        allData.push(newBasal);
      }
      // superset or improper subset
      else if (suspend.time <= match.time && suspendEnd >= matchEnd) {
        match.suppressed = cloneDeep(match);
        match.suppressed.id += '_scheduled';
        match.deliveryType = 'suspend';
        match.rate = 0.0;
        match.id += '_suspended';
      }
      // proper subset
      else {
        var first = cloneDeep(match), last = cloneDeep(match);
        first.expectedDuration = first.duration;
        first.duration = dt.difference(suspend.time, first.time);
        first.id += '_first';
        basals.push(first);
        allData.push(first);

        last.time = suspendEnd;
        last.expectedDuration = last.duration;
        last.duration = dt.difference(originalEnd, suspendEnd);
        last.id += '_last';
        basals.push(last);
        allData.push(last);

        match.suppressed = cloneDeep(match);
        match.suppressed.id += '_scheduled';
        match.id += '_suspended';
        match.deliveryType = 'suspend';
        match.time = suspend.time;
        match.duration = suspend.duration;
        match.rate = 0.0;
      }
    }
    for (var i = 0; i < numSuspends; ++i) {
      var suspend = suspends[i];
      var matches = basalsByTime.filterFunction(
        getIntervalFilterFn(suspend.time, dt.addDuration(suspend.time, suspend.duration))
      ).top(Infinity);
      if (matches.length > 0) {
        for (var j = 0; j < matches.length; ++j) {
          handleIntersection(matches[j], suspend);
        }
      }
    }
    return basals;
  },
  suspendedExtendeds: function(suspends, extendedIntervals) {
    suspends = crossfilter(suspends);
    var suspendsByTime = suspends.dimension(function(d) {
      return d.time;
    });
    var intervals = Object.keys(extendedIntervals);
    var numExtendeds = intervals.length;
    for (var i = 0; i < numExtendeds; ++i) {
      var matches = suspendsByTime.filter(intervals[i].split('/')).top(Infinity);
      var bolus = extendedIntervals[intervals[i]];
      // suspend interrupts an extended bolus
      if (matches.length > 0) {
        var suspend = matches[0];
        if (!(bolus.extended >= 0 && bolus.expectedExtended > 0)) {
          var err = new Error('An extended bolus interrupted by a suspend should have ' +
            '`extended` and `expectedExtended` properties.');
          bolus.errorMessage = err.message;
          this.erroredData.push(bolus);
        }
        bolus.expectedDuration = bolus.duration;
        bolus.duration = dt.difference(suspend.time, bolus.time);
      }
      // user cancels an extended bolus
      if (bolus.expectedExtended && bolus.expectedExtended > 0 && !bolus.expectedDuration) {
        var percentComplete = bolus.extended/bolus.expectedExtended;
        bolus.expectedDuration = bolus.duration;
        bolus.duration = percentComplete * bolus.duration;
      }
    }
  },
  joinWizardsAndBoluses: function(wizards, bolusesToJoin) {
    var numWizards = wizards.length;
    for (var i = 0; i < numWizards; ++i) {
      var wizard = wizards[i];
      if (wizard.joinKey != null) {
        if (typeof bolusesToJoin[wizard.joinKey] === 'object') {
          wizard.bolus = bolusesToJoin[wizard.joinKey];
        }
      }
    }
  },
  processData: function(data) {
    if (!(data && data.length >= 0 && Array.isArray(data))) {
      throw new Error('An array is required.');
    }
    function sortFn(key) {
      return function(a, b) {
        if (a[key] < b[key]) {
          return -1;
        }
        if (a[key] > b[key]) {
          return 1;
        }
        return 0;
      };
    }
    data.sort(sortFn('time'));
    var processedData = [], erroredData = [];
    var collections = {
      bolusesToJoin: {},
      extendedIntervals: {}
    };
    var typeGroups = {};

    var handlers = getHandlers();

    function process(d) {
      try {
        d = handlers[d.type](d, collections);
      }
      catch (e) {
        var err = new Error(util.format('No nurseshark handler defined for type [%s]', d.type));
        d.errorMessage = err.message;
      }
      if (d.errorMessage != null) {
        erroredData.push(d);
      }
      else {
        processedData.push(d);
        // group data
        if (typeGroups[d.type] == null) {
          typeGroups[d.type] = [d];
        }
        else {
          typeGroups[d.type].push(d);
        }
      }
    }

    var iterations = Math.floor(data.length / 8);
    var leftover = data.length % 8;
    var i = 0;

    if (leftover > 0){
        do {
          process(data[i++]);
        } while (--leftover > 0);
    }

    if (iterations > 0) {
      do {
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
        process(data[i++]);
      } while (--iterations > 0);      
    }

    this.joinWizardsAndBoluses(typeGroups.wizard || [], collections.bolusesToJoin);

    if (Object.keys(collections.extendedIntervals).length > 0) {
      this.suspendedExtendeds(typeGroups.deviceMeta || [], collections.extendedIntervals);
    }

    if (typeGroups.deviceMeta && typeGroups.deviceMeta.length > 0) {
      typeGroups.basal = this.mergeSuspendsIntoBasals(typeGroups.basal || [], typeGroups.deviceMeta, processedData);
    }

    return {erroredData: erroredData, processedData: processedData.sort(sortFn('normalTime'))};
  }
};