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

var tideline = window.tideline;
var watson = tideline.watson = require('../watson');
var _ = tideline.lib._;
var TidelineData = tideline.TidelineData;
var SegmentUtil = tideline.data.SegmentUtil;
var datetime = tideline.data.util.datetime;

var log = tideline.lib.bows('Preprocess');

function alwaysTrue() {
  return true;
}

function notZero(e) {
  return e.value !== 0;
}

function withTiming(name, fn) {
  var now = Date.now();
  var retVal = fn.apply(null, Array.prototype.slice.call(arguments, 2));
  log(name + ' completed in ' + (Date.now() - now) + ' millis. ');
  return retVal;
}

/**
 * This converts suspend start and end events into basal-rate-segments for the visualization
 *
 * @param data Array of data, assumed to be only deviceMeta events.
 * @returns {Array} modified array of data to have basal-rate-segments for suspend start and end events.
 */
function processSuspends(data) {
  data = _.sortBy(data, 'deviceTime');

  var retVal = [];
  var suspends = {};

  for (var i = 0; i < data.length; ++i) {
    if (data[i].subType === 'status') {
      switch (data[i].status) {
        case 'suspended':
          suspends[data[i].id] = data[i];
          break;
        case 'resumed':
        case 'resume': // 2014-05-06: Non past-tense should be removed.  If this still exists in June, please remove
          if (data[i].joinKey == null) {
            retVal.push(data[i]);
          } else {
            var suspended = suspends[data[i].joinKey];

            if (suspended == null) {
              retVal.push(data[i]);
            } else {
              retVal.push(
                _.assign({}, suspended,
                {
                  id: suspended.id + '_' + data[i].id,
                  type: 'basal-rate-segment',
                  start: suspended.deviceTime,
                  end: data[i].deviceTime,
                  deliveryType: 'suspend',
                  value: 0
                }
                )
              );
              delete suspends[data[i].joinKey];
            }
          }
          break;
        default:
          retVal.push(data[i]);
      }
    } else {
      retVal.push(data[i]);
    }
  }

  return retVal.concat(Object.keys(suspends).map(function(key){ return suspends[key]; }));
}

var TYPES_TO_INCLUDE = {
  // basals with value 0 don't get excluded because they are legitimate targets for visualization
  'basal-rate-segment': function(e){ return e.start !== e.end; },
  basal: alwaysTrue,
  bolus: notZero,
  cbg: notZero,
  deviceMeta: alwaysTrue,
  message: notZero,
  smbg: notZero,
  wizard: notZero,
  settings: notZero
};

