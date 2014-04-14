!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),(n.tideline||(n.tideline={})).preprocess=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var tideline = window.tideline;
var watson = tideline.watson;
var _ = tideline.lib._;
var TidelineData = tideline.TidelineData;
var SegmentUtil = tideline.data.SegmentUtil;

var log = tideline.lib.bows('Preprocess');

function alwaysTrue() {
  return true;
}

function notZero(e) {
  return e.value !== 0;
}

var TYPES_TO_INCLUDE = {
  // basals with value 0 don't get excluded because they are legitimate targets for visualization
  'basal-rate-segment': alwaysTrue,
  bolus: notZero,
  carbs: notZero,
  cbg: notZero,
  message: notZero,
  smbg: notZero,
  settings: notZero
};

var Preprocess = {


  REQUIRED_TYPES: ['basal-rate-segment', 'bolus', 'carbs', 'cbg', 'message', 'smbg', 'settings'],

  OPTIONAL_TYPES: [],

  MMOL_STRING: 'mmol/L',

  MGDL_STRING: 'mg/dL',

  MMOL_TO_MGDL: 18,

  mungeBasals: function(data) {
    var segments = new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'}));
    data = _.reject(data, function(d) {
      return d.type === 'basal-rate-segment';
    });
    data = data.concat(segments.actual.concat(segments.getUndelivered('scheduled')));
    return data;
  },

  filterData: function(data) {
    // filter out types we aren't using for visualization
    //  ~and~
    // because of how the Tidepool back end parses some data sources
    // we're creating things like carb events with values of 0, which
    // we don't want to visualize, so...
    // this function also removes all data with value 0 except for basals, since
    // we do want to visualize basals (e.g., temps) with value 0.0

    var counts = {};

    function incrementCount(count, type) {
      if (counts[count] == null) {
        counts[count] = {};
      }

      if (counts[count][type] == null) {
        counts[count][type] = 0;
      }

      ++counts[count][type];
    }

    var nonZeroData = _.filter(data, function(d) {
      var includeFn = TYPES_TO_INCLUDE[d.type];
      if (includeFn == null) {
        incrementCount('excluded', d.type);
        return false;
      }

      var retVal = includeFn(d);
      incrementCount(retVal ? 'included' : 'excluded', d.type);
      return retVal;
    });

    log('Excluded:', counts.excluded);
    log('# of data points', nonZeroData.length);
    log('Data types:', counts.included);

    return nonZeroData;
  },

  runWatson: function(data) {
    data = watson.normalizeAll(data);
    // Ensure the data is properly sorted
    data = _.sortBy(data, function(d) {
      // ISO8601 format lexicographically sorts according to timestamp
      return d.normalTime;
    });
    return data;
  },

  checkRequired: function(tidelineData) {
    _.forEach(this.REQUIRED_TYPES, function(type) {
      if (!tidelineData.grouped[type]) {
        log('No', type, 'data! Replaced with empty array.');
        tidelineData.grouped[type] = [];
      }
    });

    return tidelineData;
  },

  translateMmol: function(data) {
    return _.map(data, function(d) {
      if (d.units === this.MMOL_STRING) {
        d.units = this.MGDL_STRING;
        d.value = parseInt(Math.round(d.value * this.MMOL_TO_MGDL, 10));
      }
      return d;
    }, this);
  },

  processData: function(data) {
    if (!(data && data.length)) {
      log('Unexpected data input, defaulting to empty array.');
      data = [];
    }

    data = this.filterData(data);
    data = this.mungeBasals(data);
    data = this.runWatson(data);
    data = this.translateMmol(data);

    var tidelineData = this.checkRequired(new TidelineData(data));

    return tidelineData;
  }
};

