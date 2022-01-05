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

import _ from "lodash";

import utils from "./util/utils";

function plotCarb(pool, opts) {
  const d3 = window.d3;
  var defaults = {
    r: 14,
    carbPadding: 4
  };

  _.defaults(opts, defaults);

  var xPos = function(d) {
    return opts.xScale(d.epoch);
  };

  function carb(selection) {
    var yPos = opts.r + opts.carbPadding;
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      const filteredData = _.filter(currentData, (data) => {
        return _.get(data, "nutrition.carbohydrate.net", false);
      });

      if (filteredData.length < 1) {
        // Remove previous data
        d3.select(this).selectAll("g.d3-carb-group").remove();
        return;
      }

      const allCarbs = d3
        .select(this)
        .selectAll("circle.d3-carbs-only")
        .data(filteredData, (d) => d.id);
      const carbGroup = allCarbs.enter()
        .append("g")
        .attr({
          class: "d3-carb-group",
          id: (d) => `carb_group_${d.id}`,
        });

      carbGroup.append("circle").attr({
        "cx": xPos,
        "cy": yPos,
        "r": opts.r,
        "stroke-width": 0,
        "class": "d3-circle-rescuecarbs",
        "id": (d) => `carbs_circle_${d.id}`,
      });

      carbGroup
        .append("text")
        .text((d) => d.nutrition.carbohydrate.net)
        .attr({
          x: xPos,
          y: yPos,
          class: "d3-carbs-text",
          id: (d) => `carbs_text_${d.id}`,
        });

      allCarbs.exit().remove();

      // tooltips
      selection.selectAll(".d3-carb-group").on("mouseover", function() {
        carb.addTooltip(d3.select(this).datum(), utils.getTooltipContainer(this));
      });

      selection.selectAll(".d3-carb-group").on("mouseout", function() {
        if (_.get(opts, "onCarbOut", false)) {
          opts.onCarbOut();
        }
      });
    });
  }

  carb.addTooltip = function(d, rect) {
    if (_.get(opts, "onCarbHover", false)) {
      opts.onCarbHover({
        data: d,
        rect: rect
      });
    }
  };

  return carb;
}

export default plotCarb;