var preprocess = {

  REQUIRED_TYPES: ['basal-rate-segment', 'bolus', 'wizard', 'cbg', 'message', 'smbg', 'settings'],

  OPTIONAL_TYPES: [],

  MMOL_STRING: 'mmol/L',

  MGDL_STRING: 'mg/dL',

  MMOL_TO_MGDL: 18.01559,

  mungeBasals: function(data) {
    var segments = new SegmentUtil(data);
    data = _.reject(data, function(d) {
      return d.type === 'basal-rate-segment';
    });
    if (segments.actual.length === 0) {
      var theBasals = [];
      data
        .filter(function(d){ return d.type === 'basal'; })
        .forEach(function(d){
                         var datum = _.assign(
                           {},
                           d,
                           {
                             type: 'basal-rate-segment',
                             value: d.rate,
                             start: d.deviceTime,
                             end: datetime.addDuration(new Date(d.deviceTime + '.000Z'), d.duration),
                             vizType: 'actual'
                           }
                         );

                         if (datum.suppressed != null) {
                           if (datum.suppressed.deliveryType === 'scheduled') {
                             theBasals.push(_.assign(
                               {},
                               datum.suppressed,
                               {
                                 type: 'basal-rate-segment',
                                 id: datum.id + '_suppressed',
                                 value: datum.suppressed.rate,
                                 start: datum.start,
                                 end: datum.end,
                                 vizType: 'undelivered'
                               }
                             ));
                           }
                         }
                         theBasals.push(datum);
                       });
      return data.filter(function(d){ return d.type !== 'basal'; }).concat(theBasals);
    } else {
      return data.concat(segments.actual.concat(segments.getUndelivered('scheduled')));
    }
  },

  editBoluses: function(data) {
    // two adjustments to boluses here:
    // changed `extended` to false when extendedDelivery = 0
    // (these are instances where someone changed their mind about a combo bolus, basically)
    // ~and~
    // when there is a joinKey to a wizard event from which we can obtain
    // the recommendation for a bolus, extract it to populate the `recommended` field
    var wizards = _.indexBy(data, function(d) {
      if (d.type === 'wizard') {
        return d.joinKey;
      }
    });
    return _.map(data, function(d) {
      if (d.type === 'bolus' && d.joinKey != null) {
        var joined = wizards[d.joinKey];
        if (joined && joined.payload.estimate != null) {
          d.recommended = joined.payload.estimate;
        }
        return d;
      }
      if (d.extended && d.extendedDelivery === 0) {
        d.extended = false;
        return d;
      }
      else {
        return d;
      }
    });
  },

  filterData: function(data) {
    // filter out types we aren't using for visualization
    //  ~and~
    // because of how the Tidepool back end parses some data sources
    // we're creating things like carb events with values of 0, which
    // we don't want to visualize, so...
    // this function also removes all data with value 0 except for basals, since
    // we do want to visualize basals (e.g., temps) with value 0.0

    var counts = {};

    function incrementCount(count, type) {
      if (counts[count] == null) {
        counts[count] = {};
      }

      if (counts[count][type] == null) {
        counts[count][type] = 0;
      }

      ++counts[count][type];
    }

    var nonZeroData = _.filter(data, function(d) {
      var includeFn = TYPES_TO_INCLUDE[d.type];
      if (includeFn == null) {
        incrementCount('excluded', d.type);
        return false;
      }

      var retVal = includeFn(d);
      incrementCount(retVal ? 'included' : 'excluded', d.type);
      return retVal;
    });

    log('Excluded:', counts.excluded || 0);
    log('# of data points', nonZeroData.length);
    log('Data types:', counts.included);

    return nonZeroData;
  },

  processDeviceMeta: function(data) {
    var other = [];
    var deviceMeta = [];

    for (var i = 0; i < data.length; ++i) {
      if (data[i].type === 'deviceMeta') {
        deviceMeta.push(data[i]);
      } else {
        other.push(data[i]);
      }
    }

    return other.concat(processSuspends(deviceMeta));
  },

  runWatson: function(data) {
    data = watson.normalizeAll(data);
    // Ensure the data is properly sorted
    data = _.sortBy(data, function(d) {
      // ISO8601 format lexicographically sorts according to timestamp
      return d.normalTime;
    });
    return data;
  },

  checkRequired: function(tidelineData) {
    _.forEach(this.REQUIRED_TYPES, function(type) {
      if (!tidelineData.grouped[type]) {
        log('No', type, 'data! Replaced with empty array.');
        tidelineData.grouped[type] = [];
      }
    });

    return tidelineData;
  },

  translateMmol: function(data) {
    return _.map(data, function(d) {
      if (d.units === this.MMOL_STRING) {
        d.units = this.MGDL_STRING;
        d.value = parseInt(Math.round(d.value * this.MMOL_TO_MGDL, 10));
      }
      return d;
    }, this);
  },

  basalSchedulesToArray: function(basalSchedules) {
    var schedules = [];
    for(var key in basalSchedules) {
      schedules.push({
        'name': key,
        'value': basalSchedules[key]
      });
    }
    return schedules;
  },

  sortBasalSchedules: function(data) {
    return _.map(data, function(d) {
      var schedules;
      if (d.type === 'settings') {
        schedules = this.basalSchedulesToArray(d.basalSchedules);
        if (d.source === 'carelink') {
          for (var i = 0; i < schedules.length; ++i) {
            if (schedules[i].name.toLowerCase() === 'standard') {
              var standard = schedules[i];
              var index = schedules.indexOf(standard);
              schedules.splice(index, 1);
              schedules = _.sortBy(schedules, function(d) { return d.name; });
              schedules.unshift(standard);
              break;
            }
          }
        }
        d.basalSchedules = schedules;
        return d;
      }
      else {
        return d;
      }
    }, this);
  },

  appendBolusToWizard: function(data) {
    if (!(data && data.length)) {
      log('Unexpected data input, defaulting to empty array.');
      data = [];
    }
    return _.map(data, function(d) {
      if (d.type === 'wizard' && d.joinKey) {
        if (d.payload.carbInput) {
          d.carbs = {
            value: d.payload.carbInput,
            units: d.payload.carbUnits
          }
        }
        d.bolus = _.find(data, function(_d) {
          return _d.type === 'bolus' && _d.joinKey === d.joinKey;
        });
      }
      return d;
    });
  },

  processData: function(data) {
    if (!(data && data.length)) {
      log('Unexpected data input, defaulting to empty array.');
      data = [];
    }

    data = withTiming('editBoluses', this.editBoluses.bind(this), data);
    data = withTiming('filterData', this.filterData.bind(this), data);
    data = withTiming('processDeviceMeta', this.processDeviceMeta.bind(this), data);
    data = withTiming('mungeBasals', this.mungeBasals.bind(this), data);
    data = withTiming('runWatson', this.runWatson.bind(this), data);
    data = withTiming('translateMmol', this.translateMmol.bind(this), data);
    data = withTiming('sortBasalSchedules', this.sortBasalSchedules.bind(this), data);
    data = withTiming('appendBolusToWizard', this.appendBolusToWizard.bind(this), data);

    var tidelineData = this.checkRequired(new TidelineData(data));

    return tidelineData;
  }
};

module.exports = preprocess;
