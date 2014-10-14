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

var _ = require('lodash');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var crossfilter = require('crossfilter');

var types = require('../../dev/testpage/types');

var TidelineData = require('../../js/tidelinedata');

describe('TidelineData', function() {
  var td = new TidelineData([]);
  var bgClasses = {
    'very-low': {boundary: 60},
    low: {boundary: 80},
    target: {boundary: 180},
    high: {boundary: 200},
    'very-high': {boundary: 300}
  };
  it('should be a function', function() {
    assert.isFunction(TidelineData);
  });

  it('should be a (newable) constructor', function() {
    expect(td).to.exist;
  });

  it('should have a `data` attribute that is an array', function() {
    assert.isArray(td.data);
  });

  it('should have a `filterData` attribute that is a crossfilter object', function() {
    assert.isObject(td.filterData);
  });

  it('should have `bgClasses` and `bgUnits` properties', function() {
    expect(td.bgClasses).to.exist;
    expect(td.bgUnits).to.exist;
  });

  it('should default to mg/dL for `bgUnits` and `bgClasses`', function() {
    expect(td.bgClasses).to.eql(bgClasses);
    expect(td.bgUnits).to.equal('mg/dL');
  });

  it('should have `mixed` for `bgUnits` when blood glucose data is of mixed units', function() {
    var data = [
      new types.SMBG(),
      new types.CBG()
    ];
    data[1].units = 'mmol/L';
    var thisTd = new TidelineData(data);
    expect(thisTd.bgUnits).to.equal('mixed');
  });

  it('should maintain default `bgClasses` when blood glucose data is of mixed units', function() {
    var data = [
      new types.SMBG(),
      new types.CBG()
    ];
    data[1].units = 'mmol/L';
    var thisTd = new TidelineData(data);
    expect(thisTd.bgClasses).to.eql(bgClasses);
  });

  it('should transform `bgClasses` when `bgUnits` are mmol/L', function() {
    var data = [new types.SMBG()];
    data[0].units = 'mmol/L';
    var thisTd = new TidelineData(data);
    expect(thisTd.bgClasses).to.not.eql(bgClasses);
    expect(thisTd.bgUnits).to.equal('mmol/L');
  });

  // NB: eventually we probably do want to support plotting messages only
  // so TODO: remove this once we do
  it('should be able to handle message data only by returning empty tidelineData', function() {
    var now = new Date().toISOString();
    var data = [new types.Message()];
    var messageOnly = new TidelineData(data);
    expect(messageOnly.data.length).to.equal(0);
  });

  var dataTypes = {
    basal: new types.Basal(),
    bolus: new types.Bolus(),
    cbg: new types.CBG(),
    settings: new types.Settings(),
    smbg: new types.SMBG(),
    wizard: new types.Wizard()
  };

  _.each(Object.keys(dataTypes), function(dType) {
    it('should be able to handle only ' + dType + ' without error', function() {
      var data = [dataTypes[dType]];
      var single = new TidelineData(data);
      expect(single.data.length).to.be.above(1);
    });
  });

  describe('addDatum', function() {
    it('should be a function', function() {
      assert.isFunction(td.addDatum);
    });

    it('should increase the length of the group data and data by one', function() {
      var origData = [new types.Bolus()];
      var toAdd = new TidelineData(origData);
      var origLen = toAdd.data.length;
      var bolusLen = toAdd.grouped.bolus.length;
      toAdd.addDatum(new types.Bolus());
      expect(toAdd.data.length - 1).to.equal(origLen);
      expect(toAdd.grouped.bolus.length - 1).to.equal(bolusLen);
    });
  });

  describe('editDatum', function() {
    var message = new types.Message();
    var origMessage = _.clone(message);
    var editedMessage = _.clone(origMessage);
    var d = new Date(editedMessage.time);
    d.setUTCHours(d.getUTCHours() + 1);
    editedMessage.time = d.toISOString();
    var n = new Date(editedMessage.normalTime);
    n.setUTCHours(n.getUTCHours() + 1);
    editedMessage.normalTime = n.toISOString();

    it('should be a function', function() {
      assert.isFunction(td.editDatum);
    });

    it('should maintain the length of the group data and data', function() {
      var toEdit = new TidelineData([message, new types.CBG()]);
      var origLen = toEdit.data.length;
      var messageLen = toEdit.grouped.message.length;
      toEdit.editDatum(editedMessage, 'time');
      expect(toEdit.data.length).to.equal(origLen);
      expect(toEdit.grouped.message.length).to.equal(messageLen);
    });

    it('should not mutate the original datum', function() {
      expect(origMessage).to.not.eql(editedMessage);
      expect(message).to.not.eql(editedMessage);
    });
  });

  describe('generateFillData', function() {
    var thisTd = new TidelineData([new types.SMBG()]);
    var fills = thisTd.grouped.fill;

    it('should be a function', function() {
      assert.isFunction(td.generateFillData);
    });

    it('should extend beyond extent of data on either side', function() {
      expect(fills[0].normalTime).to.be.below(thisTd.grouped.smbg[0].normalTime);
      expect(fills[fills.length - 1].normalTime).to.be.above(thisTd.grouped.smbg[0].normalTime);
    });

    // TODO: for @jhbate
    it.skip('should always cover at least 24 hours, even if there is only one point-in-time datum', function() {

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

    it('should cover at least 14 days surrounding where smbg data exists (messages outside)', function() {
      var data = [
        new types.Message({time: '2014-09-01T12:00:00.000Z'}),
        new types.SMBG({deviceTime: '2014-09-05T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-16T19:00:00'}),
        new types.Message({time: '2014-09-30T12:00:00.000Z'})
      ];
      var thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-03T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-16T21:00:00.000Z');
    });

    it('should cover at least 14 days surrounding where smbg data exists (just smbg)', function() {
      var data = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00'})
      ];
      var thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-01T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-14T21:00:00.000Z');
    });
  });
});