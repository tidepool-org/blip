var schema = require('./validator/schematron.js');

module.exports = schema(
  {
    id: schema().isId(),
    joinKey: schema().ifExists().isId(),
    time: schema().ifExists().isISODateTime(),
    type: schema().string().in(['basal', 'bolus', 'cbg', 'message', 'smbg', 'settings', 'wizard'])
  }
);
