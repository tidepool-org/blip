var d3 = require('../../lib/').d3;

var format = {

  MS_IN_24: 86400000,

  fixFloatingPoint: function(n) {
    return parseFloat(n.toFixed(3));
  },

  percentage: function(f) {
    if (isNaN(f)) {
      return '-- %';
    }
    else {
      return parseInt(Math.round(f * 100), 10) + '%';
    }
  },

  millisecondsAsTimeOfDay: function(i) {
    var d = new Date(i);
    return d3.time.format.utc('%-I:%M %p')(d);
  }

};

module.exports = format;
