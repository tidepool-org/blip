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
var MS_IN_24 = 86400000;
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
  features = features || {'value': null};
  var featureSets = {
    'normal': {
    },
    'extendedHalf': {
      'extended': true,
      'extendedDelivery': 0.5 * features.value,
      'initialDelivery': 0.5 * features.value,
      'duration': MS_IN_24/12
    },
    'extendedQuarterUnderride': {
      'extended': true,
      'extendedDelivery': 0.75 * features.value,
      'initialDelivery': 0.25 * features.value,
      'duration': MS_IN_24/18,
      'recommended': features.value + 2
    },
    'square': {
      'extended': true,
      'extendedDelivery': features.value,
      'initialDelivery': 0.0,
      'duration': MS_IN_24/24
    },
    'override': {
      'recommended': features.value - 1,
    },
    'underride': {
      'recommended': features.value + 1.5
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attributes if arguments
  if (arguments.length) {
    this.deviceTime = deviceTime;
    this.id = this.makeId();
    this.joinKey = this.makeId();
    this.type = 'bolus';
    this.value = features.value;
    _.defaults(this, featureSets[features.featureSet]);
  }
};

Bolus.prototype = common;

var Wizard = function(deviceTime, features) {
  features = features || {'value': null, 'joinKey': null};
  var featureSets = {
    'default': {
      'payload': {
        'carbUnits': 'grams',
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
  var baseDuration = MS_IN_24/48;

  features = features || {'incrementer': null};
  var featureSets = {
    'scheduled': {
      'deliveryType': 'scheduled',
      'duration': baseDuration,
      'incrementer': features.incrementer,
      'start': deviceTime,
      'end': this.addInterval(deviceTime + APPEND, {'milliseconds': baseDuration}).utc().format().slice(0, -6)
    }
  };
  this.getAllFeatureSetNames = getAllFeatureSetNames(featureSets);
  // only fill out attributes if arguments
  if (arguments.length) {
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

module.exports = (function() {
  return {
    CBG: CBG,
    SMBG: SMBG,
    Carbs: Carbs,
    Bolus: Bolus,
    Wizard: Wizard,
    Basal: Basal
  };
}());