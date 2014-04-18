var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var log = require('../../lib/').bows('Shapes');

var shapes = {
  mirrorImageY: function(pointsString) {
    var points = pointsString.split(' ');
    points = _.map(points, function(point) {
      var values = point.split(',');
      var x = parseInt(values[0], 10);
      return -x + ',' + values[1] + ' ';
    });
    return _.reduce(points, function(x,y) { return x + y; }).trim();
  },

  mirrorImageX: function(pointsString) {
    var points = pointsString.split(' ');
    points = _.map(points, function(point) {
      var values = point.split(',');
      var y = parseInt(values[1], 10);
      return values[0] + ',' + -y + ' ';
    });
    return _.reduce(points, function(x,y) { return x + y; }).trim();
  },

  tooltipPolygon: function(opts) {
    opts = opts || {};
    if (!((opts.w != null) && (opts.h != null) && (opts.t != null) && (opts.k != null))) {
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