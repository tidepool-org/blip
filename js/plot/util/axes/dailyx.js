/*
 * == BSD2 LICENSE ==
 */

var _ = require('../../../lib/')._;
var d3 = require('../../../lib/').d3;

var format = require('../../../data/util/format');

var log = require('../../../lib/').bows('DailyX');

module.exports = function(pool, opts) {

  var defaults = {
    dayShiftY: 2,
    textShiftX: 5,
    textShiftY: 5,
    tickLength: 15
  };

  opts = _.defaults(opts || {}, defaults);

  var mainGroup = pool.parent();

  var stickyLabel = mainGroup.select('#tidelineLabels')
    .append('g')
    .attr('class', 'd3-axis')
    .append('text')
    .attr({
      'class': 'd3-day-label',
      x: opts.leftEdge,
      // this is the same as dailyx.dayYPosition
      // we just don't have a datum to pass here
      y: pool.height() - opts.tickLength * 2.5 + opts.dayShiftY
    });

  opts.emitter.on('zoomstart', function() {
    stickyLabel.attr('opacity', '0.2');
  });

  opts.emitter.on('zoomend', function() {
    stickyLabel.attr('opacity', '1.0');
  });

  opts.emitter.on('navigated', function(a) {
    var d = a[0].start;
    // when we're close to midnight (where close = five hours on either side)
    // remove the sticky label so it doesn't overlap with the midnight-anchored day label
    if ((d.getUTCHours() >= 19) || (d.getUTCHours() <= 4)) {
      stickyLabel.text('');
      return;
    }
    stickyLabel.text(format.xAxisDayText(d.toISOString()));
  });

  function dailyx(selection) {

    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      var ticks = selection.selectAll('g.d3-axis.' + opts['class'])
        .data(currentData, function(d) {
          return d.id;
        });

      var tickGroups = ticks.enter()
        .append('g')
        .attr({
          'class': 'd3-axis ' + opts['class'],
          'clip-path': 'url(#mainClipPath)'
        });

      tickGroups.append('line')
        .attr({
          x1: dailyx.xPosition,
          x2: dailyx.xPosition,
          y1: pool.height(),
          y2: dailyx.tickLength
        });

      tickGroups.append('text')
        .attr({
          x: dailyx.textXPosition,
          y: pool.height() - opts.textShiftY
        })
        .text(function(d) {
          return format.xAxisTickText(d.normalTime);
        });

      tickGroups.filter(function(d) {
        var dt = new Date(d.normalTime);
        if (dt.getUTCHours() === 0) {
          return d;
        }
      })
        .append('text')
        .attr({
          'class': 'd3-day-label',
          x: dailyx.textXPosition,
          y: dailyx.dayYPosition
        })
        .text(function(d) {
          return format.xAxisDayText(d.normalTime);
        });

      ticks.exit().remove();
    });
  }

  dailyx.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  dailyx.textXPosition = function(d) {
    return dailyx.xPosition(d) + opts.textShiftX;
  };

  dailyx.dayYPosition = function(d) {
    return dailyx.tickLength(d) + opts.dayShiftY;
  };

  dailyx.tickLength = function(d) {
    var dt = new Date(d.normalTime);
    if (dt.getUTCHours() === 0) {
      return pool.height() - opts.tickLength * 2.5;
    }
    else return pool.height() - opts.tickLength;
  };

  dailyx.text = function(d) {
    return format(d.normalTime);
  };

  return dailyx;
};