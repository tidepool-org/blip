var _ = window._;

var validators = {
  required: function() {
    return function(value) {
      if (!value) {
        return 'This field is required.';
      }
    };
  },

  equalsPassword: function() {
    return function(value, attributes) {
      if (value !== attributes.password) {
        return 'Passwords don\'t match';
      }
    };
  },

  // Run validators in a series, return first validation error encountered
  series: function(validators) {
    return function(value, attributes) {
      var error;

      _.forEach(validators, function(validator) {
        error = validator(value, attributes);
        if (error) {
          // Stop
          return false;
        }
      });

      return error;
    };
  }
};

var user = {
  _attributes: {
    username: {validate: validators.required()},
    password: {validate: validators.required()},
    passwordConfirm: {
      validate: validators.series([
        validators.required(),
        validators.equalsPassword()
      ]),
      validateOnlyIf: function(attributes) {
        return _.has(attributes, 'password');
      }
    },
    firstName: {validate: validators.required()},
    lastName: {validate: validators.required()}
  },

  validate: function(attributes, options) {
    options = options || {};
    var self = this;
    var errors = {};

    var allAttributeNames = _.keys(this._attributes);
    _.forEach(allAttributeNames, function(name) {
      if (self._attributeNeedsValidation(name, attributes, options)) {
        errors[name] = self._validateAttribute(name, attributes);
      }
    });

    // Remove "empty" errors
    errors = _.transform(errors, function(result, value, key) {
      if (value) {
        result[key] = value;
      }
    });

    return errors;
  },

  _attributeNeedsValidation: function(name, attributes, options) {
    options = options || {};
    var ignoreMissingAttributes = true;
    if (options.ignoreMissingAttributes === false) {
      ignoreMissingAttributes = false;
    }
  
    if (ignoreMissingAttributes && !_.has(attributes, name)) {
      return false;
    }

    var validateOnlyIf = this._attributes[name].validateOnlyIf;
    if (validateOnlyIf && !validateOnlyIf(attributes)) {
      return false;
    }

    return true;
  },

  _validateAttribute: function(name, attributes) {
    var error;

    var validator = this._attributes[name].validate;
    if (validator) {
      error = validator(attributes[name], attributes);
    }

    return error;
  }
};

module.exports = user;