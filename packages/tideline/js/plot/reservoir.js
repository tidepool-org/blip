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

import _ from 'lodash';

import { SITE_CHANGE_BY_MANUFACTURER, DEFAULT_MANUFACTURER } from '../../plugins/blip/basics/logic/constants';
import utils from './util/utils';

function plotReservoirChange(pool, opts) {
  const d3 = window.d3;
  const height = pool.height() / 5 ;
  const width = 40;

  const xPos = (d) => opts.xScale(d.epoch);
  const getPicto = (d) => {
    const change = _.get(SITE_CHANGE_BY_MANUFACTURER, _.get(d, 'pump.manufacturer', DEFAULT_MANUFACTURER), SITE_CHANGE_BY_MANUFACTURER[DEFAULT_MANUFACTURER]);
    return change.picto;
  };

  function reservoir(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      const filteredData = _.filter(currentData, {
        subType: 'reservoirChange'
      });

      const allReservoirs = d3
        .select(this)
        .selectAll('circle.d3-reservoir-only')
        .data(filteredData, (d) => d.id);

        const reservoirGroup = allReservoirs.enter()
        .append('g')
        .attr({
          'class': 'd3-reservoir-group',
          id: (d) => 'reservoir_group_' + d.id,
        });
      reservoirGroup
        .append('image')
        .attr({
          x: (d) => xPos(d) - (width / 2) ,
          y: 0,
          width,
          height,
          'xlink:href': (d) => getPicto(d),
        });

      allReservoirs.exit().remove();

      // tooltips
      selection.selectAll('.d3-reservoir-group').on('mouseover', function() {
        reservoir.addTooltip(d3.select(this).datum(), utils.getTooltipContainer(this));
      });

      selection.selectAll('.d3-reservoir-group').on('mouseout', function() {
        if (_.get(opts, 'onReservoirOut', false)) {
          opts.onReservoirOut();
        }
      });
    });
  }

  reservoir.addTooltip = function(d, rect) {
    if (_.get(opts, 'onReservoirHover', false)) {
      opts.onReservoirHover({
        data: d,
        rect: rect
      });
    }
  };

  return reservoir;
}

export default plotReservoirChange;
