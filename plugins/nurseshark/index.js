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

var handlers = {
  basal: function(d) {
    return cloneDeep(d);
  },
  bolus: function(d, collections) {
    d = cloneDeep(d);
    if (d.joinKey != null) {
      collections.bolusesToJoin[d.joinKey] = d;
    }
    if (d.duration != null) {
      collections.extendedIntervals[d.time + '/' + dt.addDuration(d.time, d.duration)] = d;
    }
    return d;
  },
  cbg: function(d) {
    d = cloneDeep(d);
    if (d.units === 'mg/dL') {
      d.value = translateBg(d.value);
    }
    return d;
  },
  deviceMeta: function(d) {
    return cloneDeep(d);
  },
  message: function(d) {
    return cloneDeep(d);
  },
  smbg: function(d) {
    d = cloneDeep(d);
    if (d.units === 'mg/dL') {
      d.value = translateBg(d.value);
    }
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
    return d;
  }
};

module.exports = {
  erroredData: [],
  mergeSuspendsIntoBasals: function(basals, suspendIntervals) {
    basals = crossfilter(basals);
    var basalsByTime = basals.dimension(function(d) {
      return d.time + '/' + dt.addDuration(d.time, d.duration || 0); 
    });
    var numSuspends = suspendIntervals.length;
    function intervalFilter(d) {
      var interval = d.split('/');
      // TODO: filter for intersection of basals and suspend intervals
    }
    for (var i = 0; i < numSuspends; ++i) {
      var matches = basalsByTime.filterFunction(intervalFilter).top(Infinity);
      if (matches.length > 0) {
        console.log('Found at least one basal intersecting with a suspend!');
      }
    }
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
    var self = this;
    if (!(data && data.length >= 0 && Array.isArray(data))) {
      throw new Error('An array is required.');
    }
    var processedData = [];
    var collections = {
      bolusesToJoin: {},
      extendedIntervals: {}
    };
    var typeGroups = {};

    function process(d) {
      try {
        d = handlers[d.type](d, collections);
      }
      catch (e) {
        var err = new Error(util.format('No nurseshark handler defined for type [%s]', d.type));
        d.errorMessage = err.message;
        self.erroredData.push(d);
      }
      // group data
      if (typeGroups[d.type] == null) {
        typeGroups[d.type] = [d];
      }
      else {
        typeGroups[d.type].push(d);
      }
      processedData.push(d);
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
      this.mergeSuspendsIntoBasals(typeGroups.basal || [], typeGroups.deviceMeta);
    }
    return {erroredData: this.erroredData, processedData: processedData};
  }
};