/* 
 * == BSD2 LICENSE ==
 */

/*jshint expr: true */
/*global describe, it */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var tideline = require('../js/index');
var annotations = tideline.plot.util.defs;

describe('annotation definitions', function() {
  describe('main text', function() {
    Object.keys(annotations.MAIN_TEXT).forEach(function(key) {
      describe(key, function() {
        it('should return a string', function() {
          console.log('Main text annotation for', key + ':');
          console.log();
          console.log(annotations.MAIN_TEXT[key]('demo', annotations));
          console.log();
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
          console.log('Lead text annotation for', key + ':');
          console.log();
          console.log(annotations.LEAD_TEXT[key]());
          console.log();
          assert.isString(annotations.LEAD_TEXT[key]());
        });
      });
    });
  });
});