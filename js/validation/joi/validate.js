var _ = require('lodash');
var Joi = require('joi');
var schemas = require('./schemas');

module.exports = {
  validateOne: function(datum, result) {
    result = result || {valid: [], invalid: []};
    function validate(schema) {
      Joi.validate(datum, schema.concat(schemas.common),
        {
          abortEarly: false,
          convert: false,
          allowUnknown: true
        },
      function(err, value) {
        if (err != null) {
          console.log('Oh noes! This is wrong:\n', value);
          console.log('\nError Message:', err.message, '\n');
          value.errorMessage = err.message;
          result.invalid.push(value);
        }
        result.valid.push(value);
      });
    }
    validate(schemas[datum.type]);
  },
  validateAll: function(data) {
    console.time('Joi');
    var result = {valid: [], invalid: []};
    for (var i = 0; i < data.length; ++i) {
      this.validateOne(data[i], result);
    }
    console.timeEnd('Joi');

    return result;

  }
};
