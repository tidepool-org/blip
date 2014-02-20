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

var log = require('../../lib/bows')('Puddle');

module.exports = function(opts) {

  opts = opts || {};

  var defaults = {};

  _.defaults(opts, defaults);

  function puddle(selection, txt) {
    // selection.call(puddle.addRect);
    selection.call(puddle.addHead);
    selection.call(puddle.addLead);
  }

  puddle.dataDisplay = function(selection, display) {
    var displayGroup = selection.append('text')
      .attr({
        'x': opts.width / 3,
        'y': opts.height * (3/5)
      });

    display.forEach(function(txt) {
      displayGroup.append('tspan')
        .attr('class', txt['class'])
        .text(txt['text']);
    });
  };

  // TODO: remove - only for development
  puddle.addRect = _.once(function(selection) {
    selection.append('rect')
      .attr({
        'x': 0,
        'y': 0,
        'width': opts.width,
        'height': opts.height,
        'fill': '#BAC9D1',
        'stroke': '#FFFFFF',
        'stroke-width': 1
      });
  });

  puddle.addHead = _.once(function(selection) {
    selection.append('text')
      .attr({
        'x': opts.width / 3,
        'y': 0,
        'class': 'd3-stats-head'
      })
      .text(opts.head);
  });

  puddle.addLead = _.once(function(selection) {
    selection.append('text')
      .attr({
        'x': opts.width / 3,
        'y': opts.height / 5,
        'class': 'd3-stats-lead'
      })
      .text(opts.lead);
  });

  puddle.id = opts.id;

  puddle.pie = opts.pie;

  return puddle;
};