/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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

var d3 = require('d3');
var _ = require('lodash');

var dt = require('../data/util/datetime');
var format = require('../data/util/format');

var timeChangeImage = require('../../img/timechange/timechange.svg');

var log = require('bows')('DeviceEvent - TimeChange');

/**
 * Module for adding timechange markers to a chart pool
 *
 * @param  {Object} pool the chart pool
 * @param  {Object|null} opts configuration options
 * @return {Object}      time change object
 */
module.exports = function(pool, opts) {
  opts = opts || {};

  /**
   * Default configuration for this component
   */
  var defaults = {
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.group();

  function timechange(selection) {
    selection.each(function(currentData) {
      var filteredData = _.filter(currentData, {subType: 'timeChange'});

      var timechanges = d3.select(this)
        .selectAll('g.d3-timechange-group')
        .data(filteredData, function(d) {
          return d.id;
        });

      var timechangeGroup = timechanges.enter()
        .append('g')
        .attr({
          'class': 'd3-timechange-group',
          id: function(d) {
            return 'timechange_' + d.id;
          }
        });

      timechange.addTimeChangeToPool(timechangeGroup);

      timechanges.exit().remove();
    });
  }

  timechange.addTimeChangeToPool = function(selection) {
    opts.xScale = pool.xScale().copy();
    selection.append('image')
      .attr({
        'xlink:href': timeChangeImage,
        x: timechange.xPositionCorner,
        y: timechange.yPositionCorner,
        width: opts.size,
        height: opts.size
      })
      .classed({'d3-image': true, 'd3-timechange': true});

    selection.on('mouseover', timechange._displayTooltip);
    selection.on('mouseout', timechange._removeTooltip);
  };

  timechange._removeTooltip = function(d) {
    var elem = d3.select('#tooltip_' + d.id).remove();
  };

  timechange._displayTooltip = function(d) {
    // Need to check if time is coming from the current data model, or the deprecated `change` property
    var fromTime = _.get(d, 'from.time', _.get(d, 'change.from'));
    var toTime = _.get(d, 'to.time', _.get(d, 'change.to'));

    var fromTimeZoneName = _.get(d, 'from.timeZoneName');
    var toTimeZoneName = _.get(d, 'to.timeZoneName');

    if (toTime || toTimeZoneName) {
      var tooltips = pool.tooltips();

      var tooltip = tooltips.addForeignObjTooltip({
        cssClass: 'svg-tooltip-timechange',
        datum: d,
        shape: 'generic',
        xPosition: timechange.xPositionCenter,
        yPosition: timechange.yPositionCenter
      });

      var foGroup = tooltip.foGroup;

      if (toTime) {
        // Render time change
        var timeChange = format.timeChangeInfo(fromTime, toTime);

        if (timeChange.format === 'h:mm a' && !toTimeZoneName) {
          // No time zone change and time change is on the same day so we display on one line.
          /* jshint laxbreak: true */
          var html = timeChange.from
            ? '<span class="fromto">from</span> ' + timeChange.from + ' <span class="fromto">to</span> ' + timeChange.to
            : '<span class="fromto">to</span> ' + timeChange.to;

          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(html);
        } else {
          // Render time change on 2 lines, appended by time zone change if present
          var fromTimeZoneText = '';
          var toTimeZoneText = '';

          if (toTimeZoneName && toTimeZoneName !== fromTimeZoneName) {
            fromTimeZoneText = fromTimeZoneName ? ' ' + fromTimeZoneName : '';
            toTimeZoneText = ' ' + toTimeZoneName;
          }

          var fromHTML = '<span class="fromto">from</span> ' + timeChange.from + fromTimeZoneText;
          var toHTML = '<span class="fromto">to</span> ' + timeChange.to + toTimeZoneText;

          if (fromTime) {
            tooltip.foGroup.append('p')
              .append('span')
              .attr('class', 'secondary')
              .html(fromHTML);
          }
          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(toHTML);
        }
        foGroup.append('p')
          .append('span')
          .attr('class', 'mainText')
          .html(timeChange.type);
      } else {
        // Render time zone change
        if (fromTimeZoneName) {
          tooltip.foGroup.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html('<span class="fromto">from</span> ' + fromTimeZoneName);
        }
        tooltip.foGroup.append('p')
          .append('span')
          .attr('class', 'secondary')
          .html('<span class="fromto">to</span> ' + toTimeZoneName);

        foGroup.append('p')
          .append('span')
          .attr('class', 'mainText')
          .html('Time Zone Change');
      }

      var dims = tooltips.foreignObjDimensions(foGroup);

      // foGroup.node().parentNode is the <foreignObject> itself
      // because foGroup is actually the top-level <xhtml:div> element
      tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
        w: dims.width + opts.tooltipPadding,
        h: dims.height,
        x: timechange.xPositionCenter(d),
        y: -dims.height,
        orientation: {
          'default': 'leftAndDown',
          leftEdge: 'rightAndDown',
          rightEdge: 'leftAndDown'
        },
        shape: 'generic',
        edge: tooltip.edge
      });
    }
  };

  timechange.xPositionCorner = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
  };

  timechange.yPositionCorner = function(d) {
    return pool.height() / 2 - opts.size / 2;
  };

  timechange.xPositionCenter = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  timechange.yPositionCenter = function(d) {
    return pool.height() / 2;
  };

  return timechange;
};
