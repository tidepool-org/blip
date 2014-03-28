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

  this.totalBolus = function(s, e) {
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
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