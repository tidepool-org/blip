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
        deviceTime: minusTwenty.toISOString().slice(0,-5),
        time: minusTwenty.toISOString(),
        deviceId: 'z',
        source: 'carelink'
      }, {
        type: 'smbg',
        deviceTime: minusTen.toISOString().slice(0,-5),
        time: minusTen.toISOString(),
        deviceId: 'z',
        source: 'carelink'
      }, {
        type: 'smbg',
        time: now.toISOString(),
        deviceId: 'a',
        source: 'carelink'
      }, {
        type: 'bolus',
        time: plusTen.toISOString(),
        deviceId: 'b',
        source: 'carelink'
      }, {
        type: 'basal',
        time: plusHalf.toISOString(),
        deviceId: 'a',
        source: 'carelink'
      }, {
        type: 'bolus',
        time: plusHour.toISOString(),
        deviceId: 'b',
        source: 'carelink'
      }, {
        type: 'basal',
        duration: 1000000,
        deviceTime: plusTwo.toISOString().slice(0,-5),
        time: plusTwo.toISOString(),
        deviceId: 'c',
        source: 'carelink'
      }, {
        type: 'bolus',
        deviceTime: plusThree.toISOString().slice(0,-5),
        time: plusThree.toISOString(),
        deviceId: 'c',
        source: 'carelink'
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
      var dummyDT = '2014-01-01T12:00:00';
      var input = [{
        type: 'bolus',
        a: 1,
        z: {
          b: 2,
          c: 3
        },
        deviceTime: dummyDT
      }, {
        type: 'wizard',
        d: [{x: 4},{y: 5}],
        deviceTime: dummyDT
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
      var dummyDT = '2014-01-01T12:00:00';
      var overlapping = [{
        type: 'basal',
        time: now.toISOString(),
        duration: 1200000,
        deviceTime: dummyDT,
        normalTime: dummyDT + '.000Z',
        normalEnd: new Date(new Date(dummyDT + '.000Z').valueOf() + 1200000).toISOString()
      }, {
        type: 'basal',
        time: plusTen.toISOString(),
        duration: 1200000,
        deviceTime: dummyDT,
        normalTime: dummyDT + '.000Z'
      }];
      var res = nurseshark.processData(overlapping).erroredData;
      expect(res.length).to.equal(1);
      expect(res[0].overlapsWith).to.eql(overlapping[0]);
      expect(res[0].errorMessage).to.equal('Basal overlaps with previous.');
    });

    it('should recursively edit the timespan properties of suppresseds within basals', function() {
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
        deviceTime: dummyDT1,
        suppressed: {
          type: 'basal',
          duration: 3600000,
          time: minusTen.toISOString(),
          deviceTime: dummyDT2,
          suppressed: {
            type: 'basal',
            duration: 3600000*2,
            time: minusHour.toISOString(),
            deviceTime: dummyDT3
          }
        }
      }];
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

    it('should filter out bad deviceMeta events', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var data = [{
        type: 'deviceMeta',
        time: new Date().toISOString(),
        duration: 300000,
        deviceTime: dummyDT
      }, {
        type: 'deviceMeta',
        time: new Date().toISOString(),
        annotations: [{
          code: 'status/incomplete-tuple'
        }],
        deviceTime: dummyDT
      }, {
        type: 'deviceMeta',
        annotations: [{
          code: 'status/unknown-previous'
        }],
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(data);
      expect(res.processedData.length).to.equal(2);
      expect(res.erroredData.length).to.equal(1);
    });

    it('should translate cbg and smbg into mg/dL when such units specified', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var bgs = [{
        type: 'cbg',
        units: 'mg/dL',
        value: 14.211645580300173,
        deviceTime: dummyDT
      }, {
        type: 'smbg',
        units: 'mg/dL',
        value: 2.487452256628842,
        deviceTime: dummyDT
      }, {
        type: 'cbg',
        units: 'mmol/L',
        value: 7.048584587016023,
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(bgs).processedData;
      expect(res[0].value).to.equal(256);
      expect(res[1].value).to.equal(45);
      expect(res[2].value).to.equal(7.048584587016023);
    });

    it('should translate wizard bg-related fields to mg/dL when such units specified', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var datum = [{
        type: 'wizard',
        deviceTime: dummyDT,
        units: 'mg/dL',
        bgInput: 15.1518112923307,
        bgTarget: {
          high: 5.550747991045533,
          low: 5.550747991045533
        },
        insulinSensitivity: 3.7753739955227665
      }];
      var res = nurseshark.processData(datum).processedData[0];
      expect(res.bgInput).to.equal(273);
      expect(res.bgTarget.low).to.equal(100);
      expect(res.bgTarget.high).to.equal(100);
      expect(res.insulinSensitivity).to.equal(68);
    });

    it('should translate settings bg-related fields to mg/dL when such units specified', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var settings = [{
        type: 'settings',
        deviceTime: dummyDT,
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
        ]
      }];
      var res = nurseshark.processData(settings).processedData[0];
      expect(res.bgTarget[0].target).to.equal(120);
      expect(res.bgTarget[0].range).to.equal(10);
      expect(res.insulinSensitivity[0].amount).to.equal(80);
      expect(res.insulinSensitivity[1].amount).to.equal(90);
    });

    it('should reshape basalSchedules from an object to an array', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var settings = [{
        type: 'settings',
        basalSchedules: {
          foo: [],
          bar: []
        },
        units: {
          bg: 'mg/dL'
        },
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(settings).processedData;
      assert.isArray(res[0].basalSchedules);
    });

    it('should return sorted data', function() {
      var dummyDT1 = '2014-01-01T12:00:00';
      var dummyDT2 = '2014-01-01T13:00:00';
      var APPEND = '.000Z';
      var data = [{
        type: 'smbg',
        units: 'mmol/L',
        deviceTime: dummyDT2
      }, {
        type: 'cbg',
        units: 'mmol/L',
        deviceTime: dummyDT1
      }];
      var sorted = [data[1], data[0]];
      sorted[0].normalTime = dummyDT1 + APPEND;
      sorted[1].normalTime = dummyDT2 + APPEND;
      expect(nurseshark.processData(data).processedData).to.eql(sorted);
    });
  });

  describe('massaging of timestamps', function() {
    // TODO: remove after we've got tideline using timezone-aware timestamps
    it('should Watson all data with a deviceTime', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var data = [{
        type: 'basal',
        time: new Date().toISOString(),
        duration: 3600000,
        deviceTime: dummyDT
      }, {
        type: 'bolus',
        deviceTime: dummyDT
      }, {
        type: 'cbg',
        units: 'mmol/L',
        deviceTime: dummyDT
      }, {
        type: 'deviceMeta',
        time: new Date().toISOString(),
        duration: 300000,
        deviceTime: dummyDT
      }, {
        type: 'smbg',
        units: 'mmol/L',
        deviceTime: dummyDT
      }, {
        type: 'settings',
        units: {
          bg: 'mmol/L'
        },
        basalSchedules: {
          foo: [],
          bar: []
        },
        deviceTime: dummyDT,
      }, {
        type: 'wizard',
        units: 'mmol/L',
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(data);
      for (var i = 0; i < res.processedData.length; ++i) {
        var datum = res.processedData[i];
        expect(datum.normalTime).to.match(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/);
      }
    });

    it('should put any datum with year < 2008 into the erroredData', function() {
      var data = [{
        type: 'message',
        timestamp: '0002-01-01T12:00:00.000Z'
      }, {
        type: 'smbg',
        time: '0002-01-01T12:00:00.000Z',
        deviceTime: '0002-01-01T12:00:00'
      }];
      var res = nurseshark.processData(data);
      expect(res.erroredData.length).to.equal(2);
    });

    it('should apply the timezone offset of the environment (browser) to a message utcTime', function() {
      var offset = new Date().getTimezoneOffset();
      var message = [{
        type: 'message',
        timestamp: '2014-09-13T02:13:18.805Z'
      }];
      var messageTime = new Date(message[0].timestamp);
      var res = nurseshark.processData(message).processedData[0];
      expect(res.normalTime).to.equal(new Date(messageTime.setUTCMinutes(messageTime.getUTCMinutes() - offset)).toISOString());
    });
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
        normalTime: new Date(messageTime.setUTCMinutes(messageTime.getUTCMinutes() - offset)).toISOString(),
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

    it('should join a bolus and wizard with matching joinKey', function() {
      var dummyDT = '2014-01-01T12:00:00';
      var data = [{
        type: 'bolus',
        joinKey: '12345',
        id: 'abcde',
        deviceTime: dummyDT
      }, {
        type: 'wizard',
        joinKey: '12345',
        id: 'bcdef',
        deviceTime: dummyDT
      }, {
        type: 'bolus',
        id: 'cdefg',
        deviceTime: dummyDT
      }, {
        type: 'wizard',
        id: 'defgh',
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(data).processedData;
      var embeddedBolus = res[1].bolus;
      var secondWiz = res[3];
      expect(embeddedBolus.id).to.equal(data[0].id);
      expect(secondWiz.bolus).to.be.undefined;
    });
  });

  describe('annotateBasals', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.annotateBasals);
    });

    it('should annotate a basal segment containing an incomplete suspend', function() {
      var now = new Date();
      var plusTen = new Date(now.valueOf() + 600000);
      var dummyDT = '2014-01-01T12:00:00';
      var data = [{
        type: 'basal',
        time: now.toISOString(),
        deviceTime: dummyDT,
        duration: 1800000
      }, {
        type: 'deviceMeta',
        annotations: [{
          code: 'status/incomplete-tuple'
        }],
        time: plusTen.toISOString(),
        deviceTime: dummyDT
      }];
      var res = nurseshark.processData(data).processedData;
      expect(res[0].annotations[0].code).to.equal('basal/intersects-incomplete-suspend');
    });
  });

  // TODO: remove this! just for development
  describe('on real data', function() {
    var data = require('../example/data/blip-input.json');
    it('should succeed without error', function() {
      var res = nurseshark.processData(data);
      assert.isArray(res.processedData);
      var ok = 0;
      for (var i = 0; i < res.erroredData.length; ++i) {
        var error = res.erroredData[i];
        if (error.errorMessage === 'Bad pump status deviceMeta.') {
          ok += 1;
        }
        else if (error.errorMessage === 'Overlapping CareLink upload.') {
          ok += 1;
        }
      }
      expect(res.erroredData.length - ok).to.equal(0);
    });
  });
});