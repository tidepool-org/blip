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
var tooltips = require('../plot/util/tooltips/generalized');

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
    highlightWidth: 4
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.group();

  function timechange(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      var filteredData = _.filter(currentData, {subType: 'timeChange'});

      var timechanges = d3.select(this)
        .selectAll('g.d3-timechange-group')
        .data(filteredData);

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

    selection.append('rect')
      .attr({
        x: timechange.highlightXPosition,
        y: timechange.highlightYPosition,
        width: opts.size + opts.highlightWidth * 2,
        height: opts.size + opts.highlightWidth * 2,
        'class': 'd3-rect-timechange hidden'
      });

    selection.append('image')
      .attr({
        'xlink:href': timeChangeImage,
        cursor: 'pointer',
        x: timechange.xPosition,
        y: timechange.yPosition,
        width: opts.size,
        height: opts.size
      })
      .classed({'d3-image': true, 'd3-timechange': true});

    selection.on('mouseover', timechange._displayTooltip);
  };

  timechange._displayTooltip = function(d) {
    log('tooltipDisplay', d);
    var elem = d3.select('#timechange_' + d.id + ' image');

    var x = elem.attr('x'),
        y =  elem.attr('y'),
        width = elem.attr('width'),
        height = elem.attr('height');
    
    var xCentre = x + (width/2);
    var yCentre = y + (width/2);

    var tooltip = tooltips.add(d, {
      group: d3.select('#tidelineTooltips'),
      classes: ['svg-tooltip-smbg'],
      orientation: 'leftAndDown',
      translation: 'translate(' + xCentre + ',' + yCentre + ')'
    });

    console.log(d);

    tooltip.foGroup.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('Time Adjustment');
    tooltip.foGroup.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="fromto">from:</span> ' + format.timestamp(d.change.from, d.displayOffset));
    tooltip.foGroup.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="fromto">to:</span> ' + format.timestamp(d.change.to, d.displayOffset));

    console.log('foGroup', tooltip.foGroup);
    tooltip.anchor();
    tooltip.makeShape();
  }

  timechange.highlightXPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2 - opts.highlightWidth;
  };

  timechange.highlightYPosition = function(d) {
    return pool.height() / 2 - opts.size / 2 - opts.highlightWidth;
  };

  timechange.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
  };

  timechange.yPosition = function(d) {
    return pool.height() / 2 - opts.size / 2;
  };

  return timechange;
};