/*
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

    it('should return an array, empty if initial array was empty', function() {
      var res = nurseshark.processData([]);
      expect((res && res.length >= 0 && Array.isArray(res))).to.be.true;
    });

    it('should return an array of new (not mutated) objects', function() {
      var input = [{a: 1, z: {x: 100, y: 99}}, {b: 2}];
      var output = nurseshark.processData(input);
      for (var i = 0; i < input.length; ++i) {
        expect(input[i] === output[i]).to.be.false;
      }
      expect(input[0].z === output[0].z).to.be.false;
    });
  });

  describe('mungeSuspends', function() {

  });
});