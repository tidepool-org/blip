var common = require('./common.js');
var schema = require('./validator/schematron.js');

var bolusCommon = schema(
  {
    deviceTime: schema().isDeviceTime(),
  }
);

module.exports = schema(schema().oneOf(
  schema(
      common,
      bolusCommon,
      {
        normal: schema().number().min(0),
        expectedNormal: schema().ifExists().number().min(0),
        duration: schema().banned(),
        extended: schema().banned(),
        expectedExtended: schema().banned(),
        subType: schema().string().in(['normal'])
      }
    ),
  schema(
      common,
      bolusCommon,
      {
        duration: schema().number().min(0),
        extended: schema().number().min(0),
        expectedExtended: schema().ifExists().number().min(0),
        normal: schema().ifExists().number().min(0),
        expectedNormal: schema().ifExists().number().min(0),
        subType: schema().string().in(['square', 'dual/square'])
      },
      schema.with('expectedNormal', 'normal')
    )
  )
);