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

import _ from "lodash";
import i18next from "i18next";
import moment from "moment-timezone";

import * as constants from "../data/util/constants";
import timeChangeImage from "../../img/timechange/timechange.svg";

/**
 * Default configuration for this component
 */
const defaults = {
  tooltipPadding: 20,
};

/**
 * Module for adding timechange markers to a chart pool
 *
 * @param  {object} pool the chart pool
 * @param  {typeof defaults} opts configuration options
 * @return {object}      time change object
 */
function plotTimeChange(pool, opts = {}) {
  const d3 = window.d3;
  _.defaults(opts, defaults);

  function timechange(selection) {
    selection.each(function (currentData) {
      const filteredData = _.filter(currentData, { subType: "timeChange" });

      const timechanges = d3
        .select(this)
        .selectAll("g.d3-timechange-group")
        .data(filteredData, (d) => d.id);

      const timechangeGroup = timechanges
        .enter()
        .append("g")
        .attr({
          class: "d3-timechange-group",
          id: d => `timechange_${d.id}`,
        });

      timechange.addTimeChangeToPool(timechangeGroup);

      timechanges.exit().remove();
    });
  }

  timechange.addTimeChangeToPool = (selection) => {
    opts.xScale = pool.xScale().copy();
    selection
      .append("image")
      .attr({
        "xlink:href": timeChangeImage,
        "x": timechange.xPositionCorner,
        "y": timechange.yPositionCorner,
        "width": opts.size,
        "height": opts.size,
      })
      .classed({ "d3-image": true, "d3-timechange": true });

    selection.on("mouseover", timechange.displayTooltip);
    selection.on("mouseout", timechange.removeTooltip);
  };

  timechange.removeTooltip = (d) => {
    d3.select(`#tooltip_${d.id}`).remove();
  };

  timechange.displayTooltip = (d) => {
    const t = i18next.t.bind(i18next);
    const mFrom = moment.tz(d.from.time, d.from.timeZoneName);
    const mTo = moment.tz(d.to.time, d.to.timeZoneName);

    let format = "h:mm a";
    if (mFrom.year() !== mTo.year()) {
      format = constants.dateTimeFormats.MMM_D_YYYY_H_MM_A_FORMAT;
    } else if (mFrom.month() !== mTo.month()) {
      format = constants.dateTimeFormats.MMM_D_H_MM_A_FORMAT;
    } else if (mFrom.date() !== mTo.date()) {
      format = constants.dateTimeFormats.DDDD_H_MM_A;
    } else {
      format = constants.dateTimeFormats.H_MM_A_FORMAT;
    }

    const fromDate = mFrom.format(format);
    const toDate = mTo.format(format);

    let changeType;
    let tzLine1 = null;
    let tzLine2 = null;

    if (d.from.timeZoneName === d.to.timeZoneName) {
      changeType = t("Time Change");
      tzLine1 = `<span class="fromto">${t("from")}</span> ${fromDate} <span class="fromto">${t("to")}</span> ${toDate}`;
    } else {
      changeType = t("Timezone Change");
      tzLine1 = `<span class="fromto">${t("from")}</span> ${fromDate} - ${d.from.timeZoneName}`;
      tzLine2 = `<span class="fromto">${t("to")}</span> ${toDate} - ${d.to.timeZoneName}`;
    }

    const tooltips = pool.tooltips();
    const tooltip = tooltips.addForeignObjTooltip({
      cssClass: "svg-tooltip-timechange",
      datum: d,
      shape: "generic",
      xPosition: timechange.xPositionCenter,
      yPosition: timechange.yPositionCenter,
    });

    const { foGroup } = tooltip;
    foGroup.append("p").append("span").attr("class", "secondary").html(tzLine1);
    if (tzLine2) {
      foGroup.append("p").append("span").attr("class", "secondary").html(tzLine2);
    }
    foGroup.append("p").append("span").attr("class", "mainText").html(changeType);

    const dims = tooltips.foreignObjDimensions(foGroup);

    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      x: timechange.xPositionCenter(d),
      y: -dims.height,
      orientation: {
        default: "leftAndDown",
        leftEdge: "rightAndDown",
        rightEdge: "leftAndDown",
      },
      shape: "generic",
      edge: tooltip.edge,
    });
  };

  timechange.xPositionCorner = (d) => {
    return opts.xScale(d.epoch) - opts.size / 2;
  };

  timechange.yPositionCorner = (/* d */) => {
    return pool.height() / 2 - opts.size / 2;
  };

  timechange.xPositionCenter = (d) => {
    return opts.xScale(d.epoch);
  };

  timechange.yPositionCenter = (/* d */) => {
    return pool.height() / 2;
  };

  return timechange;
}

export default plotTimeChange;
