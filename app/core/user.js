var _ = window._;

var user = {
  validate: function(attributes, options) {
    options = options || {};
    var ignoreMissingAttributes = true;
    if (options.ignoreMissingAttributes === false) {
      ignoreMissingAttributes = false;
    }
    var errors = {};

    var needsValidation = function(attributeName) {
      if (ignoreMissingAttributes && !_.has(attributes, attributeName)) {
        return false;
      }
      return true;
    };

    if (needsValidation('username')) {
      errors.username = this.validateRequired(attributes.username);
    }
    if (needsValidation('password')) {
      errors.password = this.validateRequired(attributes.password);
    }
    if (needsValidation('password') && needsValidation('passwordConfirm')) {
      errors.passwordConfirm =
        this.validateRequired(attributes.passwordConfirm);
      if (!errors.passwordConfirm) {
        errors.passwordConfirm =
          this.validatePasswordConfirm(attributes.password,
                                       attributes.passwordConfirm);
      }
    }
    if (needsValidation('firstName')) {
      errors.firstName = this.validateRequired(attributes.firstName);
    }
    if (needsValidation('lastName')) {
      errors.lastName = this.validateRequired(attributes.lastName);
    }

    // Filter "empty" errors
    errors = _.transform(errors, function(result, value, key) {
      if (value) {
        result[key] = value;
      }
    });

    return errors;
  },

  validateRequired: function(value) {
    if (!value) {
      return 'This field is required.';
    }
  },

  validatePasswordConfirm: function(password, passwordConfirm) {
    if (password !== passwordConfirm) {
      return 'Passwords don\'t match';
    }
  }
};

module.exports = user;