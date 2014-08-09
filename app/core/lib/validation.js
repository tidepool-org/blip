/**
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
 */

/**
Adds a `validate(attributes, options)` method to an object 
(for example a service)

`options.ignoreMissingAttributes`: default `true`, set to `false` to check
for missing attributes

Usage: Include the mixin, and defint the `_attributes` object

    var myService = {};

    _.assign(myService, validation.mixin);

    myService._attributes = {
      username: {validate: validation.required()},
      password: {validate: validation.required()},
      passwordConfirm: {
        validate: validation.series([
          validation.required(),
          myValidators.equalsPassword()
        ]),
        validateOnlyIf: function(attributes) {
          return _.has(attributes, 'password');
        }
      }
    };

You can define your own validator factories:

    var myValidators = {
      equalsPassword: function() {
        return function(value, attributes) {
          if (value !== attributes.password) {
            return 'Passwords don\'t match';
          }
        };
      }
    };

*/

var _ = require('lodash');
var moment = require('moment');

var validation = {
  required: function() {
    return function(value) {
      if (!value) {
        return 'This field is required.';
      }
    };
  },

  isValidDate: function() {
    return function(value) {
      var m = moment(value);
      // Be careful, if `value` is empty, `m` can be null
      var isValid = m && m.isValid();
      if (!isValid) {
        return 'Not a valid date.';
      }
    };
  },

  hasLengthLessThan: function(maxLength) {
    return function(value) {
      if (value.length > maxLength) {
        return 'Please keep value under ' + maxLength + ' characters.';
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

validation.mixin = {
  validate: function(attributes, options) {
    options = options || {};
    var self = this;
    var errors = {};

    if (!this._attributes) {
      throw new Error('Must define an `_attributes` property');
    }

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

module.exports = validation;