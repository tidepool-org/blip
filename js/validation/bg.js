var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    deviceTime: schema().isDeviceTime(),
    value: schema().number()
  }
);
