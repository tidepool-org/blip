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

var log = require('../lib/').bows('Two-Week SMBG');
var bgBoundaryClass = require('./util/bgBoundaryClass');

function SMBGTime (opts) {
  var MS_IN_HOUR = 3600000;

  var MS_IN_MIN = 60 * 1000;

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
    rectWidth: 32,
    tooltipWidth: 70,
    tooltipHeight: 24
  };

  opts = _.defaults(opts, defaults);

  var getBgBoundaryClass = bgBoundaryClass(opts), mainGroup, poolDaysGroup;

  this.draw = function(pool) {
    opts.pool = pool;
    mainGroup = pool.parent();
    // if you don't use poolDaysGroup to subset selection of smbg circles
    // can end up selecting circles in the legend D:
    poolDaysGroup = mainGroup.select('#daysGroup');

    var smbg = this;
    return function(selection) {
      selection.each(function(currentData) {
        // pool-dependent variables
        var xScale = opts.pool.xScale().copy();
        opts.xScale = xScale;

        var circles = d3.select(this)
          .selectAll('g.d3-smbg-time')
          .data(currentData, function(d) {
            return d.id;
          });

        var circleGroups = circles.enter()
          .append('g')
          .attr('class', 'd3-smbg-time-group');

        circleGroups.append('circle')
          .attr({
            cx: smbg.xPosition,
            cy: smbg.yPosition,
            r: smbg.radius,
            id: smbg.id,
            class: getBgBoundaryClass
          })
          .classed({'d3-smbg-time': true, 'd3-circle-smbg': true})
          .on('dblclick', function(d) {
            d3.event.stopPropagation(); // silence the click-and-drag listener
            opts.emitter.emit('selectSMBG', d.normalTime);
          });

        circleGroups.append('rect')
          .style('display', 'none')
          .attr({
            'x': function(d) {
              return smbg.xPosition(d) - opts.rectWidth/2;
            },
            'y': 0,
            // text background rect is twice an smbg wide
            'width': opts.rectWidth,
            // text background rect is half a pool high
            'height': pool.height() / 2,
            'class': 'd3-smbg-numbers d3-rect-smbg d3-smbg-time'
          });

        // NB: cannot do same display: none strategy because dominant-baseline attribute cannot be applied
        circleGroups.append('text')
          .attr({
            'x': smbg.xPosition,
            // text is centered vertically in the top half of each day pool (i.e., 1/4 way down)
            'y': pool.height() / 4,
            'opacity': '0',
            'class': 'd3-smbg-numbers d3-text-smbg d3-smbg-time'
          })
          .text(function(d) {
            return d.value;
          });

        circles.exit().remove();

        var highlight = pool.highlight(circles);

        // tooltips
        selection.selectAll('.d3-circle-smbg').on('mouseover', function() {
          highlight.on(d3.select(d3.select(this).node().parentNode));

          if (d3.select(this).classed('d3-bg-low')) {
            smbg.addTooltip(d3.select(this).datum(), 'low', pool);
          }
          else if (d3.select(this).classed('d3-bg-target')) {
            smbg.addTooltip(d3.select(this).datum(), 'target', pool);
          }
          else {
            smbg.addTooltip(d3.select(this).datum(), 'high', pool);
          }
        });
        selection.selectAll('.d3-circle-smbg').on('mouseout', function() {
          highlight.off();
          
          var id = d3.select(this).attr('id').replace('smbg_time_', 'tooltip_');
          mainGroup.select('#' + id).remove();
        });
      });
    };
  };


  this.showValues = function() {
    var that = this;
    poolDaysGroup.selectAll('.d3-rect-smbg')
      .style('display', 'inline');
    poolDaysGroup.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 1);
    poolDaysGroup.selectAll('.d3-circle-smbg')
      .transition()
      .duration(500)
      .attr({
        r: that.radius(true),
        cy: that.yPosition(true)
      });
  };

  this.hideValues = function() {
    var that = this;
    poolDaysGroup.selectAll('.d3-rect-smbg')
      .style('display', 'none');
    poolDaysGroup.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 0);
    poolDaysGroup.selectAll('.d3-circle-smbg')
      .transition()
      .duration(500)
      .attr({
        r: that.radius,
        cy: that.yPosition
      });
  };

  this.xPosition = function(d) {
    var localTime = new Date(d.normalTime);
    var hour = localTime.getUTCHours();
    var min = localTime.getUTCMinutes();
    var sec = localTime.getUTCSeconds();
    var msec = localTime.getUTCMilliseconds();
    var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
    return opts.xScale(t);
  };

  this.yPosition = function(valuesShown) {
    if (valuesShown === true) {
      // shift circles down (1/3 from bottom of pool) when displaying all smbg values
      return opts.pool.height() * 2 / 3;
    }
    // default is smbgs vertically center within each day's pool
    return opts.pool.height() / 2;
  };

  this.radius = function(valuesShown) {
    if (valuesShown === true) {
      // smaller radius when displaying all smbg values
      return opts.size/3;
    }
    // size is the total diameter of an smbg
    // radius is half that, minus one because of the 1px stroke for open circles
    return opts.size/2 - 1;
  };

  this.id = function(d) {
    return 'smbg_time_' + d.id;
  };

  this.addTooltip = function(d, category, p) {
    var yPosition = p.height() / 2;
    var xPosition = this.xPosition(d);
    mainGroup.select('#' + 'tidelineTooltips_' + p.id())
      .call(p.tooltips(),
        d,
        // tooltipXPos
        xPosition,
        'smbg',
        // timestamp
        true,
        opts.classes[category].tooltip,
        opts.tooltipWidth,
        opts.tooltipHeight,
        // imageX
        xPosition,
        // imageY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return yPosition - opts.tooltipHeight;
          }
          else {
            return yPosition;
          }
        },
        // textX
        xPosition + opts.tooltipWidth / 2,
        // textY
        function() {
          if ((category === 'low') || (category === 'target')) {
            return yPosition - opts.tooltipHeight / 2;
          }
          else {
            return yPosition + opts.tooltipHeight / 2;
          }
        });
  };
}

module.exports = SMBGTime;
