/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

var _ = require('lodash');
var d3 = require('d3');
var moment = require('moment-timezone');

var dt = require('../../../data/util/datetime');
var format = require('../../../data/util/format');

var log = require('bows')('DailyX');

module.exports = function(pool, opts) {

  var defaults = {
    textShiftX: 5,
    textShiftY: 5,
    tickLength: 15,
    longTickMultiplier: 2.5,
    timePrefs: {
      timezoneAware: false,
      timezoneName: dt.getBrowserTimezone(),
    }
  };

  _.defaults(opts || {}, defaults);

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
      y: pool.height() - opts.tickLength * opts.longTickMultiplier
    });

  opts.emitter.on('zoomstart', function() {
    stickyLabel.attr('opacity', '0.2');
  });

  opts.emitter.on('zoomend', function() {
    stickyLabel.attr('opacity', '1.0');
  });

  opts.emitter.on('navigated', function(a) {
    var offset = 0, d;
    if (opts.timePrefs.timezoneAware) {
      offset = -dt.getOffset(a[0].start, opts.timePrefs.timezoneName);
      d = moment(a[0].start).tz(opts.timePrefs.timezoneName);
    }
    else {
      d = moment(a[0].start).utc();
    }
    // when we're close to midnight (where close = five hours on either side)
    // remove the sticky label so it doesn't overlap with the midnight-anchored day label
    if ((d.hours() >= 19) || (d.hours() <= 4)) {
      stickyLabel.text('');
      return;
    }
    stickyLabel.text(format.xAxisDayText(d.toISOString(), offset));
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
          'class': 'd3-axis ' + opts['class']
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
          return format.xAxisTickText(d.normalTime, d.displayOffset);
        });

      tickGroups.filter(function(d) {
        var date = new Date(d.normalTime);
        date = new Date(dt.applyOffset(date, d.displayOffset));
        if (date.getUTCHours() === 0) {
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
          return format.xAxisDayText(d.normalTime, d.displayOffset);
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
    return dailyx.tickLength(d);
  };

  dailyx.tickLength = function(d) {
    var date = new Date(d.normalTime);
    date = new Date(dt.applyOffset(date, d.displayOffset));
    if (date.getUTCHours() === 0) {
      return pool.height() - opts.tickLength * opts.longTickMultiplier;
    }
    else return pool.height() - opts.tickLength;
  };

  dailyx.text = function(d) {
    return format(d.normalTime);
  };

  return dailyx;
};
