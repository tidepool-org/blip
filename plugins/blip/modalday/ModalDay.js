require('script!d3/d3.min.js');
require('script!d3.chart/d3.chart.min.js');

var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;
var moment = require('moment-timezone');

var tideline = require('../../../js/index');
var dt = tideline.data.util.datetime;
var format = tideline.data.util.format;

var smbgBox = require('./SMBGBox');
var smbgDay = require('./SMBGDay');
var smbgInfo = require('./SMBGInfo');

var THREE_HRS = 10800000;
var chart;

d3.chart('ModalDay', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    this.base.append('g').attr('id', 'modalMainGroup');

    this.base.append('g').attr('id', 'modalHighlightGroup');

    var dayCharts = {};

    this.layer('backgroundRects', this.base.select('#modalMainGroup').append('g').attr('id', 'modalBackgroundRects'), {
      dataBind: function() {
        var data = [];
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
          var range = chart.xScale().range();
          var yScale = chart.yScale();
          var toEnter = this;
          var mainMargins = chart.margins().main;
          var usableHeight = chart.height - mainMargins.top - mainMargins.bottom;
          var bgClasses = chart.bgClasses();
          var xPosition = function(d, i) {
            if (i === 0) {
              return mainMargins.left;
            }
            else {
              return chart.xScale()(d);
            }
          };
          var rectWidth = function(d, i) {
            // rectangles are three hours wide, so we get width of one from dividing total width by eight
            var baseWidth = (range[1] - range[0])/8;
            var bigR = chart.smbgOpts().maxR;
            if (i === 0 || i === 7) {
              return baseWidth + bigR;
            }
            else {
              return baseWidth;
            }
          };
          toEnter.append('rect')
            .attr({
              'class': function(d, i) {
                return fillClasses[i];
              },
              x: xPosition,
              y: chart.margins().main.top,
              width: rectWidth,
              height: yScale(bgClasses.target.boundary) - mainMargins.top
            })
            .classed({
              'd3-rect-fill': true
            });
          toEnter.append('rect')
            .attr({
              'class': function(d, i) {
                return fillClasses[i];
              },
              x: xPosition,
              y: yScale(bgClasses.target.boundary),
              width: rectWidth,
              height: yScale(bgClasses.low.boundary) - yScale(bgClasses.target.boundary)
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
              x: xPosition,
              y: yScale(bgClasses.low.boundary),
              width: rectWidth,
              height: chart.height - mainMargins.bottom - yScale(bgClasses.low.boundary)
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
        // this is fine to leave with no arbitrary timezone
        // it's only generating text for x-axis tick labels
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
            return d3.time.format.utc('%-I:%M %p')(d).toLowerCase();
          });
        }
        return this.selectAll('text')
          .data(data);
      },
      insert: function() {
        return this.append('text')
          .attr({
            y: chart.margins().main.top - chart.tickShift().x
          });
      },
      events: {
        merge: function() {
          var grouped = chart.grouped();
          var xPosition = function(d, i) {
            return chart.xScale()(i * THREE_HRS);
          };
          var half3HrWidth = (xPosition(null, 1) - xPosition(null, 0))/2;
          this.attr({
              'text-anchor': grouped ? 'middle' : 'start',
              x: function(d, i) {
                  if (grouped) {
                    return xPosition(d, i) + half3HrWidth;
                  }
                  return xPosition(d, i) + chart.tickShift().x;
                }
            })
            .text(function(d) { return d; });
        }
      }
    });

    this.layer('yAxis', this.base.select('#modalMainGroup').append('g').attr('id', 'modalYAxis'), {
      dataBind: function() {
        var bgClasses = chart.bgClasses();
        return this.selectAll('g')
          .data([bgClasses.low.boundary,bgClasses.target.boundary,bgClasses['very-high'].boundary]);
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
          toEnter.append('text')
            .attr({
              x: mainMargins.left - chart.tickShift().y,
              y: function(d) { return yScale(d); }
            })
            .text(function(d) {
              if (chart.smbgOpts().units === 'mmol/L') {
                return format.tooltipBG({value: d}, 'mmol/L');
              }
              return d;
            });

          toEnter.append('line')
            .attr({
              x1: mainMargins.left - chart.tickLength().y,
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
          var emitter = chart.emitter(), timezone = chart.timezone();
          var infoPlot;
          this.attr('id', function(d) { return d; })
            .attr('class', function(d) {
              return 'modalDay ' + dt.weekdayLookup(moment(d).tz(timezone).day());
            })
            .each(function(d) {
              var dayPlot = smbgDay().create(this, {x: chart.xScale(), y: chart.yScale()}, {
                bgClasses: chart.bgClasses(),
                smbg: chart.smbgOpts(),
                timezone: chart.timezone()
              });
              dayPlot.render(chart.data[d], {
                grouped: chart.grouped(),
                showingLines: chart.showingLines()
              });
              dayCharts[d] = dayPlot;
            })
            .on('dblclick', function(d) {
              var utcDay = moment(d).tz(timezone).startOf('day').add(12, 'hours').toISOString();
              emitter.emit('selectDay', utcDay);
            })
            .on('mouseover', function(d) {
              var smbgOpts = chart.smbgOpts();
              d3.select(this).classed('highlight', true);
              d3.select(this).selectAll('.smbgPath')
                .attr('stroke-width', smbgOpts.stroke * smbgOpts.strokeMultiplier);
              d3.select(this).selectAll('circle')
                .attr('r', smbgOpts.r * smbgOpts.radiusMultiplier);
              if (d3.event.target.nodeName === 'path' && !chart.grouped()) {
                var labelMargins = chart.margins().highlightLabel;
                d3.select(this).append('text')
                  .attr({
                    x: labelMargins.x,
                    y: labelMargins.y,
                    'class': 'smbgDayLabel'
                  })
                  .text(moment(d).tz(timezone).format('dddd, MMMM D'));
                infoPlot = smbgInfo.create(this, {
                  x: chart.xScale(), y: chart.yScale()
                }, {
                  timezone: chart.timezone(),
                  bgUnits: chart.smbgOpts().units
                });
                infoPlot.render(chart.data[d]);
              }
              var copy = d3.select(this)[0][0];
              d3.select(this).remove();
              var first = document.getElementById('modalHighlightGroup').firstChild;
              document.getElementById('modalHighlightGroup').insertBefore(copy, first);
            })
            .on('mouseout', function(d) {
              d3.select(this).classed('highlight', false);
              d3.select(this).selectAll('.smbgPath')
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
          if (chart.boxOverlay()) {
            chart.boxPlots.render(chart.rawData);
          }
          this.remove();
        }
      }
    });
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this._bgUnits; }
    this._bgUnits = bgUnits;
    return this;
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    return this;
  },
  boxOverlay: function(boxOverlay) {
    if (!arguments.length) { return this._boxOverlay; }
    if (boxOverlay && !this.boxPlots) {
      this.boxPlots = smbgBox.create(this.base.select('#modalMainGroup'), {
        x: this.xScale(),
        y: this.yScale()
      }, {
        bgClasses: chart.bgClasses(),
        bgUnits: chart.bgUnits(),
        timezone: this.timezone()
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
  tickLength: function(tickLength) {
    if (!arguments.length) { return this._tickLength; }
    this._tickLength = tickLength;
    return this;
  },
  tickShift: function(tickShift) {
    if (!arguments.length) { return this._tickShift; }
    this._tickShift = tickShift;
    return this;
  },
  timezone: function(timezone) {
    if (!arguments.length) { return this._timezone; }
    this._timezone = timezone;
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
    return this;
  },
  yScale: function(yScale) {
    if (!arguments.length) { return this._yScale; }
    var h = this.height;
    var mainMargins = this.margins().main;
    var smbgOpts = this.smbgOpts();
    this._yScale = yScale.range([
      h - mainMargins.bottom - this.margins().bottomBumper,
      mainMargins.top + this.margins().topBumper
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
      return d.localDate;
    });
    return _.sortBy(Object.keys(this.data), function(d) { return d; });
  }
});

module.exports = {
  create: function(el, opts) {
    opts = opts || {};
    var defaults = {
      baseMargin: opts.baseMargin || 10,
      bgDomain: [0,600],
      brushHeight: 0,
      clampTop: false,
      smbg: {
        maxR: 7.5,
        r: 6,
        radiusMultiplier: 1.5,
        stroke: 1,
        strokeMultiplier: 2,
        units: opts.bgUnits || 'mg/dL'
      },
      statsHeight: 0,
      tickLength: {y: 8},
      tickShift: {x: 5, y: 10}
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
      },
      topBumper: 30,
      bottomBumper: 30
    };
    defaults.margins.highlightLabel = {
      x: defaults.margins.main.left + 10,
      y: defaults.margins.main.top + 30
    };
    _.defaults(opts, defaults);

    var bgDomain = [opts.bgDomain[0]];
    if (opts.clampTop) {
      if (opts.smbg.units === 'mg/dL') {
        bgDomain.push(400);
      }
      else if (opts.smbg.units === 'mmol/L') {
        bgDomain.push(22.5);
      }
    }

    var yScale = d3.scale.linear()
      .clamp(opts.clampTop)
      .domain(opts.clampTop ? bgDomain : opts.bgDomain);

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
      .tickLength(opts.tickLength)
      .tickShift(opts.tickShift)
      .timezone(opts.timezone)
      .xScale(xScale)
      .yScale(yScale);

    return this;
  },
  emitter: new EventEmitter(),
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {
      boxOverlay: true,
      classes: {
        'very-low': {boundary: 60},
        low: {boundary: 80},
        target: {boundary: 180},
        high: {boundary: 200},
        'very-high': {boundary: 300}
      }
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
    this.emitter.removeAllListeners();
    chart.remove();

    return this;
  }
};
