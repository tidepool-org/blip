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

/* global __DEV__ */

var _ = require('lodash');
var crossfilter = require('crossfilter');
var util = require('util');

var dt = require('../../js/data/util/datetime');

var log;
if (typeof window !== 'undefined') {
  log = require('bows')('Nurseshark');
}
else {
  log = function() { return; };
}

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
  if (typeof window !== 'undefined' && __DEV__ === true) {
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
  joinWizardsAndBoluses: function(wizards, boluses, collections) {
    var allBoluses = collections.allBoluses, allWizards = collections.allWizards;
    var numWizards = wizards.length;
    var joinedWizards = {};
    for (var i = 0; i < numWizards; ++i) {
      var wizard = wizards[i];
      var bolusId = wizard.bolus;
      // TODO: remove once we've phased out in-d-gestion CareLink parsing
      if (bolusId == null) {
        bolusId = wizard.joinKey;
      }
      if (bolusId != null && allBoluses[bolusId]) {
        wizard.bolus = allBoluses[bolusId];
        joinedWizards[bolusId] = wizard;
      }
    }
    var numBoluses = boluses.length;
    for (var j = 0; j < numBoluses; ++j) {
      var bolus = boluses[j];
      if (bolus.joinKey != null) {
        if (allWizards[bolus.joinKey] == null) {
          delete bolus.joinKey;
        }
      }
      else if (bolus.joinKey == null && joinedWizards[bolus.id] != null) {
        bolus.joinKey = joinedWizards[bolus.id].id;
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
    return tidelineMessage;
  },
  processData: function(data, timePrefs) {
    if (!(data && data.length >= 0 && Array.isArray(data))) {
      throw new Error('An array is required.');
    }
    // data from the old-old data model (pre-v1 docs) doesn't have a `time` field
    function removeNoTime() {
      var noTimeCount = 0;
      data = _.filter(data, function(d) {
        if (d.timestamp != null || d.time != null) {
          return true;
        }
        else {
          noTimeCount += 1;
          return false;
        }
      });
      log(noTimeCount, 'records removed due to not having a `time` or `timestamp` field.');
    }
    timeIt(removeNoTime, 'removeNoTime');

    var uploadIDSources = {};
    var processedData = [], erroredData = [];
    var collections = {
      allBoluses: {},
      allWizards: {}
    };
    var typeGroups = {}, overlappingUploads = {}, mostRecentFromOverlapping = null;

    function removeOverlapping() {
      // NB: this problem is specific to CareLink data
      // sometimes settings events can be out-of-sequence wrt uploads
      // for reasons that are not entirely clear to me, but since we only read more recent settings
      // it doesn't hurt anything to have overlapping settings history across uploads
      // and we want to reduce how often we "find" overlapping uploads, so we disregard settings
      var withoutSettings = _.reject(data, {type: 'settings'});
      // basals that we fabricate in the simulator may have the wrong uploadId attached to the deviceId
      // and obviously we *created* them, so they shouldn't conflict with anything and are safe to remove
      // again in order to reduce how many overlapping uploads we're "finding"
      var withoutAnnotatedBasals = _.reject(withoutSettings, function(d) {
        if (d.type === 'basal' && d.annotations && d.annotations.length !== 0) {
          return true;
        }
        return false;
      });
      var crossData = crossfilter(_.where(withoutAnnotatedBasals, {source: 'carelink'}));
      var dataByUpload = crossData.dimension(function(d) { return d.deviceId; });
      var dataByUploadGrouping = dataByUpload.group();
      dataByUploadGrouping.reduce(
        function reduceAdd(p, v) {
          if (v.time < p.start || p.start === null) {
            p.start = v.time;
          }
          if (v.time > p.end || p.end === null) {
            p.end = v.time;
            p.lastDatumTime = v.time;
            if (v.type === 'basal') {
              p.lastBasalEnd = dt.addDuration(v.time, v.duration || 0);
            }
            else {
              p.lastNonBasalTime = v.time;
            }
          }
          return p;
        },
        function reduceRemove(p, v) {
          if (v.time === p.start) {
            p.start = null;
          }
          if (v.time === p.end) {
            p.end = null;
            p.lastBasalEnd = null;
            p.lastDatumTime = null;
            p.lastNonBasalTime = null;
          }
          return p;
        },
        function reduceInitial() {
          return {
            start: null,
            end: null,
            // track just the last datum in the upload isn't sufficient
            // since folks often leave their pumps pumping basals into the void
            // after switching to a different pump
            lastBasalEnd: null,
            lastDatumTime: null,
            lastNonBasalTime: null
          };
        }
      ).order(function(p) {
        return p.start;
      });
      var dataByUploadGroups = dataByUploadGrouping.top(Infinity).reverse();
      for (var i = 0; i < dataByUploadGroups.length; ++i) {
        var oneGroup = dataByUploadGroups[i];
        for (var j = 0; j < dataByUploadGroups.length; ++j) {
          var anotherGroup = dataByUploadGroups[j];
          if (oneGroup.value.start < anotherGroup.value.end &&
            oneGroup.value.start > anotherGroup.value.start) {
            overlappingUploads[oneGroup.key] = true;
            overlappingUploads[anotherGroup.key] = true;
          }
        }
      }
      var dataByOverlappingUploadGroups = _.filter(dataByUploadGroups, function(group) {
        return overlappingUploads[group.key];
      });
      if (dataByOverlappingUploadGroups.length > 0) {
        var sortedByBasalEnd = _.sortBy(dataByOverlappingUploadGroups, function(group) {
          return group.value.lastBasalEnd;
        }).reverse();
        var sortedByLast = _.sortBy(dataByOverlappingUploadGroups, function(group) {
          return group.value.lastDatumTime;
        }).reverse();
        var sortedByNonBasal = _.sortBy(dataByOverlappingUploadGroups, function(group) {
          return group.value.lastNonBasalTime;
        }).reverse();
        if (sortedByBasalEnd.length > 0 && sortedByLast[0].value.lastDatumTime < sortedByBasalEnd[0].value.lastBasalEnd) {
          // if someone left the basals pumping away into the void after switching pumps
          // the datasets may end at the exact same point - at the end of the basals
          // so we check if the two most recent uploads have the same endpoint re: basals
          if (sortedByBasalEnd[0].value.lastBasalEnd !== sortedByBasalEnd[1].value.lastBasalEnd) {
            mostRecentFromOverlapping = sortedByBasalEnd[0].key;
          }
          // if the two most recent uploads have the same endpoint re: basals
          // then we use the most recent sorting by non-basal events instead
          else {
            mostRecentFromOverlapping = sortedByNonBasal[0].key;
          }
        }
        // if there are no basals, we simply sort everything and pick the latest
        else {
          mostRecentFromOverlapping = sortedByLast[0].key;
        }
        log('Overlapping Carelink uploads:', Object.keys(overlappingUploads));
        log('Upload with most recent data:', mostRecentFromOverlapping);
      }
    }

    timeIt(removeOverlapping, 'Remove Overlapping');

    function createUploadIDsMap() {
      var uploads = _.where(data, {type: 'upload'});
      _.each(uploads, function(upload) {
        uploadIDSources[upload.uploadId] = upload.source || 
          ((upload.deviceManufacturers && Array.isArray(upload.deviceManufacturers) && upload.deviceManufacturers.length > 0) ? 
            upload.deviceManufacturers[0] : 'Unknown');
      });
    }

    // create a hash of uploadId: source
    createUploadIDsMap();

    var handlers = getHandlers(timePrefs);

    function addNoHandlerMessage(d) {
      d = cloneDeep(d);
      var err = new Error(util.format('No nurseshark handler defined for type [%s]', d.type));
      d.errorMessage = err.message;
      return d;
    }

    var lastD, unannotatedRemoval = false;

    function process(d) {
      if (overlappingUploads[d.deviceId] && d.deviceId !== mostRecentFromOverlapping) {
        d = cloneDeep(d);
        d.errorMessage = 'Overlapping CareLink upload.';
      }
      else {
        d = handlers[d.type] ? handlers[d.type](d, collections) : d.messagetext ? handlers.message(d, collections) : addNoHandlerMessage(d);
        if (!d.source) {
          if (d.uploadId) {
            d.source = uploadIDSources[d.uploadId];
          }
          // probably doesn't exist: for data too old to have uploadId but also without `source`
          else {
            d.source = 'Unspecified Data Source';
          }
        }
      }

      // because we don't yet have validation on editing timestamps in clamshell and blip notes
      // and someone had made a note with year 2 that caused problems for tideline
      // chose year 2008 because tidline's datetime has a validation step that rejects POSIX timestamps
      // that evaluate to year < 2008
      if (new Date(d.time).getUTCFullYear() < 2008) {
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
      nurseshark.joinWizardsAndBoluses(typeGroups.wizard || [], typeGroups.bolus || [], collections);
    }, 'Join Wizards and Boluses');

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
      }, 'Annotate Basals');
    }

    timeIt(function() {
      processedData.sort(function(a, b) {
        if (a.time < b.time) {
          return -1;
        }
        if (a.time > b.time) {
          return 1;
        }
        return 0;
      });
    }, 'Sort');
    var emoticon = erroredData.length ? ':(' : ':)';
    log(erroredData.length, 'items in the erroredData.', emoticon, _.countBy(erroredData, 'type'));
    log('Unique error messages:', _.unique(_.pluck(erroredData, 'errorMessage')));
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
        return d;
      }
      // NB: truthiness warranted here
      // basals with duration of 0 are *not* legitimate targets for visualization
      if (!d.duration) {
        var err2 = new Error('Basal with null/zero duration.');
        d.errorMessage = err2.message;
        return d;
      }
      lastEnd = dt.addDuration(d.time, d.duration);
      // TODO: remove if we change to data model to require rate even on basals of deliveryType 'suspend'
      if (!d.rate && d.deliveryType === 'suspend') {
        d.rate = 0.0;
      }
      if (d.suppressed) {
        this.suppressed(d);
      }
      // some Carelink temps and suspends are precisely one second short
      // so we extend them to avoid discontinuity
      if (d.source === 'carelink' && d.time !== lastEnd) {
        // check that the difference is indeed no more than one second (= 1000 milliseconds)
        if (dt.difference(d.time, lastEnd) <= 1000) {
          lastBasal.duration = dt.difference(d.time, lastBasal.time);
        }
      }
      lastBasal = d;
      return d;
    },
    bolus: function(d, collections) {
      d = cloneDeep(d);
      // TODO: remove once we've phased out in-d-gestion CareLink parsing
      if (d.joinKey != null) {
        collections.allBoluses[d.joinKey] = d;
      }
      collections.allBoluses[d.id] = d;
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
      d = cloneDeep(d);
      if (isBadStatus(d)) {
        var err = new Error('Bad pump status deviceMeta.');
        d.errorMessage = err.message;
      }
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
      return d;
    },
    suppressed: function(d) {
      if (d.suppressed.deliveryType === 'temp' && !d.suppressed.rate) {
        if (d.suppressed.percent && d.suppressed.suppressed &&
          d.suppressed.suppressed.deliveryType === 'scheduled' && d.suppressed.suppressed.rate >= 0) {
            d.suppressed.rate = d.suppressed.percent * d.suppressed.suppressed.rate;
        }
      }
      // a suppressed should share these attributes with its parent
      d.suppressed.duration = d.duration;
      d.suppressed.time = d.time;
      d.suppressed.deviceTime = d.deviceTime;
      if (d.suppressed.suppressed) {
        this.suppressed(d.suppressed);
      }
    },
    upload: function(d) {
      d = cloneDeep(d);
      return d;
    },
    wizard: function(d, collections) {
      d = cloneDeep(d);
      // TODO: remove once we've phased out in-d-gestion CareLink parsing
      if (d.joinKey != null) {
        collections.allWizards[d.joinKey] = d;
      }
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
      return d;
    }
  };
}

module.exports = nurseshark;