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

var d3 = window.d3;
var _ = window._;

var log = require('../lib/bows')('Carbs');

module.exports = function(pool, opts) {

  var MS_IN_ONE = 60000;

  opts = opts || {};

  var defaults = {
    width: 12,
    tooltipHeight: 24,
    tooltipWidth: 70,
    bolusTooltipCatcher: 5,
    tooltipTimestamp: true
  };

  _.defaults(opts, defaults);

  var bolusTooltipBuffer = opts.bolusTooltipCatcher * MS_IN_ONE;

  // catch bolus tooltips events
  opts.emitter.on('bolusTooltipOn', function(t) {
    var c = _.find(opts.data, function(d) {
      var carbT = Date.parse(d.normalTime);
      if (carbT >= (t - bolusTooltipBuffer) && (carbT <= (t + bolusTooltipBuffer))) {
        return d;
      }
    });
    if (c) {
      carbs.addTooltip(c, false);
    }
  });
  opts.emitter.on('bolusTooltipOff', function(t) {
    var c = _.find(opts.data, function(d) {
      var carbT = Date.parse(d.normalTime);
      if (carbT >= (t - bolusTooltipBuffer) && (carbT <= (t + bolusTooltipBuffer))) {
        return d;
      }
    });
    if (c) {
      d3.select('#tooltip_' + c.id).remove();
    }
  });

  opts.emitter.on('noCarbTimestamp', function(bool) {
    if (bool) {
      opts.tooltipTimestamp = false;
    }
    else {
      opts.tooltipTimestamp = true;
    }
  });

  function carbs(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      var rects = d3.select(this)
        .selectAll('rect')
        .data(currentData, function(d) {
          return d.id;
        });
      rects.enter()
        .append('rect')
        .attr({
          'x': function(d) {
            return opts.xScale(Date.parse(d.normalTime)) - opts.width/2;
          },
          'y': 0,
          'width': opts.width,
          'height': function(d) {
            return opts.yScale(d.value);
          },
          'class': 'd3-rect-carbs d3-carbs',
          'id': function(d) {
            return 'carbs_' + d.id;
          }
        });
      rects.exit().remove();

      // tooltips
      d3.selectAll('.d3-rect-carbs').on('mouseover', function() {
        var d = d3.select(this).datum();
        var t = Date.parse(d.normalTime);
        opts.emitter.emit('carbTooltipOn', t);
        carbs.addTooltip(d, opts.tooltipTimestamp);
      });
      d3.selectAll('.d3-rect-carbs').on('mouseout', function() {
        var d = d3.select(this).datum();
        var t = Date.parse(d.normalTime);
        d3.select('#tooltip_' + d.id).remove();
        opts.emitter.emit('carbTooltipOff', t);
      });
    });
  }

  carbs.addTooltip = function(d, category) {
    d3.select('#' + 'tidelineTooltips_carbs')
      .call(pool.tooltips(),
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'carbs',
        // timestamp
        category,
        'tooltip_carbs.svg',
        opts.tooltipWidth,
        opts.tooltipHeight,
        // imageX
        opts.xScale(Date.parse(d.normalTime)),
        // imageY
        function() {
          if (category) {
            return opts.yScale(d.value);
          }
          else {
            return opts.yScale.range()[0];
          }
        },
        // textX
        opts.xScale(Date.parse(d.normalTime)) + opts.tooltipWidth / 2,
        // textY
        function() {
          if (category) {
            return opts.yScale(d.value) + opts.tooltipHeight / 2;
          }
          else {
            return opts.tooltipHeight / 2;
          }
        },
        // customText
        d.value + 'g');
  };

  return carbs;
};