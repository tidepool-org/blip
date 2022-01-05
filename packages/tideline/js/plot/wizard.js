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

/**
 * @typedef { import('../pool').default } Pool
 * @typedef { import('d3').ScaleContinuousNumeric<number, number> } ScaleContinuousNumeric
 * @typedef {import("../tidelinedata").Datum} Datum
 */

import _ from "lodash";

import utils from "./util/utils";
import commonbolus from "./util/commonbolus";
import drawbolus from "./util/drawbolus";

const defaults = {
  width: 12
};

/**
 * @param {Pool} pool
 * @param {typeof defaults} opts
 * @returns
 */
function plotWizard(pool, opts = defaults) {
  const d3 = window.d3;

  _.defaults(opts, defaults);

  function wizard(selection) {
    const drawBolus = drawbolus(pool, { ...opts, yScale: pool.yScale(), xScale: pool.xScale().copy() });

    selection.each(function(/** @type {Datum[]} */ currentData) {
      if (currentData.length < 1) {
        d3.select(this).selectAll("g.d3-wizard-group").remove();
        return;
      }
      const withAnnotations = _.filter(currentData, (d) => {
        if (d.annotations) {
          return true;
        } else if (d.bolus) {
          return Boolean(d.bolus.annotations);
        }
        return false;
      });

      drawBolus.annotations(withAnnotations);

      const wizards = d3.select(this)
        .selectAll("g.d3-wizard-group")
        .data(currentData, (d) => d.id);

      let wizardGroups = wizards.enter()
        .append("g")
        .attr({
          class: "d3-wizard-group",
          id: (d) => `wizard_group_${d.id}`,
        });

      // sort by size so smaller boluses are drawn last
      wizardGroups = wizardGroups.sort((/** @type {Datum} */ a, /** @type {Datum} */ b) => {
        const bolusA = a.bolus ?? a;
        const bolusB = b.bolus ?? b;
        return d3.descending(commonbolus.getMaxValue(bolusA), commonbolus.getMaxValue(bolusB));
      });

      const carbs = wizardGroups.filter((/** @type {Datum} */ d) => {
        // truthiness working for us here
        // don't want carbInputs of 0 included in filter!
        return d.carbInput;
      });

      drawBolus.carb(carbs);

      const boluses = wizardGroups.filter((/** @type {Datum} */ d) => _.isObject(d.bolus));
      drawBolus.bolus(boluses);

      // boluses where programmed differs from delivered
      const undelivered = boluses.filter((bolus) => {
        const d = commonbolus.getDelivered(bolus);
        const p = commonbolus.getProgrammed(bolus);
        return Number.isFinite(d) && Number.isFinite(p) && p > d;
      });
      drawBolus.undelivered(undelivered);

      // boluses where recommended > delivered
      const underride = boluses.filter((d) => {
        const r = commonbolus.getRecommended(d);
        const p = commonbolus.getProgrammed(d);
        return Number.isFinite(r) && Number.isFinite(p) && p < r;
      });
      drawBolus.underride(underride);

      // boluses where delivered > recommended
      const override = boluses.filter((d) => {
        const r = commonbolus.getRecommended(d);
        const p = commonbolus.getProgrammed(d);
        return Number.isFinite(r) && Number.isFinite(p) && p > r;
      });
      drawBolus.override(override);

      wizards.exit().remove();

      const highlight = pool.highlight(".d3-wizard-group, .d3-bolus-group", opts);

      // tooltips
      selection.selectAll(".d3-wizard-group").on("mouseover", function(d) {
        if (d.bolus) {
          drawBolus.tooltip.add(d, utils.getTooltipContainer(this));
        }

        highlight.on(d3.select(this));
      });
      selection.selectAll(".d3-wizard-group").on("mouseout", function(d) {
        if (d.bolus) {
          drawBolus.tooltip.remove(d);
        }

        highlight.off();
      });
    });
  }

  return wizard;
}

export default plotWizard;
