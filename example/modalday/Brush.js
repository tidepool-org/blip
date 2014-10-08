var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;

d3.chart('Brush', {
  initialize: function() {
    var chart = this;

    this.width = this.base.attr('width');
    this.height = this.base.attr('height');

    this.base.append('g').attr('id', 'brushMainGroup');

    this.layer('backgroundRect', this.base.select('#brushMainGroup').append('g').attr('id', 'brushBackgroundRects'), {
      dataBind: function(data) {
        chart.emitter().emit('brushed', chart.initialExtent());
        var domain = chart.xScale().domain();
        chart.days = d3.time.day.utc.range(domain[0], domain[1]);
        return this.selectAll('g')
          .data(chart.days);
      },
      insert: function() {
        return this.append('g')
          .attr('class', 'brushBackgroundDayGroup');
      },
      events: {
        enter: function() {
          var xScale = chart.xScale();
          var toEnter = this;
          var range = xScale.range();
          var extent = range[1] - range[0];
          var mainMargins = chart.margins().main;
          toEnter.append('rect')
            .attr({
              x: function(d) { return xScale(d); },
              y: mainMargins.top,
              width: extent/chart.days.length,
              height: chart.height - mainMargins.top - mainMargins.bottom
            });
        }
      }
    });
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
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    var w = this.width;
    var mainMargins = this.margins().main;
    this._xScale = xScale.range([
      mainMargins.left,
      w - mainMargins.right
    ]);
    this.makeBrush();
    return this;
  },
  makeBrush: function() {
    var chart = this, emitter = this.emitter();
    function brushed() {
      var MS_IN_24 = 86400000;
      var origExtent = chart.brush.extent(), newExtent;
      // preserve width of handle on drag
      if (d3.event.mode === 'move') {
        var s = d3.time.day.utc.round(origExtent[0]),
          e = d3.time.day.utc.offset(s, Math.round((origExtent[1] - origExtent[0])/MS_IN_24));
        newExtent = [s, e];
      }
      // on resize, round to midnights
      else {
        newExtent = origExtent.map(d3.time.day.utc.round);

        // if empty when rounded, use floor & ceil instead
        // i.e., enforce min of 1 day
        if (newExtent[0] >= newExtent[1]) {
          newExtent[0] = d3.time.day.utc.floor(origExtent[0]);
          newExtent[1] = d3.time.day.utc.floor(origExtent[1]);
        }
      }
      emitter.emit('brushed', newExtent);
      d3.select(this).call(chart.brush.extent(newExtent));
    }

    var xScale = this.xScale();
      
    this.brush = d3.svg.brush()
      .x(xScale)
      .extent(chart.initialExtent())
      .on('brush', brushed);

    var brushHandleGroup = this.base.append('g')
      .attr('id', 'brushHandleGroup')
      .call(this.brush);

    var mainMargins = this.margins().main;

    brushHandleGroup.selectAll('rect')
      .attr({
        height: this.height - mainMargins.top - mainMargins.bottom
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
      brushHeight: 80,
      initialExtent: [d3.time.day.utc.offset(new Date(dateDomain[1]), -14), new Date(dateDomain[1])]
    };
    defaults.margins = {
      main: {
        top: 0,
        right: defaults.baseMargin,
        bottom: defaults.baseMargin,
        left: 50 + defaults.baseMargin
      }
    };
    _.defaults(opts, defaults);

    var xScale = d3.time.scale.utc()
      .domain([
        d3.time.day.utc.floor(new Date(dateDomain[0])),
        d3.time.day.utc.ceil(new Date(dateDomain[1]))
      ]);

    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: opts.brushHeight
      })
      .chart('Brush')
      .emitter(this.emitter)
      .initialExtent(opts.initialExtent)
      .margins(opts.margins)
      .xScale(xScale);

    return this;
  },
  getCurrentDay: function() {
    return new Date(chart.brush.extent()[1].valueOf() - 864e5/2);
  },
  emitter: new EventEmitter(),
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