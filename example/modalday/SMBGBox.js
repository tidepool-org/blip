var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

d3.chart('SMBGBoxOverlay', {
  initialize: function() {
    var chart = this;

    var boxPlotsGroup = this.base.append('g').attr('id', 'boxPlots');

    this.layer('rangeBoxes', boxPlotsGroup.append('g').attr('id', 'rangeBoxes'), {
      dataBind: function(data) {
        return this.selectAll('rect.rangeBox')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('rect')
          .attr({
            'class': 'rangeBox',
            width: 10
          });
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), yScale = chart.yScale();
          this.attr({
              x: function(d) { return xScale(d.msX) - 5; }
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

    this.layer('meanCircles', boxPlotsGroup.append('g').attr('id', 'meanCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle.meanCircle')
          .data(data, function(d) { return d.msX; });
      },
      insert: function() {
        return this.append('circle')
          .attr({
            'class': 'meanCircle',
            r: 5
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
  remove: function() {
    this.base.select('#boxPlots').remove();
    return this;
  },
  transform: function(data) {
    var timezone = this.timezone();
    var binSize = 108e5; // 3 hrs
    var binned = _.groupBy(data, function(d) {
      var msPer24 = Date.parse(d.normalTime) - moment.utc(d.normalTime).tz(timezone).startOf('day');
      return Math.ceil(msPer24/binSize) * binSize - (binSize/2);
    });
    var binKeys = Object.keys(binned);
    var retData = [];
    for (var i = 0; i < binKeys.length; ++i) {
      retData.push({
        max: d3.max(binned[binKeys[i]], function(d) { return d.value; }),
        mean: _.reduce(binned[binKeys[i]], function(s, n) { return s + n.value; }, 0)/binned[binKeys[i]].length,
        min: d3.min(binned[binKeys[i]], function(d) { return d.value; }),
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
    var defaults = {};
    _.defaults(opts, defaults);

    chart = el.chart('SMBGBoxOverlay')
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