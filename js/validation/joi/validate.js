var _ = require('lodash');
var async = require('async');
var Joi = require('joi');
var schemas = require('./schemas');

module.exports = {
  validateOne: function(datum, callback) {
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
                       callback(err, value);
                     }
                     callback(null, value);
                   });
    }
    validate(schemas[datum.type]);
  },
  validateAll: function(data, cb) {
    var that = this;
    async.map(data, that.validateOne, cb);
  }
};