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

/* jshint esversion:6 */

var _ = require('lodash');

var guid = require('./guid');
var dt = require('../../js/data/util/datetime');

// constants
var { MGDL_UNITS } = require('../../js/data/util/constants');
var MS_IN_24HRS = 86400000;
var APPEND = '.000Z';

var common = {
  deviceId: 'Test Page Data - 123',
  source: 'testpage',
  conversionOffset: 0,
  asObject: function() {
    var clone = {}, key;
    for (key in this) {
      if (typeof this[key] !== 'function') {
        clone[key] = this[key];
      }
    }
    return clone;
  },
  makeDeviceTime: function() {
    return new Date().toISOString().slice(0, -5);
  },
  makeNormalTime: function() {
    return this.deviceTime + APPEND;
  },
  makeTime: function() {
    var d = new Date(this.deviceTime + APPEND);
    var offsetMinutes = d.getTimezoneOffset();
    d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
    return d.toISOString();
  },
  makeTimezoneOffset: function() {
    var d = new Date(this.deviceTime + APPEND);
    var offsetMinutes = d.getTimezoneOffset();
    return -offsetMinutes;
  },
  makeId: function() { return guid(); }
};

var Basal = function(opts) {
  opts = opts || {};
  var defaults = {
    deliveryType: 'scheduled',
    deviceTime: this.makeDeviceTime(),
    duration: MS_IN_24HRS/12,
    rate: 0.5,
    scheduleName: 'standard',
  };
  _.defaults(opts, defaults);

  this.type = 'basal';

  this.deliveryType = opts.deliveryType;
  this.deviceTime = opts.deviceTime;
  this.duration = opts.duration;
  this.rate = opts.rate;
  this.scheduleName = opts.scheduleName;

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();
  this.normalEnd = dt.addDuration(this.normalTime, this.duration);

  this.id = this.makeId();
};

Basal.prototype = common;

var Bolus = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    subType: 'normal',
    value: 5.0
  };
  _.defaults(opts, defaults);

  this.type = 'bolus';
  this.deviceTime = opts.deviceTime;
  this.subType = opts.subType;

  if (this.subType === 'normal') {
    this.normal = opts.value;
  }

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

Bolus.prototype = common;

var CBG = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceId: 'DexG4Rec_XXXXXXXXX',
    deviceTime: this.makeDeviceTime(),
    units: MGDL_UNITS,
    value: 100
  };
  _.defaults(opts, defaults);

  this.type = 'cbg';

  this.deviceId = opts.deviceId;
  this.deviceTime = opts.deviceTime;
  this.units = opts.units;
  this.value = opts.value;

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

CBG.prototype = common;

var Message = function(opts) {
  opts = opts || {};
  var defaults = {
    messageText: 'This is a note.',
    parentMessage: null,
    time: new Date().toISOString()
  };
  _.defaults(opts, defaults);

  this.type = 'message';

  this.time = opts.time;
  var dt = new Date(this.time);
  var offsetMinutes = dt.getTimezoneOffset();
  dt.setUTCMinutes(dt.getUTCMinutes() - offsetMinutes);
  this.normalTime = dt.toISOString();

  this.messageText = opts.messageText;
  this.parentMessage = opts.parentMessage;

  this.id = guid();
};

var Settings = function(opts) {
  opts = opts || {};
  var defaults = {
    activeSchedule: 'standard',
    basalSchedules: [{
      name: 'standard',
      value: [{
        start: 0,
        rate: 1.0
      }]
    }],
    bgTarget: [{
      high: 100,
      low: 80,
      start: 0
    }],
    carbRatio: [{
      amount: 15,
      start: 0
    }],
    deviceTime: this.makeDeviceTime(),
    insulinSensitivity: [{
      amount: 50,
      start: 0
    }],
    units: {
      carb: 'grams',
      bg: MGDL_UNITS
    },
    source: 'Medtronic',
  };
  _.defaults(opts, defaults);

  this.type = 'pumpSettings';

  this.activeSchedule = opts.activeSchedule;
  this.basalSchedules = opts.basalSchedules;
  this.bgTarget = opts.bgTarget;
  this.carbRatio = opts.carbRatio;
  this.deviceTime = opts.deviceTime;
  this.insulinSensitivity = opts.insulinSensitivity;
  this.units = opts.units;
  this.source = opts.source;

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

Settings.prototype = common;

var SMBG = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    units: MGDL_UNITS,
    value: 100
  };
  _.defaults(opts, defaults);

  this.type = 'smbg';

  this.deviceTime = opts.deviceTime;
  this.units = opts.units;
  this.value = opts.value;

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

SMBG.prototype = common;

var DeviceEvent = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    units: 'mg/dL',
    value: 100
  };
  _.defaults(opts, defaults);

  this.type = 'deviceEvent';
  this.subType = opts.subType;

  this.deviceTime = opts.deviceTime;

  this.time = this.makeTime();
  this.createdTime = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();

  this.id = this.makeId();
};

DeviceEvent.prototype = common;

var Upload = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    timezone: 'US/Eastern',
  };
  _.defaults(opts, defaults);

  this.type = 'upload';
  this.deviceTags = opts.deviceTags;
  this.deviceTime = opts.deviceTime;
  this.deviceModel = opts.deviceModel;
  this.source = opts.source;

  this.time = this.makeTime();
  this.timezone = opts.timezone;
  this.normalTime = this.makeNormalTime();
  this.createdTime = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();

  this.id = this.makeId();
};

Upload.prototype = common;

var Wizard = function(opts) {
  opts = opts || {};
  if (opts.bolus) {
    opts.deviceTime = opts.bolus.deviceTime;
  }
  var defaults= {
    bgTarget: {
      high: 120,
      target: 100
    },
    deviceTime: this.makeDeviceTime(),
    insulinCarbRatio: 15,
    insulinSensitivity: 50,
    recommended: {},
    value: 5.0
  };
  _.defaults(opts, defaults);

  this.type = 'wizard';

  this.bgTarget = opts.bgTarget;
  this.bolus = opts.bolus ? opts.bolus : new Bolus({value: opts.value, deviceTime: this.deviceTime});
  this.deviceTime = opts.deviceTime;
  this.insulinCarbRatio = opts.insulinCarbRatio;
  this.insulinSensitivity = opts.insulinSensitivity;
  this.recommended = opts.recommended;

  this.time = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

Wizard.prototype = common;

var PhysicalActivity = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    reportedIntensity: 'medium',
    duration: {
      units: 'minutes',
      value: 30.0
    }
  };
  _.defaults(opts, defaults);

  this.type = 'physicalActivity';

  this.deviceTime = opts.deviceTime;
  this.duration = opts.duration;
  if (opts.inputTime) {
    this.inputTime = opts.inputTime;
  }
  if (opts.eventId) {
    this.eventId = opts.eventId;
  }
  this.reportedIntensity = opts.reportedIntensity;

  this.time = this.makeTime();
  this.createdTime = this.makeTime();
  this.timezoneOffset = this.makeTimezoneOffset();
  this.id = this.makeId();
};

PhysicalActivity.prototype = common;

module.exports = (function() {
  return {
    Basal: Basal,
    Bolus: Bolus,
    CBG: CBG,
    DeviceEvent: DeviceEvent,
    Message: Message,
    Settings: Settings,
    SMBG: SMBG,
    Upload: Upload,
    Wizard: Wizard,
    PhysicalActivity: PhysicalActivity,
  };
}());
