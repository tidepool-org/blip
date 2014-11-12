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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');

var dt = require('../js/data/util/datetime');

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

    it('should include suspected legacy old data model data in the erroredData', function() {
      var data = [{
        deviceTime: ''
      }];
      var res = nurseshark.processData(data);
      expect(res.erroredData.length).to.equal(1);
      expect(res.erroredData[0].errorMessage).to.equal('No time or timestamp field; suspected legacy old data model data.');
    });

    it('should remove data from two or more uploads from `carelink` source that overlap in time and annotate the edges', function() {
      var now = new Date();
      var plusTen = new Date(now.valueOf() + 600000);
      var plusHalf = new Date(now.valueOf() + 1800000);
      var plusHour = new Date(now.valueOf() + 3600000);
      var plusTwo = new Date(now.valueOf() + 3600000*2);
      var plusThree = new Date(now.valueOf() + 3600000*3);
      var minusTen = new Date(now.valueOf() - 600000);
      var minusTwenty = new Date(now.valueOf() - 1200000);
      var data = [{
        type: 'bolus',
        time: minusTwenty.toISOString(),
        deviceId: 'z',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'smbg',
        time: minusTen.toISOString(),
        deviceId: 'z',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'smbg',
        time: now.toISOString(),
        deviceId: 'a',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'bolus',
        time: plusTen.toISOString(),
        deviceId: 'b',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'basal',
        time: plusHalf.toISOString(),
        deviceId: 'a',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'bolus',
        time: plusHour.toISOString(),
        deviceId: 'b',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'basal',
        duration: 1000000,
        time: plusTwo.toISOString(),
        deviceId: 'c',
        source: 'carelink',
        timezoneOffset: 0
      }, {
        type: 'bolus',
        time: plusThree.toISOString(),
        deviceId: 'c',
        source: 'carelink',
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(data);
      expect(res.erroredData.length).to.equal(4);
      expect(res.processedData.length).to.equal(4);
      expect(res.processedData[1].annotations[0].code).to.equal('carelink/device-overlap-boundary');
      expect(res.processedData[2].annotations[0].code).to.equal('carelink/device-overlap-boundary');
    });

    it('should return an object, with erroredData and processedData', function() {
      var res = nurseshark.processData([{type:'cbg'},{type:'wizard'}]);
      assert.isObject(res);
      expect(res.erroredData).not.to.be.undefined;
      expect(res.processedData).not.to.be.undefined;
    });

    it('should log an error when no type handler exists for an obj in the input array', function() {
      var res = nurseshark.processData([{type:'foo'}]);
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

    it('should return overlapping basals in the erroredData', function() {
      var now = new Date();
      var plusTen = new Date(now.valueOf() + 600000);
      var overlapping = [{
        type: 'basal',
        time: now.toISOString(),
        duration: 1200000,
        timezoneOffset: 0
      }, {
        type: 'basal',
        time: plusTen.toISOString(),
        duration: 1200000,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(overlapping).erroredData;
      expect(res.length).to.equal(1);
      expect(_.omit(res[0].overlapsWith, ['normalTime', 'normalEnd'])).to.eql(overlapping[0]);
      expect(res[0].errorMessage).to.equal('Basal overlaps with previous.');
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
      expect(res[0].errorMessage).to.equal('Null duration. Expect an `off-schedule-rate` annotation here. Investigate if that is missing.');
    });

    it('should extend the duration of Carelink temps and suspends that are one second short', function() {
      var aTime = '2014-01-01T12:00:00.000Z';
      var nextTime = '2014-01-01T12:20:00.000Z';
      var basals = [{
        type: 'basal',
        deliveryType: 'temp',
        source: 'carelink',
        time: aTime,
        duration: 1199000,
        rate: 0.5,
        percent: 0.5,
        timezoneOffset: 0
      }, {
        type: 'basal',
        deliveryType: 'scheduled',
        source: 'carelink',
        time: nextTime,
        duration: 3600000,
        rate: 0.9,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(basals).processedData;
      expect(res.length).to.equal(2);
      var first = res[0], second = res[1];
      expect(dt.addDuration(first.time, first.duration)).to.equal(second.time);
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

    it('should filter out bad deviceMeta events', function() {
      var data = [{
        type: 'deviceMeta',
        time: new Date().toISOString(),
        duration: 300000,
        timezoneOffset: 0
      }, {
        type: 'deviceMeta',
        time: new Date().toISOString(),
        annotations: [{
          code: 'status/incomplete-tuple'
        }],
        timezoneOffset: 0
      }, {
        type: 'deviceMeta',
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
        units: 'mg/dL',
        value: 14.211645580300173,
        time: now,
        timezoneOffset: 0
      }, {
        type: 'smbg',
        units: 'mg/dL',
        value: 2.487452256628842,
        time: now,
        timezoneOffset: 0
      }, {
        type: 'cbg',
        units: 'mmol/L',
        value: 7.048584587016023,
        time: now,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(bgs).processedData;
      expect(res[0].value).to.equal(256);
      expect(res[1].value).to.equal(45);
      expect(res[2].value).to.equal(7.048584587016023);
    });

    it('should translate wizard bg-related fields to mg/dL when such units specified', function() {
      var now = new Date().toISOString();
      var datum = [{
        type: 'wizard',
        time: now,
        units: 'mg/dL',
        bgInput: 15.1518112923307,
        bgTarget: {
          high: 5.550747991045533,
          low: 5.550747991045533
        },
        insulinSensitivity: 3.7753739955227665,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(datum).processedData[0];
      expect(res.bgInput).to.equal(273);
      expect(res.bgTarget.low).to.equal(100);
      expect(res.bgTarget.high).to.equal(100);
      expect(res.insulinSensitivity).to.equal(68);
    });

    it('should translate settings bg-related fields to mg/dL when such units specified', function() {
      var now = new Date().toISOString();
      var settings = [{
        type: 'settings',
        time: now,
        units: {
          bg: 'mg/dL',
          carb: 'grams'
        },
        bgTarget: [{
          target: 6.66089758925464,
          range: 10
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
      var res = nurseshark.processData(settings).processedData[0];
      expect(res.bgTarget[0].target).to.equal(120);
      expect(res.bgTarget[0].range).to.equal(10);
      expect(res.insulinSensitivity[0].amount).to.equal(80);
      expect(res.insulinSensitivity[1].amount).to.equal(90);
    });

    it('should reshape basalSchedules from an object to an array', function() {
      var now = new Date().toISOString();
      var settings = [{
        type: 'settings',
        basalSchedules: {
          foo: [],
          bar: []
        },
        units: {
          bg: 'mg/dL'
        },
        time: now,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(settings).processedData;
      assert.isArray(res[0].basalSchedules);
    });

    it('should return sorted data', function() {
      var now = new Date();
      var nextTime = new Date(now.valueOf() + 600000);
      var APPEND = '.000Z';
      var data = [{
        type: 'smbg',
        units: 'mmol/L',
        time: nextTime.toISOString(),
        timezoneOffset: 0
      }, {
        type: 'cbg',
        units: 'mmol/L',
        time: now.toISOString(),
        timezoneOffset: 0
      }];
      var sorted = [data[1], data[0]];
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
        messagetext: 'Hello there!'
      };
      var messageTime = new Date(serverMessage.timestamp);
      var tidelineMessage = {
        id: 'a',
        parentMessage: null,
        time: now,
        messageText: 'Hello there!',
        type: 'message'
      };
      expect(nurseshark.reshapeMessage(serverMessage)).to.eql(tidelineMessage);
    });
  });

  describe('joinWizardsAndBoluses', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.joinWizardsAndBoluses);
    });

    describe('old data model (i.e., in-d-gestion)', function() {
      var now = new Date().toISOString();
      var data = [{
        type: 'bolus',
        joinKey: '12345',
        id: 'abcde',
        time: now,
        timezoneOffset: 0
      }, {
        type: 'wizard',
        joinKey: '12345',
        id: 'bcdef',
        time: now,
        timezoneOffset: 0
      }, {
        type: 'bolus',
        id: 'cdefg',
        time: now,
        joinKey: 'foo',
        timezoneOffset: 0
      }, {
        type: 'wizard',
        id: 'defgh',
        time: now,
        timezoneOffset: 0
      }];
      var res = nurseshark.processData(data).processedData;
      var embeddedBolus = res[1].bolus;
      var secondBolus = res[2];
      var secondWiz = res[3];

      it('should join a bolus and wizard with matching joinKey', function() {
        expect(embeddedBolus.id).to.equal(data[0].id);
        expect(secondWiz.bolus).to.be.undefined;
      });

      it('should delete dangling joinKeys', function() {
        expect(secondBolus.joinKey).to.be.undefined;
      });
    });

    describe('new data model', function() {
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
      var res = nurseshark.processData(data).processedData;
      var firstBolus = res[0];
      var firstWiz = res[1];
      var embeddedBolus = res[1].bolus;
      var secondBolus = res[2];
      var secondWiz = res[3];

      it('should join a bolus to a wizard that includes the bolus\'s `id` in the `bolus` field', function() {
        expect(embeddedBolus.id).to.equal(data[0].id);
        expect(secondWiz.bolus).to.be.undefined;
      });

      it('should add a joinKey to a bolus matching a wizard', function() {
        expect(firstBolus.joinKey).to.equal(firstWiz.id);
      });

      it('should not leave dangling joinKeys on boluses that don\'t match wizards', function() {
        expect(secondBolus.joinKey).to.be.undefined;
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
        type: 'deviceMeta',
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