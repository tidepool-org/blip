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
const d3 = require('d3');
const _ = require('lodash');

module.exports = function(pool, opts) {
  const defaults = {
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
      midnightWidth: 3,
      gutter: 0,
      fillClass: '',
      x: function(t) { return Date.parse(t.normalTime); }
    };

  _.defaults(opts || {}, defaults);

  function fill(selection) {
    opts.xScale = pool.xScale().copy();

    // fillClass is used to control opacity of weekend day pools in two-week view
    if(opts.fillClass) {
      selection.attr('class', opts.fillClass);
    }

    if (opts.guidelines) {
      fill.drawGuidelines();
    }

    selection.each(function(currentData) {
      currentData.reverse();

      var fills = selection.selectAll('rect.d3-fill')
        .data(currentData, function(d) {
          return d.id;
        });


      fills.enter()
        .append('rect')
        .attr({
          cursor: opts.cursor ? opts.cursor : 'auto',
          x: function(d, i) {
            // dataGutter is the extra space on the right & left edges
            // of each "pool" in weekly view
            if (opts.dataGutter) {
              if (i === currentData.length - 1) {
                return fill.xPosition(d) - opts.dataGutter;
              }
            }
            return fill.xPosition(d);
          },
          y: function() {
            if (opts.gutter.top) {
              return opts.gutter.top;
            }
            else {
              return opts.gutter;
            }
          },
          width: function(d, i) {
            // dataGutter is the extra space on the right & left edges
            // of each "pool" in weekly view
            if (opts.dataGutter) {
              if ((i === 0) || (i === currentData.length - 1)) {
                return fill.width(d) + opts.dataGutter;
              }
            }
            return fill.width(d);
          },
          height: function() {
            if (opts.gutter.top) {
              return pool.height() - opts.gutter.top - opts.gutter.bottom;
            }
            else {
              return pool.height() - 2 * opts.gutter;
            }
          },
          id: function(d) {
            return d.id;
          },
          'class': function(d) {
            return 'd3-fill d3-rect-fill d3-fill-' + d.fillColor;
          }
        })
        .on('click', function() {
          if (opts.emitter) {
            opts.emitter.emit('clickInPool', d3.event.offsetX);
          }
        });

      fills.exit().remove();

      // Add midnight markers
      if (opts.isDaily) {
        selection.selectAll('rect.d3-fill-midnight')
        .data(_.filter(currentData, {startsAtMidnight: true}), function(d) {
          return d.id;
        })
        .enter()
        .append('rect')
        .attr({
          x: function(d, i) {
            var pos;
            pos = fill.xPosition(d);
            return pos - (opts.midnightWidth/2);
          },
          y: function() {
            if (opts.gutter.top) {
              return opts.gutter.top;
            }
            else {
              return opts.gutter;
            }
          },
          width: opts.midnightWidth,
          height: function() {
            if (opts.gutter.top) {
              return pool.height() - opts.gutter.top - opts.gutter.bottom;
            }
            else {
              return pool.height() - 2 * opts.gutter;
            }
          },
          id: function(d) {
            return d.id;
          },
          'class': 'd3-fill d3-rect-fill d3-fill-midnight',
        });
      }
    });
  }

  fill.xPosition = function(d) {
    return opts.xScale(opts.x(d));
  };

  fill.width = function(d) {
    var s = Date.parse(d.normalTime), e = Date.parse(d.normalEnd);
    return opts.xScale(e) - opts.xScale(s);
  };

  fill.drawGuidelines = function() {
    var linesGroup = pool.group().selectAll('#' + pool.id() + '_guidelines').data([opts.guidelines]);
    linesGroup.enter().append('g').attr('id', pool.id() + '_guidelines');
    linesGroup.selectAll('line')
      .data(opts.guidelines)
      .enter()
      .append('line')
      .attr({
        'class': function(d) { return 'd3-line-guide ' + d['class']; },
        x1: opts.xScale.range()[0],
        x2: opts.xScale.range()[1],
        y1: function(d) { return opts.yScale(d.height); },
        y2: function(d) { return opts.yScale(d.height); }
      });
  };

  return fill;
};
