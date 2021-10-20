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
import drawPhysicalActivity from "./util/drawphysicalactivity";

/**
 * @typedef {import("../tidelinedata").default} TidelineData
 * @typedef {import("../tidelinedata").Datum} Datum
 * @typedef {import("../pool").default} Pool
 */

/**
 *
 * @param {Pool} pool
 * @param {{ tidelineData: TidelineData}} opts
 * @returns
 */
function plotPhysicalActivity(pool, opts) {
  return function physicalActivityEvent(selection) {
    const d3 = window.d3;
    opts.xScale = pool.xScale().copy();
    const drawPa = drawPhysicalActivity(pool, opts);

    selection.each(function () {
      const physicalActivities = pool.filterDataForRender(opts.tidelineData.physicalActivities);
      if (physicalActivities.length < 1) {
        return;
      }

      const physicalActivty = d3
        .select(this)
        .selectAll("g.d3-pa-group")
        .data(physicalActivities, (d) => d.id);

      const paGroups = physicalActivty
        .enter()
        .append("g")
        .attr({
          class: "d3-pa-group",
          id: (d) => `pa_group_${d.id}`,
        });

      const intensity = paGroups.filter(d => !_.isEmpty(d.reportedIntensity));
      drawPa.picto(intensity);
      drawPa.activity(intensity);

      physicalActivty.exit().remove();

      // highlight is disabled for now but we may decide to use it later one
      // var highlight = pool.highlight('.d3-pa-group', opts);

      // tooltips
      selection.selectAll(".d3-pa-group").on("mouseover", function(d) {
        if (d.reportedIntensity) {
          drawPa.tooltip.add(d, utils.getTooltipContainer(this));
        }
        // highlight is disabled for now but we may decide to use it later one
        // highlight.on(d3.select(this));
      });
      selection.selectAll(".d3-pa-group").on("mouseout", function(d) {
        if (d.reportedIntensity) {
          drawPa.tooltip.remove(d);
        }
        // highlight is disabled for now but we may decide to use it later one
        // highlight.off();
      });
    });
  };
}

export default plotPhysicalActivity;
