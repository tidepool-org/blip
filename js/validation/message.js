var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    parentMessage: schema().oneOf(
        schema(schema().in([100])), 
        schema(schema().isId())
    )
  }
);