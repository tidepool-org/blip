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

  describe('getDonationAccountCodeFromEmail', function() {
    it('should return a data donation code from an matching email', function() {
      expect(utils.getDonationAccountCodeFromEmail('bigdata+ZZZ@tidepool.org')).to.equal('ZZZ');
    });

    it('should return a null from a non matching email', function() {
      expect(utils.getDonationAccountCodeFromEmail('user@tidepool.org')).to.be.null;
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

  describe('getInviteKey', function(){
    it('should return invite key from query property of location object', function(){
      var location = {
        query: {
          inviteKey: '1234567890abcdef'
        }
      };
      expect(utils.getInviteKey(location)).to.equal('1234567890abcdef');
    });

    it('should return empty string if no location object', function(){
      expect(utils.getInviteKey()).to.equal('');
    });

    it('should return empty string if no query property of location object', function(){
      expect(utils.getInviteKey({})).to.equal('');
    });

    it('should return empty string if no inviteKey in query property of location object', function(){
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getInviteKey(location)).to.equal('');
    });
  });

  describe('getRoles', function(){
    it('should return roles from query property of location object', function(){
      var location = {
        query: {
          roles: 'zero'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['zero']);
    });

    it('should return multiple roles from query property of location object', function(){
      var location = {
        query: {
          roles: 'one,two,three'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['one', 'two', 'three']);
    });

    it('should return multiple roles from query property of location object with whitespace removed', function(){
      var location = {
        query: {
          roles: ' ,  ,, four, ,  , five ,,  , ,six,, ,'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['four', 'five', 'six']);
    });

    it('should return empty array if no usable roles in query property of location object', function(){
      var location = {
        query: {
          roles: ' ,  ,,,  , '
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });

    it('should return empty array if empty roles in query property of location object', function(){
      var location = {
        query: {
          roles: ''
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });

    it('should return empty array if no location object', function(){
      expect(utils.getRoles()).to.deep.equal([]);
    });

    it('should return empty array if no query property of location object', function(){
      expect(utils.getRoles({})).to.deep.equal([]);
    });

    it('should return empty array if no roles in query property of location object', function(){
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });
  });

  describe('getCarelink', function(){
    it('should return carelink from query property of location object', function(){
      var location = {
        query: {
          carelink: 'true'
        }
      };
      expect(utils.getCarelink(location)).to.equal('true');
    });

    it('should return empty string if empty carelink in query property of location object', function(){
      var location = {
        query: {
          carelink: ''
        }
      };
      expect(utils.getCarelink(location)).to.equal('');
    });

    it('should return null if no location object', function(){
      expect(utils.getCarelink()).to.equal(null);
    });

    it('should return null if no query property of location object', function(){
      expect(utils.getCarelink({})).to.equal(null);
    });

    it('should return null if no carelink in query property of location object', function(){
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getCarelink(location)).to.equal(null);
    });
  });

  describe('stripTrailingSlash', function() {
    it('should strip a trailing forward slash from a string', function() {
      const url = '/my-path/sub-path/';
      expect(utils.stripTrailingSlash(url)).to.equal('/my-path/sub-path');
    });
  });
});
