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

var d3 = require('d3');
var Duration = require('duration-js');
var moment = require('moment');

var format = {

  MS_IN_24: 86400000,

  tooltipBG: function(d, units) {
    if (d.annotations && Array.isArray(d.annotations) && d.annotations.length > 0) {
      var annotation = d.annotations[0];
      if (annotation.code && annotation.code === 'bg/out-of-range') {
        var value = annotation.value;
        if (value === 'low') {
          d.tooltipText = 'Lo';
        }
        else if (value === 'high') {
          d.tooltipText = 'Hi';
        }
      }
    }
    return units === 'mg/dL' ? d3.format('g')(Math.round(d.value)) : d3.format('.1f')(d.value);
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
      return parseInt(Math.round(f * 100), 10) + '%';
    }
  },

  millisecondsAsTimeOfDay: function(i) {
    var d = new Date(i);
    return d3.time.format.utc('%-I:%M %p')(d);
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

  timestamp: function(i, offset) {
    var d = new Date(i);
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return d3.time.format.utc('%-I:%M %p')(d).toLowerCase();
  },
  /**
   * Given two timestamps return an object containing a timechange 
   * 
   * @param {String} from - date string
   * @param {String} to - date string
   * @return {Object} containing keys from and to
   */
  timeChangeInfo: function(from,to) {
    if (!from || !to) { // guard statement
      throw new Error('You have not provided two datetime strings');
    }

    var fromDate = new Date(from);
    var toDate = new Date(to);
    var type = 'Time Change';

    var format = 'h:mm a';
    if (fromDate.getUTCFullYear() !== toDate.getUTCFullYear()) {
      format = 'Do MMM YYYY h:mm a';
    } else if (
      fromDate.getUTCMonth() !== toDate.getUTCMonth() ||
      fromDate.getUTCDay() !== toDate.getUTCDay()
    ) {
      format = 'Do MMM h:mm a';
    }

    if (Math.abs(toDate - fromDate) <= (8*(60*1000))) { // Clock Drift Adjustment if less than 8 minutes
      type = 'Clock Drift Adjustment';
    }



    return {
      type: type,
      from: moment(fromDate).utc().format(format),
      to: moment(toDate).utc().format(format),
    };
  },

  xAxisDayText: function(i, offset) {
    if (offset) {
      i = new Date(i);
      i.setUTCMinutes(i.getUTCMinutes() + offset);
    }
    return moment(i).utc().format('dddd, MMMM D');
  },

  xAxisTickText: function(i, offset) {
    var d = new Date(i);
    if (offset) {
      d.setUTCMinutes(d.getUTCMinutes() + offset);
    }
    return d3.time.format.utc('%-I %p')(d).toLowerCase();
  }

};

module.exports = format;
