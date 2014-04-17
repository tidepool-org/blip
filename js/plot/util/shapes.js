var d3 = require('../../lib/').d3;

var log = require('../../lib/').bows('Shapes');

var shapes = {
  tooltipPolygon: function(opts) {
    opts = opts || {};
    if (!(opts.w && opts.h && opts.t && opts.k)) {
      log('Sorry, I need w, h, t, and k variables to generate a tooltip polygon.');
    }

    var w = opts.w, h = opts.h, t = opts.t, k = opts.k;

    function pointString(x,y) {
      return x + ',' + y + ' ';
    }

    return pointString(0,0) +
      pointString((t/2), k) +
      pointString((w-(3/2*t)), k) +
      pointString((w-(3/2*t)), (k+h)) +
      pointString((0-(3/2*t)), (k+h)) +
      pointString((0-(3/2*t)), k) +
      pointString((0-(t/2)), k) + '0,0';
  }
};

module.exports = shapes;