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
    bgTarget: schema().array(schema().oneOf(
      schema(
          {
            low: schema().number(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().banned()
          }
        ),
      schema(
          {
            low: schema().number(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        ),
      schema(
          {
            low: schema().banned(),
            high: schema().banned(),
            range: schema().number(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        ),
      schema(
          {
            low: schema().banned(),
            high: schema().number(),
            range: schema().banned(),
            start: schema().number().min(0).max(86400000),
            target: schema().number()
          }
        )
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