var Joi = require('joi');
var schema = require('./schema');

module.exports = {
  validateOne: function(datum, result) {
    result = result || {valid: [], invalid: []};
    Joi.validate(datum, schema, 
      {
        abortEarly: false,
        convert: false,
        allowUnknown: true
      },
      function(err, value) {
      if (err != null) {
        console.log('Oh noes! This is wrong:\n', value);
        console.log('\nError Message:', err.message, '\n');
        result.invalid.push(value);
        return;
      }
      result.valid.push(value);
    });
  },
  validateAll: function(data) {
    var result = {valid: [], invalid: []};
    for (var i = 0; i < data.length; ++i) {
      this.validateOne(data[i], result);
    }
    return result;
  }
};
