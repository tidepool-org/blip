var common = require('./common.js');
var schema = require('./validator/schematron.js');

module.exports = schema(
  common,
  {
    basalSchedules: schema().array(
      schema(
        {
          name: schema().string().minLength(1),
          value: schema().array(
            schema(
              {
                rate: schema().number().min(0),
                start: schema().number().min(0).max(86400000)
              }
            )
          )
        }
      )
    ),
    bgTarget: schema().array(
      schema(
        {
          amount: schema().number(),
          start: schema().number().min(0).max(86400000)
        }
      )
    ),
    carbRatio: schema().array(
      schema(
        {
          amount: schema().number().min(0),
          start: schema().number().min(0).max(86400000)
        }
      )
    ),
    deviceTime: schema().isDeviceTime(),
    insulinSensitivity: schema().array(
      schema(
        {
          amount: schema().number().min(0),
          start: schema().number().min(0).max(86400000)
        }
      )
    )
  }
);