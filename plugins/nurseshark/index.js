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

var dt = require('./datetime');

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
  var schedules = [];
  for(var key in basalSchedules) {
    schedules.push({
      'name': key,
      'value': basalSchedules[key]
    });
  }
  return schedules;
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
      return d;
    },
    bolus: function(d, collections) {
      d = cloneDeep(d);
      if (d.joinKey != null) {
        collections.bolusesToJoin[d.joinKey] = d;
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
          for (var key in d.bgTarget) {
            if (key !== 'range' && key !== 'start') {
              d.bgTarget[key] = translateBg(d.bgTarget[key]);
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
        // truthiness is *required* here
        // bgInput of 0 occurs often but means bgInput was skipped in wizard interaction
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
    var processedData = [], erroredData = [];
    var collections = {
      bolusesToJoin: {}
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
      // group data
      if (typeGroups[d.type] == null) {
        typeGroups[d.type] = [d];
      }
      else {
        typeGroups[d.type].push(d);
      }
      if (d.errorMessage != null) {
        erroredData.push(d);
      }
      else {
        processedData.push(d);
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

    return {erroredData: erroredData, processedData: processedData};
  }
};