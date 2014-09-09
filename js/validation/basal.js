var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    deliveryType: joy().in(['scheduled', 'suspend', 'temp']),
    deviceTime: joy().isDeviceTime(),
    duration: joy().ifExists().number().min(0),
    normalEnd: joy().isISODateTime(),
    value: joy().number().min(0)
  }
);