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
var { MGDL_PER_MMOLL, MGDL_UNITS, MMOLL_UNITS, DEFAULT_BG_BOUNDS } = require('../js/data/util/constants');

var categorizer = require('../js/data/util/categorize');
var defaultBgClasses = {
  'very-low': { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow },
  low: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
  target: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
  high: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
};
var alternateBgClasses = {
  'very-low': { boundary: 60 },
  low: { boundary: 80 },
  target: { boundary: 150 },
  high: { boundary: 250 },
};
var mmollBgClasses = {
  'very-low': { boundary: DEFAULT_BG_BOUNDS[MMOLL_UNITS].veryLow },
  low: { boundary: DEFAULT_BG_BOUNDS[MMOLL_UNITS].targetLower },
  target: { boundary: DEFAULT_BG_BOUNDS[MMOLL_UNITS].targetUpper },
  high: { boundary: DEFAULT_BG_BOUNDS[MMOLL_UNITS].veryHigh },
};

describe('Categorize', function() {
  var defaultCategorizer = categorizer(defaultBgClasses);
  var alternateCategorizer = categorizer(alternateBgClasses);
  var noConfigCategorizer = categorizer({});
  var mmollCategorizer = categorizer(mmollBgClasses);

  it('should be a function', function() {
    assert.isFunction(categorizer);
  });

  describe('categorization', function(){
    describe('with default classes', function(){
      it('should categorize 53 as "verylow"', function(){
        expect(defaultCategorizer({value:53})).to.equal("verylow");
      });
      it('should categorize 54 as "low"', function(){
        expect(defaultCategorizer({value:54})).to.equal("low");
      });
      it('should categorize 69 as "low"', function(){
        expect(defaultCategorizer({value:69})).to.equal("low");
      });
      it('should categorize 70 as "target"', function(){
        expect(defaultCategorizer({value:70})).to.equal("target");
      });
      it('should categorize 180 as "target"', function(){
        expect(defaultCategorizer({value:180})).to.equal("target");
      });
      it('should categorize 181 as "high"', function(){
        expect(defaultCategorizer({value:181})).to.equal("high");
      });
      it('should categorize 250 as "high"', function(){
        expect(defaultCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 251 as "veryhigh"', function(){
        expect(defaultCategorizer({value:251})).to.equal("veryhigh");
      });
    });
    describe('with alternate classes', function(){
      it('should categorize 59 as "verylow"', function(){
        expect(alternateCategorizer({value:59})).to.equal("verylow");
      });
      it('should categorize 60 as "low"', function(){
        expect(alternateCategorizer({value:60})).to.equal("low");
      });
      it('should categorize 79 as "low"', function(){
        expect(alternateCategorizer({value:79})).to.equal("low");
      });
      it('should categorize 80 as "target"', function(){
        expect(alternateCategorizer({value:80})).to.equal("target");
      });
      it('should categorize 150 as "target"', function(){
        expect(alternateCategorizer({value:150})).to.equal("target");
      });
      it('should categorize 151 as "high"', function(){
        expect(alternateCategorizer({value:151})).to.equal("high");
      });
      it('should categorize 250 as "high"', function(){
        expect(alternateCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 251 as "veryhigh"', function(){
        expect(alternateCategorizer({value:251})).to.equal("veryhigh");
      });
    });
    describe('with no classes', function(){
      it('should categorize 53 as "verylow"', function(){
        expect(noConfigCategorizer({value:53})).to.equal("verylow");
      });
      it('should categorize 54 as "low"', function(){
        expect(noConfigCategorizer({value:54})).to.equal("low");
      });
      it('should categorize 69 as "low"', function(){
        expect(noConfigCategorizer({value:69})).to.equal("low");
      });
      it('should categorize 70 as "target"', function(){
        expect(noConfigCategorizer({value:70})).to.equal("target");
      });
      it('should categorize 180 as "target"', function(){
        expect(noConfigCategorizer({value:180})).to.equal("target");
      });
      it('should categorize 181 as "high"', function(){
        expect(noConfigCategorizer({value:181})).to.equal("high");
      });
      it('should categorize 250 as "high"', function(){
        expect(noConfigCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 251 as "veryhigh"', function(){
        expect(noConfigCategorizer({value:251})).to.equal("veryhigh");
      });
    });
    describe('with mmoll values', function(){
      it('should categorize 2.9 as "verylow"', function(){
        expect(mmollCategorizer({value:2.9})).to.equal("verylow");
      });
      it('should categorize 3.0 as "low"', function(){
        expect(mmollCategorizer({value:3.0})).to.equal("low");
      });
      it('should categorize 3.8 as "low"', function(){
        expect(mmollCategorizer({value:3.8})).to.equal("low");
      });
      it('should categorize 3.9 as "target"', function(){
        expect(mmollCategorizer({value:3.9})).to.equal("target");
      });
      it('should categorize 10.0 as "target"', function(){
        expect(mmollCategorizer({value:10.0})).to.equal("target");
      });
      it('should categorize 10.1 as "high"', function(){
        expect(mmollCategorizer({value:10.1})).to.equal("high");
      });
      it('should categorize 13.9 as "high"', function(){
        expect(mmollCategorizer({value:13.9})).to.equal("high");
      });
      it('should categorize 14.0 as "veryhigh"', function(){
        expect(mmollCategorizer({value:14.0})).to.equal("veryhigh");
      });
    });
  });
});
