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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');

var dt = require('../js/data/util/datetime');
var { MGDL_UNITS, MMOLL_UNITS, MGDL_PER_MMOLL } = require('../js/data/util/constants');

var nurseshark = require('../plugins/nurseshark');

describe('nurseshark', function() {
  describe('processData', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.processData);
    });

    it('should throw an error if you pass it a non-array', function() {
      var fn = function() { nurseshark.processData('Bob'); };
      expect(fn).to.throw('An array is required.');
    });

    it('should exclude pre-v1 data model data', function() {
      var data = [{
        deviceTime: ''
      }];
      var res = nurseshark.processData(data);
      expect(res.erroredData.length).to.equal(0);
      expect(res.processedData.length).to.equal(0);
    });

    it('should sort data', function() {
      var now = new Date();
      var first = now.toISOString();
      var second = new Date(now.valueOf() + 864e5).toISOString();
      var input = [{
        type: 'bolus',
        a: 1,
        z: {
          b: 2,
          c: 3
        },
        time: second,
        timezoneOffset: 0
      }, {
        type: 'wizard',
        d: [{x: 4},{y: 5}],
        time: first,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(input);
      expect(res.processedData[0]).to.eql(_.assign({}, input[1], {source: 'Unspecified Data Source'}));
      expect(res.processedData[1]).to.eql(_.assign({}, input[0], {source: 'Unspecified Data Source'}));
    });

    it('should return an object, with erroredData and processedData', function() {
      var res = nurseshark.processData([{type:'cbg'},{type:'wizard'}]);
      assert.isObject(res);
      expect(res.erroredData).not.to.be.undefined;
      expect(res.processedData).not.to.be.undefined;
    });

    it('should log an error when no type handler exists for an obj in the input array', function() {
      var res = nurseshark.processData([{type:'foo', time: '2014-01-01T00:00:00.000Z'}]);
      expect(res.erroredData.length).to.equal(1);
    });

    it('should return an array for processedData, empty if initial array was empty', function() {
      var res = nurseshark.processData([]).processedData;
      expect((res && res.length >= 0 && Array.isArray(res))).to.be.true;
    });

    it('should return an array of new (not mutated) objects', function() {
      var now = new Date().toISOString();
      var input = [{
        type: 'bolus',
        a: 1,
        z: {
          b: 2,
          c: 3
        },
        time: now,
        timezoneOffset: 0
      }, {
        type: 'wizard',
        d: [{x: 4},{y: 5}],
        time: now,
        timezoneOffset: 0
      }];
      var output = nurseshark.processData(input).processedData;
      for (var i = 0; i < input.length; ++i) {
        expect(input[i] === output[i]).to.be.false;
      }
      expect(input[0].z === output[0].z).to.be.false;
      expect(input[1].d[0] === output[1].d[0]).to.be.false;
    });

    it('should return off-schedule-rate and null-duration basals in the erroredData', function() {
      var now = new Date();
      var dummyDT = '2014-01-01T12:00:00';
      var nullDuration = [{
        type: 'basal',
        time: now.toISOString(),
        duration: null,
        normalTime: dummyDT + '.000Z',
        normalEnd: new Date(new Date(dummyDT + '.000Z').valueOf() + 1200000).toISOString()
      }];
      var res = nurseshark.processData(nullDuration).erroredData;
      expect(res.length).to.equal(1);
      expect(res[0].errorMessage).to.equal('Basal with null/zero duration.');
    });

    it('should not extend the duration of non-Carelink temps and suspends', function() {
      var aTime = '2014-01-01T12:00:00.000Z';
      var nextTime = '2014-01-01T12:20:00.000Z';
      var basals = [{
        type: 'basal',
        deliveryType: 'temp',
        time: aTime,
        duration: 1199000,
        rate: 0.5,
        percent: 0.5,
        timezoneOffset: 0
      }, {
        type: 'basal',
        deliveryType: 'scheduled',
        time: nextTime,
        duration: 3600000,
        rate: 0.9,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(basals).processedData;
      expect(res.length).to.equal(2);
      var first = res[0], second = res[1];
      expect(dt.addDuration(first.time, first.duration)).to.not.equal(second.time);
    });

    describe('suppressed handler', function() {
      var dummyDT1 = '2014-01-01T12:00:00';
      var dummyDT2 = '2014-01-01T11:30:00';
      var dummyDT3 = '2014-01-01T11:00:00';
      var now = new Date();
      var minusTen = new Date(now.valueOf() - 600000);
      var minusHour = new Date(now.valueOf() - 3600000);
      var basalWithSuppressed = [{
        type: 'basal',
        duration: 1200000,
        time: now.toISOString(),
        timezoneOffset: 0,
        suppressed: {
          type: 'basal',
          deliveryType: 'temp',
          duration: 3600000,
          time: minusTen.toISOString(),
          timezoneOffset: 0,
          percent: 0.5,
          suppressed: {
            type: 'basal',
            deliveryType: 'scheduled',
            duration: 3600000*2,
            time: minusHour.toISOString(),
            timezoneOffset: 0,
            rate: 0.5
          }
        }
      }];

      it('should recursively edit the timespan properties of suppresseds within basals', function() {
        var res = nurseshark.processData(basalWithSuppressed).processedData;
        expect(res.length).to.equal(1);
        var parent = res[0];
        var sup1 = res[0].suppressed;
        var sup2 = res[0].suppressed.suppressed;
        expect(parent.time).to.equal(sup1.time);
        expect(parent.time).to.equal(sup2.time);
        expect(parent.normalTime).to.equal(sup1.normalTime);
        expect(parent.normalTime).to.equal(sup2.normalTime);
        expect(parent.deviceTime).to.equal(sup1.deviceTime);
        expect(parent.deviceTime).to.equal(sup2.deviceTime);
        expect(parent.duration).to.equal(sup1.duration);
        expect(parent.duration).to.equal(sup2.duration);
      });

      it('should calculate the rate of a suppressed temp', function() {
        var res = nurseshark.processData(basalWithSuppressed).processedData;
        expect(res[0].suppressed.rate).to.equal(0.25);
      });
    });

    it('should filter out bad deviceEvent events', function() {
      var data = [{
        type: 'deviceEvent',
        time: new Date().toISOString(),
        duration: 300000,
        timezoneOffset: 0
      }, {
        type: 'deviceEvent',
        time: new Date().toISOString(),
        annotations: [{
          code: 'status/incomplete-tuple'
        }],
        timezoneOffset: 0
      }, {
        type: 'deviceEvent',
        time: new Date().toISOString(),
        annotations: [{
          code: 'status/unknown-previous'
        }],
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(data);
      expect(res.processedData.length).to.equal(2);
      expect(res.erroredData.length).to.equal(1);
    });

    it('should translate cbg and smbg into mg/dL when such units specified', function() {
      var now = new Date().toISOString();
      var bgs = [{
        type: 'cbg',
        units: MMOLL_UNITS,
        value: 14.211645580300173,
        time: now,
        timezoneOffset: 0
      }, {
        type: 'smbg',
        units: MMOLL_UNITS,
        value: 2.487452256628842,
        time: now,
        timezoneOffset: 0
      }, {
        type: 'cbg',
        units: MMOLL_UNITS,
        value: 7.048584587016023,
        time: now,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(bgs, MGDL_UNITS).processedData;
      expect(res[0].value).to.equal(bgs[0].value * MGDL_PER_MMOLL);
      expect(res[1].value).to.equal(bgs[1].value * MGDL_PER_MMOLL);
      expect(res[2].value).to.equal(bgs[2].value * MGDL_PER_MMOLL);
    });

    it('should translate wizard bg-related fields to mg/dL when such units specified', function() {
      var now = new Date().toISOString();
      var datum = [{
        type: 'wizard',
        time: now,
        units: MMOLL_UNITS,
        bgInput: 15.1518112923307,
        bgTarget: {
          high: 5.550747991045533,
          low: 5.550747991045533,
          target: 5.550747991045533,
          range: 0.555074799,
        },
        insulinSensitivity: 3.7753739955227665,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(datum, MGDL_UNITS).processedData[0];
      expect(res.bgInput).to.equal(datum[0].bgInput * MGDL_PER_MMOLL);
      expect(res.bgTarget.low).to.equal(datum[0].bgTarget.low * MGDL_PER_MMOLL);
      expect(res.bgTarget.high).to.equal(datum[0].bgTarget.high * MGDL_PER_MMOLL);
      expect(res.bgTarget.target).to.equal(datum[0].bgTarget.target * MGDL_PER_MMOLL);
      expect(res.bgTarget.range).to.equal(datum[0].bgTarget.range * MGDL_PER_MMOLL);
      expect(res.insulinSensitivity).to.equal(datum[0].insulinSensitivity * MGDL_PER_MMOLL);
    });

    it('should translate pumpSettings bg-related fields to mg/dL when such units specified', function() {
      var now = new Date().toISOString();
      var settings = [{
        type: 'pumpSettings',
        time: now,
        units: {
          bg: MMOLL_UNITS,
          carb: 'grams'
        },
        bgTarget: [{
          target: 6.66089758925464,
          range: 0.555074799
        }],
        insulinSensitivity: [
          {
            amount: 4.440598392836427,
            start: 0
          },
          {
            amount: 4.9956731919409805,
            start: 43200000
          }
        ],
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(settings, MGDL_UNITS).processedData[0];
      expect(res.bgTarget[0].target).to.equal(settings[0].bgTarget[0].target * MGDL_PER_MMOLL);
      expect(res.bgTarget[0].range).to.equal(settings[0].bgTarget[0].range * MGDL_PER_MMOLL);
      expect(res.insulinSensitivity[0].amount).to.equal(settings[0].insulinSensitivity[0].amount * MGDL_PER_MMOLL);
      expect(res.insulinSensitivity[1].amount).to.equal(settings[0].insulinSensitivity[1].amount * MGDL_PER_MMOLL);
    });

    it('should reshape basalSchedules from an object to an array', function() {
      var now = new Date().toISOString();
      var settings = [{
        type: 'pumpSettings',
        basalSchedules: {
          foo: [],
          bar: []
        },
        units: {
          bg: MGDL_UNITS
        },
        time: now,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(settings).processedData;
      assert.isArray(res[0].basalSchedules);
    });

    it('should add deviceSerialNumber to pumpSettings', function() {
      var now = new Date().toISOString();
      var upload = {
        type: 'upload',
        deviceManufacturers: ['Demo'],
        deviceSerialNumber: '9876',
        uploadId: '1234',
        time: now,
        timezoneOffset: 0
      };
      var settings = {
        type: 'pumpSettings',
        basalSchedules: {
          foo: [],
          bar: []
        },
        units: {
          bg: MGDL_UNITS
        },
        time: now,
        timezoneOffset: 0,
        uploadId: '1234'
      };
      var res = nurseshark.processData([upload, settings]).processedData;
      expect(res[0].deviceSerialNumber).to.equal('9876');
    });

    it('should add a source field if missing and there is an upload object with deviceManufacturers', function() {
      var now = new Date().toISOString();
      var upload = {
        type: 'upload',
        deviceManufacturers: ['Demo'],
        uploadId: '1234',
        time: now,
        timezoneOffset: 0
      };
      var bolus = {
        time: now,
        timezoneOffset: 0,
        type: 'bolus',
        subType: 'normal',
        normal: 2.0,
        uploadId: '1234'
      };
      var res = nurseshark.processData([upload, bolus]).processedData;
      expect(res[1].type).to.equal('bolus');
      expect(res[1].source).to.equal('Demo');
    });

    it('should add `Unknown` as source if no upload metadata', function() {
      var now = new Date().toISOString();
      var bolus = {
        time: now,
        timezoneOffset: 0,
        type: 'bolus',
        subType: 'normal',
        normal: 2.0
      };
      var res = nurseshark.processData([bolus]).processedData;
      expect(res[0].source).to.equal('Unspecified Data Source');
    });

    it('should return sorted data', function() {
      var now = new Date();
      var nextTime = new Date(now.valueOf() + 600000);
      var APPEND = '.000Z';
      var data = [{
        type: 'smbg',
        units: MMOLL_UNITS,
        time: nextTime.toISOString(),
        timezoneOffset: 0
      }, {
        type: 'cbg',
        units: MMOLL_UNITS,
        time: now.toISOString(),
        timezoneOffset: 0
      }];
      var sorted = [data[1], data[0]];
      _.each(sorted, function(d) { d.source = 'Unspecified Data Source'; });
      sorted[0].normalTime = now.toISOString();
      sorted[1].normalTime = nextTime.toISOString();
      expect(nurseshark.processData(data).processedData).to.eql(sorted);
    });
  });

  it('should put any datum with year < 2008 into the erroredData', function() {
    var data = [{
      type: 'message',
      timestamp: '0002-01-01T12:00:00.000Z'
    }, {
      type: 'smbg',
      time: '0002-01-01T12:00:00.000Z',
      timezoneOffset: 0
    }];
    var res = nurseshark.processData(data);
    expect(res.erroredData.length).to.equal(2);
  });

  describe('reshapeMessage', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.reshapeMessage);
    });

    it('should yield the message format tideline expects', function() {
      var now = new Date().toISOString();
      var offset = new Date().getTimezoneOffset();
      var serverMessage = {
        id: 'a',
        parentmessage: null,
        timestamp: now,
        messagetext: 'Hello there!',
        user: 'foo'
      };
      var messageTime = new Date(serverMessage.timestamp);
      var tidelineMessage = {
        id: 'a',
        parentMessage: null,
        time: now,
        messageText: 'Hello there!',
        user: 'foo',
        type: 'message'
      };
      expect(nurseshark.reshapeMessage(serverMessage)).to.eql(tidelineMessage);
    });
  });

  describe('joinWizardsAndBoluses', function() {
    var now = new Date().toISOString();
    var data = [{
      type: 'bolus',
      id: 'abcde',
      time: now,
      timezoneOffset: 0
    }, {
      type: 'wizard',
      bolus: 'abcde',
      id: 'bcdef',
      time: now,
      timezoneOffset: 0
    }, {
      type: 'bolus',
      id: 'cdefg',
      time: now,
      timezoneOffset: 0
    }, {
      type: 'wizard',
      id: 'defgh',
      time: now,
      timezoneOffset: 0
    }];
    it('should be a function', function() {
      assert.isFunction(nurseshark.joinWizardsAndBoluses);
    });

    describe('new data model', function() {
      var res = nurseshark.processData(data).processedData;
      var embeddedBolus = res[1].bolus;
      var secondWiz = res[3];

      it('should join a bolus to a wizard that includes the bolus\'s `id` in the `bolus` field', function() {
        expect(embeddedBolus.id).to.equal(data[0].id);
        expect(secondWiz.bolus).to.be.undefined;
      });

      it('should add a wizard inside the bolus if bolus is associated with a wizard', function() {
        var res = nurseshark.processData(data).processedData;
        var embeddedWiz = res[0].wizard;
        var secondBolus = res[3];
        expect(embeddedWiz.id).to.equal(data[1].id);
        expect(secondBolus.wizard).to.be.undefined;
      });
    });
  });

  describe('annotateBasals', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.annotateBasals);
    });

    it('should annotate a basal segment containing an incomplete suspend', function() {
      var now = new Date();
      var plusTen = new Date(now.valueOf() + 600000);
      var data = [{
        type: 'basal',
        time: now.toISOString(),
        timezoneOffset: 0,
        duration: 1800000
      }, {
        type: 'deviceEvent',
        annotations: [{
          code: 'status/incomplete-tuple'
        }],
        time: plusTen.toISOString(),
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(data).processedData;
      expect(res[0].annotations[0].code).to.equal('basal/intersects-incomplete-suspend');
    });
  });
});
