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

  isTwentyFourHours: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    if (end - start === this.MS_IN_24) {
      return true;
    }
    else { return false; }
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