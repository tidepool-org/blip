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
    highlightWidth: 4,
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.group();

  function timechange(selection) {
    opts.xScale = pool.xScale().copy();

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
        cursor: 'pointer',
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
    var elem = d3.select('#timechange_' + d.id + ' image');
    var tooltips = pool.tooltips();
    var tooltip = tooltips.addForeignObjTooltip({
      cssClass: 'svg-tooltip-timechange',
      datum: d,//_.assign(d, {type: 'deviceEvent'}), // we're currently using the message pool to display the tooltip
      shape: 'generic',
      xPosition: timechange.xPositionCenter,
      yPosition: timechange.yPositionCenter
    });

    var timeChange = format.timeChangeInfo(d.change.from, d.change.to);

    var foGroup = tooltip.foGroup;
    if (timeChange.format === 'h:mm a') { // if the timechange is on the same display time info on one line
      tooltip.foGroup.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">from</span> ' + timeChange.from + ' <span class="fromto">to</span> ' + timeChange.to);
    } else {
      tooltip.foGroup.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">from</span> ' + timeChange.from);
      tooltip.foGroup.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">to</span> ' + timeChange.to);
    }
    foGroup.append('p')
      .append('span')
      .attr('class', 'mainText')
      .html(timeChange.type);
      
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