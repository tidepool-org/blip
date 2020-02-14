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

var chai = require('chai');
var expect = chai.expect;

var constants = require('../js/data/util/constants');

describe('constants', function() {
  it('should export an object', function() {
    expect(typeof constants).to.equal('object');
  });

  it('should define the MGDL_PER_MMOLL conversion as 18.01559', function() {
    expect(constants.MGDL_PER_MMOLL).to.equal(18.01559);
  });

  it('should define the MGDL_UNITS conversion as mg/dL', function() {
    expect(constants.MGDL_UNITS).to.equal('mg/dL');
  });

  it('should define the MMOLL_UNITS conversion as mmol/L', function() {
    expect(constants.MMOLL_UNITS).to.equal('mmol/L');
  });

  it('should define the AUTOMATED_BASAL_DEVICE_MODELS mapping', function() {
    expect(constants.AUTOMATED_BASAL_DEVICE_MODELS).to.eql({
      Medtronic: ['1580', '1581', '1582', '1780', '1781', '1782'],
      Diabeloop: true,
    });
  });

  it('should define the AUTOMATED_BASAL_LABELS mapping', function() {
    expect(constants.AUTOMATED_BASAL_LABELS).to.eql({
      Medtronic: 'Auto Mode',
      Diabeloop: 'Loop mode',
      default: 'Automated',
    });
  });

  it('should define the SCHEDULED_BASAL_LABELS mapping', function() {
    expect(constants.SCHEDULED_BASAL_LABELS).to.eql({
      Medtronic: 'Manual',
      Diabeloop: 'Loop mode off',
      default: 'Manual',
    });
  });

  it('should define the DEFAULT_BG_BOUNDS MGDL_UNITS veryLow threshold as 54', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MGDL_UNITS].veryLow).to.equal(54);
  });

  it('should define the DEFAULT_BG_BOUNDS MGDL_UNITS targetLower threshold as 70', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MGDL_UNITS].targetLower).to.equal(70);
  });

  it('should define the DEFAULT_BG_BOUNDS MGDL_UNITS targetUpper threshold as 180', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MGDL_UNITS].targetUpper).to.equal(180);
  });

  it('should define the DEFAULT_BG_BOUNDS MGDL_UNITS veryHigh threshold as 250', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MGDL_UNITS].veryHigh).to.equal(250);
  });

  it('should define the DEFAULT_BG_BOUNDS MMOLL_UNITS veryLow threshold as 3.0', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MMOLL_UNITS].veryLow).to.equal(3.0);
  });

  it('should define the DEFAULT_BG_BOUNDS MMOLL_UNITS targetLower threshold as 3.9', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MMOLL_UNITS].targetLower).to.equal(3.9);
  });

  it('should define the DEFAULT_BG_BOUNDS MMOLL_UNITS targetUpper threshold as 10.0', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MMOLL_UNITS].targetUpper).to.equal(10.0);
  });

  it('should define the DEFAULT_BG_BOUNDS MMOLL_UNITS veryHigh threshold as 13.9', function() {
    expect(constants.DEFAULT_BG_BOUNDS[constants.MMOLL_UNITS].veryHigh).to.equal(13.9);
  });

  it('should define the BG_CLAMP_THRESHOLD in MGDL_UNITS threshold as 600', function() {
    expect(constants.BG_CLAMP_THRESHOLD[constants.MGDL_UNITS]).to.equal(600);
  });

  it('should define the BG_CLAMP_THRESHOLD in MMOLL_UNITS threshold as 600/MGDL_PER_MMOLL', function() {
    expect(constants.BG_CLAMP_THRESHOLD[constants.MMOLL_UNITS]).to.equal(600/constants.MGDL_PER_MMOLL);
  });
});
