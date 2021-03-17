
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

import _ from 'lodash';
import moment from 'moment-timezone';

import { MS_IN_DAY } from './constants';

const datetime = {
  APPEND: 'T00:00:00.000Z',

  addDays: function(s, n) {
    var d = moment.utc(s);
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

  applyOffset: function(d, offset) {
    var date = new Date(d);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
    return new Date(date).toISOString();
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

  findBasicsDays: function(/** @type {string[]} */ range, timezone = 'UTC') {
    const currentDate = moment.utc(range[0]).tz(timezone);
    const dateOfUpload = moment.utc(range[1]).tz(timezone);
    const endOfWeek = moment.utc(dateOfUpload).tz(timezone).endOf('isoWeek');

    const days = [];
    while (currentDate.isBefore(endOfWeek)) {
      const date = currentDate.format('YYYY-MM-DD');
      const dateObj = { date, type: 'past' };
      if (currentDate.isSame(dateOfUpload, 'day')) {
        dateObj.type = 'mostRecent';
      } else if (currentDate.isAfter(dateOfUpload, 'day')) {
        dateObj.type = 'future';
      }
      days.push(dateObj);
      currentDate.add(1, 'day');
    }
    return days;
  },

  findBasicsStart: function(/** @type {string} */ timestamp, timezone = 'UTC') {
    return moment.utc(timestamp).tz(timezone)
      .startOf('isoWeek')
      .subtract(14, 'days')
      .toDate().toISOString();
  },

  getBrowserTimezone: function() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  getDuration: function(d1, d2) {
    return new Date(d2).valueOf() - new Date(d1).valueOf();
  },

  getLocalDate: function(d, timezoneName) {
    timezoneName = timezoneName || 'UTC';
    return moment.utc(d).tz(timezoneName).format('YYYY-MM-DD');
  },

  getLocalDayOfWeek: function(d, timezoneName) {
    timezoneName = timezoneName || 'UTC';
    return this.weekdayLookup(moment.utc(d).tz(timezoneName).day());
  },

  getMidnight: function(d, next) {
    if (next) {
      return this.getMidnight(this.addDays(d, 1));
    }
    else {
      return this.toISODateString(d) + this.APPEND;
    }
  },

  /**
   * Return the number of miliseconds since midnight
   * @param {string|moment.Moment} d a date
   */
  getMsFromMidnight: function(d) {
    if (moment.isMoment(d)) {
      let val = d.hours() * 1000 * 60 * 60;
      val += d.minutes() * 1000 * 60;
      val += d.seconds() * 1000;
      val += d.milliseconds();
      return val;
    }
    var midnight = new Date(this.getMidnight(d)).valueOf();
    return new Date(d).valueOf() - midnight;
  },

  // this does basically the same as above method
  // but I don't want to take the time right now to consolidate them
  // and make sure all uses of former are covered by latter
  getMsPer24: function(d, timezoneName) {
    timezoneName = timezoneName || 'UTC';
    var localized = moment.utc(d).tz(timezoneName);
    var hrsToMs = localized.hours() * 1000 * 60 * 60;
    var minToMs = localized.minutes() * 1000 * 60;
    var secToMs = localized.seconds() * 1000;
    var ms = localized.milliseconds();
    return hrsToMs + minToMs + secToMs + ms;
  },

  getOffset: function(d, timezoneName) {
    return moment.tz.zone(timezoneName).utcOffset(Date.parse(d));
  },

  getNumDays: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    return Math.ceil((end - start)/MS_IN_DAY);
  },

  getUTCOfLocalPriorMidnight: function(d, timezoneName) {
    timezoneName = timezoneName || 'UTC';
    var local = moment.utc(d).tz(timezoneName);
    return local.startOf('day').toDate().toISOString();
  },

  getUTCOfLocalNextMidnight: function(d, timezoneName) {
    timezoneName = timezoneName || 'UTC';
    var local = moment.utc(d).tz(timezoneName);
    return new Date(local.endOf('day').valueOf() + 1).toISOString();
  },

  isATimestamp: function(s) {
    if (isNaN(Date.parse(s))) {
      return false;
    }
    else {
      return true;
    }
  },

  isLessThanTwentyFourHours: function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    if (end - start < MS_IN_DAY) {
      return true;
    }
    else { return false; }
  },

  isNearRightEdge: function(d, edge) {
    // check if d.normalTime is within six hours before edge
    var t = new Date(d.normalTime);
    if (edge.valueOf() - t.valueOf() < MS_IN_DAY/4) {
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
    if (end - start === MS_IN_DAY) {
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
    let date;
    if (!(moment.isMoment(d) || d instanceof Date)) {
      date = moment.utc(d);
    } else {
      date = d;
    }
    return date.toISOString().slice(0,10);
  },

  smbgEdge: function(d, offset) {
    var date = offset ? new Date(this.applyOffset(d, offset)) : new Date(d);
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
  },

  weekdayLookup: function(n) {
    if (n < 0 || n > 6) {
      console.error('weekdayLookup: invalid day', n);
      return null;
    }
    var weekdays = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    return weekdays[n];
  },

  /**
   * setTimeout() as promised
   * @param {number} timeout in milliseconds
   * @returns Promise<void>
   */
  waitTimeout: (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  },
};

export default datetime;
