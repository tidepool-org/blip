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

  this.draw = function(pool) {
    opts.pool = pool;
    var smbg = this;
    return function(selection) {
      selection.each(function(currentData) {
        // pool-dependent variables
        var xScale = opts.pool.xScale().copy();
        opts.xScale = xScale;

        var circles = d3.select(this)
          .selectAll('g')
          .data(currentData, function(d) {
            return d._id;
          });

        var circleGroups = circles.enter()
          .append('g')
          .attr('class', 'd3-smbg-time-group');

        circleGroups.append('image')
          .attr({
            'xlink:href': function(d) {
              if (d.value <= opts.classes['very-low'].boundary) {
                return opts.pool.imagesBaseUrl() + '/smbg/very_low.svg';
              }
              else if ((d.value > opts.classes['very-low'].boundary) && (d.value <= opts.classes.low.boundary)) {
                return opts.pool.imagesBaseUrl() + '/smbg/low.svg';
              }
              else if ((d.value > opts.classes.low.boundary) && (d.value <= opts.classes.target.boundary)) {
                return opts.pool.imagesBaseUrl() + '/smbg/target.svg';
              }
              else if ((d.value > opts.classes.target.boundary) && (d.value <= opts.classes.high.boundary)) {
                return opts.pool.imagesBaseUrl() + '/smbg/high.svg';
              }
              else if (d.value > opts.classes.high.boundary) {
                return opts.pool.imagesBaseUrl() + '/smbg/very_high.svg';
              }
            },
            'x': function(d) {
              return smbg.xPosition(d);
            },
            'y': function(d) {
              return pool.height() / 2 - opts.size / 2;
            },
            'width': opts.size,
            'height': opts.size,
            'id': function(d) {
              return 'smbg_time_' + d._id;
            },
            'class': function(d) {
              if (d.value <= opts.classes.low.boundary) {
                return 'd3-bg-low';
              }
              else if ((d.value > opts.classes.low.boundary) && (d.value <= opts.classes.target.boundary)) {
                return 'd3-bg-target';
              }
              else if (d.value > opts.classes.target.boundary) {
                return 'd3-bg-high';
              }
            }
          })
          .classed({'d3-image': true, 'd3-smbg-time': true, 'd3-image-smbg': true})
          .on('dblclick', function(d) {
            d3.event.stopPropagation(); // silence the click-and-drag listener
            opts.emitter.emit('selectSMBG', d.normalTime);
          });

        circleGroups.append('rect')
          .style('display', 'none')
          .attr({
            'x': function(d) {
              var localTime = new Date(d.normalTime);
              var hour = localTime.getUTCHours();
              var min = localTime.getUTCMinutes();
              var sec = localTime.getUTCSeconds();
              var msec = localTime.getUTCMilliseconds();
              var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
              return xScale(t) - opts.rectWidth / 2;
            },
            'y': 0,
            'width': opts.size * 2,
            'height': pool.height() / 2,
            'class': 'd3-smbg-numbers d3-rect-smbg d3-smbg-time'
          });

        // NB: cannot do same display: none strategy because dominant-baseline attribute cannot be applied
        circleGroups.append('text')
          .attr({
            'x': function(d) {
              var localTime = new Date(d.normalTime);
              var hour = localTime.getUTCHours();
              var min = localTime.getUTCMinutes();
              var sec = localTime.getUTCSeconds();
              var msec = localTime.getUTCMilliseconds();
              var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
              return xScale(t);
            },
            'y': pool.height() / 4,
            'opacity': '0',
            'class': 'd3-smbg-numbers d3-text-smbg d3-smbg-time'
          })
          .text(function(d) {
            return d.value;
          });

        circles.exit().remove();

        // tooltips
        selection.selectAll('.d3-image-smbg').on('mouseover', function() {
          console.log('Hi there :D');
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
        d3.selectAll('.d3-image-smbg').on('mouseout', function() {
          var id = d3.select(this).attr('id').replace('smbg_time_', 'tooltip_');
          d3.select('#' + id).remove();
        });
      });
    };
  };

  this.showValues = function() {
    d3.selectAll('.d3-rect-smbg')
      .style('display', 'inline');
    d3.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 1);
    d3.selectAll('.d3-image-smbg')
      .transition()
      .duration(500)
      .attr({
        'height': opts.size * 0.75,
        'width': opts.size * 0.75,
        'y': opts.pool.height() / 2
      });
  };

  this.hideValues = function() {
    d3.selectAll('.d3-rect-smbg')
      .style('display', 'none');
    d3.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 0);
    d3.selectAll('.d3-image-smbg')
      .transition()
      .duration(500)
      .attr({
        'height': opts.size,
        'width': opts.size,
        'y': opts.pool.height() / 2 - opts.size / 2
      });
  };

  this.xPosition = function(d) {
    var localTime = new Date(d.normalTime);
    var hour = localTime.getUTCHours();
    var min = localTime.getUTCMinutes();
    var sec = localTime.getUTCSeconds();
    var msec = localTime.getUTCMilliseconds();
    var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
    return opts.xScale(t) - opts.size / 2;
  };

  this.addTooltip = function(d, category, p) {
    var yPosition = p.height() / 2;
    var xPosition = this.xPosition(d) + opts.size/2;
    console.log(p.id());
    d3.select('#' + 'tidelineTooltips_' + p.id())
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