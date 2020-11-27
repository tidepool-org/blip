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

var types = require('./types');
var utils = require('./utils');

var dt = require('../../js/data/util/datetime');

// constants
var MS_IN_24HRS = 86400000;
var APPEND = '.000Z';

var CBGMIN = 0.75*288, SMBGMIN = 4;

var naiveTimestamp = function() {
  return new Date().toISOString().slice(0, -5);
};

module.exports = (function() {
  return {
    basal: {
      constant: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          rate: 1.0,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var dur = MS_IN_24HRS/4;
        var basals = [];
        var next = new utils.Intervaler(opts.start, dur);
        for (var i = 0; i < opts.days * 4; ++i) {
          basals.push(new types.Basal({
            rate: opts.rate,
            duration: MS_IN_24HRS/4,
            deviceTime: next()
          }));
        }
        return basals;
      }
    },
    bolus: {
      constantFour: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 2.5,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var dur = MS_IN_24HRS/4;
        var boluses = [];
        var next = new utils.Intervaler(opts.start, dur);
        for (var i = 0; i < opts.days * 4; ++i) {
          boluses.push(new types.Bolus({
            value: opts.value,
            deviceTime: next()
          }));
        }
        return boluses;
      }
    },
    cbg: {
      constantFull: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp(),
          deviceId: 'Dexcom_XXXXXX',
        };
        _.defaults(opts, defaults);

        var cbgs = [];
        var next = new utils.Intervaler(opts.start, 1000*60*5);
        var end = dt.addDuration(dt.addDuration(opts.start + APPEND, MS_IN_24HRS*opts.days), -1000*60*5);
        var current = opts.start;
        while (current !== end.slice(0, -5)) {
          current = next();
          cbgs.push(new types.CBG({
            value: opts.value,
            deviceId: opts.deviceId,
            deviceTime: current
          }));
        }
        return cbgs;
      },
      constantJustEnough: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp(),
          cbgMin: CBGMIN,
          deviceId: 'Dexcom_XXXXXX',
        };
        _.defaults(opts, defaults);

        var cbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, 1000*60*5);
          while (j < opts.cbgMin) {
            cbgs.push(new types.CBG({
              value: opts.value,
              deviceId: opts.deviceId,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return cbgs;
      },
      constantJustEnoughMmoll: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 8.56,
          start: naiveTimestamp(),
          cbgMin: CBGMIN,
          deviceId: 'Dexcom_XXXXXX',
        };
        _.defaults(opts, defaults);

        var cbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, 1000*60*5);
          while (j < opts.cbgMin) {
            cbgs.push(new types.CBG({
              value: opts.value,
              deviceId: opts.deviceId,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return cbgs;
      },
      constantInadequate: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp(),
          cbgMin: CBGMIN,
          deviceId: 'Dexcom_XXXXXX',
        };
        _.defaults(opts, defaults);

        var cbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, 1000*60*5);
          while (j < (opts.cbgMin - 1)) {
            cbgs.push(new types.CBG({
              value: opts.value,
              deviceId: opts.deviceId,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return cbgs;
      }
    },
    smbg: {
      constantFull: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var smbgs = [];
        var next = new utils.Intervaler(opts.start, MS_IN_24HRS/4);
        var end = dt.addDuration(opts.start + '.000Z', MS_IN_24HRS*opts.days);
        var current = opts.start;
        while (current !== end.slice(0, -5)) {
          current = next();
          smbgs.push(new types.SMBG({
            value: opts.value,
            deviceTime: current
          }));
        }
        return smbgs;
      },
      constantJustEnough: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var smbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, MS_IN_24HRS/24);
          while (j < SMBGMIN) {
            smbgs.push(new types.SMBG({
              value: opts.value,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return smbgs;
      },
      constantJustEnoughMmoll: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 8.56,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var smbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, MS_IN_24HRS/24);
          while (j < SMBGMIN) {
            smbgs.push(new types.SMBG({
              value: opts.value,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return smbgs;
      },
      constantInadequate: function(opts) {
        opts = opts || {};
        var defaults = {
          days: 1,
          value: 100,
          start: naiveTimestamp()
        };
        _.defaults(opts, defaults);

        var smbgs = [];
        var start = opts.start;
        for (var i = 0; i < opts.days; ++i) {
          var j = 0;
          var next = new utils.Intervaler(start, MS_IN_24HRS/24);
          while (j < SMBGMIN - 1) {
            smbgs.push(new types.SMBG({
              value: opts.value,
              deviceTime: next()
            }));
            j++;
          }
          start = dt.addDuration(start + APPEND, MS_IN_24HRS);
        }
        return smbgs;
      }
    }
  };
}());
