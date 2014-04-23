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
/*global describe, it */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');

var watson = require('../plugins/data/watson');
var data = watson.normalizeAll(require('../example/data/device-data.json'));

var tideline = require('../js/index');
var TidelineData = tideline.TidelineData;

describe('TidelineData', function() {
  describe('an instance', function() {
    it('should be an object', function() {
      assert.isObject(new TidelineData(data));
    });

    it('should have a `data` attribute that is an array', function() {
      assert.isArray(new TidelineData(data).data);
    });

    it('should have a `filterData` attribute that is an object', function() {
      assert.isObject(new TidelineData(data).filterData);
    });
  });

  describe('addDatum', function() {
    it('should increase the length of the group data and data by one', function() {
      var datum = {
        'normalTime': '2008-01-01T12:00:00.000Z',
        'value': 5.0,
        'type': 'bolus'
      };
      var td = new TidelineData(data);
      var previousLengths = {
        'data': td.data.length,
        'bolus': td.grouped.bolus.length
      };
      var newTd = td.addDatum(datum);
      var newLengthsMinusOne = {
        'data': newTd.data.length - 1,
        'bolus': newTd.grouped.bolus.length - 1
      };
      expect(previousLengths).to.eql(newLengthsMinusOne);
    });
  });
});