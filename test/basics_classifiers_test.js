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

var classifiers = require('../plugins/blip/basics/logic/classifiers');

describe('basics classifiers', function() {
  it('should be a function', function() {
    assert.isFunction(classifiers);
  });

  it('should return an object');

  it('should return all tags that apply to a basal (based on deliveryType)');

  it('should return all tags that apply to a bolus');

  it('should classify an smbg as manual or meter');

  it('should also categorize the value of an smbg');
});