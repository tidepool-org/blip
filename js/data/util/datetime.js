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

var datetime = {

  APPEND: 'T00:00:00.000Z',

  MS_IN_24: 86400000,

  addDays: function(s, n) {
    var d = moment(s);
    d.add(n, 'days');
    return d.toISOString();
  },

  addDuration: function(datetime, duration) {
    datetime = new Date(datetime);

    return new Date(datetime.valueOf() + duration).toISOString();
  },

  adjustToInnerEndpoints: function(s, e, endpoints) {
    if (!endpoints) {
      return null;
    }
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    var thisTypeStart = new Date(endpoints[0]).valueOf(), thisTypeEnd = new Date(endpoints[1]).valueOf();
    if (start < thisTypeStart) {
      return [thisTypeStart, end];
    }
    else if (end > thisTypeEnd) {
      return [start, thisTypeEnd];
    }
    else {
      return [start, end];
    }
  },

  checkIfDateInRange: function(s, endpoints) {
    var d = new Date(s);
    var start = new Date(endpoints[0]);
    var end = new Date(endpoints[1]);
    if ((d.valueOf() >= start.valueOf()) && (d.valueOf() <= end.valueOf())) {
      return true;
    }
    else {
      return false;
    }
  },

  checkIfUTCDate: function(s) {
    var d = new Date(s);
    if (typeof s === 'number') {
      if (d.getUTCFullYear() < 2008) {
        return false;
      }
      else {
        return true;
      }
    }
    else if (s.slice(s.length - 1, s.length) !== 'Z') {
      return false;
    }
    else {
      if (s === d.toISOString()) {
        return true;
      }
      else {
        return false;
      }
    }
  },

  composeMsAndDateString: function(ms, d) {
    return new Date(ms + new Date(this.toISODateString(d) + this.APPEND).valueOf()).toISOString();
  },

  difference: function(d2, d1) {
    return new Date(d2) - new Date(d1);
  },

  getDuration: function(d1, d2) {
    return new Date(d2).valueOf() - new Date(d1).valueOf();
  },

  getMidnight: function(d, next) {
    if (next) {
      return this.getMidnight(this.addDays(d, 1));
    }
    else {
      return this.toISODateString(d) + this.APPEND;
    }
  },

  getMsFromMidnight: function(d) {
    var midnight = new Date(this.getMidnight(d)).valueOf();
    return new Date(d).valueOf() - midnight;
  },

  getNumDays: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    return Math.ceil((end - start)/this.MS_IN_24);
  },

  isLessThanTwentyFourHours: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    if (end - start < this.MS_IN_24) {
      return true;
    }
    else { return false; }
  },

  isNearRightEdge: function(d, edge) {
    // check if d.normalTime is within six hours before edge
    var t = new Date(d.normalTime);
    if (edge.valueOf() - t.valueOf() < this.MS_IN_24/4) {
      return true;
    }
    return false;
  },

  isSegmentAcrossMidnight: function(s, e) {
    var start = new Date(s), end = new Date(e);
    var startDate = this.toISODateString(s), endDate = this.toISODateString(e);
    if (startDate === endDate) {
      return false;
    }
    else {
      if (end.getUTCDate() === start.getUTCDate() + 1) {
        if (this.getMidnight(e) === e) {
          return false;
        }
        return true;
      }
      else {
        return false;
      }
    }
  },

  isTwentyFourHours: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    if (end - start === this.MS_IN_24) {
      return true;
    }
    else { return false; }
  },

  roundToNearestMinutes: function(d, resolution) {
    var date = new Date(d);
    var min = date.getUTCMinutes();
    var values = _.range(0, 60, resolution);
    for (var i = 0; i < values.length; ++i) {
      if (min - values[i] < resolution/2) {
        date.setUTCMinutes(values[i]);
        return date.toISOString();
      }
      else if (i === values.length - 1) {
        date.setUTCMinutes(0);
        date.setUTCHours(date.getUTCHours() + 1);
        return date.toISOString();
      }
    }
  },

  toISODateString: function(d) {
    var date = new Date(d);
    return date.toISOString().slice(0,10);
  },

  smbgEdge: function(d) {
    var date = new Date(d);
    if (date.getUTCHours() <= 2) {
      return 'left';
    }
    else if (date.getUTCHours() >= 21) {
      return 'right';
    }
    else {
      return null;
    }
  },

  verifyEndpoints: function(s, e, endpoints) {
    if (!endpoints) {
      return null;
    }
    if (this.checkIfUTCDate(s) && this.checkIfUTCDate(e)) {
      endpoints = this.adjustToInnerEndpoints(s, e, endpoints);
      s = endpoints[0];
      e = endpoints[1];
      if (this.checkIfDateInRange(s, endpoints) && this.checkIfDateInRange(e, endpoints)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
};

module.exports = datetime;