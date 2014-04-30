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

try {
  global.window = {
    tideline: require('../js/')
  };
  global.window.tideline.watson = require('../plugins/data/watson/');
}
catch (TypeError) {}

var data = require('../example/data/device-data.json');

var Preprocess = require('../plugins/data/preprocess/');

var settings = require('./fixtures/settings');

describe('Preprocess', function() {
  describe('REQUIRED_TYPES', function() {
    it('should be an array', function() {
      assert.isArray(Preprocess.REQUIRED_TYPES);
    });
  });

  describe('OPTIONAL_TYPES', function() {
    it('should be an array', function() {
      assert.isArray(Preprocess.OPTIONAL_TYPES);
    });
  });

  describe('MMOL_STRING', function() {
    it('should be a string', function() {
      assert.isString(Preprocess.MMOL_STRING);
    });
  });

  describe('MGDL_STRING', function() {
    it('should be a string', function() {
      assert.isString(Preprocess.MGDL_STRING);
    });
  });

  describe('MMOL_TO_MGDL', function() {
    it('should be 18', function() {
      expect(Preprocess.MMOL_TO_MGDL).to.equal(18);
    });
  });

  describe('mungeBasals', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.mungeBasals);
    });

    it('should return an array', function() {
      assert.isArray(Preprocess.mungeBasals(data));
    });

    it('should add a vizType key to each `basal-rate-segment` object', function() {
      var basal = _.findWhere(data, {'type': 'basal-rate-segment'});

      expect(Preprocess.mungeBasals([basal])[0].vizType).to.exist;
    });
  });

  describe('editBoluses', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.editBoluses);
    });

    it('should add a recommended field to a bolus when a matching wizard event exists', function() {
      var data =
        [{
          'deviceTime': '2013-10-24T11:54:14',
          'source': 'carelink',
          'programmed': 5.4,
          'value': 4,
          'subType': 'normal',
          'joinKey': '7e6psp14lnur1s4k12ofeqap3e47kf8b',
          'type': 'bolus'
        },
        {
          'deviceTime': '2013-10-24T11:54:14',
          'payload': {
              'carbUnits': 'grams',
              'correctionEstimate': 0,
              'bgInput': 0,
              'targetHigh': 100,
              'foodEstimate': 5.4,
              'carbRatio': 12,
              'insulinSensitivity': 50,
              'bgUnits': 'mg dl',
              'carbInput': 65,
              'activeInsulin': 0,
              'estimate': 5.4,
              'targetLow': 80
            },
            'source': 'carelink',
            'joinKey': '7e6psp14lnur1s4k12ofeqap3e47kf8b',
            'type': 'wizard'
          }];

      var res = Preprocess.editBoluses(data);
      var bolus = _.findWhere(res, {'type': 'bolus'});

      expect(bolus.recommended).to.equal(5.4);
    });

    it('should change extended to false when extendedDelivery is zero', function() {
      var datum = [{
        'deviceTime': '2013-11-05T17:21:28',
        'value': 7.5,
        'extendedDelivery': 0.0,
        'initialDelivery': 7,
        'duration': 1800000,
        'extended': true,
        'type': 'bolus'
      }];

      var res = Preprocess.editBoluses(datum);
      expect(res[0].extended).to.be.false;
    });

    it('should pass through all other data types unchanged', function() {
      var data = [{
        'messageText': 'Chicken magna ham sausage, t-bone cupidatat labore ex in drumstick andouille boudin chuck. Sed salami mollit shoulder velit flank ad in ut capicola pastrami ham hock. Salami pork belly tail laboris deserunt, ground round ham sunt dolore flank nostrud.',
        'parentMessage': '',
        'utcTime': '2014-03-07T12:09:40Z',
        '_id': '318ea715-7f82-416e-8d73-1881b8245e1e',
        'type': 'message'
      },
    {
        'deviceTime': '2014-03-07T15:15:08',
        'type': 'cbg',
        'value': 176,
        '_id': 'dc7edcb2-458d-4bc7-aebe-8b77594fd336'
      },
    {
        'deviceTime': '2014-03-07T15:20:08',
        'type': 'cbg',
        'value': 180,
        '_id': 'e484c167-06a2-4bda-8906-016adf649f70'
      },
    {
        'deviceTime': '2014-03-07T15:25:08',
        'type': 'cbg',
        'value': 182,
        '_id': '308673cf-12e3-44cf-800d-dccc22859812'
      }];

      var res = Preprocess.editBoluses(data);
      expect(res).to.eql(data);
    });
  });

  describe('filterData', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.filterData);
    });

    it('should return an array', function() {
      assert.isArray(Preprocess.filterData(data));
    });

    it('should filter out a carb event with value 0', function() {
      var carb = _.findWhere(data, {'type': 'carbs'});
      carb.value = 0;

      expect(Preprocess.filterData([carb])).to.have.length(0);
    });

    it('should filter out an event with type `foo`', function() {
      var foo = {'type': 'foo'};
      if (!_.contains(Preprocess.TYPES_TO_INCLUDE, 'foo')) {
        expect(Preprocess.filterData([foo])).to.have.length(0);
      }
    });
  });

  describe('runWatson', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.runWatson);
    });

    it('should return an array', function() {
      assert.isArray(Preprocess.runWatson(data));
    });

    it('should add a normalTime key to each object', function() {
      var first = data[0];

      expect(Preprocess.runWatson([first])[0].normalTime).to.exist;
    });
  });

  describe('checkRequired', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.checkRequired);
    });

    it('should return an object', function() {
      assert.isObject(Preprocess.checkRequired({'grouped': {}}));
    });

    it('should add an empty array to a grouped data object that does not have a key for a required type', function() {
      var grouped = {'grouped': {}};
      var allEmpties = {'grouped': {}};
      _.forEach(Preprocess.REQUIRED_TYPES, function(type) {
        allEmpties.grouped[type] = [];
      });
      
      expect(Preprocess.checkRequired(grouped)).to.eql(allEmpties);
    });
  });

  describe('translateMmol', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.translateMmol);
    });

    it('should return an array', function() {
      assert.isArray(Preprocess.translateMmol(data));
    });

    it('should translate a value of 5.5 mmol/L to 99 mg/dL', function() {
      expect(Preprocess.translateMmol([{'units': 'mmol/L', 'value': 5.5}])).to.eql([{
        'units': 'mg/dL',
        'value': 99
      }]);
    });
  });

  describe('basalSchedulesToArray', function() {
    var basalSchedules = {
        'pattern b': [],
        'pattern a': [
            {
                'start': 0,
                'rate': 0.95
              },
              {
                'start': 3600000,
                'rate': 0.9
              },
              {
                'start': 10800000,
                'rate': 1
              },
              {
                'start': 14400000,
                'rate': 1
              },
              {
                'start': 18000000,
                'rate': 1.1
              },
              {
                'start': 21600000,
                'rate': 1.15
              },
              {
                'start': 32400000,
                'rate': 1.05
              },
              {
                'start': 54000000,
                'rate': 1.1
              },
              {
                'start': 61200000,
                'rate': 1.05
              }
            ],
            'standard': [
              {
                'start': 0,
                'rate': 0.8
              },
              {
                'start': 3600000,
                'rate': 0.75
              },
              {
                'start': 10800000,
                'rate': 0.85
              },
              {
                'start': 14400000,
                'rate': 0.9
              },
              {
                'start': 18000000,
                'rate': 0.9
              },
              {
                'start': 21600000,
                'rate': 0.95
              },
              {
                'start': 32400000,
                'rate': 0.9
              },
              {
                'start': 54000000,
                'rate': 0.95
              },
              {
                'start': 61200000,
                'rate': 0.9
              }
            ]
          };
    it('should be a function', function() {
      assert.isFunction(Preprocess.basalSchedulesToArray);
    });
    
    it('should return an array', function() {
      assert.isArray(Preprocess.basalSchedulesToArray(basalSchedules));
    });

    it('should return an array composed of objects with name and value keys', function() {
      var keys = ['name', 'value'];
      expect(Object.keys(Preprocess.basalSchedulesToArray(basalSchedules)[0])).to.eql(keys);
    });

    it('should return an array of objects where the value of each is identical to the values of the object passed in', function() {
      var keys = Object.keys(basalSchedules);
      var processed = Preprocess.basalSchedulesToArray(basalSchedules);
      for (var i = 0; i < keys.length; i++) {
        expect(processed[i].value).to.eql(basalSchedules[keys[i]]);
      }
    });
  });

  describe('sortBasalSchedules', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.sortBasalSchedules);
    });

    it('should return an array', function() {
      assert.isArray(Preprocess.sortBasalSchedules(settings));
    });

    it('should have `standard` first if `standard` exists', function() {
      for (var j = 0; j < settings.length; j++) {
        // console.log(res[j].basalSchedules);
        var standard = _.findWhere(settings[j].basalSchedules, {'name': 'standard'});
        if (standard) {
          expect(settings[j].basalSchedules.indexOf(standard)).to.equal(0);
        }
      }
    });

    // TODO: add test for alpha sort order otherwise
  });

  describe('processDeviceMeta', function(){
    it('should convert marryable status changes to basal-rate-segment and ignore others', function(){
      var data = [
        { id: '0', type: 'something', deviceTime: '0' },
        { id: '1', type: 'deviceMeta', subType: 'status', status: 'resume', deviceTime: '1' },
        { id: '2', type: 'deviceMeta', subType: 'something', deviceTime: '2' },
        { id: '3', type: 'deviceMeta', subType: 'status', status: 'suspended', deviceTime: '3' },
        { id: '3.5', type: 'deviceMeta', subType: 'status', status: 'suspended', deviceTime: '3.5' },
        { id: '4', type: 'something', deviceTime: '4' },
        { id: '5', type: 'deviceMeta', subType: 'status', status: 'resume', deviceTime: '5'},
        { id: '6', type: 'deviceMeta', subType: 'status', status: 'resume', deviceTime: '6', joinKey: '3' },
        { id: '7', type: 'billyBob' }
      ];

      expect(Preprocess.processDeviceMeta(data)).deep.equals(
        [
          { id: '0', type: 'something', deviceTime: '0' },
          { id: '4', type: 'something', deviceTime: '4' },
          { id: '7', type: 'billyBob' },
          { id: '1', type: 'deviceMeta', subType: 'status', status: 'resume', deviceTime: '1' },
          { id: '2', type: 'deviceMeta', subType: 'something', deviceTime: '2' },
          { id: '5', type: 'deviceMeta', subType: 'status', status: 'resume', deviceTime: '5'},
          { id: '3_6', type: 'basal-rate-segment', subType: 'status', status: 'suspended', deviceTime: '3',
            start: '3', end: '6', deliveryType: 'manualSuspend', value: 0 },
          { id: '3.5', type: 'deviceMeta', subType: 'status', status: 'suspended', deviceTime: '3.5' }
        ]
      );
    });
  });

  describe('processData', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.processData);
    });

    it('should return an object', function() {
      assert.isObject(Preprocess.processData(data));
    });
  });
});