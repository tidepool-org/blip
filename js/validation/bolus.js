var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    deviceTime: schema().isDeviceTime(),
    value: schema().number().min(0),
    duration: schema().ifExists().number().min(0),
    extended: schema().ifExists().boolean(),
    initialDelivery: schema().ifExists().number().min(0),
    extendedDelivery: schema().ifExists().number().min(0),
    programmed: schema().ifExists().number().min(0),
    recommended: schema().ifExists().number().min(0),
    suspendedAt: schema().ifExists().string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  },
  schema.and(['extended', 'extendedDelivery']),
  schema.with('extended', 'duration')
);