window.d3 = window.d3 || require('d3/d3.min.js');
window.d3.chart = window.d3.chart || require('d3.chart/d3.chart.min.js');

var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;

var moment = require('moment-timezone');

var MS_IN_24 = 86400000;

var MMM_FORMAT, MMM_D_FORMAT = require('../../../js/data/util/constants');

d3.chart('Brush', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    this.base.append('g').attr('id', 'brushMainGroup');

    var xPosition = function(d) {
      var zone = moment.tz.zone(chart.timezone());
      return chart.xScale()(moment.utc(d).add(zone.parse(d.valueOf()), 'minutes').toDate());
    };

    this.layer('brushTicks', this.base.append('g').attr('id', 'brushTicks'), {
      dataBind: function() {
        return this.selectAll('line')
          .data(chart.ticks);
      },
      insert: function() {
        return this.append('line');
      },
      events: {
        enter: function() {
          var xScale = chart.xScale();
          var margins = chart.margins().main;
          var tickLength = chart.tickLength();
          this.attr({
            x1: xPosition,
            x2: xPosition,
            y1: margins.top,
            y2: margins.top + tickLength
          });
        }
      }
    });

    this.layer('brushAxisText', this.base.append('g').attr('id', 'brushAxisText'), {
      dataBind: function() {
        return this.selectAll('text')
          .data(chart.textTicks || chart.ticks);
      },
      insert: function() {
        return this.append('text');
      },
      events: {
        enter: function() {
          var xScale = chart.xScale(), tz = chart.timezone();
          var tickShift = chart.tickShift();
          if (chart.brushTickInterval() !== 'month') {
            tickShift.x = 0;
          }
          this.attr({
            x: function(d) {
              return xPosition(d) + tickShift.x;
            },
            y: tickShift.y
          })
          .classed('centered', chart.brushTickInterval() !== 'month')
          .text(function(d) {
            var format = chart.brushTickInterval() === 'month' ? MMM_FORMAT : MMM_D_FORMAT ;
            return moment.utc(d).format(format);
          });
        }
      }
    });
  },
  brushTickInterval: function(brushTickInterval) {
    if (!arguments.length) { return this._brushTickInterval; }
    this._brushTickInterval = brushTickInterval;
    return this;
  },
  cornerRadius: function(cornerRadius) {
    if (!arguments.length) { return this._cornerRadius; }
    this._cornerRadius = cornerRadius;
    return this;
  },
  emitter: function(emitter) {
    if (!arguments.length) { return this._emitter; }
    this._emitter = emitter;
    return this;
  },
  initialExtent: function(initialExtent) {
    if (!arguments.length) { return this._initialExtent; }
    this._initialExtent = initialExtent;
    return this;
  },
  margins: function(margins) {
    if (!arguments.length) { return this._margins; }
    this._margins = margins;
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
  setExtent: function(newExtent) {
    var xScale = this.xScale(), timezone = this.timezone();
    var scaleDomain = xScale.domain();
    if (newExtent[0] < scaleDomain[0]) {
      var extentSize = (newExtent[1] - newExtent[0])/MS_IN_24;
      var s = moment.utc(scaleDomain[0]).tz(timezone).startOf('day');
      newExtent = [s, d3.time.day.utc.offset(s, extentSize)];
    }
    this.brushHandleGroup.call(this.brush.extent(newExtent));
    this.fixBrushHandlers(this.brushHandleGroup);
    return this;
  },
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    var w = this.width;
    var mainMargins = this.margins().main;
    this._xScale = xScale.range([
      mainMargins.left,
      w - mainMargins.right
    ]);
    var domain = xScale.domain();
    var domainDays = (domain[1] - domain[0])/MS_IN_24;
    var smallDaysLimit = 40, mediumDaysLimit = 90;
    this._brushTickInterval = domainDays < mediumDaysLimit ? 'week' : 'month';
    // we suggest 4 ticks, but d3 makes the final determination about how many to generate
    // and that final number could be higher or lower
    var ticks = xScale.ticks(4);
    this.ticks = ticks;
    // don't want tick labels to appear too close to edge
    // so only show if > two weeks from start of floor of end-of-domain month
    var lastTick = ticks[ticks.length - 1];
    if (this._brushTickInterval === 'month' && (domain[1] - lastTick) / MS_IN_24 < 14) {
      this.textTicks = ticks.slice();
      this.textTicks.pop();
    }
    this.makeBrush();
    return this;
  },
  makeBrush: function() {
    var chart = this, emitter = this.emitter();
    function brushed() {

      var origExtent = chart.brush.extent(), newExtent;
      var timezone = chart.timezone();
      // preserve width of handle on drag
      if (d3.event.mode === 'move') {
        var s = moment.utc(origExtent[0]).tz(timezone).startOf('day');
        var e = moment(s).add(Math.round((origExtent[1] - origExtent[0])/MS_IN_24), 'days');
        newExtent = [s, e];
      }
      // on resize, round to midnights
      else {
        newExtent = origExtent.map(d3.time.day.utc.round);

        // if empty when rounded, use floor & ceil instead
        // i.e., enforce min of 1 day
        if (newExtent[0] >= newExtent[1]) {
          newExtent[0] = moment.utc(origExtent[0]).tz(timezone).startOf('day');
          newExtent[1] = moment.utc(origExtent[1]).tz(timezone).startOf('day');
        }
      }
      emitter.emit('brushed', [newExtent[0].toISOString(), newExtent[1].toISOString()]);
      d3.select(this).call(chart.brush.extent(newExtent));
      chart.fixBrushHandlers(d3.select(this));
    }

    var xScale = this.xScale();
    var initial = chart.initialExtent();

    var extentDates = [Date.parse(initial[0]), Date.parse(initial[1])];

    this.brush = d3.svg.brush()
      .x(xScale)
      .extent(extentDates)
      .on('brush', brushed);

    this.brushHandleGroup = this.base.append('g')
      .attr('id', 'brushHandleGroup')
      .call(this.brush);

    this.fixBrushHandlers(this.brushHandleGroup);

    var mainMargins = this.margins().main;

    var cornerRadius = this.cornerRadius();

    this.brushHandleGroup.select('rect.background')
      .attr({
        height: this.height - mainMargins.top - mainMargins.bottom,
        transform: 'translate(0,' + mainMargins.top + ')',
        rx: cornerRadius,
        ry: cornerRadius
      })
      .style('visibility', 'visible');

    this.brushHandleGroup.select('rect.extent')
      .attr({
        height: this.height - mainMargins.top - mainMargins.bottom,
        transform: 'translate(0,' + mainMargins.top + ')',
        rx: cornerRadius,
        ry: cornerRadius
      });
  },
  fixBrushHandlers: function(brushNode) {
    var oldMousedown = brushNode.on('mousedown.brush');
    brushNode.on('mousedown.brush', function() {
      brushNode.on('mouseup.brush', function() {
        clearHandlers();
      });

      brushNode.on('mousemove.brush', function() {
        clearHandlers();
        oldMousedown.call(this);
      });

      function clearHandlers() {
        brushNode.on('mousemove.brush', null);
        brushNode.on('mouseup.brush', null);
      }
    });
  },
  remove: function() {
    this.base.remove();
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, dateDomain, opts) {
    opts = opts || {};
    var defaults = {
      baseMargin: opts.baseMargin || 10,
      brushHeight: el.offsetHeight,
      cornerRadius: 10,
      initialExtent: [d3.time.day.utc.offset(new Date(dateDomain[1]), -14), new Date(dateDomain[1])],
      tickLength: 10,
      tickShift: {x: 5, y: 3}
    };
    defaults.margins = {
      main: {
        top: defaults.baseMargin + 11,
        right: defaults.baseMargin + 30,
        bottom: defaults.baseMargin - 5,
        left: defaults.baseMargin + 30
      }
    };
    _.defaults(opts, defaults);

    var xScale = d3.time.scale.utc()
      .domain([
        moment.utc(dateDomain[0]).tz(opts.timezone).startOf('day'),
        moment.utc(dateDomain[1]).tz(opts.timezone).startOf('day').add(1, 'days')
      ]);

    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: opts.brushHeight
      })
      .chart('Brush')
      .cornerRadius(opts.cornerRadius)
      .emitter(this.emitter)
      .initialExtent(opts.initialExtent)
      .margins(opts.margins)
      .tickLength(opts.tickLength)
      .tickShift(opts.tickShift)
      .timezone(opts.timezone)
      .xScale(xScale);

    return this;
  },
  getCurrentDay: function() {
    return new Date(chart.brush.extent()[1].valueOf() - MS_IN_24/2);
  },
  emitter: new EventEmitter(),
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.draw();

    return this;
  },
  setExtent: function(newExtent) {
    chart.setExtent(newExtent);
  },
  destroy: function() {
    this.emitter.removeAllListeners();
    chart.remove();

    return this;
  }
};
