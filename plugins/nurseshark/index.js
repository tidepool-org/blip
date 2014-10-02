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
      if (code === 'status/unknown-previous') {
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
  if (d.type === 'basal') {
    d.normalEnd = dt.addDuration(d.normalTime, d.duration);
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

function timeIt(fn, name) {
  if (typeof window !== 'undefined') {
    console.time(name);
    fn();
    console.timeEnd(name);
  }
  else {
    fn();
  }
}

var nurseshark = {
  annotateBasals: function(basals, incompleteSuspends) {
    var crossBasals = crossfilter(basals);
    var basalsByTime = crossBasals.dimension(function(d) {
      return d.time + '/' + dt.addDuration(d.time, d.duration);
    });
    var numSuspends = incompleteSuspends.length;
    function findIntersecting(suspendStart) {
      return function(d) {
        var interval = d.split('/');
        var basalStart = interval[0], basalEnd = interval[1];
        if (basalStart <= suspendStart && suspendStart <= basalEnd) {
          return true;
        }
        return false;
      };
    }
    function handleIntersection(match) {
      if (!match.annotations) {
        match.annotations = [];
      }
      match.annotations.push({
        'code': 'basal/intersects-incomplete-suspend'
      });
    }

    for (var i = 0; i < numSuspends; ++i) {
      var suspend = incompleteSuspends[i];
      var matches = basalsByTime.filterFunction(
        findIntersecting(suspend.time)
      ).top(Infinity);
      if (matches.length > 0) {
        for (var j = 0; j < matches.length; ++j) {
          handleIntersection(matches[j]);
        }
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
  reshapeMessage: function(d) {
    var tidelineMessage = {
      time: d.timestamp,
      messageText: d.messagetext,
      parentMessage: d.parentmessage,
      type: 'message',
      id: d.id
    };
    // TODO: remove after we've got tideline using timezone-aware timestamps
    var dt = new Date(tidelineMessage.time);
    var offsetMinutes = dt.getTimezoneOffset();
    dt.setUTCMinutes(dt.getUTCMinutes() - offsetMinutes);
    tidelineMessage.normalTime = dt.toISOString();
    return tidelineMessage;
  },
  processData: function(data) {
    if (!(data && data.length >= 0 && Array.isArray(data))) {
      throw new Error('An array is required.');
    }
    var processedData = [], erroredData = [];
    var collections = {
      bolusesToJoin: {}
    };
    var typeGroups = {}, overlappingUploads = {};

    function removeOverlapping() {
      // NB: this problem is specific to CareLink data
      var crossData = crossfilter(_.where(data, {source: 'carelink'}));
      var dataByUpload = crossData.dimension(function(d) { return d.deviceId; });
      var dataByUploadGrouping = dataByUpload.group();
      dataByUploadGrouping.reduce(
        function reduceAdd(p, v) {
          if (v.time < p.start || p.start === null) {
            p.start = v.time;
          }
          if (v.time > p.end || p.end === null) {
            p.end = v.time;
          }
          return p;
        },
        function reduceRemove(p, v) {
          if (v.time === p.start) {
            p.start = null;
          }
          if (v.time === p.end) {
            p.end = null;
          }
          return p;
        },
        function reduceInitial(p, v) {
          return {start: null, end: null};
        }
      ).order(function(p) {
        return p.start;
      });
      var dataByUploadGroups = dataByUploadGrouping.top(Infinity).reverse();
      for (var i = 0; i < dataByUploadGroups.length; ++i) {
        var group = dataByUploadGroups[i], lastGroup = lastGroup || {};
        if (lastGroup.value && group.value.start < lastGroup.value.end) {
          overlappingUploads[group.key] = true;
          overlappingUploads[lastGroup.key] = true;
        }
        lastGroup = group;
      }
    }

    timeIt(removeOverlapping, 'removeOverlapping');

    var handlers = getHandlers();

    function addNoHandlerMessage(d) {
      d = cloneDeep(d);
      var err = new Error(util.format('No nurseshark handler defined for type [%s]', d.type));
      d.errorMessage = err.message;
      return d;
    }

    var lastD, unannotatedRemoval = false;

    function process(d) {
      if (overlappingUploads[d.deviceId]) {
        d = cloneDeep(d);
        d.errorMessage = 'Overlapping CareLink upload.';
        if (lastD && lastD.source === 'carelink') {
          if (!lastD.annotations) {
            lastD.annotations = [];
          }
          lastD.annotations.push({
            code: 'carelink/device-overlap-boundary'
          });
        }
      }
      else {
        if (lastD && lastD.errorMessage === 'Overlapping CareLink upload.') {
          unannotatedRemoval = true;
          if (d.source === 'carelink' && d.type === 'basal') {
            if (!d.annotations) {
              d.annotations = [];
            }
            d.annotations.push({
              code: 'carelink/device-overlap-boundary'
            });
            unannotatedRemoval = false;
          }
        }
        else if (unannotatedRemoval) {
          if (d.source === 'carelink' && d.type === 'basal') {
            if (!d.annotations) {
              d.annotations = [];
            }
            d.annotations.push({
              code: 'carelink/device-overlap-boundary'
            });
            unannotatedRemoval = false;
          }
        }
        d = handlers[d.type] ? handlers[d.type](d, collections) : d.messagetext ? handlers.message(d, collections) : addNoHandlerMessage(d);
      }
      if (d.normalTime && new Date(d.normalTime).getUTCFullYear() < 2008) {
        d.errorMessage = 'Invalid datetime (before 2008).';
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
      lastD = d;
    }

    timeIt(function() {
      for (var i = 0; i < data.length; ++i) {
        process(data[i]);
      }
    }, 'Process');

    timeIt(function() {
      nurseshark.joinWizardsAndBoluses(typeGroups.wizard || [], collections.bolusesToJoin);
    }, 'joinWizardsAndBoluses');

    if (typeGroups.deviceMeta && typeGroups.deviceMeta.length > 0) {
      timeIt(function() {
        nurseshark.annotateBasals(typeGroups.basal || [], _.filter(typeGroups.deviceMeta, function(d) {
          if (d.annotations && d.annotations.length > 0) {
            for (var i = 0; i < d.annotations.length; ++i) {
              var annotation = d.annotations[i];
              if (annotation.code === 'status/incomplete-tuple') {
                return true;
              }
            }
          }
          return false;
        }));
      }, 'annotateBasals');
    }

    timeIt(function() {
      processedData.sort(function(a, b) {
        if (a.normalTime < b.normalTime) {
          return -1;
        }
        if (a.normalTime > b.normalTime) {
          return 1;
        }
        return 0;
      });
    }, 'Sort');
    return {erroredData: erroredData, processedData: processedData};
  }
};

function getHandlers() {
  var lastEnd, lastBasal;

  return {
    basal: function(d) {
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
      // TODO: remove if we change to data model to require rate even on basals of deliveryType 'suspend'
      if (!d.rate && d.deliveryType === 'suspend') {
        d.rate = 0.0;
      }
      watson(d);
      function equalizeSuppressed(d) {
        // a suppressed should share these attributes with its parent
        d.suppressed.deviceTime = d.deviceTime;
        d.suppressed.duration = d.duration;
        d.suppressed.time = d.time;
        watson(d.suppressed);
        if (d.suppressed.suppressed) {
          equalizeSuppressed(d.suppressed);
        }
      }
      if (d.suppressed) {
        equalizeSuppressed(d);
      }
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
      return nurseshark.reshapeMessage(d);
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

module.exports = nurseshark;