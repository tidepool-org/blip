var schema = require('./validator/schematron.js');

module.exports = schema(
  {
    id: schema().isId(),
    joinKey: schema().ifExists().isId(),
    normalTime: schema().ifExists().isISODateTime(),
    type: schema().string()
  }
);
