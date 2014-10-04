var _ = require('lodash');
var d3 = window.d3;
var EventEmitter = require('events').EventEmitter;

d3.chart('ModalDay', {
  initialize: function() {
    this.width = this.base.attr('width');
    this.height = this.base.attr('height');
    this.emitter = new EventEmitter();

    var chart = this;

    // TODO: start adding layers
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this.bgClasses; }
    this.bgClasses = bgClasses;
    return this;
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this.bgUnits; }
    this.bgUnits = bgUnits;
    return this;
  },
  datetimeLocation: function(datetimeLocation) {
    if (!arguments.length) { return this.datetimeLocation; }
    this.datetimeLocation = datetimeLocation;
    return this;
  },
  scale: function(scale) {
    if (!arguments.length) { return this.scale; }
    this.scale = scale;
    return this;
  },
  remove: function() {
    this.base.remove();
    return this;
  }
});

var chart;

module.exports = {
  create: function(el) {
    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: el.offsetHeight,
        id: 'tidelineModalDay'
      })
      .chart('ModalDay');

    return this;
  },
  render: function(opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts.defaults);

    var scale;

    chart.bgClasses(opts.bgClasses)
      .bgUnits(opts.bgUnits)
      .datetimeLocation(opts.datetimeLocation)
      .scale(scale);

    chart.draw(opts.data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};