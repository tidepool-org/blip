var common = require('./common.js');
var joy = require('./joy/joy.js');

module.exports = joy(
  common,
  {
    parentMessage: joy().ifExists().string(),
    utcTime: joy().isISODateTime()
  }
);