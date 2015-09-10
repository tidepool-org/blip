/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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
var assert = chai.assert;
var expect = chai.expect;

var dm = require('../plugins/blip/basics/logic/datamunger');

describe('basics datamunger', function() {
  it('should be an object', function() {
    assert.isObject(dm);
  });

  describe('bgDistribution', function() {
    it('should be a function', function() {
      assert.isFunction(dm.bgDistribution);
    });

    
  });

  describe('infusionSiteHistory', function() {
    var oneWeekDates = {
      '2015-09-07': 'past',
      '2015-09-08': 'past',
      '2015-09-09': 'past',
      '2015-09-10': 'past',
      '2015-09-11': 'past',
      '2015-09-12': 'dayOfUpload',
      '2015-09-13': 'future'
    };
    var countSiteChangesByDay = {
      '2015-09-08': 1,
      '2015-09-12': 1
    };
    it('should be a function', function() {
      assert.isFunction(dm.infusionSiteHistory);
    });

    it.skip('should return an object keyed by date; value is object with attrs type, daysSince');
  });
});