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

var chai = require('chai');
var expect = chai.expect;

var constants = require('../js/data/util/constants');

describe('constants', function() {
  it('should export an object', function() {
    expect(typeof constants).to.equal('object');
  });

  it('should have 18.01559 for the GLUCOSE_MM conversion', function() {
    expect(constants.GLUCOSE_MM).to.equal(18.01559);
  });
});