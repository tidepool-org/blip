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

function BasalUtil(data) {

  this.segmentDose = function(duration, rate) {
    var hours = duration / MS_IN_HOUR;
    return format.fixFloatingPoint(hours * rate);
  };

  this.totalBasal = function(s, e) {
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      // return the total basal dose between two arbitrary datetimes
      var dose = 0.0;
      var start = new Date(s).valueOf(), end = new Date(e).valueOf();
      var firstSegment = _.find(this.actual, function(segment) {
        return (new Date(segment.normalTime).valueOf() <= start) && (start <= new Date(segment.normalEnd).valueOf());
      });
      if (firstSegment) {
        var index = this.actual.indexOf(firstSegment) + 1;
        var lastSegment = _.find(this.actual, function(segment) {
          return (new Date(segment.normalTime).valueOf() <= end) && (end <= new Date(segment.normalEnd).valueOf());
        });
        var lastIndex = this.actual.indexOf(lastSegment);
        dose += this.segmentDose(new Date(firstSegment.normalEnd) - start, firstSegment.value);
        while (index < lastIndex) {
          var segment = this.actual[index];
          dose += this.segmentDose((new Date(segment.normalEnd) - new Date(segment.normalTime)), segment.value);
          index++;
        }
        if (lastSegment) {
          dose += this.segmentDose(e - new Date(lastSegment.normalTime), lastSegment.value);
        }
        else {
          // when there isn't a complete domain of basal data
          return NaN;
        }
      }
      else {
        // when there isn't a complete domain of basal data
        return NaN;
      }
      return format.fixFloatingPoint(dose);
    }
    else {
      return NaN;
    }
  };

  this.actual = _.where(data, {'vizType': 'actual'});
  this.undelivered = _.where(data, {'vizType': 'undelivered'});

  this.data = data;
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalEnd];
  }
}

module.exports = BasalUtil;