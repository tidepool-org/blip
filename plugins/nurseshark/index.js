var _ = require('lodash');

module.exports = {
  processData: function(data) {
    if (!(data && data.length >= 0 && Array.isArray(data))) {
      throw new Error('An array is required.');
    }
    data = _.map(data, function(d) {
      return _.cloneDeep(d);
    });
    return data;
  }
};