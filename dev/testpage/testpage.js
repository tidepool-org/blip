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
var moment = require('moment');

var days = require('./days');

module.exports = (function() {
  var cbgDay = new days.CBGDay();
  var smbgDay = new days.SMBGDay({interval: 30});
  var carbsDay = new days.CarbsDay();
  var bolusDay = new days.BolusDay();

  function full() {
    var values = [60,110,300], data = [];
    values.forEach(function(val) {
      data.push(cbgDay.generateFull(cbgDay.opts.patterns.steady, {
        seedValue: val
      }));
    });
    data.push(smbgDay.generateFull(smbgDay.opts.patterns.ident, {
      start: moment('2008-01-01T00:30:00.000Z')
    }));
    data.push(smbgDay.generateFull(smbgDay.opts.patterns.ident, {
      start: moment('2008-01-01T21:00:00.000Z'),
      reverse: true
    }));
    data.push(smbgDay.generateFull(smbgDay.opts.patterns.ident, {
      start: moment('2008-01-01T06:30:00.000Z')
    }));
    data.push(smbgDay.generateFull(smbgDay.opts.patterns.ident, {
      start: moment('2008-01-01T15:00:00.000Z'),
      reverse: true
    }));
    var alternating = carbsDay.opts.patterns.alternating(100);
    data.push(carbsDay.generateFull(alternating, {
      start: moment('2008-01-01T01:00:00.000Z')
    }));
    var allFeatureSets = bolusDay.opts.patterns.allFeatureSets();
    data.push(bolusDay.generateFull(allFeatureSets, {
      start: moment('2008-01-01T00:00:00.000Z')
    }));
    return _.flatten(data);
  }

  return {
    full: full
  };
})();