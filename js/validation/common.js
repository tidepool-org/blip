var schema = require('./validator/schematron.js');

module.exports = schema(
  {
    id: schema().isId(),
    joinKey: schema().isId(),
    normalTime: schema().isISODateTime(),
    type: schema().string()
  }
);
