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

var _ = require('../lib/')._;
var format = require('./util/format');
var datetime = require('./util/datetime');
var log = require('../lib/').bows('BasalUtil');

var MS_IN_HOUR = 3600000.0;
var MS_IN_DAY = 86400000;

function BasalUtil(data) {

  this.segmentDose = function(duration, rate) {
    var hours = duration / MS_IN_HOUR;
    return format.fixFloatingPoint(hours * rate);
  };

  this.subtotal = function(endpoints) {
    var dose = 0.0;
    var start = new Date(endpoints.start.datetime), end = new Date(endpoints.end.datetime);
    // handle first segment, which may have started before the start endpoint
    var segment = this.actual[endpoints.start.index];
    dose += this.segmentDose((new Date(segment.normalEnd) - start), segment.value);
    var i = endpoints.start.index + 1;
    while (i < endpoints.end.index) {
      segment = this.actual[i];
      dose += this.segmentDose((new Date(segment.normalEnd) - new Date(segment.normalTime)), segment.value);
      i++;
    }
    segment = this.actual[endpoints.end.index];
    // handle last segment, which may go past the end endpoint
    dose += this.segmentDose((end - new Date(segment.normalTime)), segment.value);
    return format.fixFloatingPoint(dose);
  };

  this.isContinuous = function(s, e) {
    var start = new Date(s), end = new Date(e);
    var firstSegment = _.find(this.actual, function(segment) {
        return (new Date(segment.normalTime).valueOf() <= start) && (start <= new Date(segment.normalEnd).valueOf());
      });
    var lastSegment = _.find(this.actual, function(segment) {
        return (new Date(segment.normalTime).valueOf() <= end) && (end <= new Date(segment.normalEnd).valueOf());
      });
    if (firstSegment && lastSegment) {
      var startIndex = this.actual.indexOf(firstSegment), endIndex = this.actual.indexOf(lastSegment);
      var i = startIndex;
      while (i < endIndex) {
        var s1 = this.actual[i], s2 = this.actual[i + 1];
        if (s1.normalEnd !== s2.normalTime) {
          return false;
        }
        i++;
      }
      return {
        'start': {
          'datetime': start.toISOString(),
          'index': startIndex
        },
        'end': {
          'datetime': end.toISOString(),
          'index': endIndex
        }
      };
    }
    else {
      return false;
    }
  };

  this.totalBasal = function(s, e, opts) {
    opts = opts || {};
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      if (datetime.isTwentyFourHours(s, e)) {
        var endpoints = this.isContinuous(s, e);
        if (endpoints) {
          return {'total': this.subtotal(endpoints)};
        }
        else {
          log('Basal data within this 24 hours is not continuous; cannot calculate basal total.');
          return {'total': NaN};
        }
      }
      else if (datetime.isLessThanTwentyFourHours(s, e)) {
        log('Data domain less than twenty-four hours; cannot calculate basal total.');
        return {'total': NaN};
      }
      else {
        var dose = 0.0;
        var excluded = [];
        var start = new Date(s), end = new Date(e);
        var n = datetime.getNumDays(s, e);
        for (var j = 0; j < n; j++) {
          var dayStart = new Date(start);
          var dayEnd = new Date(dayStart);
          dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
          var endpoints = this.isContinuous(dayStart.toISOString(), dayEnd.toISOString());
          if (endpoints && datetime.isTwentyFourHours(dayStart.toISOString(), dayEnd.toISOString())) {
            if (isNaN(this.subtotal(endpoints))) {
              excluded.push(dayStart.toISOString().slice(0,10));
            }
            else {
              dose += this.subtotal(endpoints);
            }
          }
          else {
            excluded.push(dayStart.toISOString().slice(0,10));
          }
          start.setUTCDate(start.getUTCDate() + 1);
        }
        if (excluded.length <= opts.exclusionThreshold) {
          return {
            'total': dose,
            'excluded': excluded
          };
        }
        else {
          log(excluded.length, 'days excluded. Not enough days with basal data to calculate basal total.');
          return {
            'total': NaN,
            'excluded': excluded
          };
        }
      }
    }
    else {
      return {'total': NaN};
    }
  };

  this.actual = _.where(data, {'vizType': 'actual'});
  this.undelivered = _.where(data, {'vizType': 'undelivered'});

  this.data = data;
  this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalEnd];
}

module.exports = BasalUtil;