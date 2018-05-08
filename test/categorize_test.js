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
var { MGDL_PER_MMOLL } = require('../js/data/util/constants');

var categorizer = require('../js/data/util/categorize');
var defaultBgClasses = {
  'very-low': { boundary: 54 },
  low: { boundary: 70 },
  target: { boundary: 180 },
  high: { boundary: 250 },
};
var alternateBgClasses = {
  'very-low': { boundary: 60 },
  low: { boundary: 80 },
  target: { boundary: 150 },
  high: { boundary: 250 },
};
var mmollBgClasses = {
  'very-low': { boundary: 54/MGDL_PER_MMOLL },
  low: { boundary: 70/MGDL_PER_MMOLL },
  target: { boundary: 180/MGDL_PER_MMOLL },
  high: { boundary: 250/MGDL_PER_MMOLL },
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
      it('should categorize 54 as "verylow"', function(){
        expect(defaultCategorizer({value:54})).to.equal("verylow");
      });
      it('should categorize 55 as "low"', function(){
        expect(defaultCategorizer({value:55})).to.equal("low");
      });
      it('should categorize 60 as "low"', function(){
        expect(defaultCategorizer({value:60})).to.equal("low");
      });
      it('should categorize 70 as "target"', function(){
        expect(defaultCategorizer({value:70})).to.equal("target");
      });
      it('should categorize 100 as "target"', function(){
        expect(defaultCategorizer({value:100})).to.equal("target");
      });
      it('should categorize 180 as "target"', function(){
        expect(defaultCategorizer({value:180})).to.equal("target");
      });
      it('should categorize 250 as "high"', function(){
        expect(defaultCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 300 as "veryhigh"', function(){
        expect(defaultCategorizer({value:300})).to.equal("veryhigh");
      });
      it('should categorize 350 as "veryhigh"', function(){
        expect(defaultCategorizer({value:350})).to.equal("veryhigh");
      });
    });
    describe('with alternate classes', function(){
      it('should categorize 55 as "verylow"', function(){
        expect(alternateCategorizer({value:55})).to.equal("verylow");
      });
      it('should categorize 60 as "low"', function(){
        expect(alternateCategorizer({value:60})).to.equal("low");
      });
      it('should categorize 70 as "low"', function(){
        expect(alternateCategorizer({value:70})).to.equal("low");
      });
      it('should categorize 80 as "target"', function(){
        expect(alternateCategorizer({value:80})).to.equal("target");
      });
      it('should categorize 100 as "target"', function(){
        expect(alternateCategorizer({value:100})).to.equal("target");
      });
      it('should categorize 150 as "target"', function(){
        expect(alternateCategorizer({value:150})).to.equal("target");
      });
      it('should categorize 220 as "high"', function(){
        expect(alternateCategorizer({value:220})).to.equal("high");
      });
      it('should categorize 250 as "high"', function(){
        expect(alternateCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 270 as "veryhigh"', function(){
        expect(alternateCategorizer({value:270})).to.equal("veryhigh");
      });
    });
    describe('with no classes', function(){
      it('should categorize 54 as "low"', function(){
        expect(noConfigCategorizer({value:54})).to.equal("low");
      });
      it('should categorize 55 as "low"', function(){
        expect(noConfigCategorizer({value:55})).to.equal("low");
      });
      it('should categorize 60 as "low"', function(){
        expect(noConfigCategorizer({value:60})).to.equal("low");
      });
      it('should categorize 70 as "target"', function(){
        expect(noConfigCategorizer({value:70})).to.equal("target");
      });
      it('should categorize 100 as "target"', function(){
        expect(noConfigCategorizer({value:100})).to.equal("target");
      });
      it('should categorize 180 as "target"', function(){
        expect(noConfigCategorizer({value:180})).to.equal("target");
      });
      it('should categorize 250 as "high"', function(){
        expect(noConfigCategorizer({value:250})).to.equal("high");
      });
      it('should categorize 300 as "high"', function(){
        expect(noConfigCategorizer({value:300})).to.equal("high");
      });
      it('should categorize 350 as "veryhigh"', function(){
        expect(noConfigCategorizer({value:350})).to.equal("veryhigh");
      });
    });
    describe('with mmoll values', function(){
      it('should categorize 2.5 as "verylow"', function(){
        expect(mmollCategorizer({value:2.8})).to.equal("verylow");
      });
      it('should categorize 3.2 as "verylow"', function(){
        expect(mmollCategorizer({value:3.2})).to.equal("low");
      });
      it('should categorize 3.7 as "low"', function(){
        expect(mmollCategorizer({value:3.7})).to.equal("low");
      });
      it('should categorize 6.5 as "target"', function(){
        expect(mmollCategorizer({value:6.5})).to.equal("target");
      });
      it('should categorize 8.0 as "target"', function(){
        expect(mmollCategorizer({value:8.0})).to.equal("target");
      });
      it('should categorize 9.9 as "target"', function(){
        expect(mmollCategorizer({value:9.9})).to.equal("target");
      });
      it('should categorize 12.2 as "high"', function(){
        expect(mmollCategorizer({value:12.2})).to.equal("high");
      });
      it('should categorize 15.8 as "veryhigh"', function(){
        expect(mmollCategorizer({value:15.8})).to.equal("veryhigh");
      });
      it('should categorize 22.0 as "veryhigh"', function(){
        expect(mmollCategorizer({value:22.0})).to.equal("veryhigh");
      });
    });
  });
});
