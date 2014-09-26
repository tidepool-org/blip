var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    deliveryType: schema().in(['scheduled', 'suspend', 'temp']),
    duration: schema().ifExists().number().min(0),
    normalEnd: schema().isISODateTime(),
    value: schema().number().min(0)
  }
);