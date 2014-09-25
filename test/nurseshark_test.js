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

    it('should return an object, with errors and processedData', function() {
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
      var input = [{
        type: 'bolus',
        a: 1,
        z: {
          b: 2,
          c: 3
        }
      }, {
        type: 'wizard',
        d: [{x: 4},{y: 5}]
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
        normalTime: dummyDT + '.000Z'
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

    it('should filter out bad deviceMeta events', function() {
      var data = [{
        type: 'deviceMeta',
        time: new Date().toISOString(),
        duration: 300000
      }, {
        type: 'deviceMeta',
        annotations: [{
          code: 'status/incomplete-tuple'
        }]
      }, {
        type: 'deviceMeta',
        annotations: [{
          code: 'status/unknown-previous'
        }]
      }];
      var res = nurseshark.processData(data);
      expect(res.processedData.length).to.equal(1);
      expect(res.erroredData.length).to.equal(2);
    });

    it('should translate cbg and smbg into mg/dL when such units specified', function() {
      var bgs = [{
        type: 'cbg',
        units: 'mg/dL',
        value: 14.211645580300173
      }, {
        type: 'smbg',
        units: 'mg/dL',
        value: 2.487452256628842
      }, {
        type: 'cbg',
        units: 'mmol/L',
        value: 7.048584587016023
      }];
      var res = nurseshark.processData(bgs).processedData;
      expect(res[0].value).to.equal(256);
      expect(res[1].value).to.equal(45);
      expect(res[2].value).to.equal(7.048584587016023);
    });

    it('should translate wizard bg-related fields to mg/dL when such units specified', function() {
      var datum = [{
        type: 'wizard',
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
      var settings = [{
        type: 'settings',
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
      var settings = [{
        type: 'settings',
        basalSchedules: {
          foo: [],
          bar: []
        },
        units: {
          bg: 'mg/dL'
        }
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

    it('should apply the timezone offset of the environment (browser) to a message utcTime', function() {
      var offset = new Date().getTimezoneOffset();
      var message = [{
        type: 'message',
        time: '2014-09-13T02:13:18.805Z'
      }];
      var messageTime = new Date(message[0].time);
      var res = nurseshark.processData(message).processedData[0];
      expect(res.normalTime).to.equal(new Date(messageTime.setUTCMinutes(messageTime.getUTCMinutes() - offset)).toISOString());
    });
  });

  describe('reshapeNote', function() {
    it.skip('should be a function', function() {
      assert.isFunction(nurseshark.reshapeNote);
    });
  });

  describe('joinWizardsAndBoluses', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.joinWizardsAndBoluses);
    });

    it('should join a bolus and wizard with matching joinKey', function() {
      var data = [{
        type: 'bolus',
        joinKey: '12345',
        id: 'abcde'
      }, {
        type: 'wizard',
        joinKey: '12345',
        id: 'bcdef'
      }, {
        type: 'bolus',
        id: 'cdefg'
      }, {
        type: 'wizard',
        id: 'defgh'
      }];
      var res = nurseshark.processData(data).processedData;
      var embeddedBolus = res[1].bolus;
      var secondWiz = res[3];
      expect(embeddedBolus.id).to.equal(data[0].id);
      expect(secondWiz.bolus).to.be.undefined;
    });
  });

  describe('suspendedExtendeds', function() {
    it('should be a function', function() {
      assert.isFunction(nurseshark.suspendedExtendeds);
    });

    it('should find an extended interrupted by a suspend event', function() {
      var now = new Date();
      var earlier = new Date(now.valueOf() - 720000);
      var input = [{
        type: 'deviceMeta',
        subType: 'status',
        status: 'suspended',
        duration: 10000,
        time: now.toISOString()
      }, {
        type: 'bolus',
        extended: 0.2,
        expectedExtended: 1.0,
        duration: 3600000,
        time: earlier.toISOString()
      }];
      var output = [{
        type: 'deviceMeta',
        subType: 'status',
        status: 'suspended',
        duration: 10000,
        time: now.toISOString()
      }, {
        type: 'bolus',
        extended: 0.2,
        expectedExtended: 1.0,
        duration: 720000,
        expectedDuration: 3600000,
        time: earlier.toISOString()
      }];
      var res = nurseshark.processData(input).processedData;
      expect(res[0].duration).to.equal(output[1].duration);
    });

    it('should add an expectedDuration to user-cancelled extended boluses', function() {
      var now = new Date().toISOString();
      var cancelled = [{
        type: 'bolus',
        subType: 'square',
        extended: 0.4,
        expectedExtended: 2.0,
        duration: 10000,
        time: now
      }];
      var res = nurseshark.processData(cancelled).processedData[0];
      expect(res.duration).to.equal(2000);
      expect(res.expectedDuration).to.equal(10000);
    });
  });

  describe('mergeSuspendsIntoBasals', function() {
    var now = new Date();
    var plusHalf = new Date(now.valueOf() + 3600000/2);
    var plusHour = new Date(now.valueOf() + 3600000);
    var plusTwoHours = new Date(now.valueOf() + 3600000*2);
    var notQuite = new Date(now.valueOf() + 3600000*2 + 5000);
    var plusThreeHours = new Date(now.valueOf() + 3600000*3);

    it('should be a function', function() {
      assert.isFunction(nurseshark.mergeSuspendsIntoBasals);
    });

    it('should transform a suspend interval spanning several basal segments into equal number of basal segments of rate 0.0', function() {
      var inputData = [{
        type: 'basal',
        id: '1',
        deliveryType: 'scheduled',
        time: now.toISOString(),
        duration: 3600000,
        rate: 1.0
      }, {
        type: 'basal',
        id: '2',
        deliveryType: 'scheduled',
        time: plusHour.toISOString(),
        duration: 3600000,
        rate: 0.9
      }, {
        type: 'basal',
        id: '3',
        deliveryType: 'scheduled',
        time: plusTwoHours.toISOString(),
        duration: 3600000,
        rate: 0.75
      }, {
        type: 'basal',
        id: '4',
        deliveryType: 'scheduled',
        time: plusThreeHours.toISOString(),
        duration: 3600000,
        rate: 0.6
      }, {
        type: 'deviceMeta',
        subType: 'status',
        status: 'suspended',
        time: plusHalf.toISOString(),
        duration: 3600000*1.5 + 5000
      }];
      var outputData = [{
        type: 'basal',
        id: '1',
        deliveryType: 'scheduled',
        time: now.toISOString(),
        duration: 3600000/2,
        expectedDuration: 3600000,
        rate: 1.0
      }, {
        type: 'basal',
        id: '2_suspended',
        time: plusHour.toISOString(),
        duration: 3600000,
        rate: 0.0,
        deliveryType: 'suspend',
        suppressed: {
          type: 'basal',
          id: '2_scheduled',
          time: plusHour.toISOString(),
          duration: 3600000,
          rate: 0.9,
          deliveryType: 'scheduled'
        }
      }, {
        type: 'basal',
        id: '3',
        deliveryType: 'scheduled',
        time: notQuite.toISOString(),
        duration: 3600000 - 5000,
        expectedDuration: 3600000,
        rate: 0.75
      }, {
        type: 'basal',
        id: '4',
        deliveryType: 'scheduled',
        time: plusThreeHours.toISOString(),
        duration: 3600000,
        rate: 0.6
      }, {
        type: 'basal',
        id: '3_suspended',
        time: plusTwoHours.toISOString(),
        duration: 5000,
        rate: 0.0,
        deliveryType: 'suspend',
        suppressed: {
          type: 'basal',
          id: '3_scheduled',
          deliveryType: 'scheduled',
          time: plusTwoHours.toISOString(),
          duration: 3600000,
          rate: 0.75
        }
      }, {
        type: 'basal',
        id: '1_suspended',
        time: plusHalf.toISOString(),
        duration: 3600000/2,
        rate: 0.0,
        deliveryType: 'suspend',
        suppressed: {
          type: 'basal',
          id: '1_scheduled',
          time: now.toISOString(),
          duration: 3600000,
          rate: 1.0,
          deliveryType: 'scheduled'
        }
      }];
      expect(nurseshark.mergeSuspendsIntoBasals(inputData.slice(0,4), [inputData[4]], [])).to.eql(outputData);
    });

    it('should transform a suspend interval entirely within a basal segment into a temp basal segment of rate 0.0', function() {
      var inputData = [{
        type: 'basal',
        id: '1',
        deliveryType: 'scheduled',
        time: now.toISOString(),
        duration: 3600000*2,
        rate: 1.0
      }, {
        type: 'basal',
        id: '2',
        deliveryType: 'scheduled',
        time: plusTwoHours.toISOString(),
        duration: 3600000,
        rate: 0.9
      }, {
        type: 'deviceMeta',
        subType: 'status',
        status: 'suspended',
        time: plusHalf.toISOString(),
        duration: 3600000/2
      }];
      var outputData = [{
        type: 'basal',
        id: '1_suspended',
        deliveryType: 'suspend',
        time: plusHalf.toISOString(),
        duration: 3600000/2,
        rate: 0.0,
        suppressed: {
          type: 'basal',
          id: '1_scheduled',
          deliveryType: 'scheduled',
          time: now.toISOString(),
          duration: 3600000*2,
          rate: 1.0
        }
      }, {
        type: 'basal',
        id: '2',
        deliveryType: 'scheduled',
        time: plusTwoHours.toISOString(),
        duration: 3600000,
        rate: 0.9
      }, {
        type: 'basal',
        id: '1_first',
        deliveryType: 'scheduled',
        time: now.toISOString(),
        duration: 3600000/2,
        expectedDuration: 3600000*2,
        rate: 1.0
      }, {
        type: 'basal',
        id: '1_last',
        deliveryType: 'scheduled',
        time: plusHour.toISOString(),
        duration: 3600000,
        expectedDuration: 3600000*2,
        rate: 1.0
      }];
      expect(nurseshark.mergeSuspendsIntoBasals(inputData.slice(0,2), [inputData[2]], [])).to.eql(outputData);
    });

    it.skip('should annotate basals that intersect with suspends annotated with incomplete-tuple', function() {

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
      }
      expect(res.erroredData.length - ok).to.equal(0);
    });

    it('should create some new basals if there are suspends', function() {
      var suspends = _.where(data, {status: 'suspended'});
      var validSuspends = _.reject(suspends, function(s) {
        return s.annotations != null;
      });
      var basals = _.where(data, {type: 'basal'});
      if (validSuspends.length > 0) {
        var res = nurseshark.processData(data);
        var resBasals = _.where(res.processedData, {type: 'basal'});
        expect(basals.length).to.be.below(resBasals.length);
      }
    });

    it('how long does lodash sort take?', function() {
      _.sortBy(data, function(d) {
        return d.time;
      });
    });

    it('how long does array sort take?', function() {
      data.sort(function(a, b) {
        if (a.normalTime < b.normalTime) {
          return -1;
        }
        if (a.normalTime > b.normalTime) {
          return 1;
        }
        return 0;
      });
    });

    it('how long does deep clone take?', function() {
      var cloned = [];
      for (var i = 0; i < data.length; ++i) {
        cloned.push(_.cloneDeep(data[i]));
      }
    });
  });

  // TODO: remove this! just for development
  describe('on demo data', function() {
    var data = require('../example/data/device-data.json');
    it('should succeed without error', function() {
      var res = nurseshark.processData(data);
      assert.isArray(res.processedData);
      expect(res.erroredData.length).to.equal(0);
    });

    it('should create some new basals if there are suspends', function() {
      var suspends = _.where(data, {status: 'suspended'});
      var validSuspends = _.reject(suspends, function(s) {
        return s.annotations != null;
      });
      var basals = _.where(data, {type: 'basal'});
      if (validSuspends.length > 0) {
        var res = nurseshark.processData(data);
        var resBasals = _.where(res.processedData, {type: 'basal'});
        expect(basals.length).to.be.below(resBasals.length);
      }
    });

    it('how long does deep clone take?', function() {
      var cloned = [];
      for (var i = 0; i < data.length; ++i) {
        cloned.push(_.cloneDeep(data[i]));
      }
    });
  });
});