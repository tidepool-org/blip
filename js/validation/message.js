var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    parentMessage: schema().oneOf(
        schema(schema().isNull()), 
        schema(schema().isId())
    )
  }
);