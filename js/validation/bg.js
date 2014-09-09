var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    deviceTime: joy().isDeviceTime(),
    value: joy().number()
  }
);
