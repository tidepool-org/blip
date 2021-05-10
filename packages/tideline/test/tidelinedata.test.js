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

import _ from 'lodash';
import { assert, expect } from 'chai';

import { MGDL_UNITS, MMOLL_UNITS, DEFAULT_BG_BOUNDS, BG_CLAMP_THRESHOLD } from '../js/data/util/constants';
import TidelineData from '../js/tidelinedata';

// import types from '../dev/testpage/types';

describe('TidelineData', function() {
  const bgUnits = MGDL_UNITS;
  const roundingAllowance = 0.0001;
  const fixedDate = new Date('2021-02-10T09:00:00Z');
  const fixedDateIso = fixedDate.toISOString();
  const fixedDateValue = fixedDate.valueOf();
  const timezoneName = 'Europe/Paris';

  const properties = [
    'data',
    'maxDuration',
    'grouped',
    'diabetesData',
    'deviceParameters',
    'physicalActivities',
    'zenEvents',
    'confidentialEvents',
    'latestPumpManufacturer',
    'endpoints',
    'basicsData',
    'filterData',
    'smbgData',
    'cbgData',
    'dataByDate',
    'smbgByDate',
    'smbgByDayOfWeek',
    'cbgByDate',
    'cbgByDayOfWeek',
    'basalUtil',
    'bolusUtil',
    'cbgUtil',
    'smbgUtil',
    'timezonesList',
  ];

  describe('Init', function () {
    const bgClasses = {
      'very-low': { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow - roundingAllowance},
      low: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower - roundingAllowance},
      target: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper + roundingAllowance},
      high: { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh + roundingAllowance},
      'very-high': { boundary: BG_CLAMP_THRESHOLD[bgUnits] }
    };
    /** @type {TidelineData} */
    let td = null;

    before(() => {
      td = new TidelineData();
      // const data = [new types.SMBG()];
      // data[0].units = MMOLL_UNITS;
      // await thisTd.addData(data);
      // const data = [
      //   new types.SMBG(),
      //   new types.CBG(),
      // ];
      // await thisTd.addData(data);
    });

    it('should be a function', function() {
      assert.isFunction(TidelineData);
    });

    it('should be a (newable) constructor', function() {
      expect(td).to.exist;
    });

    it('most properties should be null', () => {
      const nullProperties = _.difference(properties, ['data', 'maxDuration']);
      nullProperties.forEach((prop) => {
        expect(td[prop], prop).to.be.null;
      });
    });

    it('should have a `data` attribute that is an array', function() {
      assert.isArray(td.data);
    });

    it('should have a `maxDuration` attribute that is a number equal 0', function() {
      expect(td.maxDuration).to.be.equal(0);
    });

    it('should default to mg/dL for `bgUnits` and `bgClasses`', function() {
      const msg = JSON.stringify({ expected: bgClasses, having: td.bgClasses }, null, 2);
      expect(td.opts.bgClasses, msg).to.deep.eql(bgClasses);
      expect(td.opts.bgUnits).to.equal(MGDL_UNITS);
    });

    it('should transform `bgClasses` when `bgUnits` are mmol/L', async () => {
      td = new TidelineData({bgUnits: MMOLL_UNITS});
      expect(td.opts.bgClasses).to.not.eql(bgClasses);
      expect(td.opts.bgUnits).to.equal(MMOLL_UNITS);
    });
  });

  describe('normalizeTime', () => {
    it('should set normalTime and epoch values', () => {
      const dInitial = {
        type: 'upload',
        time: fixedDateIso,
      };
      const dExpected = {
        ...dInitial,
        normalTime: fixedDateIso,
        epoch: fixedDateValue,
      };
      const dResult = _.clone(dInitial);
      TidelineData.prototype.normalizeTime(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });

    it('should set normalEnd and epochEnd for basal values', () => {
      const dInitial = {
        type: 'basal',
        time: fixedDateIso,
        duration: 5000,
        suppressed: {
          type: 'basal',
          deliveryType: 'temp',
        },
      };
      const dExpected = {
        ...dInitial,
        normalTime: fixedDateIso,
        normalEnd: new Date(fixedDateValue + dInitial.duration).toISOString(),
        epoch: fixedDateValue,
        epochEnd: fixedDateValue + dInitial.duration,
      };
      delete dExpected.suppressed;
      const dResult = _.clone(dInitial);
      TidelineData.prototype.normalizeTime(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });

    it('should set normalEnd and epochEnd for deviceEvent/confidential values', () => {
      const dInitial = {
        type: 'deviceEvent',
        subType: 'confidential',
        time: fixedDateIso,
        duration: {
          value: 1,
          units: 'hours',
        },
      };
      const dExpected = {
        ...dInitial,
        normalTime: fixedDateIso,
        normalEnd: new Date(fixedDateValue + dInitial.duration.value * 60 * 60 * 1000).toISOString(),
        epoch: fixedDateValue,
        epochEnd: fixedDateValue + dInitial.duration.value * 60 * 60 * 1000,
      };
      const dResult = _.clone(dInitial);
      TidelineData.prototype.normalizeTime(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });

    it('should set normalEnd and epochEnd for deviceEvent/zen values', () => {
      const dInitial = {
        type: 'deviceEvent',
        subType: 'zen',
        time: fixedDateIso,
        duration: {
          value: 30,
          units: 'minutes',
        },
      };
      const dExpected = {
        ...dInitial,
        normalTime: fixedDateIso,
        normalEnd: new Date(fixedDateValue + dInitial.duration.value * 60 * 1000).toISOString(),
        epoch: fixedDateValue,
        epochEnd: fixedDateValue + dInitial.duration.value * 60 * 1000,
      };
      const dResult = _.clone(dInitial);
      TidelineData.prototype.normalizeTime(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });
  });


  describe('cleanDatum', () => {
    const dInitial = {
      id: 'abc',
      type: 'cbg',
      time: fixedDateIso,
      deviceTime: fixedDateIso,
      deviceId:  'ABC',
      deviceSerialNumber: 'ABC',
      timezoneOffset: 0,
      clockDriftOffset: 0,
      conversionOffset: 0,
      createdTime: fixedDateIso,
      _id: 'abc',
      _userId: 'abc',
      _schemaVersion: 3,
    };

    /** @type {TidelineData} */
    let tidelineData = null;

    before(() => {
      tidelineData = new TidelineData();
    });

    it('should cleanup unwanted datum fields', () => {
      const dExpected = {
        id: dInitial.id,
        type: dInitial.type,
        source: 'Diabeloop',
      };
      const dResult = _.clone(dInitial);
      tidelineData.cleanDatum(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });

    it('should should keep some device information for pumpSettings', () => {
      const dExpected = {
        id: dInitial.id,
        deviceTime: dInitial.deviceTime,
        deviceId: dInitial.deviceId,
        deviceSerialNumber: dInitial.deviceSerialNumber,
        type: 'pumpSettings',
        source: 'Diabeloop',
      };
      const dResult = _.clone({ ...dInitial, type: 'pumpSettings' });
      tidelineData.cleanDatum(dResult);
      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });

    it('should add an id if missing', () => {
      const dResult = _.clone(dInitial);
      delete dResult.id;
      tidelineData.cleanDatum(dResult);
      expect(dResult.id).to.be.a('string').not.empty;
    });
  });

  describe('createTimezoneChange', () => {
    /** @type {TidelineData} */
    let tidelineData = null;

    before(() => {
      tidelineData = new TidelineData();
    });

    it('should create a valid deviceEvent/timeChange datum', () => {
      const dExpected = {
        epoch: fixedDateValue,
        normalTime: fixedDateIso,
        timezone: timezoneName,
        displayOffset: -60,
        type: 'deviceEvent',
        subType: 'timeChange',
        source: 'Diabeloop',
        from: {
          time: fixedDateIso,
          timeZoneName: 'UTC',
        },
        to: {
          time: fixedDateIso,
          timeZoneName: timezoneName,
        },
        method: 'guessed',
      };

      const dResult = tidelineData.createTimezoneChange('UTC', timezoneName, fixedDateValue);
      expect(dResult.id).to.be.a('string').not.empty;
      delete dResult.id;

      expect(dResult, JSON.stringify({ dExpected, dResult })).to.be.deep.equal(dExpected);
    });
  });


  describe('setTimezones', () => {
    /** @type {TidelineData} */
    let td = null;

    beforeEach(() => {
      td = new TidelineData({ timePrefs: { timezoneName } });
    });

    it('should set timezone/displayOffset/guessedTimezone if missing - using default timezone', () => {
      const dInitial = {
        id: 'abc',
        type: 'basal',
        epoch: fixedDateValue,
      };

      td.data = [dInitial];
      td.setTimezones();

      expect(td.data.length).to.be.equal(1);
      expect(dInitial.timezone).to.be.equal(timezoneName);
      expect(dInitial.guessedTimezone).to.be.true;
      expect(dInitial.displayOffset).to.be.equal(-60);
    });

    it('should set timezone/displayOffset/guessedTimezone if missing - using first valid timezone', () => {
      const dInitial = {
        id: 'abc',
        type: 'cbg',
        epoch: fixedDateValue,
      };

      const timezone = 'America/Los_Angeles';
      td.data = [dInitial, {...dInitial, timezone }];
      td.setTimezones();

      expect(td.data.length).to.be.equal(2);
      expect(td.data[0].timezone).to.be.equal(timezone);
      expect(td.data[0].guessedTimezone).to.be.true;
      expect(td.data[0].displayOffset).to.be.equal(480);
      expect(td.data[1].timezone).to.be.equal(timezone);
      expect(td.data[1].guessedTimezone).to.be.undefined;
      expect(td.data[1].displayOffset).to.be.equal(480);
    });

    it('should should set localDate and msPer24 for cbg & smbg', () => {
      const dInitial = {
        id: 'abc',
        type: 'cbg',
        epoch: fixedDateValue,
        timezone: timezoneName,
      };

      td.data = [dInitial, { ...dInitial, type: 'smbg' }];
      td.setTimezones();

      expect(td.data.length).to.be.equal(2);
      td.data.forEach((d) => {
        expect(d.timezone).to.be.equal(timezoneName);
        expect(d.guessedTimezone).to.be.undefined;
        expect(d.displayOffset).to.be.equal(-60);
        expect(d.localDate).to.be.equal('2021-02-10');
        expect(d.msPer24).to.be.equal(36000000); // UTC+1 => 10h => 10 * 60 * 60 * 1000
      });
    });

    it('should not generate a deviceEvent/timeChange event when the timezone is the synonym Etc/*', () => {
      const synonymZone = 'Etc/GMT-1';
      const dInitial = {
        id: 'abc',
        type: 'bolus',
        epoch: fixedDateValue,
        timezone: timezoneName,
      };

      td.data = [dInitial, { ...dInitial, timezone: synonymZone }];
      td.setTimezones();

      const onErrorMsg = JSON.stringify(td, null, 2);
      expect(td.data.length, onErrorMsg).to.be.equal(2);
      expect(td.data[0].timezone, onErrorMsg).to.be.equal(timezoneName);
      expect(td.data[0].guessedTimezone, onErrorMsg).to.be.undefined;
      expect(td.data[0].displayOffset, onErrorMsg).to.be.equal(-60);
      expect(td.data[1].timezone, onErrorMsg).to.be.equal(synonymZone);
      expect(td.data[1].guessedTimezone, onErrorMsg).to.be.undefined;
      expect(td.data[1].displayOffset, onErrorMsg).to.be.equal(-60);

      expect(td.opts.timePrefs, onErrorMsg).to.be.deep.equal({
        timezoneAware: true,
        timezoneName,
        timezoneOffset: 60,
      });
      expect(td.timezonesList, onErrorMsg).to.be.deep.equal([{ time: 0, timezone: timezoneName }]);
    });

    it('should ignore "UTC", "GMT", "Etc/GMT" timezones', () => {
      const INVALID_TIMEZONES = ['UTC', 'GMT', 'Etc/GMT'];
      const dInitial = {
        id: 'abc',
        type: 'bolus',
        epoch: fixedDateValue,
        timezone: timezoneName,
      };

      td.data.push(dInitial);
      INVALID_TIMEZONES.forEach((timezone) => {
        td.data.push({ ...dInitial, timezone });
      });
      td.setTimezones();

      const onErrorMsg = JSON.stringify(td, null, 2);
      expect(td.data.length, onErrorMsg).to.be.equal(INVALID_TIMEZONES.length + 1);
      expect(td.data[0].timezone, onErrorMsg).to.be.equal(timezoneName);
      expect(td.data[0].guessedTimezone, onErrorMsg).to.be.undefined;
      expect(td.data[0].displayOffset, onErrorMsg).to.be.equal(-60);
      for (let i=1; i<td.data.length; i++) {
        expect(td.data[1].timezone, onErrorMsg).to.be.equal(timezoneName);
        expect(td.data[1].guessedTimezone, onErrorMsg).to.be.true;
        expect(td.data[1].displayOffset, onErrorMsg).to.be.equal(-60);
      }

      expect(td.opts.timePrefs, onErrorMsg).to.be.deep.equal({
        timezoneAware: true,
        timezoneName,
        timezoneOffset: 60,
      });
      expect(td.timezonesList, onErrorMsg).to.be.deep.equal([{ time: 0, timezone: timezoneName }]);
    });

    it('should generate a deviceEvent/timeChange on summer/winter time change', () => {
      const summerTime = new Date('2020-10-25T00:59:00Z');
      const winterTime = new Date('2020-10-25T01:01:00Z');
      const dInitial = {
        id: 'abc',
        type: 'bolus',
        epoch: summerTime.valueOf(),
        normalTime: summerTime.toISOString(),
        timezone: timezoneName,
      };

      td.data = _.cloneDeep([
        dInitial,
        {
          ...dInitial,
          type: 'wizard',
          epoch: winterTime.valueOf(),
          normalTime: winterTime.toISOString()
        }
      ]);
      td.setTimezones();

      const d0 = { ...dInitial, displayOffset: -120 };
      const d1 = {
        type: 'deviceEvent',
        subType: 'timeChange',
        method: 'guessed',
        source: 'Diabeloop',
        normalTime: '2020-10-25T01:00:00.000Z',
        timezone: timezoneName,
        displayOffset: -60,
        epoch: 1603587600000,
        from: {
          time: '2020-10-25T00:59:59.999Z',
          timeZoneName: timezoneName,
        },
        to: {
          time: '2020-10-25T01:00:00.000Z',
          timeZoneName: timezoneName,
        },
      };
      const d2 = {
        ...dInitial,
        type: 'wizard',
        displayOffset: -60,
        epoch: winterTime.valueOf(),
        normalTime: winterTime.toISOString()
      };
      expect(td.data.length).to.be.equal(3);

      delete td.data[1].id; // generated, can't be guessed
      const onErrorMsg = JSON.stringify({ td, d0, d1, d2 }, null, 2);

      expect(td.data[0], onErrorMsg).to.be.deep.equal(d0);
      expect(td.data[1], onErrorMsg).to.be.deep.equal(d1);
      expect(td.data[2], onErrorMsg).to.be.deep.equal(d2);
      expect(td.opts.timePrefs, onErrorMsg).to.be.deep.equal({
        timezoneAware: true,
        timezoneName,
        timezoneOffset: 60,
      });
      expect(td.timezonesList, onErrorMsg).to.be.deep.equal([{ time: 0, timezone: timezoneName }]);
    });
  });

/*
  it('should contain sorted groups of data by normalTime', async () => {
    const data = [
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
    thisTd = new TidelineData();
    await thisTd.addData(data);
    expect(thisTd.grouped.smbg[0].id).to.equal('1');
    expect(thisTd.grouped.smbg[1].id).to.equal('2');
    expect(thisTd.grouped.smbg[2].id).to.equal('3');
    expect(thisTd.grouped.smbg[3].id).to.equal('4');
  });

  it('should filter out messages with bad timestamps', async () => {
    const data = [{
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
    thisTd = new TidelineData();
    await thisTd.addData(data);
    expect(thisTd.data.length).to.be.equal(0);
    expect(thisTd.grouped).to.be.null;
  });

  const dataTypes = {
    basal: new types.Basal(),
    bolus: new types.Bolus(),
    cbg: new types.CBG(),
    smbg: new types.SMBG(),
    wizard: new types.Wizard()
  };

  _.forOwn(dataTypes, (datum, dType) => {
    it(`should be able to handle only ${dType} without error`, async () => {
      const data = [datum];
      thisTd = new TidelineData();
      await thisTd.addData(data);
      expect(thisTd.data.length).to.be.above(1);
    });
  });

  describe('setUtilities', function() {
    function BaseObject() {
      return {
        grouped: {
          bolus: [],
          basal: [],
          cbg: [],
          smbg: [],
        },
      };
    }

    let baseObject;

    beforeEach(function() {
      thisTd = new TidelineData();
      baseObject = new BaseObject();
      baseObject.opts = thisTd.opts;
      thisTd.setUtilities.call(baseObject);
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

  // describe('filterDataArray', function() {
  //   var diabetesData = [
  //     new types.Basal({ deviceTime: '2015-10-01T00:00:00' }),
  //     new types.Bolus({ deviceTime: '2015-10-04T00:00:00' }),
  //   ];

  //   var data = [
  //     new types.Upload({ deviceTags: ['insulin-pump'], source: 'Insulet' }),
  //     new types.Settings({ deviceTime: '2015-09-30T00:00:00' }),
  //     new types.Settings({ deviceTime: '2015-10-02T00:00:00' }),
  //     new types.Settings({ deviceTime: '2015-10-05T00:00:00' }),
  //     new types.Message({ time: '2015-09-28T00:00:00' }),
  //     new types.Message({ time: '2015-10-02T00:00:00' }),
  //     new types.Message({ time: '2015-10-05T00:00:00' }),
  //   ].concat(diabetesData);

  //   var BaseObject = function(data) {
  //     return {
  //       data,
  //       diabetesData,
  //     };
  //   };

  //   var baseObject;

  //   beforeEach(function() {
  //     thisTd = new TidelineData();
  //     baseObject = new BaseObject(data);
  //   });

  //   it('should filter out upload data', function() {
  //     expect(_.filter(baseObject.data, { type: 'upload' }).length).to.equal(1);
  //     thisTd.filterDataArray.call(baseObject);
  //     expect(_.filter(baseObject.data, { type: 'upload' }).length).to.equal(0);
  //   });

  //   it('should filter out message data if it is prior to the time of the earliest diabetes datum', function() {
  //     expect(_.filter(baseObject.data, { type: 'message' }).length).to.equal(3);
  //     thisTd.filterDataArray.call(baseObject);
  //     expect(_.filter(baseObject.data, { type: 'message' }).length).to.equal(2);
  //     expect(_.find(baseObject.data, { type: 'message' }).time).to.equal('2015-10-02T00:00:00');
  //     expect(_.findLast(baseObject.data, { type: 'message' }).time).to.equal('2015-10-05T00:00:00');
  //   });

  //   it('should filter out settings data if it is outside diabetes data time range', function() {
  //     expect(_.filter(baseObject.data, { type: 'pumpSettings' }).length).to.equal(3);
  //     thisTd.filterDataArray.call(baseObject);
  //     expect(_.filter(baseObject.data, { type: 'pumpSettings' }).length).to.equal(1);
  //     expect(_.find(baseObject.data, { type: 'pumpSettings' }).time).to.equal('2015-10-02T00:00:00.000Z');
  //   });
  // });

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

    var baseObject;

    beforeEach(function() {
      thisTd = new TidelineData();
      baseObject = new BaseObject();
    });

    it('should deduplicate the data array', function() {
      expect(baseObject.data.length).to.equal(6);
      thisTd.deduplicateDataArrays.call(baseObject);
      expect(baseObject.data.length).to.equal(3);
    });

    it('should deduplicate the diabetes data array', function() {
      expect(baseObject.diabetesData.length).to.equal(4);
      thisTd.deduplicateDataArrays.call(baseObject);
      expect(baseObject.diabetesData.length).to.equal(2);
    });

    it('should deduplicate the grouped data arrays', function() {
      expect(baseObject.grouped.basal.length).to.equal(2);
      expect(baseObject.grouped.bolus.length).to.equal(2);
      expect(baseObject.grouped.settings.length).to.equal(2);
      thisTd.deduplicateDataArrays.call(baseObject);
      expect(baseObject.grouped.basal.length).to.equal(1);
      expect(baseObject.grouped.bolus.length).to.equal(1);
      expect(baseObject.grouped.settings.length).to.equal(1);
    });
  });

  describe('addData', function() {
    it('should increase the length of the group data, diabetes data, and data by the length of the provided data array (not including extra fill data)', async () => {
      var data = [
        new types.Bolus({ deviceTime: '2015-09-28T00:00:00' }),
        new types.Message({ time: '2015-09-29T00:00:00.000Z' }),
        new types.Basal({ deviceTime: '2015-09-30T00:00:00' }),
      ];

      thisTd = new TidelineData();
      await thisTd.addData(data);

      var newData = [
        new types.Bolus(),
        new types.Bolus(),
        new types.Basal(),
        new types.SMBG(),
      ];

      thisTd.addData(newData);
      var tdDataWithoutFills = _.reject(thisTd.data, { type: 'fill' });
      expect(tdDataWithoutFills.length).to.equal(7);

      expect(thisTd.diabetesData.length).to.equal(6);

      expect(thisTd.grouped.bolus.length).to.equal(3);
      expect(thisTd.grouped.basal.length).to.equal(2);
      expect(thisTd.grouped.smbg.length).to.equal(1);
    });

    it('should only add valid data', function() {
      var origData = [
        new types.Bolus(),
      ];

      thisTd = new TidelineData(origData);

      var goodBolus = new types.Bolus();

      var badBolus = _.assign({}, new types.Bolus(), {
        deviceTime: null,
      });

      var newData = [
        goodBolus,
        badBolus,
      ];

      expect(_.reject(thisTd.data, { type: 'fill' }).length).to.equal(1);
      expect(thisTd.diabetesData.length).to.equal(1);
      expect(thisTd.grouped.bolus.length).to.equal(1);

      thisTd.addData(newData);

      expect(_.reject(thisTd.data, { type: 'fill' }).length).to.equal(2);
      expect(thisTd.diabetesData.length).to.equal(2);
      expect(thisTd.grouped.bolus.length).to.equal(2);
    });

    it('should sort the data by "normalTime"', function() {
      var origData = [
        new types.Basal({ deviceTime: '2015-10-04T00:00:00' }),
        new types.Bolus({ deviceTime: '2015-10-06T00:00:00' }),
        new types.Message({ time: '2015-10-08T00:00:00.000Z' }),
      ];

      thisTd = new TidelineData(origData);

      var newData = [
        new types.CBG({ deviceTime: '2015-10-01T00:00:00' }),
        new types.SMBG({ deviceTime: '2015-10-07T00:00:00' }),
      ];

      thisTd.addData(newData);
      var tdDataWithoutFills = _.reject(thisTd.data, { type: 'fill' });

      expect(_.findIndex(tdDataWithoutFills, {type: 'cbg'})).to.equal(0);
      expect(_.findIndex(tdDataWithoutFills, {type: 'smbg'})).to.equal(3);
    });

    it('should expand the fill data on the right if necessary', function() {
      var origData = [new types.Bolus()];
      thisTd = new TidelineData(origData);
      var origFill = thisTd.grouped.fill;
      var lastFill = origFill[origFill.length - 1];
      var later = moment(lastFill.normalTime).add(6, 'hours').toDate();
      thisTd.addData([new types.SMBG({deviceTime: later.toISOString().slice(0, -5)})]);
      var newFill = thisTd.grouped.fill;
      expect(moment(newFill[newFill.length - 1].normalTime).toDate()).to.be.at.least(later);
    });

    context('data munging', function() {
      var filterDataArraySpy;
      var generateFillDataSpy;
      var adjustFillsForTwoWeekViewSpy;
      var deduplicateDataArraysSpy;
      var setUtilitiesSpy;
      var updateCrossFiltersSpy;

      before(() => {
        thisTd = new TidelineData([]);
        filterDataArraySpy = sinon.spy(thisTd, 'filterDataArray');
        generateFillDataSpy = sinon.spy(thisTd, 'generateFillData');
        adjustFillsForTwoWeekViewSpy = sinon.spy(thisTd, 'adjustFillsForTwoWeekView');
        deduplicateDataArraysSpy = sinon.spy(thisTd, 'deduplicateDataArrays');
        setUtilitiesSpy = sinon.spy(thisTd, 'setUtilities');
        updateCrossFiltersSpy = sinon.spy(thisTd, 'updateCrossFilters');
      });

      beforeEach(() => {
        thisTd.addData([new types.Basal()]);
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

    // Sometimes we have a timeout on theses tests, so use a long one.
    this.timeout(10000);

    it('should be a function', function() {
      assert.isFunction(thisTd.editDatum);
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
      const having = _.omit(toEdit.grouped.message[0], 'displayOffset');
      expect(having, JSON.stringify({ expected: origMessage, having }, null, 2)).to.deep.equal(origMessage);
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
    thisTd = new TidelineData([
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
    let thisTd = null;
    let fills = null;
    before(() => {
      thisTd = new TidelineData([new types.SMBG()]);
      fills = thisTd.grouped.fill;
    });

    it('should be a function', function() {
      assert.isFunction(thisTd.generateFillData);
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
      thisTd = new TidelineData([
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
      thisTd = new TidelineData([
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
      assert.isFunction(thisTd.adjustFillsForTwoWeekView);
    });

    it('should cover at least 14 days surrounding where smbg data exists (messages outside)', function() {
      var data = [
        new types.Message({time: '2014-09-01T12:00:00.000Z'}),
        new types.SMBG({deviceTime: '2014-09-05T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-16T19:00:00'}),
        new types.Message({time: '2014-09-30T12:00:00.000Z'})
      ];
      thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-03T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-16T21:00:00.000Z');
    });

    it('should cover at least 14 days surrounding where smbg data exists (just smbg)', function() {
      var data = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00'})
      ];
      thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-01T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-14T21:00:00.000Z');
    });

    it('when timezoneAware, it should produce appropriately shifted intervals: true story, bruh', function() {
      var start = '2014-12-19T08:28:00', end = '2015-03-18T05:42:00';
      thisTd = new TidelineData([
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
      thisTd = new TidelineData([
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
    thisTd = new TidelineData(data);

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
      thisTd = new TidelineData(mmolData);
      expect(thisTd.bgUnits).to.eql(MGDL_UNITS);
    });

    it('should set bgUnits to mmol/L when mmol/L opt is passed in', function() {
      var mmolData = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00', units: MMOLL_UNITS}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00', units: MMOLL_UNITS})
      ];
      thisTd = new TidelineData(mmolData, {bgUnits: MMOLL_UNITS});
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
        thisTd = new TidelineData(data);
        expect(thisTd.grouped.pumpSettings[1].lastManualBasalSchedule).to.equal('standard');
      });

      it('should not set the `lastManualBasalSchedule` property on the last pumpSettings object when unavailable', function() {
        var data = [
          new types.Settings(),
          new types.Settings({ activeSchedule: 'Auto Mode', source: 'Medtronic' }),
          new types.Basal({ deliveryType: 'automated' }),
        ];
        thisTd = new TidelineData(data);
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
        thisTd = new TidelineData(data);
        expect(thisTd.grouped.pumpSettings[1].lastManualBasalSchedule).to.be.undefined;
      });
    });
  });

  describe('createNormalTime', function() {
    var data = [new types.Basal()];
    thisTd = new TidelineData(data);

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
      thisTd = new TidelineData(data);
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
    thisTd = new TidelineData(_.cloneDeep(data), {});

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

  describe('setEvents', function() {
    var data = [
      new types.DeviceEvent({
        deviceTime: '2014-07-01T10:00:00',
        eventId: 'Event1',
        subType: 'zen',
        inputTime: moment.utc().subtract(2, 'days').toISOString(),
      }),
      new types.DeviceEvent({
        deviceTime: '2014-07-02T10:30:00',
        inputTime: moment.utc().subtract(1, 'days').toISOString(),
        eventId: 'Event2',
        subType: 'zen',
      }),
      new types.DeviceEvent({
        inputTime: moment.utc().subtract(4, 'hours').toISOString(),
        eventId: 'Event3',
        subType: 'zen',
      }),
      new types.DeviceEvent({
        inputTime: moment.utc().subtract(3, 'hours').toISOString(),
        eventId: 'Event3',
        subType: 'zen',
      }),
    ];
    thisTd = new TidelineData(_.cloneDeep(data), {});

    it('should be a function', function() {
      assert.isFunction(thisTd.setEvents);
    });

    const Zen1 = _.filter(thisTd.zenEvents, { 'eventId': 'Event1' });
    const Zen2 = _.filter(thisTd.zenEvents, { 'eventId': 'Event2' });
    const Zen3 = _.filter(thisTd.zenEvents, { 'eventId': 'Event3' });

    it('should deduplicate Events based on eventId', function() {
      expect(thisTd.zenEvents.length).to.equal(3);
      expect(Zen1.length).to.equal(1);
      expect(Zen2.length).to.equal(1);
      expect(Zen3.length).to.equal(1);
    });

    it('should have taken the most recent event by eventID', () => {
      expect(Zen1[0].id).to.equal(data[0].id);
      expect(Zen1[0].inputTime).to.equal(data[0].inputTime);
      expect(Zen2[0].id).to.equal(data[1].id);
      expect(Zen2[0].inputTime).to.equal(data[1].inputTime);
      expect(Zen3[0].id).to.equal(data[3].id);
      expect(Zen3[0].inputTime).to.equal(data[3].inputTime);
    })
  });

  describe('Sort Settings', function(){
    const unorderedParameters = { parameters: [
      {
        name: 'SMALL_MEAL_BREAKFAST',
      },
      {
        name: 'WEIGHT',
      },
      {
        name: 'MEDIUM_MEAL_BREAKFAST',
      },
      {
        name: 'MEDIUM_MEAL_LUNCH',
      },
    ]};
    const orderedParameters = { parameters: [
      {
        name: 'MEDIUM_MEAL_BREAKFAST',
      },
      {
        name: 'MEDIUM_MEAL_LUNCH',
      },
      {
        name: 'WEIGHT',
      },
      {
        name: 'SMALL_MEAL_BREAKFAST',
      },
    ]};
    const dataNoParams = [
      new types.Settings({
        source: 'Diabeloop',
        payload: { },
        deviceTime: '2020-12-02T10:30:00',
      }),
    ];
    const data = [
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...unorderedParameters },
        deviceTime: '2020-12-02T10:30:00',
      }),
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...orderedParameters },
        deviceTime: '2020-12-10T10:30:00',
      }),
    ];
    const unorderedUnknownParameters = _.cloneDeep(unorderedParameters);
    const orderedUnknownParameters = _.cloneDeep(orderedParameters);
    // add unknown parameter at the beginning of the array
    unorderedUnknownParameters.parameters.unshift({ name: 'UNKNOWN'});
    // add the unknown parameter at the end of the array
    orderedUnknownParameters.parameters.push({ name: 'UNKNOWN'});

    const unknownData = [
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...unorderedUnknownParameters },
        deviceTime: '2020-12-02T10:30:00',
      }),
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...orderedUnknownParameters },
        deviceTime: '2020-12-10T10:30:00',
      }),
    ];
    const noParamsTd = new TidelineData(_.cloneDeep(dataNoParams), {});
    const thisTd = new TidelineData(_.cloneDeep(data), {});
    const thisUnknownTd = new TidelineData(_.cloneDeep(unknownData), {});

    it('should work if no parameters', function() {
      expect(noParamsTd.grouped.pumpSettings.length).to.equal(1);
    });

    it('should work and sort parameters', function() {
      expect(thisTd.grouped.pumpSettings.length).to.equal(2);
      _.forEach(thisTd.grouped.pumpSettings, item => {
        expect(item.payload.parameters).to.deep.have.ordered.members(orderedParameters.parameters);
      });
    });

    it('should work and push unknonwn parameters at the end', function() {
      expect(thisUnknownTd.grouped.pumpSettings.length).to.equal(2);
      _.forEach(thisUnknownTd.grouped.pumpSettings, item => {
        expect(item.payload.parameters).to.deep.have.ordered.members(orderedUnknownParameters.parameters);
      });
    });

  });

  describe('addManufacturer', function() {
    const pumpManufacturer = { pump: { manufacturer: 'unknown'} };
    const oldpumpManufacturer = { pump: { manufacturer: 'too-old'} };
    const defaultpumpManufacturer = { pump: { manufacturer: 'default'} };

    const data = [
      new types.DeviceEvent({
        deviceTime: '2014-07-01T10:00:00',
        subType: 'reservoirChange',
        inputTime: moment.utc().subtract(2, 'days').toISOString(),
      }),
      new types.DeviceEvent({
        deviceTime: '2014-07-02T10:30:00',
        inputTime: moment.utc().subtract(1, 'days').toISOString(),
        eventId: 'Event2',
        subType: 'reservoirChange',
      }),
      new types.DeviceEvent({
        inputTime: moment.utc().subtract(4, 'hours').toISOString(),
        eventId: 'Event3',
        subType: 'reservoirChange',
      }),
      new types.DeviceEvent({
        inputTime: moment.utc().subtract(3, 'hours').toISOString(),
        eventId: 'Event3',
        subType: 'reservoirChange',
      }),
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...pumpManufacturer },
        deviceTime: '2020-12-02T10:30:00',
      }),
      new types.Settings({
        source: 'Diabeloop',
        payload: { ...oldpumpManufacturer },
        deviceTime: '2019-12-02T10:30:00',
      }),
    ];
    const expectedPumpManufacturer = _.update(pumpManufacturer, 'pump.manufacturer', (o) => {return _.capitalize(o)});
    const expectedDefaultPumpManufacturer = _.update(defaultpumpManufacturer, 'pump.manufacturer', (o) => {return _.capitalize(o)});

    const thisTd = new TidelineData(_.cloneDeep(data), {});

    it('should be a function', function() {
      assert.isFunction(thisTd.addManufacturer);
    });

    it('should retrieve the last pump manufacturer', function() {
      expect(thisTd.latestPumpManufacturer).to.deep.equal(expectedPumpManufacturer.pump.manufacturer);
    });

    it('deviceEvent should contain the manufacturer property when set in pumpSettings', function() {
      expect(thisTd.grouped.deviceEvent.length).to.equal(4);
      _.forEach(thisTd.grouped.deviceEvent,
        (d) => expect(d.pump).to.deep.equal(expectedPumpManufacturer.pump)
        )
    });

    const data2 = _.cloneDeep(data);
    data2.push(new types.Settings({
      source: 'Diabeloop',
      deviceTime: '2020-12-05T10:30:00',
    }));
    const thisTd2 = new TidelineData(_.cloneDeep(data2), {});

    it('deviceEvent should contain the default manufacturer property when not set in last pumpSettings', function() {
      expect(thisTd2.grouped.deviceEvent.length).to.equal(4);
      _.forEach(thisTd2.grouped.deviceEvent,
        (d) => expect(d.pump).to.deep.equal(expectedDefaultPumpManufacturer.pump)
        );
    });
  });
  */
});
