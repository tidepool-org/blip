var expect = chai.expect;
var _ = window._;

var user = require('../../app/core/user');
var demoUser = require('../../demo/sample/user.json');

describe('User service', function() {
  var userInitialAttr = demoUser;
  var userAttr;

  beforeEach(function() {
    resetUserAttr();
  });

  it('should exist', function() {
    expect(user).to.exist;
  });

  describe('validate', function() {
    var ERROR_REQUIRED = 'This field is required.';
    var ERROR_PASSWORDS_DONT_MATCH = 'Passwords don\'t match';

    it('should exist', function() {
      expect(user.validate).to.exist;
    });

    it('should return empty object if no validation errors', function() {
      var errors = user.validate(userAttr);

      expect(errors).to.be.an('object');
      expect(errors).to.be.empty;
    });

    it('should ignore missing attributes by default', function() {
      delete userAttr.username;
      var errors = user.validate(userAttr);

      expect(errors).to.be.empty;
    });

    it('should allow to check for missing required attributes', function() {
      delete userAttr.username;
      var errors = user.validate(userAttr, {
        ignoreMissingAttributes: false
      });

      expect(errors).to.include.keys('username');
    });

    it('should return correct error for required attributes', function() {
      userAttr = {
        'username': '',
        'password': '',
        'passwordConfirm': '',
        'firstName': '',
        'lastName': ''
      };
      var errors = user.validate(userAttr);

      _.forEach(_.keys(userAttr), function(key) {
        expect(errors[key]).to.equal(ERROR_REQUIRED);
      });
    });

    it('should not check password confirm if password is missing', function() {
      userAttr = {'passwordConfirm': ''};
      var errors = user.validate(userAttr);

      expect(errors).to.be.empty;
    });

    it('should return correct error if passwords don\'t match', function() {
      userAttr = {
        'password': 'foo',
        'passwordConfirm': 'bar'
      };
      var errors = user.validate(userAttr);

      expect(errors.passwordConfirm).to.equal(ERROR_PASSWORDS_DONT_MATCH);
    });

    it('should validate matching passwords', function() {
      userAttr = {
        'password': 'foo',
        'passwordConfirm': 'foo'
      };
      var errors = user.validate(userAttr);

      expect(errors).to.be.empty;
    });

  });

  function resetUserAttr() {
    userAttr = _.clone(userInitialAttr);
  }
});