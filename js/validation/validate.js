var _ = require('lodash');
var async = require('async');
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
  validateOne: function(datum, cb) {
    var handler = schemas[datum.type];
    if (handler == null) {
      datum.errorMessage = util.format('Unknown data.type[%s]', datum.type);
      cb(new Error(datum.errorMessage), datum);
    } else {
      try {
        handler(datum);
      } catch (e) {
        console.log('Oh noes! This is wrong:\n', datum);
        console.log(util.format('Error Message: %s%s', datum.type, e.message));
        datum.errorMessage = e.message;
        result.invalid.push(datum);
        return cb(e, datum);
      }
      cb(null, datum);
    }
  },
  validateAll: function(data, cb) {
    console.time('Pure');
    async.map(data, this.validateOne.bind(this), function(err, results) {
      console.timeEnd('Pure');
      cb(err, results);
    });
  }
};
