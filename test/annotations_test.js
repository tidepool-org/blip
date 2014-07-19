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

var tideline = require('../js/index');
var annotations = tideline.plot.util.annotations.defs;

// change to true when you want to view all produced annotations
var logging = false;

describe('annotation definitions', function() {
  describe('main text', function() {
    Object.keys(annotations.MAIN_TEXT).forEach(function(key) {
      describe(key, function() {
        it('should return a string', function() {
          if (logging) {
            console.log('Main text annotation for', key + ':');
            console.log();
            console.log(annotations.MAIN_TEXT[key]('demo', annotations));
            console.log();
          }
          assert.isString(annotations.MAIN_TEXT[key]('demo', annotations));
        });
      });
    });

    describe('default', function() {
      it('should return a string', function() {
        assert.isString(annotations.default());
      });
      it('should have a source when possible', function() {
        var expected = "We can't be 100% certain of the data displayed here because of how Demo reports the data.";
        expect(annotations.default('demo')).to.equal(expected);
      });
    });
  });

  describe('lead text', function() {
    Object.keys(annotations.LEAD_TEXT).forEach(function(key) {
      describe(key, function() {
        it('should return a string', function() {
          if (logging) {
            console.log('Lead text annotation for', key + ':');
            console.log();
            console.log(annotations.LEAD_TEXT[key]());
            console.log();
          }
          assert.isString(annotations.LEAD_TEXT[key]());
        });
      });
    });
  });
});