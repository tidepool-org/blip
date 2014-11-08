var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

d3.chart('SMBGInfo', {
  initialize: function() {
    var chart = this;

    var xPosition = function(d) {
      var timezone = chart.timezone();
      var msPer24Pos = Date.parse(d.normalTime) - moment.utc(d.normalTime).tz(timezone).startOf('day');
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
          var toEnter = this;
          toEnter.append('rect')
            .attr({
              x: function(d) {
                return xPosition(d) - 15;
              },
              y: function(d) {
                return yPosition(d) + 10;
              },
              width: 30,
              height: 20,
              fill: '#FFFFFF',
              opacity: 0.75
            });

          toEnter.append('text')
            .attr({
              x: xPosition,
              y: function(d) {
                return yPosition(d) + 25;
              }
            })
            .text(function(d) { return d.value; });
        }
      }
    });
  },
  smbgOpts: function(smbgOpts) {
    if (!arguments.length) { return this._smbgOpts; }
    this._smbgOpts = smbgOpts;
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
    var defaults = {};
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .chart('SMBGInfo')
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