var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    basalSchedules: joy().array(
      joy(
        {
          name: joy().string().minLength(1),
          value: joy().array(
            joy(
              {
                rate: joy().number().min(0),
                start: joy().number().min(0).max(86400000)
              }
            )
          )
        }
      )
    ),
    bgTarget: joy().array(
      joy(
        {
          amount: joy().number(),
          start: joy().number().min(0).max(86400000)
        }
      )
    ),
    carbRatio: joy().array(
      joy(
        {
          amount: joy().number().min(0),
          start: joy().number().min(0).max(86400000)
        }
      )
    ),
    deviceTime: joy().isDeviceTime(),
    insulinSensitivity: joy().array(
      joy(
        {
          amount: joy().number().min(0),
          start: joy().number().min(0).max(86400000)
        }
      )
    )
  }
);