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

var datetime = {

  APPEND: 'T00:00:00.000Z',

  MS_IN_24: 86400000,

  addDays: function(s, n) {
    var d = new Date(s);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString();
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

  isTwentyFourHours: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    if (end - start === this.MS_IN_24) {
      return true;
    }
    else { return false; }
  },

  toISODateString: function(d) {
    var date = new Date(d);
    return date.toISOString().slice(0,10);
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