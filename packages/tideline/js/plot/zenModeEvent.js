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

const d3 = require('d3');
const _ = require('lodash');

const utils = require('./util/utils');

module.exports = function(pool, opts) {
  opts = opts || {};

  const defaults = {
    r: 14,
  };

  _.defaults(opts, defaults);

  const xPos = (d) => utils.xPos(d, opts);
  const calculateWidth = (d) => utils.calculateWidth(d, opts);

  opts.xScale = pool.xScale().copy();
  const height = pool.height();
  const offset = height / 5 /2;

  function zenModeEvent(selection) {
    selection.each(function() {
      const currentData = opts.data;
      const zenModeEvent = d3.select(this)
        .selectAll('g.d3-event-group')
        .data(currentData, (d) => d.id);

      const zenGroup = zenModeEvent.enter()
        .append('g')
        .attr({
          'class': 'd3-event-group',
          id: (d) => `event_group_${d.id}`,
        });

      zenGroup.append('rect')
      .attr({
        x: xPos,
        y: 0,
        width: calculateWidth, 
        height,
        class: 'd3-rect-zen d3-zen',
        id: (d) => `zen_${d.id}`,
      });
      zenGroup.append('circle').attr({
        cx: (d) => xPos(d) + calculateWidth(d)/2,
        cy: offset,
        r: opts.r,
        'stroke-width': 0,
        class: 'd3-circle-zen',
        id: (d) => `zen_circle_${d.id}`,
      });
      zenGroup.append('text')
        .text('ZEN')
        .attr({
          x: (d) => xPos(d) + calculateWidth(d)/2,
          y: offset,
          class: 'd3-zen-text',
          id: (d) => `zen_text_${d.id}`,
        });

        zenModeEvent.exit().remove();
    });
  };

  return zenModeEvent;
};
