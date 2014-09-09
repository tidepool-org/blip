var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    bolus: joy().object(),
    carbs: joy().ifExists().object({ value: joy().number().min(0) }),
    deviceTime: joy().isDeviceTime()
  }
);