var format = {

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
  }

};

module.exports = format;
