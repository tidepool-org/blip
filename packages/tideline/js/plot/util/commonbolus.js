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

const _ = require('lodash');

const format = require('../../data/util/format');

const commonBolus = {
  getBolus: (b) => {
    if (b.type === 'wizard' && !_.isEmpty(b.bolus)) {
      return b.bolus;
    } else if (b.type === 'bolus') {
      return b;
    }
    return null;
  },
  getRecommended: function(d) {
    if (d.type !== 'wizard' || _.isEmpty(d.recommended)) {
      return Number.NaN;
    }
    if (Number.isFinite(d.recommended.net)) {
      return d.recommended.net;
    }
    let rec = 0;
    if (Number.isFinite(d.recommended.carb)) {
      rec += d.recommended.carb;
    }
    if (Number.isFinite(d.recommended.correction)) {
      rec += d.recommended.correction;
    }
    return format.fixFloatingPoint(rec);
  },
  getMaxValue: function(d) {
    let programmed = this.getProgrammed(d);
    if (Number.isNaN(programmed)) {
      return Number.NaN;
    }
    let rec = 0;
    if (d.type === 'wizard') {
      rec = this.getRecommended(d);
      if (Number.isNaN(rec)) {
        rec = 0;
      }
    }
    return Math.max(rec, programmed);
  },
  getDelivered: function(d) {
    const bolus = commonBolus.getBolus(d);
    if (bolus !== null && Number.isFinite(bolus.normal)) {
      return bolus.normal;
    }
    return Number.NaN;
  },
  getProgrammed: function(d) {
    const bolus = commonBolus.getBolus(d);
    if (bolus === null) {
      return Number.NaN;
    }

    const expectedNormal = Number.isFinite(bolus.expectedNormal) ? bolus.expectedNormal : 0;
    const normal = Number.isFinite(bolus.normal) ? bolus.normal : 0;

    return Math.max(expectedNormal, normal);
  },
  getMaxDuration: function(d) {
    const bolus = commonBolus.getBolus(d);
    if (bolus === null) {
      return Number.NaN;
    }

    // don't want truthiness here because want to return expectedDuration
    // from a bolus interrupted immediately (duration = 0)
    if (!Number.isFinite(bolus.duration)) {
      return Number.NaN;
    }
    const expectedDuration = Number.isFinite(bolus.expectedDuration) ? bolus.expectedDuration : 0;
    return Math.max(expectedDuration, bolus.duration);
  }
};

module.exports = commonBolus;
