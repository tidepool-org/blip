var format = {

  fixFloatingPoint: function(n) {
    return parseFloat(n.toFixed(3));
  },

  percentage: function(f) {
    if (isNaN(f)) {
      return '-- %';
    }
    else {
      return parseInt(f.toFixed(2) * 100, 10) + '%';
    }
  }

};

module.exports = format;