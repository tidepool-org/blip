var schema = require('./validator/schematron.js');

module.exports = schema(
  {
    id: schema().isId(),
    joinKey: schema().ifExists().isId(),
    normalTime: schema().isISODateTime(),
    time: schema().isISODateTime(),
    type: schema().string().in(['basal', 'bolus', 'cbg', 'message', 'smbg', 'settings', 'wizard'])
  }
);
