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

    it('should be able to handle an empty data array without error', function() {
      var empty = preprocess.processData([]);
      assert.isObject(empty);
      assert.isArray(empty.data);
      expect(empty.data.length).to.equal(0);
    });

    it('should be able to handle message data only by returning empty tidelineData', function() {
      var messageOnly = _.where(data, {type: 'message'});
      var messageOnlyProcessed = preprocess.processData(messageOnly);
      assert.isObject(messageOnlyProcessed);
      assert.isArray(messageOnlyProcessed.data);
      expect(messageOnlyProcessed.data.length).to.equal(0);
    });

    var dataTypes = [
      'smbg',
      'bolus',
      'cbg',
      'settings',
      'basal-rate-segment'
    ];

    _.each(dataTypes, function(dType) {
      it('should be able to handle only ' + dType + ' without error', function() {
        var thisOnly = _.where(data, {type: dType});
        var typeOnlyProcessed = preprocess.processData(thisOnly);
        assert.isObject(typeOnlyProcessed);
        assert.isArray(typeOnlyProcessed.data);
        expect(typeOnlyProcessed.data.length).to.be.above(thisOnly.length);
      });
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

  describe('editDatum', function() {
    var datum = _.clone(_.findWhere(td.data, {'type': 'message'}));
    var oldDatum = _.clone(datum);
    var d = new Date(datum.utcTime);
    d.setUTCHours(d.getUTCHours() + 1);
    d = d.toISOString();
    datum.utcTime = d;
    var newTd = td.editDatum(datum, 'utcTime');
    it('should maintain the length of the group data and data', function() {
      var previousLengths = {
        'data': td.data.length,
        'message': td.grouped.message.length
      };
      var newLengths = {
        'data': newTd.data.length,
        'message': newTd.grouped.message.length
      };
      expect(previousLengths).to.eql(newLengths);
    });

    it('should mutate the original datum', function() {
      var newDatum = _.findWhere(newTd.data, {'id': datum.id});
      expect(oldDatum).not.to.eql(newDatum);
    });
  });

  describe('generateFillData', function() {
    var fills = td.grouped.fill;
    it('should be a function', function() {
      assert.isFunction(td.generateFillData);
    });

    it('should extend beyond extent of data on either side', function() {
      var dData = td.diabetesData;
      expect(fills[0].normalTime).to.be.below(dData[0].normalTime);
      expect(fills[fills.length - 1].normalTime).to.be.above(dData[dData.length - 1].normalTime);
    });

    it('should be contiguous', function() {
      for (var i = 0; i < fills.length; ++i) {
        if (i !== fills.length - 1) {
          expect(fills[i].normalEnd).to.equal(fills[i + 1].normalTime);
        }
      }
    });
  });

  describe('adjustFillsForTwoWeekView', function() {
    it('should be a function', function() {
      assert.isFunction(td.adjustFillsForTwoWeekView);
    });

    it('should cover all and only the days where smbg data exists (messagse outside)', function() {
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
      expect(newTd.twoWeekData[newTd.twoWeekData.length - 1].normalTime).to.equal('2014-06-22T21:00:00.000Z');
      var fills = _.where(newTd.twoWeekData, {'type': 'fill'});
      for (var i = 0; i < fills.length; ++i) {
        if (i !== fills.length - 1) {
          expect(fills[i].normalEnd).to.equal(fills[i + 1].normalTime);
        }
      }
    });

    it('should cover all and only the days where smbg data exists (just smbg)', function() {
      var newData = [
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
        }
      ];
      var newTd = preprocess.processData(newData);
      expect(newTd.twoWeekData[0].normalTime).to.equal('2014-06-06T00:00:00.000Z');
      expect(newTd.twoWeekData[newTd.twoWeekData.length - 1].normalTime).to.equal('2014-06-22T21:00:00.000Z');
      var fills = _.where(newTd.twoWeekData, {'type': 'fill'});
      for (var i = 0; i < fills.length; ++i) {
        if (i !== fills.length - 1) {
          expect(fills[i].normalEnd).to.equal(fills[i + 1].normalTime);
        }
      }
    });
  });
});