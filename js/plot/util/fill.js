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
var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var log = require('../../lib/').bows('Fill');

module.exports = function(pool, opts) {

  var fills = [],
  defaults = {
    classes: {
        0: 'darkest',
        3: 'dark',
        6: 'lighter',
        9: 'light',
        12: 'lightest',
        15: 'lighter',
        18: 'dark',
        21: 'darker'
      },
      duration: 3,
      gutter: 0
    };

  _.defaults(opts || {}, defaults);

  function pushFillFor(start, end) {
    fills.push({
      width: opts.xScale(end) - opts.xScale(start),
      x: opts.xScale(start),
      fill: opts.classes[start.getUTCHours()]
    });
  }

  function durationSegmentedDomain() {
    var first = new Date(opts.endpoints[0]);
    var last = new Date(opts.endpoints[1]);
    // make sure we encapsulate the domain completely by padding the start and end with `opts.duration`
    first.setUTCHours(first.getUTCHours() - first.getUTCHours() % opts.duration - opts.duration);
    last.setUTCHours(last.getUTCHours() + last.getUTCHours() % opts.duration + opts.duration);
    return d3.time.hour.utc.range(first, last, opts.duration);
  }

  function fill(selection) {
    if (!opts.xScale) {
      opts.xScale = pool.xScale().copy();
    }
    var i, range;

    range = durationSegmentedDomain();
    for (i = 0; i < range.length - 1; i++) {
      pushFillFor(range[i], range[i + 1]);
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
            if (i === 0) {
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

    if (opts.guidelines) {
      var linesGroup = pool.group().append('g')
        .attr('id', pool.id() + '_guidelines');
      _.each(opts.guidelines, function(guide){
        linesGroup.append('line')
          .attr({
            'class': 'd3-line-guide ' + guide['class'],
            'x1': opts.xScale.range()[0],
            'x2': opts.xScale.range()[1],
            'y1': opts.yScale(guide.height),
            'y2': opts.yScale(guide.height)
          });
      });
    }
  }

  return fill;
};
