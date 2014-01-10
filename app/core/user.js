var _ = window._;

var user = {
  attributes: {
    username: {validate: 'required'},
    password: {validate: 'required'},
    passwordConfirm: {
      validate: ['required', 'equalsPassword'],
      validateOnlyIf: function(attributes) {
        return _.has(attributes, 'password');
      }
    },
    firstName: {validate: 'required'},
    lastName: {validate: 'required'}
  },

  validate: function(attributes, options) {
    options = options || {};
    var self = this;
    var errors = {};

    var allAttributeNames = _.keys(this.attributes);
    _.forEach(allAttributeNames, function(name) {
      if (self.attributeNeedsValidation(name, attributes, options)) {
        errors[name] = self.validateAttribute(name, attributes);
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

  validators: {
    required: function(value) {
      if (!value) {
        return 'This field is required.';
      }
    },

    equalsPassword: function(value, attributes) {
      if (value !== attributes.password) {
        return 'Passwords don\'t match';
      }
    }
  },

  attributeNeedsValidation: function(name, attributes, options) {
    options = options || {};
    var ignoreMissingAttributes = true;
    if (options.ignoreMissingAttributes === false) {
      ignoreMissingAttributes = false;
    }
  
    if (ignoreMissingAttributes && !_.has(attributes, name)) {
      return false;
    }

    var validateOnlyIf = this.attributes[name].validateOnlyIf;
    if (validateOnlyIf && !validateOnlyIf(attributes)) {
      return false;
    }

    return true;
  },

  getValidatorsForAttribute: function(name) {
    var self = this;
    var validators = this.attributes[name].validate;

    if (!validators) {
      return [];
    }

    if (!_.isArray(validators)) {
      validators = [validators];
    }

    validators = _.map(validators, function(validator) {
      if (typeof validator === 'string') {
        validator = self.validators[validator];
      }

      if (typeof validator !== 'function') {
        // No-op
        return function() {};
      }

      return validator;
    });
    
    return validators;
  },

  validateAttribute: function(name, attributes) {
    var error;

    var validators = this.getValidatorsForAttribute(name);
    _.forEach(validators, function(validator) {
      error = validator(attributes[name], attributes);
      if (error) {
        // Stop on first error for this attribute
        return false;
      }
    });

    return error;
  }
};

module.exports = user;