var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;
var moment = require('moment');

var SMBGBox = require('./SMBGBox');
var SMBGDay = require('./SMBGDay');
var SMBGInfo = require('./SMBGInfo');

d3.chart('ModalDay', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    this.base.append('g').attr('id', 'modalMainGroup');

    this.base.append('g').attr('id', 'modalHighlightGroup');

    var THREE_HRS = 10800000;

    var dayCharts = {};

    this.layer('backgroundRects', this.base.select('#modalMainGroup').append('g').attr('id', 'modalBackgroundRects'), {
      dataBind: function() {
        var data = [];
        // TODO: could be generalized via options for number of intervals
        for (var i = 0; i < 8; ++i) {
          data.push(i*THREE_HRS);
        }
        return this.selectAll('g')
          .data(data);
      },
      insert: function() {
        return this.append('g');
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
          var yScale = chart.yScale();
          var toEnter = this;
          var mainMargins = chart.margins().main;
          var usableHeight = chart.height - mainMargins.top - mainMargins.bottom;
          toEnter.append('rect')
            .attr({
              'class': function(d, i) {
                return fillClasses[i];
              },
              x: chart.rectXScale(),
              y: chart.margins().main.top,
              width: extent/8,
              height: yScale(180) - mainMargins.top
            })
            .classed({
              'd3-rect-fill': true
            });
          toEnter.append('rect')
            .attr({
              'class': function(d, i) {
                return fillClasses[i];
              },
              x: chart.rectXScale(),
              y: yScale(180),
              width: extent/8,
              height: yScale(80) - yScale(180)
            })
            .classed({
              'd3-rect-fill': true,
              'd3-rect-fill-faded': true
            });
          toEnter.append('rect')
            .attr({
              'class': function(d, i) {
                return fillClasses[i];
              },
              x: chart.rectXScale(),
              y: yScale(80),
              width: extent/8,
              height: chart.height - mainMargins.bottom - yScale(80)
            })
            .classed({
              'd3-rect-fill': true
            });
        }
      }
    });

    this.layer('xAxis', this.base.select('#modalMainGroup').append('g')
      .attr('id', 'modalXAxis')
      .append('g')
      .attr('class', 'd3-axis d3-top'), {
      dataBind: function() {
        var now = new Date();
        var start = d3.time.day.utc.floor(now);
        var end = d3.time.day.utc.ceil(now);
        var data;
        if (chart.grouped()) {
          data = [
            '12 - 3 am',
            '3 - 6 am',
            '6 - 9 am',
            '9 am - 12 pm',
            '12 - 3 pm',
            '3 - 6 pm',
            '6 - 9 pm',
            '9 pm - 12 am'
          ];
        }
        else {
          data = d3.time.hour.utc.range(start, end, 3).map(function (d) {
            return moment(d).utc().format('h:mm a');
          });
        }
        return this.selectAll('text')
          .data(data);
      },
      insert: function() {
        return this.append('text')
          .attr({
            y: chart.margins().main.top -5
          });
      },
      events: {
        merge: function() {
          var grouped = chart.grouped();
          var xPosition = function(d, i) {
            return chart.rectXScale()(i * THREE_HRS);
          };
          var half3HrWidth = (xPosition(null, 1) - xPosition(null, 0))/2;
          this.attr({
              'text-anchor': grouped ? 'middle' : 'start',
              x: function(d, i) {
                  if (grouped) {
                    return xPosition(d, i) + half3HrWidth;
                  }
                  // TODO: factor out magic number
                  return xPosition(d, i) + 5;
                },
              'font-style': grouped ? 'italic' : 'normal'
            })
            .text(function(d) { return d; });
        }
      }
    });

    this.layer('yAxis', this.base.select('#modalMainGroup').append('g').attr('id', 'modalYAxis'), {
      dataBind: function() {
        return this.selectAll('g')
          .data([100,200,300]);
      },
      insert: function() {
        return this.append('g')
          .attr('class', 'd3-axis d3-left');
      },
      events: {
        enter: function() {
          var yScale = chart.yScale();
          var toEnter = this;
          var mainMargins = chart.margins().main;
          // TODO: refactor magic nums, etc.
          toEnter.append('text')
            .attr({
              x: mainMargins.left - 10,
              y: function(d) { return yScale(d); }
            })
            .text(function(d) { return d; });

          toEnter.append('line')
            .attr({
              x1: mainMargins.left - 8,
              x2: mainMargins.left,
              y1: function(d) { return yScale(d); },
              y2: function(d) { return yScale(d); }
            });
        }
      }
    });

    this.layer('modalDays', this.base.select('#modalMainGroup').append('g').attr('id', 'modalDays'), {
      dataBind: function(data) {
        return this.selectAll('g.modalDay')
          .data(data, function(d) { return d; });
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        enter: function() {
          if (chart.boxOverlay()) {
            chart.boxPlots.render(chart.rawData);
          }
          var emitter = chart.emitter();
          var infoPlot;
          this.attr('id', function(d) { return d; })
            .attr('class', function(d) {
              return 'modalDay ' + d3.time.format.utc('%A')(new Date(d)).toLowerCase();
            })
            .each(function(d) {
              var dayPlot = SMBGDay().create(this, {x: chart.xScale(), y: chart.yScale()}, {
                smbg: chart.smbgOpts()
              });
              dayPlot.render(chart.data[d], {
                grouped: chart.grouped(),
                showingLines: chart.showingLines()
              });
              dayCharts[d] = dayPlot;
            })
            .on('click', function(d) {
              emitter.emit('selectDay', d);
            })
            .on('mouseover', function(d) {
              d3.select(this).classed('highlight', true);
              d3.select(this).selectAll('path')
                .attr('stroke-width', chart.smbgOpts().stroke * 1.5);
              d3.select(this).selectAll('circle')
                .attr('r', chart.smbgOpts().r * 1.5);
              if (d3.event.target.nodeName === 'path' && !chart.grouped()) {
                var mainMargins = chart.margins().main;
                d3.select(this).append('text')
                  .attr({
                    x: chart.width - mainMargins.right - 10,
                    y: mainMargins.top + 30,
                    'class': 'smbgDayLabel'
                  })
                  .text(moment(d).format('dddd, MMMM Do'));
                infoPlot = SMBGInfo.create(this, {x: chart.xScale(), y: chart.yScale()});
                infoPlot.render(chart.data[d]); 
              }
              var copy = d3.select(this)[0][0];
              d3.select(this).remove();
              var first = document.getElementById('modalHighlightGroup').firstChild;
              document.getElementById('modalHighlightGroup').insertBefore(copy, first);  
            })
            .on('mouseout', function(d) {
              d3.select(this).classed('highlight', false);
              d3.select(this).selectAll('path')
                .attr('stroke-width', chart.smbgOpts().stroke);
              d3.select(this).selectAll('circle')
                .attr('r', chart.smbgOpts().r);
              d3.select(this).selectAll('.smbgInfo').remove();
              d3.select(this).selectAll('.smbgDayLabel').remove();
              var copy = d3.select(this)[0][0];
              d3.select(this).remove();
              document.getElementById('modalDays').appendChild(copy);
            });
        },
        update: function() {
          if (chart.boxOverlay()) {
            chart.boxPlots.render(chart.rawData);
          }
          this.each(function(d) {
            var day = dayCharts[d];
            day.render(chart.data[d], {
              grouped: chart.grouped(),
              showingLines: chart.showingLines()
            });
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
  boxOverlay: function(boxOverlay) {
    if (!arguments.length) { return this._boxOverlay; }
    if (boxOverlay && !this.boxPlots) {
      this.boxPlots = SMBGBox.create(this.base.select('#modalMainGroup'), {
        x: this.xScale(),
        y: this.yScale()
      });
    }
    else if (!boxOverlay && this.boxPlots) {
      this.boxPlots.destroy();
      this.boxPlots = null;
    }
    this._boxOverlay = boxOverlay;
    return this;
  },
  grouped: function(grouped) {
    if (!arguments.length) { return this._grouped; }
    this._grouped = grouped;
    return this;
  },
  emitter: function(emitter) {
    if (!arguments.length) { return this._emitter; }
    this._emitter = emitter;
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
      mainMargins.left + Math.round(smbgOpts.maxR),
      w - mainMargins.right - Math.round(smbgOpts.maxR)
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
      h - mainMargins.bottom - Math.round(smbgOpts.maxR),
      mainMargins.top + Math.round(smbgOpts.maxR)
    ]);
    return this;
  },
  remove: function() {
    this.base.remove();
    return this;
  },
  transform: function(data) {
    this.rawData = data;
    this.data = _.groupBy(data, function(d) {
      return d.normalTime.slice(0,10);
    });
    return _.sortBy(Object.keys(this.data), function(d) { return d; });
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
        maxR: 7.5,
        r: 5,
        stroke: 3,
        units: 'mg/dL'
      },
      statsHeight: 80,
      bgDomain: [0,600],
      clampTop: false
    };
    defaults.margins = {
      main: {
        top: 20 + defaults.baseMargin,
        right: defaults.baseMargin,
        bottom: defaults.baseMargin,
        left: 30 + defaults.baseMargin
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
      .clamp(opts.clampTop)
      .domain(opts.clampTop ? [opts.bgDomain[0], 400] : opts.bgDomain);

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
      .emitter(this.emitter)
      .margins(opts.margins)
      .smbgOpts(opts.smbg)
      .xScale(xScale)
      .yScale(yScale);

    return this;
  },
  emitter: new EventEmitter(),
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {
      boxOverlay: true
    };
    _.defaults(opts, defaults);

    chart.bgClasses(opts.bgClasses)
      .bgUnits(opts.bgUnits)
      .boxOverlay(opts.boxOverlay)
      .grouped(opts.grouped)
      .showingLines(opts.showingLines)
      .draw(data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};