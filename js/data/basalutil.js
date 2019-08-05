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

var format = require('./util/format');
var dt = require('./util/datetime');

var MS_IN_HOUR = 3600000;
var MS_IN_DAY = 86400000;

function BasalUtil(data) {

  this.scheduleTotal = function(schedule) {
    if ((! (schedule && Array.isArray(schedule) && schedule.length > 0))) {
      return NaN;
    }
    var total = 0, duration;
    schedule.push({
      start: MS_IN_DAY
    });
    for (var i = 1; i <= schedule.length - 1; i++) {
      duration = schedule[i].start - schedule[i - 1].start;
      total += this.segmentDose(duration, schedule[i - 1].rate);
    }

    schedule.pop();

    return format.fixFloatingPoint(total);
  };

  this.segmentDose = function(duration, rate) {
    var hours = duration / MS_IN_HOUR;
    return format.fixFloatingPoint(hours * rate);
  };

  this.subtotal = function(endpoints) {
    var dose = 0.0;
    var start = new Date(endpoints.start.datetime), end = new Date(endpoints.end.datetime);
    // handle first segment, which may have started before the start endpoint
    var segment = this.actual[endpoints.start.index];
    dose += this.segmentDose((new Date(segment.normalEnd) - start), segment.rate);
    var i = endpoints.start.index + 1;
    while (i < endpoints.end.index) {
      segment = this.actual[i];
      dose += this.segmentDose(segment.duration, segment.rate);
      i++;
    }
    segment = this.actual[endpoints.end.index];
    // handle last segment, which may go past the end endpoint
    dose += this.segmentDose((end - new Date(segment.normalTime)), segment.rate);
    return format.fixFloatingPoint(dose);
  };

  this.getEndpoints = function(s, e, optionalExtents = false) {
    var start = new Date(s), end = new Date(e);
    var startIndex = _.findIndex(this.actual, function(segment) {
      return (optionalExtents || new Date(segment.normalTime).valueOf() <= start) && (start <= new Date(segment.normalEnd).valueOf());
    });
    var endIndex = _.findLastIndex(this.actual, function(segment) {
      return (new Date(segment.normalTime).valueOf() <= end) && (optionalExtents || end <= new Date(segment.normalEnd).valueOf());
    });

    return {
      start: {
        datetime: start.toISOString(),
        index: startIndex,
      },
      end: {
        datetime: end.toISOString(),
        index: endIndex,
      },
    };
  };

  this.getContinuousEndpoints = function(s, e) {
    var endpoints = this.getEndpoints(s, e);

    if ((endpoints.start.index >= 0) && (endpoints.end.index >= 0)) {
      var i = endpoints.start.index;
      while (i < endpoints.end.index) {
        var s1 = this.actual[i], s2 = this.actual[i + 1];
        if (s1.normalEnd !== s2.normalTime) {
          return false;
        }
        i++;
      }
      return endpoints;
    }
    else {
      return false;
    }
  };

  /**
   * getBasalPathGroupType
   * @param {Object} basal - single basal datum
   * @return {String} the path group type
   */
  this.getBasalPathGroupType = function(datum) {
    var deliveryType = _.get(datum, 'deliveryType');
    var suppressedDeliveryType = _.get(datum, 'suppressed.deliveryType');
    return _.includes([deliveryType, suppressedDeliveryType], 'automated') ? 'automated' : 'manual';
  };

  /**
   * getBasalPathGroups
   * @param {Array} basals - Array of preprocessed Tidepool basal objects
   * @return {Array} groups of alternating 'automated' and 'manual' datums
   */
  this.getBasalPathGroups = function(basals) {
    var basalPathGroups = [];
    var currentPathType;
    _.each(basals, datum => {
      var pathType = this.getBasalPathGroupType(datum);
      if (pathType !== currentPathType) {
        currentPathType = pathType;
        basalPathGroups.push([]);
      }
      _.last(basalPathGroups).push(datum);
    });

    return basalPathGroups;
  };

  this.actual = data;

  this.data = data || [];
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, dt.addDuration(this.data[this.data.length - 1].normalTime, this.data[this.data.length - 1].duration)];
  }
}

module.exports = BasalUtil;
