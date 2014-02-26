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

var log = require('../lib/bows')('CBG');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    classes: {
      'low': {'boundary': 80, 'tooltip': 'cbg_tooltip_low.svg'},
      'target': {'boundary': 180, 'tooltip': 'cbg_tooltip_target.svg'},
      'high': {'boundary': 200, 'tooltip': 'cbg_tooltip_high.svg'}
    },
    tooltipSize: 24
  };

  _.defaults(opts, defaults);

  function cbg(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      var allCBG = d3.select(this).selectAll('circle')
        .data(currentData, function(d) {
          return d.id;
        });
      var cbgGroups = allCBG.enter()
        .append('circle')
        .attr('class', 'd3-cbg');
      var cbgLow = cbgGroups.filter(function(d) {
        if (d.value <= opts.classes['low']['boundary']) {
          return d;
        }
      });
      var cbgTarget = cbgGroups.filter(function(d) {
        if ((d.value > opts.classes['low']['boundary']) && (d.value <= opts.classes['target']['boundary'])) {
          return d;
        }
      });
      var cbgHigh = cbgGroups.filter(function(d) {
        if (d.value > opts.classes['target']['boundary']) {
          return d;
        }
      });
      cbgLow.attr({
          'cx': function(d) {
            return opts.xScale(Date.parse(d.normalTime));
          },
          'cy': function(d) {
            return opts.yScale(d.value);
          },
          'r': 2.5,
          'id': function(d) {
            return 'cbg_' + d.id;
          }
        })
        .datum(function(d) {
          return d;
        })
        .classed({'d3-circle-cbg': true, 'd3-bg-low': true});
      cbgTarget.attr({
          'cx': function(d) {
            return opts.xScale(Date.parse(d.normalTime));
          },
          'cy': function(d) {
            return opts.yScale(d.value);
          },
          'r': 2.5,
          'id': function(d) {
            return 'cbg_' + d.id;
          }
        })
        .classed({'d3-circle-cbg': true, 'd3-bg-target': true});
      cbgHigh.attr({
          'cx': function(d) {
            return opts.xScale(Date.parse(d.normalTime));
          },
          'cy': function(d) {
            return opts.yScale(d.value);
          },
          'r': 2.5,
          'id': function(d) {
            return 'cbg_' + d.id;
          }
        })
        .classed({'d3-circle-cbg': true, 'd3-bg-high': true});
      allCBG.exit().remove();

      // tooltips
      d3.selectAll('.d3-circle-cbg').on('mouseover', function() {
        if (d3.select(this).classed('d3-bg-low')) {
          cbg.addTooltip(d3.select(this).datum(), 'low');
        }
        else if (d3.select(this).classed('d3-bg-target')) {
          cbg.addTooltip(d3.select(this).datum(), 'target');
        }
        else {
          cbg.addTooltip(d3.select(this).datum(), 'high');
        }
      });
      d3.selectAll('.d3-circle-cbg').on('mouseout', function() {
        var id = d3.select(this).attr('id').replace('cbg_', 'tooltip_');
        d3.select('#' + id).remove();
      });
    });
  }

  cbg.addTooltip = function(d, category) {
    d3.select('#' + 'd3-tooltip-group_cbg')
      .call(pool.tooltips(),
        d,
        // tooltipXPos
        opts.xScale(Date.parse(d.normalTime)),
        'cbg',
        // timestamp
        false,
        opts.classes[category]['tooltip'],
        opts.tooltipSize,
        opts.tooltipSize,
        // imageX
        opts.xScale(Date.parse(d.normalTime)),
        // imageY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipSize;
          }
          else {
            return opts.yScale(d.value);
          }
        },
        // textX
        opts.xScale(Date.parse(d.normalTime)) + opts.tooltipSize / 2,
        // textY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return opts.yScale(d.value) - opts.tooltipSize / 2;
          }
          else {
            return opts.yScale(d.value) + opts.tooltipSize / 2;
          }
        });
  };

  return cbg;
};