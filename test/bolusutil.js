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

/*jshint expr: true */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');
// Tideline expects a global `window` object to grab its dependencies
// Not very pretty to add one this way, but as long as we run
// these tests in Node (vs. in the browser), this is required
global.window = {_: _};

var watson = require('../example/watson');
var data = watson.normalize(require('../example/data/device-data.json'));

var BolusUtil = require('../js/data/bolusutil');

describe('bolus utilities', function() {
  describe('totalBolus', function() {
    var bolus = new BolusUtil(_.where(data, {'type': 'bolus'}));
    it('should be a function', function() {
      assert.isFunction(bolus.totalBolus);
    });
  });
});