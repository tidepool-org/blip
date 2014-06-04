var moment = require('moment');

module.exports = {
  addInterval: function(datetime, duration) {
    duration = moment.duration(duration);
    return moment(datetime).add(duration);
  }
};