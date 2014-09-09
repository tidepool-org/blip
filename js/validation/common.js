var joy = require('./joy/joy.js');

module.exports = joy(
  {
    id: joy().isId(),
    joinKey: joy().isId(),
    normalTime: joy().isISODateTime()
  }
);
