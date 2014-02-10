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
 
module.exports = function(pool, opts) {

  MS_IN_HOUR = 3600000;

  MS_IN_MIN = 60 * 1000;

  var opts = opts || {};

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
    xScale: pool.xScale().copy()
  };

  _.defaults(opts, defaults);

  function smbg(selection) {
    selection.each(function(currentData) {
      var circles = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.normalTime;
        });
      var circleGroups = circles.enter()
        .append('g')
        .attr('class', 'd3-smbg-time-group');
      circleGroups.append('image')
        .attr({
          'xlink:href': function(d) {
            if (d.value <= opts.classes['very-low']['boundary']) {
              return '../img/smbg/very_low.svg';
            }
            else if ((d.value > opts.classes['very-low']['boundary']) && (d.value <= opts.classes['low']['boundary'])) {
              return '../img/smbg/low.svg';
            }
            else if ((d.value > opts.classes['low']['boundary']) && (d.value <= opts.classes['target']['boundary'])) {
              return '../img/smbg/target.svg';
            }
            else if ((d.value > opts.classes['target']['boundary']) && (d.value <= opts.classes['high']['boundary'])) {
              return '../img/smbg/high.svg';
            }
            else if (d.value > opts.classes['high']['boundary']) {
              return '../img/smbg/very_high.svg';
            }
          },
          'x': function(d) {
            var localTime = new Date(d.normalTime);
            var hour = localTime.getUTCHours();
            var min = localTime.getUTCMinutes();
            var sec = localTime.getUTCSeconds();
            var msec = localTime.getUTCMilliseconds();
            var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
            return opts.xScale(t) - opts.size / 2;
          },
          'y': function(d) {
            return pool.height() / 2 - opts.size / 2;
          },
          'width': opts.size,
          'height': opts.size,
          'id': function(d) {
            return 'smbg_time_' + d.id;
          },
          'class': function(d) {
            if (d.value <= opts.classes['low']['boundary']) {
              return 'd3-bg-low';
            }
            else if ((d.value > opts.classes['low']['boundary']) && (d.value <= opts.classes['target']['boundary'])) {
              return 'd3-bg-target';
            }
            else if (d.value > opts.classes['target']['boundary']) {
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
            return opts.xScale(t) - opts.rectWidth / 2;
          },
          'y': 0,
          'width': opts.size * 2,
          'height': pool.height() / 2,
          'class': 'd3-smbg-numbers d3-rect-smbg d3-smbg-time'
        });

      circleGroups.append('text')
        .style('display', 'none')
        .attr({
          'x': function(d) {
            var localTime = new Date(d.normalTime);
            var hour = localTime.getUTCHours();
            var min = localTime.getUTCMinutes();
            var sec = localTime.getUTCSeconds();
            var msec = localTime.getUTCMilliseconds();
            var t = hour * MS_IN_HOUR + min * MS_IN_MIN + sec * 1000 + msec;
            return opts.xScale(t);
          },
          'y': pool.height() / 2 - opts.size / 8,
          'class': 'd3-smbg-numbers d3-text-smbg d3-smbg-time'
        })
        .text(function(d) {
          return d.value;
        });

      circles.exit().remove();

      opts.emitter.on('numbers', function(toggle) {
        if (toggle === 'show') {
          d3.selectAll('.d3-smbg-numbers')
            .style('display', 'inline');
          d3.selectAll('.d3-image-smbg')
            .transition()
            .duration(750)
            .attr({
              'height': opts.size * 0.75,
              'y': pool.height() / 2
            });
        }
        else if (toggle === 'hide') {
          d3.selectAll('.d3-smbg-numbers')
            .style('display', 'none');
          d3.selectAll('.d3-image-smbg')
            .transition()
            .duration(750)
            .attr({
              'height': opts.size,
              'y': pool.height() / 2 - opts.size / 2
            });
        }
      });
    });
  }

  return smbg; 
};