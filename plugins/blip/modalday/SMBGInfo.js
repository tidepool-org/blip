var _ = require('lodash');
var d3 = window.d3;

var tideline = require('../../../js/index');
var dt = tideline.data.util.datetime;

d3.chart('SMBGInfo', {
  initialize: function() {
    var chart = this;

    var xPosition = function(d) {
      var msPer24Pos = dt.getMsPer24(d.normalTime, chart.timezone());
      return chart.xScale()(msPer24Pos);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    this.layer('smbgInfo', this.base.append('g').attr('class', 'smbgInfo'), {
      dataBind: function(data) {
        return this.selectAll('g')
          .data(data, function(d) { return d.id; });
      },
      insert: function() {
        return this.append('g').attr('class', 'smbgInfoGroup');
      },
      events: {
        enter: function() {
          var opts = chart.opts().infoRects;
          var toEnter = this;
          toEnter.append('rect')
            .attr({
              x: function(d) {
                return xPosition(d) - opts.width/2;
              },
              y: function(d) {
                return yPosition(d) + opts.height/2;
              },
              width: opts.width,
              height: opts.height
            });

          toEnter.append('text')
            .attr({
              x: xPosition,
              y: function(d) {
                return yPosition(d) + chart.opts().textShift.y;
              }
            })
            .text(function(d) { return d.value; });
        }
      }
    });
  },
  opts: function(opts) {
    if (!arguments.length) { return this._opts; }
    this._opts = opts;
    return this;
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
        infoRects: {
          height: 20,
          width: 30
        },
        textShift: {
          y: 25
        }
      }
    };
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .chart('SMBGInfo')
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
  }
};