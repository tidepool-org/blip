var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    bolus: schema().object(),
    carbs: schema().ifExists().object({ value: schema().number().min(0) }),
    deviceTime: schema().isDeviceTime()
  }
);