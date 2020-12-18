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

const commonbolus = require('./util/commonbolus');
const drawbolus = require('./util/drawbolus');

module.exports = function(pool, opts) {
  opts = opts || {};

  const defaults = {
    width: 12
  };

  _.defaults(opts, defaults);

  const drawBolus = drawbolus(pool, opts);

  function bolus(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(data) {
      // filter out boluses with wizard
      const currentData = _.filter(data, (d) => _.isEmpty(d.wizard));
      drawBolus.annotations(_.filter(currentData, 'annotations'));

      const boluses = d3.select(this)
        .selectAll('g.d3-bolus-group')
        .data(currentData, (d) => d.id);

      const bolusGroups = boluses.enter()
        .append('g')
        .attr({
          'class': 'd3-bolus-group',
          id: (d) => `bolus_group_${d.id}`
        })
        .sort((a, b) => {
          // sort by size so smaller boluses are drawn last
          return d3.descending(commonbolus.getMaxValue(a), commonbolus.getMaxValue(b));
        });

      const normal = bolusGroups.filter((bolus) => {
        const d = commonbolus.getDelivered(bolus);
        return Number.isFinite(d) && d > 0;
      });
      drawBolus.bolus(normal);

      // boluses where programmed differs from delivered
      const undelivered = bolusGroups.filter((bolus) => {
        const d = commonbolus.getDelivered(bolus);
        const p = commonbolus.getProgrammed(bolus);
        return Number.isFinite(d) && Number.isFinite(p) && p > d;
      });
      drawBolus.undelivered(undelivered);

      // Not currently in use:
      // const extended = bolusGroups.filter(function(d) {
      //   return Number.isFinite(d.extended) || Number.isFinite(d.expectedExtended);
      // });
      // drawBolus.extended(extended);

      // const extendedSuspended = bolusGroups.filter((bolus) => {
      //   if (Number.isFinite(bolus.expectedExtended) && Number.isFinite(bolus.extended)) {
      //     return Math.abs(bolus.expectedExtended - bolus.extended) > Number.EPSILON;
      //   }
      //   return false;
      // });
      // drawBolus.extendedSuspended(extendedSuspended);

      boluses.exit().remove();

      const highlight = pool.highlight('.d3-wizard-group, .d3-bolus-group', opts);

      // tooltips
      selection.selectAll('.d3-bolus-group').on('mouseover', function(d) {
        highlight.on(d3.select(this));
        const parentContainer = document.getElementsByClassName('patient-data')[0].getBoundingClientRect();
        const container = this.getBoundingClientRect();
        container.y = container.top - parentContainer.top;

        drawBolus.tooltip.add(d, container);
      });
      selection.selectAll('.d3-bolus-group').on('mouseout', function(d) {
        highlight.off();
        drawBolus.tooltip.remove(d);
      });
    });
  }

  return bolus;
};
