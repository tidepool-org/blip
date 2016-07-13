/* global chai */
/* global describe */
/* global it */

var utils = require('../../../app/core/utils');
var expect = chai.expect;

describe('utils', function() {

  describe('capitalize', function() {
    it('should return a capitalized string', function(){
      expect(utils.capitalize('lower')).to.equal('Lower');
    });

    it('should return a string if already capitalized', function(){
      expect(utils.capitalize('Upper')).to.equal('Upper');
    });

    it('should return an empty string if given one', function(){
      expect(utils.capitalize('')).to.equal('');
    });
  });

  describe('getIn', function() {
    var obj = {a: {b: 1, l: [1]}};

    it('should return value when properties exist', function() {
      var result = utils.getIn(obj, ['a', 'b']);
      expect(result).to.equal(1);
    });

    it('should return length property of arrays', function() {
      var result = utils.getIn(obj, ['a', 'l', 'length']);
      expect(result).to.equal(1);
    });

    it('should return undefined when a property is not found', function() {
      var result = utils.getIn(obj, ['a', 'c']);
      expect(result).to.be.undefined;
    });

    it('should return supplied default when a property is not found', function() {
      var result = utils.getIn(obj, ['a', 'c'], 1);
      expect(result).to.equal(1);
    });

    it('should allow default value to be an object', function() {
      var result = utils.getIn(obj, ['a', 'c'], {d: 1});
      expect(result).to.deep.equal({d: 1});
    });

    it('should return object if property list is empty', function() {
      var result = utils.getIn(obj, []);
      expect(result).to.deep.equal(obj);
    });

    it('should return object no property list given', function() {
      var result = utils.getIn(obj);
      expect(result).to.deep.equal(obj);
    });

    it('should return undefined if value given is not an object', function() {
      var result = utils.getIn(null, ['a', 'b']);
      expect(result).to.be.undefined;
    });
  });

  describe('validateEmail', function() {
    it('should validate jane@tidepool.org as email', function() {
      expect(utils.validateEmail('jane@tidepool.org')).to.be.true;
    });

    it('should validate jane+skip@tidepool.org as email', function() {
      expect(utils.validateEmail('jane+skip@tidepool.org')).to.be.true;
    });

    it('should validate jane@tidepool.io as email', function() {
      expect(utils.validateEmail('jane@tidepool.io')).to.be.true;
    });

    it('should validate jane.smith@c.co.uk as email', function() {
      expect(utils.validateEmail('jane.smith@c.co.uk')).to.be.true;
    });

    it('should validate p@b.com as email', function() {
      expect(utils.validateEmail('p@b.com')).to.be.true;
    });

    it('should validate frank_b@google.com as email', function() {
      expect(utils.validateEmail('frank_b@google.com')).to.be.true;
    });

    it('should validate test123@test123.co as email', function() {
      expect(utils.validateEmail('test123@test123.co')).to.be.true;
    });

    it('should validate jane@ as email', function() {
      expect(utils.validateEmail('jane@')).to.be.false;
    });

    it('should validate jane@linkedin as email', function() {
      expect(utils.validateEmail('jane@linkedin')).to.be.false;
    });

    it('should validate jane@linkedin. as email', function() {
      expect(utils.validateEmail('jane@linkedin.')).to.be.false;
    });

    it('should validate jane as email', function() {
      expect(utils.validateEmail('jane')).to.be.false;
    });
  });

  describe('getSignupEmail', function(){
    it('should return email from location object', function(){
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal('jane@tidepool.org');
    });

    it('should handle conversion of space to plus', function(){
      var location = {
        query: {
          signupEmail: 'jane skip@tidepool.org'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal('jane+skip@tidepool.org');
    });

    it('should return null if no argument given', function(){
      expect(utils.getSignupEmail()).to.equal(null);
    });

    it('should return null if no query property', function(){
      expect(utils.getSignupEmail({})).to.equal(null);
    });

    it('should return null if no signupEmail in query property', function(){
      var location = {
        query: {
          signupKey: 'someKey'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal(null);
    });

    it('should return null if signupEmail is not valid', function(){
      var location = {
        query: {
          signupEmail: 'notgood@'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal(null);
    });
    
  });
});
