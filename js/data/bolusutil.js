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
var log = require('../lib/').bows('BolusUtil');

function BolusUtil(data) {

  this.subtotal = function(s, e) {
    var dose = 0.0;
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
    var firstBolus = _.find(this.data, function(bolus) {
      var d = new Date(bolus.normalTime).valueOf();
      return (d >= start) && (d <= end);
    });
    if (firstBolus) {
      var index = this.data.indexOf(firstBolus);
      while (index < (data.length - 1) && (new Date(this.data[index].normalTime).valueOf() <= end)) {
        var bolus = this.data[index];
        dose += bolus.value;
        index++;
      }
    }
    return format.fixFloatingPoint(dose);
  };

  this.totalBolus = function(s, e, opts) {
    opts = opts || {};
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      var start = new Date(s).valueOf(), end = new Date(e).valueOf();
      var total = 0.0;
      if (datetime.isTwentyFourHours(s, e)) {
        total += this.subtotal(s, e);
      }
      else if (datetime.isLessThanTwentyFourHours(s, e)) {
        log('Data domain less than twenty-four hours; cannot calculate bolus total.');
        return NaN;
      }
      else {
        if ((opts.excluded) && (opts.excluded.length > 0)) {
          var first = new Date(start).toISOString();
          var ex = opts.excluded[0];
          var bolus = this;
          opts.excluded.forEach(function(ex) {
            // exclude boluses that happen to be directly on first timestamp
            if (first !== ex) {
              total += bolus.subtotal(first, ex);
            }
            first = datetime.addDays(ex, 1);
          });
          if (first !== end) {
            total += this.subtotal(first, end);
          }
        }
        else {
          total += this.subtotal(start, end);
        }
      }
      return format.fixFloatingPoint(total);
    }
    else {
      return NaN;
    }
  };

  this.data = data;
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalTime];
  }
}

module.exports = BolusUtil;