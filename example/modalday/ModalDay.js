var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;
var moment = require('moment');

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

    this.layer('yAxis', this.base.select('#modalMainGroup').append('g').attr('id', 'modalYAxis'), {
      dataBind: function() {
        var bgClasses = chart.bgClasses();
        var data = _.map(Object.keys(bgClasses), function(key) {
          return bgClasses[key].boundary;
        });
        return this.selectAll('g')
          .data(data);
      },
      insert: function() {
        return this.append('g')
          .attr('class', 'd3-axis d3-left');
      },
      events: {
        enter: function() {
          var yScale = chart.yScale();
          var toEnter = this;
          // TODO: refactor magic nums, etc.
          toEnter.append('text')
            .attr({
              x: chart.margins().main.left - 10,
              y: function(d) { return yScale(d); }
            })
            .text(function(d) { return d; });

          toEnter.append('line')
            .attr({
              x1: chart.margins().main.left - 8,
              x2: chart.margins().main.left,
              y1: function(d) { return yScale(d); },
              y2: function(d) { return yScale(d); }
            });
        }
      }
    });

    this.layer('yAxisCategories', this.base.select('#modalMainGroup').append('g').attr('id', 'modalYAxisCateogries'), {
      dataBind: function() {
        var bgClasses = chart.bgClasses();
        return this.selectAll('text')
          .data([{
            name: 'low',
            value: bgClasses['very-low'].boundary
          }, {
            name: 'target',
            value: (bgClasses.target.boundary - bgClasses.low.boundary)/2 + bgClasses.low.boundary
          }, {
            name: 'high',
            value: (bgClasses['very-high'].boundary - bgClasses.high.boundary)/2 + bgClasses.high.boundary
          }]);
      },
      insert: function() {
        return this.append('g')
          .attr('class', 'd3-axis d3-left')
          .append('text');
      },
      events: {
        enter: function() {
          var x = chart.margins().main.left/5;
          var y = function(d) { return chart.yScale()(d.value); };
          this.attr({
            x: x,
            y: y,
            transform: function(d) {
              return 'rotate(270 ' + x + ',' + y(d) + ')';
            }
          })
          .text(function(d) { return d.name; })
          // TODO: this is a haaaaack
          // because I set 'text-anchor' to 'end' for the other yAxis stuff
          // but now I want to override
          .style('text-anchor', 'middle');
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
          var emitter = chart.emitter();
          var infoPlot;
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
              if (d3.event.target.nodeName === 'path') {
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
      // TODO: replace with non-zero when ready to add stats component
      statsHeight: 0,
      bgDomain: [0,600],
      clampTop: false
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