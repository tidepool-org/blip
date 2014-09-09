var _ = require('lodash');
var util = require('util');

var joy = require('./joy/joy.js');

var schemas = {
  'basal-rate-segment': require('./basal'),
  bolus: require('./bolus'),
  cbg: require('./bg'),
  common: require('./common'),
  deviceMeta: joy(),
  message: require('./message'),
  settings: require('./settings'),
  smbg: require('./bg'),
  wizard: require('./wizard')
};

module.exports = {
  validateOne: function(datum, result) {
    result = result || {valid: [], invalid: []};

    var handler = schemas[datum.type];
    if (handler == null) {
      datum.errorMessage = util.format('Unknown data.type[%s]', datum.type);
      result.invalid.push(datum);
    } else {
      try {
        handler(datum);
      } catch (e) {
        console.log('Oh noes! This is wrong:\n', datum);
        console.log(util.format('Error Message: %s%s', datum.type, e.message));
        datum.errorMessage = e.message;
        result.invalid.push(datum);
        return;
      }
      result.valid.push(datum);
    }
  },
  validateAll: function(data) {
    console.time('Pure');
    var result = {valid: [], invalid: []};
    for (var i = 0; i < data.length; ++i) {
      this.validateOne(data[i], result);
      if (result.invalid.length > 0) {
        break;
      }
    }
    console.timeEnd('Pure');
    return result;
  }
};
