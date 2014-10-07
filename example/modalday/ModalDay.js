var _ = require('lodash');
var d3 = window.d3;
var moment = require('moment');

var SMBGDay = require('./SMBGDay');

d3.chart('ModalDay', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    this.base.append('g').attr('id', 'modalMainGroup');

    var THREE_HRS = 10800000;

    this.layer('backgroundRects', this.base.select('#modalMainGroup').append('g').attr('id', 'modalBackgroundRects'), {
      dataBind: function() {
        var data = [];
        // TODO: could be generalized via options for number of intervals
        for (var i = 0; i < 8; ++i) {
          data.push(i*THREE_HRS);
        }
        return this.selectAll('rect')
          .data(data);
      },
      insert: function() {
        return this.append('rect');
      },
      events: {
        enter: function() {
          var fillClasses = [
            'd3-fill-darkest',
            'd3-fill-dark',
            'd3-fill-lighter',
            'd3-fill-light',
            'd3-fill-lightest',
            'd3-fill-lighter',
            'd3-fill-dark',
            'd3-fill-darker'
          ];
          var range = chart.rectXScale().range();
          var extent = range[1] - range[0];
          var mainMargins = chart.margins().main;
          this.attr({
            'class': function(d, i) {
              return fillClasses[i];
            },
            x: chart.rectXScale(),
            y: chart.margins().main.top,
            width: extent/8,
            height: chart.height - mainMargins.top - mainMargins.bottom
          })
          .classed({
            'd3-rect-fill': true
          });
        }
      }
    });

    this.layer('xAxis', this.base.select('#modalMainGroup').append('g').attr('id', 'modalXAxis'), {
      dataBind: function() {
        var now = new Date();
        var start = d3.time.day.utc.floor(now);
        var end = d3.time.day.utc.ceil(now);
        return this.selectAll('g')
          .data(d3.time.hour.utc.range(start, end, 3));
      },
      insert: function() {
        return this.append('g')
          .attr('class', 'd3-axis d3-top');
      },
      events: {
        enter: function() {
          var xPosition = function(d, i) {
            return chart.rectXScale()(i * THREE_HRS);
          };
          var toEnter = this;
          toEnter.append('text')
            .attr({
              x: function(d, i) {
                // TODO: factor out magic number
                return xPosition(d, i) + 5;
              },
              y: chart.margins().main.top - 5
            })
            .text(function(d) { return moment(d).utc().format('h:mm a'); });
          toEnter.append('line')
            .attr({
              x1: xPosition,
              x2: xPosition,
              // TODO: factor out magic number
              y1: 10,
              y2: chart.margins().main.top
            });
        }
      }
    });

    this.layer('modalDays', this.base.select('#modalMainGroup').append('g').attr('id', 'modalDays'), {
      dataBind: function(data) {
        return this.selectAll('g')
          .data(data, function(d) { return d; });
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        merge: function() {
          var dayCharts = [];
          this.attr('id', function(d) { return d; })
            .attr('class', function(d) {
              return 'modalDay ' + moment(d).utc().format('dddd').toLowerCase();
            })
            .each(function(d) {
              var dayPlot = SMBGDay.create(this, {x: chart.xScale(), y: chart.yScale()}, {
                showingLines: chart.showingLines(),
                smbg: chart.smbgOpts()
              });
              dayPlot.render(chart.data[d]);
            });
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    return this;
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this._bgUnits; }
    this._bgUnits = bgUnits;
    return this;
  },
  margins: function(margins) {
    if (!arguments.length) { return this._margins; }
    this._margins = margins;
    return this;
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
  rectXScale: function(xScale) {
    if (!arguments.length) { return this._rectXScale; }
    var w = this.width;
    var mainMargins = this.margins().main;
    this._rectXScale = xScale.copy().range([
      mainMargins.left,
      w - mainMargins.right
    ]);
    return this;
  },
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    var w = this.width;
    var mainMargins = this.margins().main;
    var smbgOpts = this.smbgOpts();
    this._xScale = xScale.copy().range([
      mainMargins.left + Math.round(smbgOpts.r),
      w - mainMargins.right - Math.round(smbgOpts.r)
    ]);
    this.rectXScale(xScale);
    return this;
  },
  yScale: function(yScale) {
    if (!arguments.length) { return this._yScale; }
    var h = this.height;
    var mainMargins = this.margins().main;
    var smbgOpts = this.smbgOpts();
    this._yScale = yScale.range([
      h - mainMargins.bottom - Math.round(smbgOpts.r),
      mainMargins.top + Math.round(smbgOpts.r)
    ]);
    return this;
  },
  remove: function() {
    this.base.remove();
    return this;
  },
  transform: function(data) {
    this.data = data;
    return _.sortBy(Object.keys(data), function(d) { return d; });
  }
});

var chart;

module.exports = {
  create: function(el, opts) {
    opts = opts || {};
    var defaults = {
      baseMargin: opts.baseMargin || 10,
      brushHeight: 80,
      smbg: {
        r: 5,
        stroke: 3,
      },
      // TODO: replace with non-zero when ready to add stats component
      statsHeight: 0,
      bgDomain: [0,600]
    };
    defaults.margins = {
      main: {
        top: 20 + defaults.baseMargin,
        right: defaults.baseMargin,
        bottom: defaults.baseMargin,
        left: 50 + defaults.baseMargin
      },
      stats: {
        top: defaults.baseMargin/2,
        right: defaults.baseMargin,
        left: defaults.baseMargin,
        bottom: defaults.baseMargin/2
      }
    };
    _.defaults(opts, defaults);

    var yScale = d3.scale.linear()
      .domain(opts.bgDomain);

    var xScale = d3.scale.linear()
      .domain([0, 86400000]);

    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: el.offsetHeight - opts.brushHeight - opts.statsHeight,
        id: 'tidelineModalDay'
      })
      .chart('ModalDay')
      .margins(opts.margins)
      .smbgOpts(opts.smbg)
      .xScale(xScale)
      .yScale(yScale);

    return this;
  },
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.bgClasses(opts.bgClasses)
      .bgUnits(opts.bgUnits)
      .showingLines(opts.showingLines)
      .draw(data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};