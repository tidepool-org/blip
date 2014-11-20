var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

var THREE_HRS = 10800000;

d3.chart('SMBGBoxOverlay', {
  initialize: function() {
    var chart = this;

    var boxPlotsGroup = this.base.insert('g', '#modalDays').attr('id', 'overlayUnderneath');
    var meanCirclesGroup = this.base.append('g').attr('id', 'overlayOnTop');

    this.layer('rangeBoxes', boxPlotsGroup.append('g').attr('id', 'rangeBoxes'), {
      dataBind: function(data) {
        return this.selectAll('rect.rangeBox')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('rect')
          .attr({
            'class': 'rangeBox',
            width: chart.opts().rectWidth
          });
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          var halfRect = chart.opts().rectWidth/2;
          this.attr({
              x: function(d) { return xScale(d.msX) - halfRect; }
            });
        },
        merge: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              y: function(d) { return yScale(d.max); },
              height: function(d) {
                return yScale(d.min) - yScale(d.max);
              }
            });
        }
      }
    });

    this.layer('meanCircles', meanCirclesGroup.append('g').attr('id', 'meanCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle.meanCircle')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('circle')
          .attr({
            'class': 'meanCircle',
            r: chart.opts().rectWidth/2
          });
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              cx: function(d) { return xScale(d.msX); }
            });
        },
        merge: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              cy: function(d) { return yScale(d.mean); },
            });
        }
      }
    });
  },
  opts: function(opts) {
    if (!arguments.length) { return this._opts; }
    this._opts = opts;
    return this;
  },
  remove: function() {
    this.base.select('#overlayUnderneath').remove();
    this.base.select('#overlayOnTop').remove();
    return this;
  },
  transform: function(data) {
    var timezone = this.timezone();
    var binSize = THREE_HRS;
    var binned = _.groupBy(data, function(d) {
      var msPer24 = Date.parse(d.normalTime) - moment.utc(d.normalTime).tz(timezone).startOf('day');
      return Math.ceil(msPer24/binSize) * binSize - (binSize/2);
    });
    var binKeys = Object.keys(binned);
    var retData = [];
    var value = function(d) { return d.value; };
    var reduceForMean = function(s, n) { return s + n.value; };
    for (var i = 0; i < binKeys.length; ++i) {
      retData.push({
        max: d3.max(binned[binKeys[i]], value),
        mean: _.reduce(binned[binKeys[i]], reduceForMean, 0)/binned[binKeys[i]].length,
        min: d3.min(binned[binKeys[i]], value),
        msX: parseInt(binKeys[i], 10),
        values: binned[binKeys[i]]
      });
    }
    return retData;
  },
  timezone: function(timezone) {
    if (!arguments.length) { return this._timezone; }
    this._timezone = timezone;
    return this;
  },
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    this._xScale = xScale;
    return this;
  },
  yScale: function(yScale) {
    if (!arguments.length) { return this._yScale; }
    this._yScale = yScale;
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, scales, opts) {
    opts = opts || {};
    var defaults = {
      opts: {
        rectWidth: 18
      }
    };
    _.defaults(opts, defaults);

    chart = el.chart('SMBGBoxOverlay')
      .opts(opts.opts)
      .timezone(opts.timezone)
      .xScale(scales.x)
      .yScale(scales.y);

    return this;
  },
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.draw(data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};