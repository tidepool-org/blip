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

var d3 = require('d3');
var Duration = require('duration-js');
var moment = require('moment-timezone');
var { MGDL_UNITS, DDDD_MMMM_D_FORMAT, HOUR_FORMAT, MMMM_D_FORMAT } = require('./constants');

const i18next = require('i18next');
const t = i18next.t.bind(i18next);

var format = {

  MS_IN_24: 86400000,

  tooltipBG: function(d, units) {
    if (d.annotations && Array.isArray(d.annotations) && d.annotations.length > 0) {
      var annotation = d.annotations[0];
      if (annotation.code && annotation.code === 'bg/out-of-range') {
        var value = annotation.value;
        if (value === 'low') {
          d.tooltipText = d.type === 'cbg' ? 'Lo' : 'Low';
        }
        else if (value === 'high') {
          d.tooltipText = d.type === 'cbg' ? 'Hi' : 'High';
        }
      }
    }
    return format.tooltipBGValue(d.value, units);
  },

  tooltipBGValue: function(value, units) {
    return units === MGDL_UNITS ? d3.format('g')(Math.round(value)) : d3.format('.1f')(value);
  },

  tooltipValue: function(x) {
    if (x === 0) {
      return '0.0';
    }
    else {
      var formatted = d3.format('.3f')(x);
      // remove zero-padding on the right
      while (formatted[formatted.length - 1] === '0') {
        formatted = formatted.slice(0, formatted.length - 1);
      }
      if (formatted[formatted.length - 1] === '.') {
        formatted = formatted + '0';
      }
      return formatted;
    }
  },

  nameForDisplay: function(name, maxWordLength) {
    maxWordLength = maxWordLength || 22;
    return name.split(' ').map(function(part) {
      return (part.length <= maxWordLength) ?
        part :
        [part.substring(0,maxWordLength), '...'].join('');
    }).join(' ');
  },

  /**
   * Function for returning a preview of a text value followed by elipsis.
   * Will return a string of max length + 3 (for elipsis). Will end preview
   * at last completed word that fits into preview.
   *
   * @param  {String} text
   * @param  {Number} previewLength
   * @return {String}
   */
  textPreview: function(text, previewLength) {
    previewLength = previewLength || 50; // default length
    if (text.length <= previewLength) {
      return text;
    } else {
      var substring = text.substring(0, previewLength);
      var lastSpaceIndex = substring.lastIndexOf(' ');
      var end = (lastSpaceIndex > 0) ? lastSpaceIndex : previewLength;
      return substring.substring(0, end) + '...';
    }
  },

  capitalize: function(s) {
    // transform the first letter of string s to uppercase
    return s[0].toUpperCase() + s.slice(1);
  },

  dayAndDate: function(i, offset) {
    var d = new Date(i);
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return moment.utc(d).format('ddd, MMM D');
  },

  fixFloatingPoint: function(n) {
    return parseFloat(n.toFixed(3));
  },

  percentage: function(f) {
    if (isNaN(f)) {
      return '-- %';
    }
    else {
      return d3.format('%')(f);
    }
  },

  millisecondsAsTimeOfDay: function(i) {
    var d = new Date(i);
    var f = t('%-I:%M %p');
    return d3.time.format.utc(f)(d);
  },

  timespan: function(d) {
    var QUARTER = ' ¼', HALF = ' ½', THREE_QUARTER = ' ¾', THIRD = ' ⅓', TWO_THIRDS = ' ⅔';
    var dur = Duration.parse(d.duration + 'ms');
    var hours = dur.hours();
    var minutes = dur.minutes() - (hours * 60);

    if (hours !== 0) {
      if (hours === 1) {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hr';
        case 15:
          return 'over ' + hours + QUARTER + ' hr';
        case 20:
          return 'over ' + hours + THIRD + ' hr';
        case 30:
          return 'over ' + hours + HALF + ' hr';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hr';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hr';
        default:
          return 'over ' + hours + ' hr ' + minutes + ' min';
        }
      } else {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hrs';
        case 15:
          return 'over ' + hours + QUARTER + ' hrs';
        case 20:
          return 'over ' + hours + THIRD + ' hrs';
        case 30:
          return 'over ' + hours + HALF + ' hrs';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hrs';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hrs';
        default:
          return 'over ' + hours + ' hrs ' + minutes + ' min';
        }
      }
    } else {
      return 'over ' + minutes + ' min';
    }
  },

  /**
   * Given a string timestamp, return a formatted date string
   * Optionally adjust the time if an offset is supplied.
   *
   * @param  {String} timestring
   * @param  {Number} offset
   * @return {String} [MMMM D] e.g. August 4
   */
  datestamp: function(timestring, offset) {
    var d = new Date(timestring);
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return moment(d).utc().format(MMMM_D_FORMAT);
  },

  /**
   * Given a string timestamp, return a formatted time string.
   * Optionally adjust the time if an offset is supplied.
   *
   * @param  {String} timestring
   * @param  {Number} offset
   * @return {String} [%-I:%M %p] D e.g. 3:14 am
   */
  timestamp: function(timestring, offset) {
    var d = new Date(timestring);
    var f = t('%-I:%M %p');
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return d3.time.format.utc(f)(d).toLowerCase();
  },

  /**
   * Given two timestamps return an object containing a timechange
   *
   * @param {String} from - date string
   * @param {String} to - date string (required)
   * @return {Object} containing keys from, to, type, format
   */
  timeChangeInfo: function(from, to) {
    if (!to) { // guard statement
      throw new Error('You have not provided a `to` datetime string');
    }

    // the "from" and "to" fields of a time change are always timezone-naive
    // timestamps by definition (b/c they are device-relative time)
    // but some (versions) of (some) browsers like to coerce timestamps without TZ info into local time
    // and we need to prevent that, so we use moment.utc and then use the UTC
    // variant of all JS Date methods to ensure consistency across browsers
    var fromDate = from ? moment.utc(from).toDate() : undefined;
    var toDate = moment.utc(to).toDate();
    var type = 'Time Change';

    var format = 'h:mm a';
    if (fromDate && toDate) {
      if (fromDate.getUTCFullYear() !== toDate.getUTCFullYear()) {
        format = 'MMM D, YYYY h:mm a';
      } else if (
        fromDate.getUTCMonth() !== toDate.getUTCMonth() ||
        fromDate.getUTCDay() !== toDate.getUTCDay()
      ) {
        format = 'MMM D, h:mm a';
      }

      if (Math.abs(toDate - fromDate) <= (8*(60*1000))) { // Clock Drift Adjustment if less than 8 minutes
        type = 'Clock Drift Adjustment';
      }
    }

    return {
      type: type,
      from: fromDate ? moment(fromDate).utc().format(format): undefined,
      to: moment(toDate).utc().format(format),
      format: format
    };
  },

  xAxisDayText: function(i, offset) {
    if (offset) {
      i = new Date(i);
      i.setUTCMinutes(i.getUTCMinutes() + offset);
    }
    return moment(i).utc().format(DDDD_MMMM_D_FORMAT);
  },

  xAxisTickText: function(i, offset) {
    var d = new Date(i);
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return d3.time.format.utc(HOUR_FORMAT)(d).toLowerCase();
  }
};

module.exports = format;
