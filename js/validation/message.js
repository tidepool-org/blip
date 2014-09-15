var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    parentMessage: schema().ifExists().string(),
    utcTime: schema().isISODateTime()
  }
);