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

/* global sinon */
/* global context */

var _ = require('lodash');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var crossfilter = require('crossfilter2');
var moment = require('moment-timezone');

var types = require('../dev/testpage/types');
var { MGDL_UNITS, MMOLL_UNITS, DEFAULT_BG_BOUNDS, BG_CLAMP_THRESHOLD } = require('../js/data/util/constants');

var TidelineData = require('../js/tidelinedata');

describe('TidelineData', function() {
  var td = new TidelineData([]);
  var bgUnits = MGDL_UNITS;
  var roundingAllowance = 0.0001;
  var bgClasses = {
    'very-low': { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow - roundingAllowance},
    low: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower - roundingAllowance},
    target: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper + roundingAllowance},
    high: { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh + roundingAllowance},
    'very-high': { boundary: BG_CLAMP_THRESHOLD[bgUnits] }
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
    expect(td.bgUnits).to.equal(MGDL_UNITS);
  });

  it('should transform `bgClasses` when `bgUnits` are mmol/L', function() {
    var data = [new types.SMBG()];
    data[0].units = MMOLL_UNITS;
    var thisTd = new TidelineData(data, {bgUnits: MMOLL_UNITS});
    expect(thisTd.bgClasses).to.not.eql(bgClasses);
    expect(thisTd.bgUnits).to.equal(MMOLL_UNITS);
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
        "units": MMOLL_UNITS,
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
        "units": MMOLL_UNITS,
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
        "units": MMOLL_UNITS,
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
        "units": MMOLL_UNITS,
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

  describe('activeScheduleIsAutomated', function() {
    it('should return `true` when the active schedule is automated', function() {
      var data = [
        new types.Settings({ activeSchedule: 'Auto Mode', source: 'Medtronic' }),
      ];
      var thisTD = new TidelineData(data);

      expect(thisTD.activeScheduleIsAutomated()).to.be.true;
    });

    it('should return `false` when the active schedule is not automated', function() {
      var data = [
        new types.Settings({ activeSchedule: 'standard', source: 'Medtronic' }),
      ];
      var thisTD = new TidelineData(data);

      expect(thisTD.activeScheduleIsAutomated()).to.be.false;
    });
  });

  describe('setUtilities', function() {
    var BaseObject = function() {
      return {
        grouped: {
          bolus: [],
          basal: [],
          cbg: [],
          smbg: [],
        },
      };
    };

    var thisTD;
    var baseObject;

    beforeEach(function() {
      thisTD = new TidelineData([]);
      baseObject = new BaseObject();
      thisTD.setUtilities.call(baseObject);
    });

    it('should set set a basal utility', function() {
      expect(baseObject.basalUtil).to.be.an('object');
    });

    it('should set set a bolus utility', function() {
      expect(baseObject.bolusUtil).to.be.an('object');
    });

    it('should set set a cbg utility', function() {
      expect(baseObject.cbgUtil).to.be.an('object');
    });

    it('should set set an smbg utility', function() {
      expect(baseObject.smbgUtil).to.be.an('object');
    });
  });

  describe('filterDataArray', function() {
    var diabetesData = [
      new types.Basal({ deviceTime: '2015-10-01T00:00:00' }),
      new types.Bolus({ deviceTime: '2015-10-04T00:00:00' }),
    ];

    var data = [
      new types.Upload({ deviceTags: ['insulin-pump'], source: 'Insulet' }),
      new types.Settings({ deviceTime: '2015-09-30T00:00:00' }),
      new types.Settings({ deviceTime: '2015-10-02T00:00:00' }),
      new types.Settings({ deviceTime: '2015-10-05T00:00:00' }),
      new types.Message({ time: '2015-09-28T00:00:00' }),
      new types.Message({ time: '2015-10-02T00:00:00' }),
      new types.Message({ time: '2015-10-05T00:00:00' }),
    ].concat(diabetesData);

    var BaseObject = function(data) {
      return {
        data,
        diabetesData,
      };
    };

    var thisTD;
    var baseObject;

    beforeEach(function() {
      thisTD = new TidelineData([]);
      baseObject = new BaseObject(data);
    });

    it('should filter out upload data', function() {
      expect(_.filter(baseObject.data, { type: 'upload' }).length).to.equal(1);
      thisTD.filterDataArray.call(baseObject);
      expect(_.filter(baseObject.data, { type: 'upload' }).length).to.equal(0);
    });

    it('should filter out message data if it is prior to the time of the earliest diabetes datum', function() {
      expect(_.filter(baseObject.data, { type: 'message' }).length).to.equal(3);
      thisTD.filterDataArray.call(baseObject);
      expect(_.filter(baseObject.data, { type: 'message' }).length).to.equal(2);
      expect(_.find(baseObject.data, { type: 'message' }).time).to.equal('2015-10-02T00:00:00');
      expect(_.findLast(baseObject.data, { type: 'message' }).time).to.equal('2015-10-05T00:00:00');
    });

    it('should filter out settings data if it is outside diabetes data time range', function() {
      expect(_.filter(baseObject.data, { type: 'pumpSettings' }).length).to.equal(3);
      thisTD.filterDataArray.call(baseObject);
      expect(_.filter(baseObject.data, { type: 'pumpSettings' }).length).to.equal(1);
      expect(_.find(baseObject.data, { type: 'pumpSettings' }).time).to.equal('2015-10-02T00:00:00.000Z');
    });
  });

  describe('deduplicateDataArrays', function() {
    var basal = [new types.Basal()];
    var basals = basal.concat(basal);

    var bolus = [new types.Bolus()];
    var boluses = bolus.concat(bolus);

    var setting = [new types.Settings()];
    var settings = setting.concat(setting);

    var BaseObject = function() {
      return {
        data: basals.concat(boluses).concat(settings),
        diabetesData: basals.concat(boluses),
        grouped: {
          basal: basals,
          bolus: boluses,
          settings: settings,
        }
      };
    };

    var thisTD;
    var baseObject;

    beforeEach(function() {
      thisTD = new TidelineData([]);
      baseObject = new BaseObject();
    });

    it('should deduplicate the data array', function() {
      expect(baseObject.data.length).to.equal(6);
      thisTD.deduplicateDataArrays.call(baseObject);
      expect(baseObject.data.length).to.equal(3);
    });

    it('should deduplicate the diabetes data array', function() {
      expect(baseObject.diabetesData.length).to.equal(4);
      thisTD.deduplicateDataArrays.call(baseObject);
      expect(baseObject.diabetesData.length).to.equal(2);
    });

    it('should deduplicate the grouped data arrays', function() {
      expect(baseObject.grouped.basal.length).to.equal(2);
      expect(baseObject.grouped.bolus.length).to.equal(2);
      expect(baseObject.grouped.settings.length).to.equal(2);
      thisTD.deduplicateDataArrays.call(baseObject);
      expect(baseObject.grouped.basal.length).to.equal(1);
      expect(baseObject.grouped.bolus.length).to.equal(1);
      expect(baseObject.grouped.settings.length).to.equal(1);
    });
  });

  describe('addData', function() {
    it('should increase the length of the group data, diabetes data, and data by the length of the provided data array (not including extra fill data)', function() {
      var origData = [
        new types.Bolus({ deviceTime: '2015-09-28T00:00:00' }),
        new types.Message({ time: '2015-09-29T00:00:00.000Z' }),
        new types.Basal({ deviceTime: '2015-09-30T00:00:00' }),
      ];

      var thisTD = new TidelineData(origData);

      var newData = [
        new types.Bolus(),
        new types.Bolus(),
        new types.Basal(),
        new types.SMBG(),
      ];

      thisTD.addData(newData);
      var tdDataWithoutFills = _.reject(thisTD.data, { type: 'fill' });
      expect(tdDataWithoutFills.length).to.equal(7);

      expect(thisTD.diabetesData.length).to.equal(6);

      expect(thisTD.grouped.bolus.length).to.equal(3);
      expect(thisTD.grouped.basal.length).to.equal(2);
      expect(thisTD.grouped.smbg.length).to.equal(1);
    });

    it('should only add valid data', function() {
      var origData = [
        new types.Bolus(),
      ];

      var thisTD = new TidelineData(origData);

      var goodBolus = new types.Bolus();

      var badBolus = _.assign({}, new types.Bolus(), {
        deviceTime: null,
      });

      var newData = [
        goodBolus,
        badBolus,
      ];

      expect(_.reject(thisTD.data, { type: 'fill' }).length).to.equal(1);
      expect(thisTD.diabetesData.length).to.equal(1);
      expect(thisTD.grouped.bolus.length).to.equal(1);

      thisTD.addData(newData);

      expect(_.reject(thisTD.data, { type: 'fill' }).length).to.equal(2);
      expect(thisTD.diabetesData.length).to.equal(2);
      expect(thisTD.grouped.bolus.length).to.equal(2);
    });

    it('should sort the data by "normalTime"', function() {
      var origData = [
        new types.Basal({ deviceTime: '2015-10-04T00:00:00' }),
        new types.Bolus({ deviceTime: '2015-10-06T00:00:00' }),
        new types.Message({ time: '2015-10-08T00:00:00.000Z' }),
      ];

      var thisTD = new TidelineData(origData);

      var newData = [
        new types.CBG({ deviceTime: '2015-10-01T00:00:00' }),
        new types.SMBG({ deviceTime: '2015-10-07T00:00:00' }),
      ];

      thisTD.addData(newData);
      var tdDataWithoutFills = _.reject(thisTD.data, { type: 'fill' });

      expect(_.findIndex(tdDataWithoutFills, {type: 'cbg'})).to.equal(0);
      expect(_.findIndex(tdDataWithoutFills, {type: 'smbg'})).to.equal(3);
    });

    it('should expand the fill data on the right if necessary', function() {
      var origData = [new types.Bolus()];
      var thisTD = new TidelineData(origData);
      var origFill = thisTD.grouped.fill;
      var lastFill = origFill[origFill.length - 1];
      var later = moment(lastFill.normalTime).add(6, 'hours').toDate();
      thisTD.addData([new types.SMBG({deviceTime: later.toISOString().slice(0, -5)})]);
      var newFill = thisTD.grouped.fill;
      expect(moment(newFill[newFill.length - 1].normalTime).toDate()).to.be.at.least(later);
    });

    context('data munging', function() {
      var thisTD;
      var filterDataArraySpy;
      var generateFillDataSpy;
      var adjustFillsForTwoWeekViewSpy;
      var deduplicateDataArraysSpy;
      var setUtilitiesSpy;
      var updateCrossFiltersSpy;

      before(() => {
        thisTD = new TidelineData([]);
        filterDataArraySpy = sinon.spy(thisTD, 'filterDataArray');
        generateFillDataSpy = sinon.spy(thisTD, 'generateFillData');
        adjustFillsForTwoWeekViewSpy = sinon.spy(thisTD, 'adjustFillsForTwoWeekView');
        deduplicateDataArraysSpy = sinon.spy(thisTD, 'deduplicateDataArrays');
        setUtilitiesSpy = sinon.spy(thisTD, 'setUtilities');
        updateCrossFiltersSpy = sinon.spy(thisTD, 'updateCrossFilters');
      });

      beforeEach(() => {
        thisTD.addData([new types.Basal()]);
      });

      afterEach(() => {
        filterDataArraySpy.resetHistory();
        generateFillDataSpy.resetHistory();
        adjustFillsForTwoWeekViewSpy.resetHistory();
        deduplicateDataArraysSpy.resetHistory();
        setUtilitiesSpy.resetHistory();
        updateCrossFiltersSpy.resetHistory();
      });

      after(() => {
        filterDataArraySpy.restore();
        generateFillDataSpy.restore();
        adjustFillsForTwoWeekViewSpy.restore();
        deduplicateDataArraysSpy.restore();
        setUtilitiesSpy.restore();
        updateCrossFiltersSpy.restore();
      });

      it('should call the "filterDataArray" method', function() {
        sinon.assert.calledOnce(filterDataArraySpy);
        assert(filterDataArraySpy.firstCall);
      });

      it('should call the fill generation methods after the data array is filtered', function() {
        sinon.assert.calledOnce(generateFillDataSpy);
        assert(generateFillDataSpy.calledAfter(filterDataArraySpy));

        sinon.assert.calledOnce(adjustFillsForTwoWeekViewSpy);
        assert(adjustFillsForTwoWeekViewSpy.calledAfter(generateFillDataSpy));
      });

      it('should call the "deduplicateDataArrays" method after the fills are created', function() {
        sinon.assert.calledOnce(deduplicateDataArraysSpy);
        assert(deduplicateDataArraysSpy.calledAfter(adjustFillsForTwoWeekViewSpy));
      });

      it('should call the "setUtilities" method after deduplication', function() {
        sinon.assert.calledOnce(setUtilitiesSpy);
        assert(setUtilitiesSpy.calledAfter(deduplicateDataArraysSpy));
      });

      it('should call the "updateCrossFilters" method at the end', function() {
        sinon.assert.calledOnce(updateCrossFiltersSpy);
        assert(setUtilitiesSpy.lastCall);
      });
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

    // Sometimes Travis VM can take longer than 2s to perform this test.
    this.timeout(3000);

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
      var toEditDate = moment(toEdit.grouped.message[0].normalTime).toDate();
      var newFillDate = moment(newFill[newFill.length - 1].normalTime).toDate();
      expect(newFillDate).to.be.at.least(toEditDate);
    });
  });

  describe('findBasicsData', function() {
    var smbg = new types.SMBG({deviceTime: '2015-08-31T00:01:00'});
    var firstCBG = new types.CBG({deviceTime: '2015-09-25T10:10:00'});
    var firstCalibration = {
      type: 'deviceEvent',
      subType: 'calibration',
      deviceTime: '2015-09-26T15:50:00',
      time: '2015-09-26T22:50:00.000Z',
      normalTime: '2015-09-26T22:50:00.000Z',
      timezoneOffset: -420
    };
    var bolus = new types.Bolus({deviceTime: '2015-09-28T14:05:00'});
    var basal = new types.Basal({deviceTime: '2015-09-28T14:06:00'});
    var secondCBG = new types.CBG({deviceTime: '2015-10-01T14:22:00'});
    var message = new types.Message({time: '2015-10-01T16:30:00'});
    var settings = new types.Settings({deviceTime: '2015-10-01T18:00:00'});
    var upload = new types.Upload({ deviceTime: '2015-10-01T18:00:00', deviceTags: ['insulin-pump'], source: 'Insulet' });
    var secondCalibration = {
      type: 'deviceEvent',
      subType: 'calibration',
      deviceTime: '2015-10-02T09:35:00',
      time: '2015-10-02T16:35:00.000Z',
      normalTime: '2015-10-02T16:35:00.000Z',
      timezoneOffset: -420
    };

    // defaults to timezoneAware: false
    var thisTd = new TidelineData([
      upload,
      smbg,
      firstCBG,
      firstCalibration,
      bolus,
      basal,
      message,
      settings,
      secondCBG,
      secondCalibration]
    );

    it('should determine the date range for The Basics based on latest available device data', function() {
      var dateRange = thisTd.basicsData.dateRange;
      expect(dateRange[0]).to.equal('2015-09-14T00:00:00.000Z');

      // in this case, the second calibration is the latest device data upload
      expect(dateRange[1]).to.equal(secondCalibration.normalTime);
      expect(thisTd.basicsData.data.bolus.data.length).to.equal(1);
      expect(thisTd.basicsData.data.bolus.data[0]).to.deep.equal(bolus);
    });

    it('should build a basicsData objects with all necessary attributes', function() {
      assert.isString(thisTd.basicsData.timezone);
      assert.isObject(thisTd.basicsData.data);
      assert.isArray(thisTd.basicsData.dateRange);
      assert.isArray(thisTd.basicsData.days);
    });

    it('should add all relevant data as provided', function() {
      expect(thisTd.basicsData.data.bolus.data.length).to.equal(1);
      expect(thisTd.basicsData.data.upload.data.length).to.equal(1);
      expect(thisTd.basicsData.data.basal.data.length).to.equal(1);
      expect(thisTd.basicsData.data.cbg.data.length).to.equal(2);
      expect(thisTd.basicsData.data.calibration.data.length).to.equal(2);
      expect(thisTd.basicsData.data.calibration.data[1]).to.deep.equal(secondCalibration);
    });

    it('should not add settings or message data', function() {
      expect(thisTd.basicsData.data.settings).to.be.undefined;
      expect(thisTd.basicsData.data.message).to.be.undefined;
    });
  });

  describe('generateFillData', function() {
    var thisTd = new TidelineData([new types.SMBG()]);
    var fills = thisTd.grouped.fill;

    it('should be a function', function() {
      assert.isFunction(td.generateFillData);
    });

    it('should extend beyond extent of data on either side', function() {
      var time1 = moment(fills[0].normalTime).toDate();
      var time2 = moment(thisTd.grouped.smbg[0].normalTime).toDate();
      expect(time1).to.be.below(time2);

      time1 = moment(fills[fills.length - 1].normalEnd).toDate();
      time2 = moment(thisTd.grouped.smbg[0].normalTime).toDate();
      expect(time1).to.be.above(time2);
    });

    it('should always cover at least 24 hours, even if there is only one point-in-time datum', function() {
      var first = moment(fills[0].normalTime).add(1, 'days').toDate();
      var last = moment(fills[fills.length - 1].normalEnd).toDate();
      expect(last).to.be.at.least(first);
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
          units: MGDL_UNITS,
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2014-03-09T19:00:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: MGDL_UNITS,
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'US/Pacific'
      }});
      var fills = thisTd.grouped.fill;
      var toDSTAt = '2014-03-09T10:00:00.000Z';
      var inDST = '2014-03-09T11:00:00.000Z';
      var endsAtInDST = _.find(fills, {normalEnd: inDST});
      var endsAtToDST = _.find(fills, {normalTime: toDSTAt});
      var startsAtToDST = _.find(fills, {normalTime: toDSTAt});
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
      var endsAtAfterChange = _.find(fills, {normalEnd: afterChange});
      var startsAtAfterChange = _.find(fills, {normalTime: afterChange});
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
          units: MGDL_UNITS,
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2015-03-18T12:42:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: MGDL_UNITS,
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'US/Pacific'
      }});
      var twoWeekFills = _.filter(thisTd.twoWeekData, {type: 'fill'});
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
          units: MGDL_UNITS,
          value: 100
        }, {
          type: 'smbg',
          deviceTime: end,
          time: '2015-03-18T12:42:00.000Z',
          timezoneOffset: -420,
          id: 'abcde',
          units: MGDL_UNITS,
          value: 101
        }
      ], {timePrefs: {
        timezoneAware: true,
        timezoneName: 'Pacific/Auckland'
      }});
      var twoWeekFills = _.filter(thisTd.twoWeekData, {type: 'fill'});
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

    it('should apply `0.0001` rounding allowances for mg/dL values', function() {
      expect(thisTd.bgClasses['very-low'].boundary).to.equal(DEFAULT_BG_BOUNDS[bgUnits].veryLow - roundingAllowance);
      expect(thisTd.bgClasses.low.boundary).to.equal(DEFAULT_BG_BOUNDS[bgUnits].targetLower - roundingAllowance);
      expect(thisTd.bgClasses.target.boundary).to.equal(DEFAULT_BG_BOUNDS[bgUnits].targetUpper + roundingAllowance);
      expect(thisTd.bgClasses.high.boundary).to.equal(DEFAULT_BG_BOUNDS[bgUnits].veryHigh + roundingAllowance);
    });

    it('should default bgUnits to mg/dL', function() {
      var mmolData = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00', units: MMOLL_UNITS}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00', units: MMOLL_UNITS})
      ];
      var thisTd = new TidelineData(mmolData);
      expect(thisTd.bgUnits).to.eql(MGDL_UNITS);
    });

    it('should set bgUnits to mmol/L when mmol/L opt is passed in', function() {
      var mmolData = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00', units: MMOLL_UNITS}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00', units: MMOLL_UNITS})
      ];
      var thisTd = new TidelineData(mmolData, {bgUnits: MMOLL_UNITS});
      expect(thisTd.bgUnits).to.equal(MMOLL_UNITS);
    });
  });

  describe('setLastManualBasalSchedule', function() {
    context('automated basal is active at last upload', function() {
      it('should set the `lastManualBasalSchedule` property on the last pumpSettings object when available', function() {
        var data = [
          new types.Settings(),
          new types.Settings({ activeSchedule: 'Auto Mode', source: 'Medtronic' }),
          new types.Basal({ deliveryType: 'scheduled' }),
        ];
        var thisTd = new TidelineData(data);
        expect(thisTd.grouped.pumpSettings[1].lastManualBasalSchedule).to.equal('standard');
      });

      it('should not set the `lastManualBasalSchedule` property on the last pumpSettings object when unavailable', function() {
        var data = [
          new types.Settings(),
          new types.Settings({ activeSchedule: 'Auto Mode', source: 'Medtronic' }),
          new types.Basal({ deliveryType: 'automated' }),
        ];
        var thisTd = new TidelineData(data);
        expect(thisTd.grouped.pumpSettings[1].lastManualBasalSchedule).to.be.undefined;
      });
    });

    context('automated basal is not active at last upload', function() {
      it('should not set the `lastManualBasalSchedule` property', function() {
        var data = [
          new types.Settings(),
          new types.Settings({ activeSchedule: 'standard', source: 'Medtronic' }),
          new types.Basal({ deliveryType: 'scheduled' }),
        ];
        var thisTd = new TidelineData(data);
        expect(thisTd.grouped.pumpSettings[1].lastManualBasalSchedule).to.be.undefined;
      });
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
      var datum = _.find(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(datum.deviceTime + '.000Z');
    });

    it('should apply the timezone offset of the environment (browser) to a message time when not timezoneAware', function() {
      var data = [new types.SMBG({deviceTime: '2014-01-01T00:00:00'}), new types.Message()];
      var thisTd = new TidelineData(data);
      var datum = _.find(thisTd.data, {type: 'message'});
      var now = new Date();
      var offset = now.getTimezoneOffset();
      var adjusted = new Date(datum.time);
      adjusted.setUTCMinutes(adjusted.getUTCMinutes() - offset);
      expect(datum.normalTime).to.equal(moment.utc(adjusted).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');
    });

    it('should not re-normalize to new timezone if timezoneAware is still false', function() {
      thisTd.applyNewTimePrefs({timezoneName: 'Pacific/Auckland'});
      var datum = _.find(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(datum.deviceTime + '.000Z');
    });

    it('should re-normalize to US/Pacific by default on switch to timezoneAware', function() {
      thisTd.applyNewTimePrefs({timezoneAware: true});
      var datum = _.find(thisTd.data, {type: 'basal'});
      expect(datum.normalTime).to.equal(moment(datum.deviceTime).tz('US/Pacific').toISOString());
    });

    it('should re-normalize to new timezone when new timezoneName', function() {
      thisTd.applyNewTimePrefs({timezoneName: 'Pacific/Auckland'});
      thisTd.addData([new types.Message()]);
      var datum = _.find(thisTd.data, {type: 'basal'});
      var message = _.find(thisTd.data, {type: 'message'});
      expect(datum.normalTime).to.equal(moment(datum.deviceTime).tz('Pacific/Auckland').toISOString());
      expect(message.normalTime).to.equal(moment(message.time).tz('Pacific/Auckland').toISOString());
    });
  });

  describe('deduplicatePhysicalActivities', function() {
    var data = [
      new types.PhysicalActivity({
        deviceTime: '2014-07-01T10:00:00',
        eventId: 'PA1',
      }),
      new types.PhysicalActivity({
        deviceTime: '2014-07-01T10:30:00',
        eventId: 'PA1',
      }),
      new types.PhysicalActivity({
        deviceTime: '2014-07-02T10:30:00',
      }),
      new types.PhysicalActivity({
        inputTime: moment.utc().subtract(4, 'hours').toISOString(),
        eventId: 'PA2',
      }),
      new types.PhysicalActivity({
        inputTime: moment.utc().subtract(3, 'hours').toISOString(),
        eventId: 'PA2',
      })
    ];
    var thisTd = new TidelineData(_.cloneDeep(data), {});

    it('should be a function', function() {
      assert.isFunction(thisTd.deduplicatePhysicalActivities);
    });

    const PA1 = _.filter(thisTd.physicalActivities, { 'eventId': 'PA1' });
    const PA2 = _.filter(thisTd.physicalActivities, { 'eventId': 'PA2' });
    const PA3 = _.filter(thisTd.physicalActivities, { 'eventId': data[2].id });

    it('should deduplicate PAs based on eventId', function() {
      // PA1, PA2 and undefined
      expect(thisTd.physicalActivities.length).to.equal(3);
      expect(PA1.length).to.equal(1);
      expect(PA2.length).to.equal(1);
      expect(PA3.length).to.equal(1);
    });

    it('should have taken the most recent activity by eventID', () => {
      expect(PA1[0].id).to.equal(data[1].id);
      expect(PA1[0].inputTime).to.equal(data[1].deviceTime + '.000Z');
      expect(PA2[0].id).to.equal(data[4].id);
      expect(PA2[0].inputTime).to.equal(data[4].inputTime);
    })
  });

});
