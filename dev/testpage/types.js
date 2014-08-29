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

var guid = require('./guid');
var dt = require('./datetime');

// common elements
var MS_IN_24HRS = 86400000;
var MS_IN_10MIN = 600000;
var APPEND = '.000Z';

var getAllFeatureSetNames = function(featureSets) {
  featureSets = featureSets || {};
  return function() {
    var names = [];
    for (var key in featureSets) {
      if (featureSets.hasOwnProperty(key)) {
        names.push(key);
      }
    }
    return names;
  };
};

var common = {
  deviceId: 'Demo Data - 123',
  source: 'demo',
  asObject: function() {
    var clone = {}, key;
    for (key in this) {
      if (typeof this[key] !== 'function') {
        clone[key] = this[key];
      }
    }
    return clone;
  },
  makeId: function() { return guid(); }
};

var CBG = function(deviceTime, value) {
  this.deviceTime = deviceTime;
  this.id = this.makeId();
  this.type = 'cbg';
  this.value = value;
};

CBG.prototype = common;

var SMBG = function(deviceTime, value) {
  this.deviceTime = deviceTime;
  this.id = this.makeId();
  this.type = 'smbg';
  this.value = value;
};

SMBG.prototype = common;

var Carbs = function(deviceTime, value) {
  this.deviceTime = deviceTime;
  this.id = this.makeId();
  this.type = 'carbs';
  this.value = value;
};

Carbs.prototype = common;

var Bolus = function(deviceTime, features) {
  features = features || {'value': null, 'addJoinKey': true};
  var featureSets = {
    'normal': {
    },
    'extendedHalf': {
      'extended': true,
      'extendedDelivery': 0.5 * features.value,
      'initialDelivery': 0.5 * features.value,
      'duration': MS_IN_24HRS/12
    },
    'extendedQuarterUnderride': {
      'extended': true,
      'extendedDelivery': 0.75 * features.value,
      'initialDelivery': 0.25 * features.value,
      'duration': MS_IN_24HRS/18,
      'recommended': features.value + 2
    },
    'square': {
      'extended': true,
      'extendedDelivery': features.value,
      'initialDelivery': 0.0,
      'duration': MS_IN_24HRS/24
    },
    'override': {
      'recommended': features.value - 1,
    },
    'underride': {
      'recommended': features.value + 1.5
    },
    'interrupted': {
      'programmed': features.value,
      'recommended': features.value - 2,
      'value': features.value - (features.value * 0.9)
    },
    'interruptedExtended': {
      'extended': true,
      'extendedDelivery': 0.5 * features.value * 0.6,
      'initialDelivery': 0.5 * features.value,
      'duration': MS_IN_24HRS/12,
      'programmed': features.value,
      'suspendedAt': this.addInterval(deviceTime + APPEND, {'milliseconds': MS_IN_24HRS/12 - (MS_IN_10MIN * 4)}).utc().format().slice(0, -6) + APPEND,
      'value': features.value * 0.8
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attributes if arguments
  if (arguments.length) {
    this.deviceTime = deviceTime;
    this.id = this.makeId();
    if (features.addJoinKey) {
      this.joinKey = this.makeId();
    }
    this.type = 'bolus';
    if (!this.value) {
      this.value = features.value;
    }
    _.assign(this, featureSets[features.featureSet]);
  }
};

Bolus.prototype = common;

var Wizard = function(deviceTime, features) {
  features = features || {'value': null, 'joinKey': null};
  var featureSets = {
    'default': {
      'payload': {
        'carbInput': features.value
      }
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attributes if arguments
  if (arguments.length) {
    this.deviceTime = deviceTime;
    this.id = this.makeId();
    if (features.joinKey) {
      this.joinKey = features.joinKey;
    }
    this.type = 'wizard';
    _.defaults(this, featureSets[features.featureSet]);
  }
};

Wizard.prototype = common;

var Basal = function(deviceTime, features) {
  var baseDuration = MS_IN_24HRS/48;

  features = features || {'incrementer': null};
  var featureSets = {
    'scheduled': {
      'duration': baseDuration,
      'incrementer': features.incrementer,
      'start': deviceTime,
      'end': this.addInterval(deviceTime + APPEND, {'milliseconds': baseDuration}).utc().format().slice(0, -6)
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attributes if arguments
  if (arguments.length) {
    this.deliveryType = 'scheduled';
    this.deviceTime = deviceTime;
    this.id = this.makeId();
    this.type = 'basal-rate-segment';
    var incrementer = featureSets[features.featureSet].incrementer;
    this.value = incrementer();
    _.defaults(this, featureSets[features.featureSet]);
  }
};

Basal.prototype = common;
Basal.prototype.addInterval = dt.addInterval;

var TempBasal = function(deviceTime, features) {
  features = features || {};
  var featureSets = {
    'longTemp': {
      'duration': MS_IN_24HRS/6 - MS_IN_10MIN * 3,
      'start': deviceTime,
      'end': this.addInterval(deviceTime + APPEND, {'milliseconds': MS_IN_24HRS/6 - MS_IN_10MIN * 3}).utc().format().slice(0, -6)
    },
    'longTempFiftyPercent': {
      'duration': MS_IN_24HRS/16,
      'start': deviceTime,
      'percent': 0.5,
      'end': this.addInterval(deviceTime + APPEND, {'milliseconds': MS_IN_24HRS/16}).utc().format().slice(0, -6)
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attribute if arguments
  if (arguments.length) {
    this.deliveryType = 'temp';
    this.deviceTime = deviceTime;
    this.id = this.makeId();
    this.type = 'basal-rate-segment';
    if (this.percent == null) {
      this.value = features.value ? features.value : 0.0;
    }
    _.defaults(this, featureSets[features.featureSet]);
  }
};

TempBasal.prototype = common;
TempBasal.prototype.addInterval = dt.addInterval;

module.exports = (function() {
  return {
    CBG: CBG,
    SMBG: SMBG,
    Carbs: Carbs,
    Bolus: Bolus,
    Wizard: Wizard,
    Basal: Basal,
    TempBasal: TempBasal
  };
}());