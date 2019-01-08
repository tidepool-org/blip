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

/* jshint esversion:6 */
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var _ = require('lodash');

var format = require('../data/util/format');
var dt = require('../data/util/datetime');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    opacity: 0.4,
    opacityDelta: 0.2,
    pathStroke: 1.5,
    timezoneAware: false,
    tooltipPadding: 20
  };

  opts = _.defaults(opts, defaults);

  function suspend(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      var filteredData = _.filter(currentData, {
        subType: 'status',
        status: 'suspended',
        reason: { suspended: 'automatic' }
      });

      filteredData = _.filter(filteredData, (data) => {
        return !_.isUndefined(data.duration);
      });

      var deviceEventGroup = selection
        .selectAll('.d3-deviceevent-group')
        .data(['d3-deviceevent-group']);

      deviceEventGroup
        .enter()
        .append('g')
        .attr('class', 'd3-basal-path-group');

      _.each(filteredData, (data, index) => {
        var id = data.id;
        var radius = 7;
        var xPosition = suspend.xPosition(data);
        var yPosition = radius + 2;
        var endXPosition = suspend.endXPosition(data);

        var markers = deviceEventGroup
          .selectAll(`.d3-basal-marker-group.d3-basal-marker-group-automated-${id}`)
          .data([`d3-basal-marker-group d3-basal-marker-group-automated-${id}`]);

        var markersGroups = markers
          .enter()
          .append('g')
          .attr('class', function(d) {
            return d;
          });

        markersGroups.append('line').attr({
          x1: xPosition,
          y1: yPosition,
          x2: xPosition,
          y2: pool.height(),
          class: 'd3-basal-group-line'
        });

        markersGroups.append('circle').attr({
          class: 'd3-basal-group-circle',
          cx: xPosition,
          cy: yPosition,
          r: radius
        });

        markersGroups
          .append('text')
          .attr({
            x: xPosition,
            y: yPosition,
            class: 'd3-basal-group-label'
          })
          .text('S');

        markers.exit().remove();

        markers = deviceEventGroup
          .selectAll(`.d3-basal-marker-group.d3-basal-marker-group-manual-${id}`)
          .data([`d3-basal-marker-group d3-basal-marker-group-manual-${id}`]);

        markersGroups = markers
          .enter()
          .append('g')
          .attr('class', function(d) {
            return d;
          });

        markersGroups.append('line').attr({
          x1: endXPosition,
          y1: yPosition,
          x2: endXPosition,
          y2: pool.height(),
          class: 'd3-basal-group-line'
        });

        markersGroups.append('circle').attr({
          class: 'd3-basal-group-circle',
          cx: endXPosition,
          cy: yPosition,
          r: radius
        });

        markersGroups
          .append('text')
          .attr({
            x: endXPosition,
            y: yPosition,
            class: 'd3-basal-group-label'
          })
          .text('R');

        markers.exit().remove();
      });
    });
  }

  suspend.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  suspend.endXPosition = function(d) {
    return opts.xScale(Date.parse(dt.addDuration(d.normalTime, d.duration)));
  };

  suspend.yPosition = function(d) {
    return opts.yScale(d.rate);
  };

  return suspend;
};
