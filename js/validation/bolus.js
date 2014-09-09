var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    deviceTime: joy().isDeviceTime(),
    value: joy().number().min(0),

    duration: joy().ifExists().number().min(0),
    extended: joy().ifExists().boolean(),
    initialDelivery: joy().ifExists().number().min(0),
    extendedDelivery: joy().ifExists().number().min(0),
    programmed: joy().ifExists().number().min(0),
    recommended: joy().ifExists().number().min(0),
    suspendedAt: joy().ifExists().string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  },
  joy.and(['extended', 'extendedDelivery']),
  joy.with('extended', 'duration')
);