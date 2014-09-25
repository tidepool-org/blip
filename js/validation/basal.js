var common = require('./common.js');
var schema = require('./validator/schematron.js');

var basalCommon = {
  deliveryType: schema().in(['scheduled', 'suspend', 'temp']),
  deviceTime: schema().isDeviceTime(),
  duration: schema().ifExists().number().min(0),
  normalEnd: schema().isISODateTime(),
  rate: schema().number().min(0)
};

module.exports = schema(
  common,
  schema(basalCommon),
  {
    suppressed: schema().ifExists().object(basalCommon)
  }
);