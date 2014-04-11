/* 
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

  describe('processData', function() {
    it('should be a function', function() {
      assert.isFunction(Preprocess.processData);
    });

    it('should return an object', function() {
      assert.isObject(Preprocess.processData(data));
    });
  });
});