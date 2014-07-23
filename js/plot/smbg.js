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

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var log = require('../lib/').bows('SMBG');
var scales = require('./util/scales')();
var bgBoundaryClass = require('./util/bgBoundaryClass');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    classes: {
      'very-low': {'boundary': 60},
      'low': {'boundary': 80, 'tooltip': 'smbg_tooltip_low.svg'},
      'target': {'boundary': 180, 'tooltip': 'smbg_tooltip_target.svg'},
      'high': {'boundary': 200, 'tooltip': 'smbg_tooltip_high.svg'},
      'very-high': {'boundary': 300}
    },
    size: 16,
    tooltipWidth: 70,
    tooltipHeight: 24
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.parent();
  var getBgBoundaryClass = bgBoundaryClass(opts);

  function smbg(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      var circles = d3.select(this)
        .selectAll('circle.d3-smbg')
        .data(currentData, function(d) {
          return d.id;
        });
      circles.enter()
        .append('circle')
        .attr({
          cx: smbg.xPosition,
          cy: smbg.yPosition,
          r: smbg.radius,
          id: smbg.id,
          'clip-path': 'url(#mainClipPath)',
          'class': getBgBoundaryClass
        })
        .classed({'d3-smbg': true, 'd3-circle-smbg': true});

      circles.exit().remove();

      var highlight = pool.highlight(circles);

      // tooltips
      selection.selectAll('.d3-circle-smbg').on('mouseover', function() {
        highlight.on(d3.select(this));

        if (d3.select(this).classed('d3-bg-low')) {
          smbg.addTooltip(d3.select(this).datum(), 'low');
        }
        else if (d3.select(this).classed('d3-bg-target')) {
          smbg.addTooltip(d3.select(this).datum(), 'target');
        }
        else {
          smbg.addTooltip(d3.select(this).datum(), 'high');
        }
      });
      selection.selectAll('.d3-circle-smbg').on('mouseout', function() {
        highlight.off();

        var id = d3.select(this).attr('id').replace('smbg_', 'tooltip_');
        mainGroup.select('#' + id).remove();
      });
    });
  }

  smbg.radius = function() {
    // size is the total diameter of an smbg
    // radius is half that, minus one because of the 1px stroke for open circles
    return opts.size/2 - 1;
  };

  smbg.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  smbg.yPosition = function(d) {
    return opts.yScale(d.value);
  };

  smbg.id = function(d) {
    return 'smbg_' + d.id;
  };

  smbg.addTooltip = function(d, category) {
    mainGroup.select('#' + 'tidelineTooltips_smbg')
      .call(pool.tooltips(),
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'smbg',
        // timestamp
        true,
        opts.classes[category].tooltip,
        opts.tooltipWidth,
        opts.tooltipHeight,
        // imageX
        opts.xScale(Date.parse(d.normalTime)),
        // imageY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipHeight;
          }
          else {
            return opts.yScale(d.value);
          }
        },
        // textX
        opts.xScale(Date.parse(d.normalTime)) + opts.tooltipWidth / 2,
        // textY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipHeight / 2;
          }
          else {
            return opts.yScale(d.value) + opts.tooltipHeight / 2;
          }
        });
  };

  return smbg;
};
