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
        bgTarget: {
          target: 6.66089758925464,
          range: 10
        },
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
      expect(res.bgTarget.target).to.equal(120);
      expect(res.bgTarget.range).to.equal(10);
      expect(res.insulinSensitivity[0].amount).to.equal(80);
      expect(res.insulinSensitivity[1].amount).to.equal(90);
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
        subType: 'extended',
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
        subType: 'extended',
        extended: 0.2,
        expectedExtended: 1.0,
        duration: 720000,
        expectedDuration: 3600000,
        time: earlier.toISOString()
      }];
      var res = nurseshark.processData(input).processedData;
      expect(res[1].duration).to.equal(output[1].duration);
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

  // TODO: remove this! just for development
  describe('nurseshark on real data', function() {
    var data = require('../example/data/blip-input.json');
    it('should succeed', function() {
      console.time('Nurseshark');
      assert.isArray(nurseshark.processData(data).processedData);
      console.timeEnd('Nurseshark');
    });
  });
});