var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

d3.chart('SMBGDay', {
  initialize: function() {
    var chart = this;

    var xPosition = function(d) {
      var msPer24Pos = Date.parse(d.normalTime) - d3.time.day.utc.floor(new Date(d.normalTime));
      return chart.xScale()(msPer24Pos);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    this.layer('smbgCircles', this.base.append('g').attr('class', 'smbgCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle')
          .data(data, function(d) { return d.id; });
      },
      insert: function() {
        return this.append('circle')
          .attr('class', 'smbgCircle');
      },
      events: {
        enter: function() {
          this.attr({
            cx: xPosition,
            cy: yPosition,
            r: chart.smbgOpts().r
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });

    this.layer('smbgLines', this.base.append('g').attr('class', 'smbgLines'), {
      dataBind: function(data) {
        var pathData = _.map(_.sortBy(data, function(d) { return d.normalTime; }), function(d) {
          return [
            xPosition(d),
            yPosition(d)
          ];
        });
        return this.selectAll('path')
          .data([pathData]);
      },
      insert: function() {
        return this.append('path')
          .attr('class', 'smbgPath');
      },
      events: {
        enter: function() {
          var line = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate('linear');
          this.attr({
            d: function(d) {
              return line(d);
            },
            'stroke-width': chart.smbgOpts().stroke,
            visibility: chart.showingLines() ? 'visible': 'hidden'
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  showingLines: function(showingLines) {
    if (!arguments.length) { return this._showingLines; }
    this._showingLines = showingLines;
    return this;
  },
  smbgOpts: function(smbgOpts) {
    if (!arguments.length) { return this._smbgOpts; }
    this._smbgOpts = smbgOpts;
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
      smbg: {
        r: 5,
        stroke: 3
      }
    };
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .chart('SMBGDay')
      .showingLines(opts.showingLines)
      .smbgOpts(opts.smbg)
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