module.exports = Preprocess;

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvVGlkZXBvb2wvdGlkZWxpbmUvcGx1Z2lucy9kYXRhL3ByZXByb2Nlc3MvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogPT0gQlNEMiBMSUNFTlNFID09XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFRpZGVwb29sIFByb2plY3RcbiAqIFxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXJcbiAqIHRoZSB0ZXJtcyBvZiB0aGUgYXNzb2NpYXRlZCBMaWNlbnNlLCB3aGljaCBpcyBpZGVudGljYWwgdG8gdGhlIEJTRCAyLUNsYXVzZVxuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIE9wZW4gU291cmNlIEluaXRpYXRpdmUgYXQgb3BlbnNvdXJjZS5vcmcuXG4gKiBcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVFxuICogQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1NcbiAqIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW07IGlmXG4gKiBub3QsIHlvdSBjYW4gb2J0YWluIG9uZSBmcm9tIFRpZGVwb29sIFByb2plY3QgYXQgdGlkZXBvb2wub3JnLlxuICogPT0gQlNEMiBMSUNFTlNFID09XG4gKi9cblxudmFyIHRpZGVsaW5lID0gd2luZG93LnRpZGVsaW5lO1xudmFyIHdhdHNvbiA9IHRpZGVsaW5lLndhdHNvbjtcbnZhciBfID0gdGlkZWxpbmUubGliLl87XG52YXIgVGlkZWxpbmVEYXRhID0gdGlkZWxpbmUuVGlkZWxpbmVEYXRhO1xudmFyIFNlZ21lbnRVdGlsID0gdGlkZWxpbmUuZGF0YS5TZWdtZW50VXRpbDtcblxudmFyIGxvZyA9IHRpZGVsaW5lLmxpYi5ib3dzKCdQcmVwcm9jZXNzJyk7XG5cbmZ1bmN0aW9uIGFsd2F5c1RydWUoKSB7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBub3RaZXJvKGUpIHtcbiAgcmV0dXJuIGUudmFsdWUgIT09IDA7XG59XG5cbnZhciBUWVBFU19UT19JTkNMVURFID0ge1xuICAvLyBiYXNhbHMgd2l0aCB2YWx1ZSAwIGRvbid0IGdldCBleGNsdWRlZCBiZWNhdXNlIHRoZXkgYXJlIGxlZ2l0aW1hdGUgdGFyZ2V0cyBmb3IgdmlzdWFsaXphdGlvblxuICAnYmFzYWwtcmF0ZS1zZWdtZW50JzogYWx3YXlzVHJ1ZSxcbiAgYm9sdXM6IG5vdFplcm8sXG4gIGNhcmJzOiBub3RaZXJvLFxuICBjYmc6IG5vdFplcm8sXG4gIG1lc3NhZ2U6IG5vdFplcm8sXG4gIHNtYmc6IG5vdFplcm8sXG4gIHNldHRpbmdzOiBub3RaZXJvXG59O1xuXG52YXIgUHJlcHJvY2VzcyA9IHtcblxuXG4gIFJFUVVJUkVEX1RZUEVTOiBbJ2Jhc2FsLXJhdGUtc2VnbWVudCcsICdib2x1cycsICdjYXJicycsICdjYmcnLCAnbWVzc2FnZScsICdzbWJnJywgJ3NldHRpbmdzJ10sXG5cbiAgT1BUSU9OQUxfVFlQRVM6IFtdLFxuXG4gIE1NT0xfU1RSSU5HOiAnbW1vbC9MJyxcblxuICBNR0RMX1NUUklORzogJ21nL2RMJyxcblxuICBNTU9MX1RPX01HREw6IDE4LFxuXG4gIG11bmdlQmFzYWxzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNlZ21lbnRzID0gbmV3IFNlZ21lbnRVdGlsKF8ud2hlcmUoZGF0YSwgeyd0eXBlJzogJ2Jhc2FsLXJhdGUtc2VnbWVudCd9KSk7XG4gICAgZGF0YSA9IF8ucmVqZWN0KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLnR5cGUgPT09ICdiYXNhbC1yYXRlLXNlZ21lbnQnO1xuICAgIH0pO1xuICAgIGRhdGEgPSBkYXRhLmNvbmNhdChzZWdtZW50cy5hY3R1YWwuY29uY2F0KHNlZ21lbnRzLmdldFVuZGVsaXZlcmVkKCdzY2hlZHVsZWQnKSkpO1xuICAgIHJldHVybiBkYXRhO1xuICB9LFxuXG4gIGZpbHRlckRhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyBmaWx0ZXIgb3V0IHR5cGVzIHdlIGFyZW4ndCB1c2luZyBmb3IgdmlzdWFsaXphdGlvblxuICAgIC8vICB+YW5kflxuICAgIC8vIGJlY2F1c2Ugb2YgaG93IHRoZSBUaWRlcG9vbCBiYWNrIGVuZCBwYXJzZXMgc29tZSBkYXRhIHNvdXJjZXNcbiAgICAvLyB3ZSdyZSBjcmVhdGluZyB0aGluZ3MgbGlrZSBjYXJiIGV2ZW50cyB3aXRoIHZhbHVlcyBvZiAwLCB3aGljaFxuICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gdmlzdWFsaXplLCBzby4uLlxuICAgIC8vIHRoaXMgZnVuY3Rpb24gYWxzbyByZW1vdmVzIGFsbCBkYXRhIHdpdGggdmFsdWUgMCBleGNlcHQgZm9yIGJhc2Fscywgc2luY2VcbiAgICAvLyB3ZSBkbyB3YW50IHRvIHZpc3VhbGl6ZSBiYXNhbHMgKGUuZy4sIHRlbXBzKSB3aXRoIHZhbHVlIDAuMFxuXG4gICAgdmFyIGNvdW50cyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gaW5jcmVtZW50Q291bnQoY291bnQsIHR5cGUpIHtcbiAgICAgIGlmIChjb3VudHNbY291bnRdID09IG51bGwpIHtcbiAgICAgICAgY291bnRzW2NvdW50XSA9IHt9O1xuICAgICAgfVxuXG4gICAgICBpZiAoY291bnRzW2NvdW50XVt0eXBlXSA9PSBudWxsKSB7XG4gICAgICAgIGNvdW50c1tjb3VudF1bdHlwZV0gPSAwO1xuICAgICAgfVxuXG4gICAgICArK2NvdW50c1tjb3VudF1bdHlwZV07XG4gICAgfVxuXG4gICAgdmFyIG5vblplcm9EYXRhID0gXy5maWx0ZXIoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgdmFyIGluY2x1ZGVGbiA9IFRZUEVTX1RPX0lOQ0xVREVbZC50eXBlXTtcbiAgICAgIGlmIChpbmNsdWRlRm4gPT0gbnVsbCkge1xuICAgICAgICBpbmNyZW1lbnRDb3VudCgnZXhjbHVkZWQnLCBkLnR5cGUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXRWYWwgPSBpbmNsdWRlRm4oZCk7XG4gICAgICBpbmNyZW1lbnRDb3VudChyZXRWYWwgPyAnaW5jbHVkZWQnIDogJ2V4Y2x1ZGVkJywgZC50eXBlKTtcbiAgICAgIHJldHVybiByZXRWYWw7XG4gICAgfSk7XG5cbiAgICBsb2coJ0V4Y2x1ZGVkOicsIGNvdW50cy5leGNsdWRlZCk7XG4gICAgbG9nKCcjIG9mIGRhdGEgcG9pbnRzJywgbm9uWmVyb0RhdGEubGVuZ3RoKTtcbiAgICBsb2coJ0RhdGEgdHlwZXM6JywgY291bnRzLmluY2x1ZGVkKTtcblxuICAgIHJldHVybiBub25aZXJvRGF0YTtcbiAgfSxcblxuICBydW5XYXRzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gd2F0c29uLm5vcm1hbGl6ZUFsbChkYXRhKTtcbiAgICAvLyBFbnN1cmUgdGhlIGRhdGEgaXMgcHJvcGVybHkgc29ydGVkXG4gICAgZGF0YSA9IF8uc29ydEJ5KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIC8vIElTTzg2MDEgZm9ybWF0IGxleGljb2dyYXBoaWNhbGx5IHNvcnRzIGFjY29yZGluZyB0byB0aW1lc3RhbXBcbiAgICAgIHJldHVybiBkLm5vcm1hbFRpbWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgY2hlY2tSZXF1aXJlZDogZnVuY3Rpb24odGlkZWxpbmVEYXRhKSB7XG4gICAgXy5mb3JFYWNoKHRoaXMuUkVRVUlSRURfVFlQRVMsIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIGlmICghdGlkZWxpbmVEYXRhLmdyb3VwZWRbdHlwZV0pIHtcbiAgICAgICAgbG9nKCdObycsIHR5cGUsICdkYXRhISBSZXBsYWNlZCB3aXRoIGVtcHR5IGFycmF5LicpO1xuICAgICAgICB0aWRlbGluZURhdGEuZ3JvdXBlZFt0eXBlXSA9IFtdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRpZGVsaW5lRGF0YTtcbiAgfSxcblxuICB0cmFuc2xhdGVNbW9sOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIF8ubWFwKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChkLnVuaXRzID09PSB0aGlzLk1NT0xfU1RSSU5HKSB7XG4gICAgICAgIGQudW5pdHMgPSB0aGlzLk1HRExfU1RSSU5HO1xuICAgICAgICBkLnZhbHVlID0gcGFyc2VJbnQoTWF0aC5yb3VuZChkLnZhbHVlICogdGhpcy5NTU9MX1RPX01HREwsIDEwKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZDtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBwcm9jZXNzRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICghKGRhdGEgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICBsb2coJ1VuZXhwZWN0ZWQgZGF0YSBpbnB1dCwgZGVmYXVsdGluZyB0byBlbXB0eSBhcnJheS4nKTtcbiAgICAgIGRhdGEgPSBbXTtcbiAgICB9XG5cbiAgICBkYXRhID0gdGhpcy5maWx0ZXJEYXRhKGRhdGEpO1xuICAgIGRhdGEgPSB0aGlzLm11bmdlQmFzYWxzKGRhdGEpO1xuICAgIGRhdGEgPSB0aGlzLnJ1bldhdHNvbihkYXRhKTtcbiAgICBkYXRhID0gdGhpcy50cmFuc2xhdGVNbW9sKGRhdGEpO1xuXG4gICAgdmFyIHRpZGVsaW5lRGF0YSA9IHRoaXMuY2hlY2tSZXF1aXJlZChuZXcgVGlkZWxpbmVEYXRhKGRhdGEpKTtcblxuICAgIHJldHVybiB0aWRlbGluZURhdGE7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlcHJvY2VzcztcbiJdfQ==
(1)
});
