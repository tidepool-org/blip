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

var _ = require('../../lib/')._;

var log = require('../../lib/').bows('Fill');

module.exports = function(pool, opts) {

  var first = new Date(opts.endpoints[0]),
    last = new Date(opts.endpoints[1]),
    nearest, fills = [];

  first.setMinutes(first.getMinutes() + first.getTimezoneOffset());
  last.setMinutes(last.getMinutes() + last.getTimezoneOffset());

  var defaults = {
    classes: {
      0: 'darkest',
      3: 'dark',
      6: 'lighter',
      9: 'light',
      12: 'lightest',
      15: 'lighter',
      18: 'dark',
      21: 'darkest'
    },
    duration: 3,
    gutter: 0
  };

  _.defaults(opts || {}, defaults);

  function fill(selection) {
    if (!opts.xScale) {
      opts.xScale = pool.xScale().copy();
    }
    fill.findNearest(opts.endpoints[1]);
    var otherNear = new Date(nearest);
    otherNear.setMinutes(otherNear.getMinutes() - otherNear.getTimezoneOffset());
    fills.push({
      width: opts.xScale(last) - opts.xScale(nearest),
      x: opts.xScale(otherNear),
      fill: opts.classes[nearest.getHours()]
    });
    var current = new Date(nearest);
    while (current > first) {
      var next = new Date(current);
      next.setHours(current.getHours() - opts.duration);
      var otherNext = new Date(next);
      otherNext.setMinutes(otherNext.getMinutes() - otherNext.getTimezoneOffset());
      fills.push({
        width: opts.xScale(current) - opts.xScale(next),
        x: opts.xScale(otherNext),
        fill: opts.classes[next.getHours()]
      });
      current = next;
    }

    if (opts.dataGutter) {
      fills.shift();
    }

    selection.selectAll('rect')
      .data(fills)
      .enter()
      .append('rect')
      .attr({
        'x': function(d, i) {
          if (opts.dataGutter) {
            if (i === fills.length  - 1) {
              return d.x - opts.dataGutter;
            }
            else {
              return d.x;
            }
          }
          else {
            return d.x;
          }
        },
        'y': function() {
          if (opts.gutter.top) {
            return opts.gutter.top;
          }
          else {
            return opts.gutter;
          }
        },
        'width': function(d, i) {
          if (opts.dataGutter) {
            if ((i === 0) || (i === fills.length  - 1)) {
              return d.width + opts.dataGutter;
            }
            else {
              return d.width;
            }
          }
          else {
            return d.width;
          }
        },
        'height': function() {
          if (opts.gutter.top) {
            return pool.height() - opts.gutter.top - opts.gutter.bottom;
          }
          else {
            return pool.height() - 2 * opts.gutter;
          }
        },
        'class': function(d) {
          return 'd3-rect-fill d3-fill-' + d.fill;
        }
      });
  }

  fill.findNearest = function(d) {
    var date = new Date(d);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    var hourBreaks = [];
    var i = 0;
    while (i <= 24) {
      hourBreaks.push(i);
      i += opts.duration;
    }
    for(var j = 0; j < hourBreaks.length; j++) {
      var br = hourBreaks[j];
      var nextBr = hourBreaks[j + 1];
      if ((date.getHours() >= br) && (date.getHours() < nextBr)) {
        nearest = new Date(date.getFullYear(), date.getMonth(), date.getDate(), br, 0, 0);
      }
    }
  };
  
  return fill;
};