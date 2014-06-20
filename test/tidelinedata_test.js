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

var data = require('../example/data/device-data.json');

try {
  global.window = {
    tideline: require('../js/')
  };
  global.window.tideline.watson = require('../plugins/data/watson/');
}
catch (TypeError) {}

var TidelineData = window.tideline.TidelineData;
var preprocess = require('../plugins/data/preprocess');

describe('TidelineData', function() {
  var td = preprocess.processData(data);
  describe('an instance', function() {
    it('should be an object', function() {
      assert.isObject(td);
    });

    it('should have a `data` attribute that is an array', function() {
      assert.isArray(td.data);
    });

    it('should have a `filterData` attribute that is an object', function() {
      assert.isObject(td.filterData);
    });
  });

  describe('addDatum', function() {
    it('should increase the length of the group data and data by one', function() {
      var datum = {
        'normalTime': '2008-01-01T12:00:00.000Z',
        'value': 5.0,
        'type': 'bolus'
      };
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

  describe('adjustFillsForTwoWeekView', function() {
    it('should be a function', function() {
      assert.isFunction(td.adjustFillsForTwoWeekView);
    });

    it('should cover all and only the days where smbg data exists', function() {
      var newData = [
        {
          'messageText': 'Ball tip corned beef ut, dolore prosciutto jerky fugiat capicola doner velit. Do beef ribs adipisicing, pork belly et enim tail filet mignon tri-tip non dolore ham ut.',
          'parentMessage': '',
          'utcTime': '2014-06-05T11:09:53Z',
          'type': 'message',
          'id': '675945be-e2d2-4875-826e-bc47a15db98f'
        },
        {
          'deviceTime': '2014-06-06T19:51:29',
          'value': 145,
          'source': 'demo',
          'deviceId': 'Demo - 123',
          'units': 'mg/dL',
          'type': 'smbg',
          'id': 'e89938f8-de92-429a-bfff-1e7627cac9d4'
        },
        {
          'deviceTime': '2014-06-22T02:12:55',
          'value': 66,
          'source': 'demo',
          'deviceId': 'Demo - 123',
          'units': 'mg/dL',
          'type': 'smbg',
          'id': 'fc032543-0b5e-40e6-b863-48963d4d486c'
        },
        {
          'messageText': 'Sirloin ea pancetta, sed eiusmod beef frankfurter duis pork. Meatball capicola ullamco, eu in laborum ball tip tail voluptate ex sunt ut in sed.',
          'parentMessage': '',
          'utcTime': '2014-06-23T11:03:17Z',
          'type': 'message',
          'id': '9b1317c1-e04b-4813-8955-dfe16f14b92b'
        }
      ];
      var newTd = preprocess.processData(newData);
      expect(newTd.twoWeekData[0].normalTime).to.equal('2014-06-06T00:00:00.000Z');
      // expect(td.twoWeekData[td.twoWeekData.length - 1].normalTime).to.equal('2014-06-22T21:00:00.000Z');
    });
  });
});