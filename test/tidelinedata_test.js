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
var moment = require('moment-timezone');

var types = require('../dev/testpage/types');

var TidelineData = require('../js/tidelinedata');

describe('TidelineData', function() {
  var td = new TidelineData([]);
  var bgClasses = {
    'very-low': {boundary: 60},
    low: {boundary: 80},
    target: {boundary: 180},
    high: {boundary: 300},
    'very-high': {boundary: 600}
  };
  it('should be a function', function() {
    assert.isFunction(TidelineData);
  });

  it('should be a (newable) constructor', function() {
    expect(td).to.exist;
  });

  it('should have a `basicsData` attribute that is an object', function() {
    assert.isObject(td.basicsData);
  });

  it('should have a `data` attribute that is an array', function() {
    assert.isArray(td.data);
  });

  it('should have a `filterData` attribute that is a crossfilter object', function() {
    assert.isObject(td.filterData);
  });

  it('should have a `smbgData` attribute that is a crossfilter object', function() {
    assert.isObject(td.smbgData);
  });
  
  it('should have `bgClasses` and `bgUnits` properties', function() {
    expect(td.bgClasses).to.exist;
    expect(td.bgUnits).to.exist;
  });

  it('should default to mg/dL for `bgUnits` and `bgClasses`', function() {
    expect(td.bgClasses).to.eql(bgClasses);
    expect(td.bgUnits).to.equal('mg/dL');
  });

  it('should transform `bgClasses` when `bgUnits` are mmol/L', function() {
    var data = [new types.SMBG()];
    data[0].units = 'mmol/L';
    var thisTd = new TidelineData(data, {bgUnits: 'mmol/L'});
    expect(thisTd.bgClasses).to.not.eql(bgClasses);
    expect(thisTd.bgUnits).to.equal('mmol/L');
  });

  it('should contain sorted groups of data by normalTime', function() {
    var data = [
      {
        "_schemaVersion": 0,
        "conversionOffset": 2678355000,
        "deviceId": "InsOmn-130133672",
        "deviceTime": "2015-06-03T13:03:16",
        "guid": "3",
        "id": "3",
        "subType": "manual",
        "time": "2015-06-03T20:04:01.000Z",
        "timezoneOffset": -1860,
        "type": "smbg",
        "units": "mmol/L",
        "value": 1
      },
      {
        "_schemaVersion": 0,
        "conversionOffset": 2678355000,
        "deviceId": "InsOmn-130133672",
        "deviceTime": "2014-04-03T13:03:16",
        "guid": "2",
        "id": "2",
        "subType": "manual",
        "time": "2014-04-03T20:04:01.000Z",
        "timezoneOffset": -1860,
        "type": "smbg",
        "units": "mmol/L",
        "value": 1
      },
      {
        "_schemaVersion": 0,
        "conversionOffset": 2678355000,
        "deviceId": "InsOmn-130133672",
        "deviceTime": "2016-10-03T13:03:16",
        "guid": "4",
        "id": "4",
        "subType": "manual",
        "time": "2016-10-03T20:04:01.000Z",
        "timezoneOffset": -1860,
        "type": "smbg",
        "units": "mmol/L",
        "value": 1
      },
      {
        "_schemaVersion": 0,
        "conversionOffset": 2678355000,
        "deviceId": "InsOmn-130133672",
        "deviceTime": "2013-02-03T13:03:16",
        "guid": "1",
        "id": "1",
        "subType": "manual",
        "time": "2013-02-03T20:04:01.000Z",
        "timezoneOffset": -1860,
        "type": "smbg",
        "units": "mmol/L",
        "value": 1
      }
    ];
    var thisTd = new TidelineData(data);
    expect(thisTd.grouped.smbg[0].id).to.equal('1');
    expect(thisTd.grouped.smbg[1].id).to.equal('2');
    expect(thisTd.grouped.smbg[2].id).to.equal('3');
    expect(thisTd.grouped.smbg[3].id).to.equal('4');
  });

  // NB: eventually we probably do want to support plotting messages only
  // so TODO: remove this once we do
  it('should be able to handle message data only by returning empty tidelineData', function() {
    var now = new Date().toISOString();
    var data = [new types.Message()];
    var messageOnly = new TidelineData(data);
    expect(messageOnly.data.length).to.equal(0);
  });

  it('should filter out messages with bad timestamps', function() {
    var data = [{
      time: 'Invalid date',
      messageText: 'Hi there',
      parentMessage: null,
      type: 'message',
      id: 'foo',
      source: 'Unspecified Data Source',
      // this is a somewhat artificial example because `Invalid date` in the `time`
      // field will actually prevent the `normalTime` and `displayOffset` from being generated
      // but I wanted to show the validation actually operating on the lack
      // of a valid timestamp in the `time` field rather than on the missing `displayOffset`
      // which is what actually fails validation first IRL
      normalTime: '2015-01-01T00:00:00.000Z',
      displayOffset: 0
    }];
    var res = new TidelineData(data);
    expect(res.grouped.message.length).to.equal(0);
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
    // because one-day view doesn't involve settings
    if (dType !== 'settings') {
      it('should be able to handle only ' + dType + ' without error', function() {
        var data = [dataTypes[dType]];
        var single = new TidelineData(data);
        expect(single.data.length).to.be.above(1);
      });
    }
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

    it('should expand the fill data on the right if necessary', function() {
      var origData = [new types.Bolus()];
      var toAdd = new TidelineData(origData);
      var origFill = toAdd.grouped.fill;
      var lastFill = origFill[origFill.length - 1];
      var later = moment(lastFill.normalTime).add(6, 'hours').toISOString();
      toAdd.addDatum(new types.SMBG({deviceTime: later.slice(0, -5)}));
      var newFill = toAdd.grouped.fill;
      expect(newFill[newFill.length - 1].normalTime).to.be.at.least(later);
    });
  });

  describe('editDatum', function() {
    var smbg = new types.SMBG({deviceTime: '2015-09-01T15:00:00'});
    var message = new types.Message({time: '2015-09-01T22:30:00.000Z'});
    var origMessage = _.clone(message);
    var editedMessage = _.clone(origMessage);
    var d = new Date(editedMessage.time);
    d.setUTCHours(d.getUTCHours() + 1);
    editedMessage.time = d.toISOString();
    editedMessage.messageText = 'This is an edited note.';

    it('should be a function', function() {
      assert.isFunction(td.editDatum);
    });

    it('should maintain the length of the group data and data', function() {
      var toEdit = new TidelineData([smbg, _.clone(message), new types.CBG()]);
      var origDataLen = toEdit.data.length;
      var origGroupLen = toEdit.grouped.message.length;
      toEdit.editDatum(editedMessage, 'time');
      expect(toEdit.data.length).to.equal(origDataLen);
      expect(toEdit.grouped.message.length).to.equal(origGroupLen);
    });

    it('should update the messageText if edited datum is message', function() {
      var toEdit = new TidelineData([smbg, _.clone(message), new types.CBG()]);
      expect(toEdit.grouped.message[0].messageText).to.equal('This is a note.');
      toEdit.editDatum(editedMessage, 'time');
      expect(toEdit.grouped.message[0].messageText).to.equal('This is an edited note.');
    });

    it('should mutate the original datum', function() {
      var toEdit = new TidelineData([smbg, message, new types.CBG()]);
      expect(message === origMessage).to.be.false;
      expect(toEdit.grouped.message[0] === message).to.be.true;
      expect(_.omit(toEdit.grouped.message[0], 'displayOffset')).to.deep.equal(origMessage);
      expect(toEdit.grouped.message[0] === origMessage).to.be.false;
      toEdit.editDatum(editedMessage, 'time');
      expect(toEdit.grouped.message[0]).to.deep.equal(editedMessage);
      expect(toEdit.grouped.message[0] === editedMessage).to.be.false;
    });

    it('should expand the fill data if necessary', function() {
      var toEdit = new TidelineData([smbg, _.clone(message), new types.CBG()], {
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific'
        }
      });
      var origFill = toEdit.grouped.fill;
      var lastFill = origFill[origFill.length - 1];
      var d = new Date(lastFill.normalTime);
      d.setUTCHours(d.getUTCHours() + 7);
      editedMessage.time = d.toISOString();
      toEdit.editDatum(editedMessage, 'time');
      var newFill = toEdit.grouped.fill;
      expect(newFill[newFill.length - 1].normalTime).to.be.at.least(toEdit.grouped.message[0].normalTime);
    });
  });

  describe('findBasicsData', function() {
    var smbg = new types.SMBG({deviceTime: '2015-08-31T00:01:00'});
    var inBasicsCBG = new types.CBG({deviceTime: '2015-09-25T10:10:00'});
    var inBasicsCalibration = {
      type: 'deviceEvent',
      subType: 'calibration',
      deviceTime: '2015-09-26T15:50:00',
      time: '2015-09-26T22:50:00.000Z',
      normalTime: '2015-09-26T22:50:00.000Z',
      timezoneOffset: -420
    };
    var bolus = new types.Bolus({deviceTime: '2015-09-28T14:05:00'});
    var futureCBG = new types.CBG({deviceTime: '2015-10-01T14:22:00'});
    var futureCalibration = {
      type: 'deviceEvent',
      subType: 'calibration',
      deviceTime: '2015-10-02T09:35:00',
      time: '2015-10-02T16:35:00.000Z',
      normalTime: '2015-10-02T16:35:00.000Z',
      timezoneOffset: -420
    };
    // defaults to timezoneAware: false
    var thisTd = new TidelineData([
      smbg,
      inBasicsCBG,
      inBasicsCalibration,
      bolus,
      futureCBG,
      futureCalibration]
    );
    it('should determine the date range for The Basics based on available pump data', function() {
      var dateRange = thisTd.basicsData.dateRange;
      expect(dateRange[0]).to.equal('2015-09-14T00:00:00.000Z');
      expect(dateRange[1]).to.equal(bolus.time);
    });

    it('should only include CGM data types within the pump-data determined date range', function() {
      var basicsData = thisTd.basicsData.data;
      expect(basicsData.cbg.data.length).to.equal(1);
      expect(basicsData.calibration.data.length).to.equal(1);
    });

    it('should build a basicsData objects with all necessary attributes', function() {
      assert.isString(thisTd.basicsData.timezone);
      assert.isObject(thisTd.basicsData.data);
      assert.isObject(thisTd.basicsData.data.bolus);
      assert.isObject(thisTd.basicsData.data.smbg);
      assert.isArray(thisTd.basicsData.dateRange);
      assert.isArray(thisTd.basicsData.days);
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
      expect(fills[fills.length - 1].normalEnd).to.be.above(thisTd.grouped.smbg[0].normalTime);
    });

    it('should always cover at least 24 hours, even if there is only one point-in-time datum', function() {
      var first = fills[0], last = fills[fills.length - 1];
      expect(last.normalEnd).to.be.at.least(moment(first.normalTime).add(1, 'days').toISOString());
    });

    it('should be contiguous', function() {
      for (var i = 0; i < fills.length; ++i) {
        if (i !== fills.length - 1) {
          expect(fills[i].normalEnd).to.equal(fills[i + 1].normalTime);
        }
      }
    });

    it('when timezoneAware, should produce a foreshortened interval for Spring Forward', function() {
      var start = '2014-03-08T12:00:00', end = '2014-03-09T12:00:00';
      var thisTd = new TidelineData([
        {
          type: 'smbg',
          deviceTime: start,
          time: '2014-03-08T20:00:00.000Z',
          timezoneOffset: -480,
          id: 'abcde',
          units: 'mg/dL',
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2014-03-09T19:00:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: 'mg/dL',
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'US/Pacific'
      }});
      var fills = thisTd.grouped.fill;
      var toDSTAt = '2014-03-09T10:00:00.000Z';
      var inDST = '2014-03-09T11:00:00.000Z';
      var endsAtInDST = _.findWhere(fills, {normalEnd: inDST});
      var endsAtToDST = _.findWhere(fills, {normalTime: toDSTAt});
      var startsAtToDST = _.findWhere(fills, {normalTime: toDSTAt});
      assert.isUndefined(endsAtInDST);
      assert.isObject(endsAtToDST);
      assert.isObject(startsAtToDST);
    });

    it('when timezoneAware, should produce a lengthened interval for Fall Back', function() {
      var thisTd = new TidelineData([
        new types.SMBG({deviceTime: '2014-11-01T12:00:00'}),
        new types.SMBG({deviceTime: '2014-11-03T12:00:00'})
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'US/Pacific'
      }});
      var fills = thisTd.grouped.fill;
      var afterChange = '2014-11-02T11:00:00.000Z';
      var endsAtAfterChange = _.findWhere(fills, {normalEnd: afterChange});
      var startsAtAfterChange = _.findWhere(fills, {normalTime: afterChange});
      assert.isObject(endsAtAfterChange);
      assert.isObject(startsAtAfterChange);
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

    it('when timezoneAware, it should produce appropriately shifted intervals: true story, bruh', function() {
      var start = '2014-12-19T08:28:00', end = '2015-03-18T05:42:00';
      var thisTd = new TidelineData([
        {
          type: 'smbg',
          deviceTime: start,
          time: '2014-12-19T16:28:00.000Z',
          timezoneOffset: -480,
          id: 'abcde',
          units: 'mg/dL',
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2015-03-18T12:42:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: 'mg/dL',
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'US/Pacific'
      }});
      var twoWeekFills = _.where(thisTd.twoWeekData, {type: 'fill'});
      var firstFill = twoWeekFills[0], lastFill = twoWeekFills[twoWeekFills.length - 1];
      expect(firstFill.normalTime).to.equal('2014-12-19T08:00:00.000Z');
      expect(lastFill.normalTime).to.equal('2015-03-19T04:00:00.000Z');
    });

    it('when timezoneAware, it should produce appropriately shifted intervals: New Zealand!', function() {
      var start = '2014-12-19T08:28:00', end = '2015-03-18T05:42:00';
      var thisTd = new TidelineData([
        {
          type: 'smbg',
          deviceTime: start,
          time: '2014-12-19T16:28:00.000Z',
          timezoneOffset: -480,
          id: 'abcde',
          units: 'mg/dL',
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2015-03-18T12:42:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: 'mg/dL',
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'Pacific/Auckland'
      }});
      var twoWeekFills = _.where(thisTd.twoWeekData, {type: 'fill'});
      var firstFill = twoWeekFills[0], lastFill = twoWeekFills[twoWeekFills.length - 1];
      expect(firstFill.normalTime).to.equal('2014-12-19T11:00:00.000Z');
      expect(lastFill.normalTime).to.equal('2015-03-19T08:00:00.000Z');
    });
  });

  describe('setBGPrefs', function() {
    var data = [
      new types.SMBG({deviceTime: '2014-09-13T05:00:00'}),
      new types.SMBG({deviceTime: '2014-09-14T19:00:00'})
    ];
    var thisTd = new TidelineData(data);

    it('should be a function', function() {
      assert.isFunction(thisTd.setBGPrefs);
    });

    it('should set bgClasses to the default', function() {
      expect(thisTd.bgClasses).to.eql(bgClasses);
    });

    it('should default bgUnits to mg/dL', function() {
      var mmolData = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00', units: 'mmol/L'}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00', units: 'mmol/L'})
      ];
      var thisTd = new TidelineData(mmolData);
      expect(thisTd.bgUnits).to.eql('mg/dL');
    });

    it('should set bgUnits to mmol/L when mmol/L opt is passed in', function() {
      var mmolData = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00', units: 'mmol/L'}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00', units: 'mmol/L'})
      ];
      var thisTd = new TidelineData(mmolData, {bgUnits: 'mmol/L'});
      expect(thisTd.bgUnits).to.equal('mmol/L');
    });
  });

  describe('createNormalTime', function() {
    var data = [new types.Basal()];
    var thisTd = new TidelineData(data);

    it('should be a function', function() {
      assert.isFunction(thisTd.createNormalTime);
    });

    it('applyNewTimePrefs should be a function', function() {
      assert.isFunction(thisTd.applyNewTimePrefs);
    });

    it('should normalize to fake UTC by default', function() {
      var datum = _.findWhere(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(datum.deviceTime + '.000Z');
    });

    it('should apply the timezone offset of the environment (browser) to a message time when not timezoneAware', function() {
      var data = [new types.SMBG({deviceTime: '2014-01-01T00:00:00'}), new types.Message()];
      var thisTd = new TidelineData(data);
      var datum = _.findWhere(thisTd.data, {type: 'message'});
      var now = new Date();
      var offset = now.getTimezoneOffset();
      var adjusted = new Date(datum.time);
      adjusted.setUTCMinutes(adjusted.getUTCMinutes() - offset);
      expect(datum.normalTime).to.equal(moment.utc(adjusted).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
    });

    it('should not re-normalize to new timezone if timezoneAware is still false', function() {
      thisTd.applyNewTimePrefs({timezoneName: 'Pacific/Auckland'});
      var datum = _.findWhere(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(datum.deviceTime + '.000Z');
    });

    it('should re-normalize to US/Pacific by default on switch to timezoneAware', function() {
      thisTd.applyNewTimePrefs({timezoneAware: true});
      var datum = _.findWhere(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(moment(datum.deviceTime).tz('US/Pacific').toISOString());
    });

    it('should re-normalize to new timezone when new timezoneName', function() {
      thisTd.applyNewTimePrefs({timezoneName: 'Pacific/Auckland'});
      thisTd.addDatum(new types.Message());
      var datum = _.findWhere(thisTd.data, {type: 'basal'});
      var message = _.findWhere(thisTd.data, {type: 'message'});
      expect(datum.normalTime).to.equal(moment(datum.deviceTime).tz('Pacific/Auckland').toISOString());
      expect(message.normalTime).to.equal(moment(message.time).tz('Pacific/Auckland').toISOString());
    });
  });
});