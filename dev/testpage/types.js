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
var dt = require('../../js/data/util/datetime');

// constants
var MS_IN_24HRS = 86400000;
var APPEND = '.000Z';

var common = {
  deviceId: 'Test Page Data - 123',
  source: 'testpage',
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
  makeId: function() { return guid(); }
};

var Basal = function(opts) {
  opts = opts || {};
  var defaults = {
    deliveryType: 'scheduled',
    deviceTime: this.makeDeviceTime(),
    duration: MS_IN_24HRS/12,
    rate: 0.5
  };
  _.defaults(opts, defaults);

  this.type = 'basal';

  this.deliveryType = opts.deliveryType;
  this.deviceTime = opts.deviceTime;
  this.duration = opts.duration;
  this.rate = opts.rate;

  this.time = this.makeTime();
  this.normalTime = this.makeNormalTime();
  this.normalEnd = dt.addDuration(this.normalTime, this.duration);
  
  this.id = this.makeId();
};

Basal.prototype = common;

var CBG = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    units: 'mg/dL',
    value: 100
  };
  _.defaults(opts, defaults);

  this.type = 'cbg';

  this.deviceTime = opts.deviceTime;
  this.units = opts.units;
  this.value = opts.value;

  this.time = this.makeTime();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

CBG.prototype = common;

var SMBG = function(opts) {
  opts = opts || {};
  var defaults = {
    deviceTime: this.makeDeviceTime(),
    units: 'mg/dL',
    value: 100
  };
  _.defaults(opts, defaults);

  this.type = 'smbg';

  this.deviceTime = opts.deviceTime;
  this.units = opts.units;
  this.value = opts.value;

  this.time = this.makeTime();
  this.normalTime = this.makeNormalTime();

  this.id = this.makeId();
};

SMBG.prototype = common;

module.exports = (function() {
  return {
    Basal: Basal,
    CBG: CBG,
    SMBG: SMBG
  };
}());