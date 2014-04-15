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

  describe('processData', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.processData);
    });

    it('should return an object', function() {
      assert.isObject(Preprocess.processData(data));
    });
  });
});