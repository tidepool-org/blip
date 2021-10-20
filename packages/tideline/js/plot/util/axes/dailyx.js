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
import moment from "moment-timezone";

import format from "../../../data/util/format";

const defaults = {
  textShiftX: 5,
  textShiftY: 5,
  tickLength: 15,
  longTickMultiplier: 2.5,
  /** @type {import("../../../tidelinedata").default} */
  tidelineData: {
    getTimezoneAt: _.constant("UTC"),
  },
};

function axesDaily(pool, opts = defaults) {

  _.defaults(opts, defaults);

  let mainGroup = pool.parent();
  let stickyLabel = mainGroup.select("#tidelineLabels")
    .append("g")
    .attr("class", "d3-axis")
    .append("text")
    .attr({
      class: "d3-day-label",
      x: opts.leftEdge,
      // this is the same as dailyx.dayYPosition
      // we just don't have a datum to pass here
      y: pool.height() - opts.tickLength * opts.longTickMultiplier
    });

  /**
   * While 'inTransition' there is a lots of 'zoomstart' / 'zoomend' events
   * Use an accumulator for that
   */
  let transitionAccumulator = 0;
  /**
   * @param {boolean} value true if in transition
   */
  function onTransition(value) {
    transitionAccumulator += value ? 1 : -1;
    if (transitionAccumulator > 0) {
      stickyLabel.attr("opacity", "0.2");
    } else {
      stickyLabel.attr("opacity", "1.0");
    }
  }

  /**
   * Update the sticky label text
   * @param {number} date MS since epoch
   */
  function updateStickyLabel(date) {
    const timezone = opts.tidelineData.getTimezoneAt(date);
    const startDate = moment.tz(date, timezone);
    if (startDate.isValid()) {
      const dateHours = startDate.hours();

      // When we're close to midnight (where close = five hours on either side)
      // remove the sticky label so it doesn't overlap with the midnight-anchored day label
      let text = "";
      if (4 < dateHours && dateHours < 19) {
        text = format.xAxisDayText(startDate);
      }
      stickyLabel.text(text);
    } else {
      // Don't bother create a bows() log for this one,
      // should not happend outside buggy dev process anyway.
      console.warn("axesDaily.updateStickyLabel: invalid date", date, timezone);
    }
  }

  // ** Events listeners **
  opts.emitter.on("inTransition", onTransition);
  opts.emitter.on("zoomstart", () => onTransition(true));
  opts.emitter.on("zoomend", () => onTransition(false));
  opts.emitter.on("dailyx-navigated", updateStickyLabel);

  function dailyx(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      const ticks = selection.selectAll("g.d3-axis." + opts["class"])
        .data(currentData, (d) => d.id);

      const tickGroups = ticks.enter()
        .append("g")
        .attr({
          class: "d3-axis " + opts["class"]
        });

      tickGroups.append("line")
        .attr({
          x1: dailyx.xPosition,
          x2: dailyx.xPosition,
          y1: pool.height(),
          y2: dailyx.tickLength
        });

      tickGroups.append("text")
        .attr({
          id: (d) => `x-axis-hour-${d.epoch}`,
          x: dailyx.textXPosition,
          y: pool.height() - opts.textShiftY
        })
        .text((d) => format.xAxisTickText(moment.tz(d.epoch, d.timezone)));

      let prevDay = -1;
      tickGroups
        .filter((d) => {
          let display = false;
          if (d.startsAtMidnight) {
            const day = moment.tz(d.epoch, d.timezone).day();
            display = day !== prevDay;
            prevDay = day;
          }
          return display;
        })
        .append("text")
        .attr({
          id: (d) => `x-axis-day-${d.epoch}`,
          class: "d3-day-label",
          x: dailyx.textXPosition,
          y: dailyx.dayYPosition
        })
        .text((d) => format.xAxisDayText(moment.tz(d.epoch, d.timezone)));

      ticks.exit().remove();
    });
  }

  dailyx.tickLength = (d) => {
    const m = moment.tz(d.epoch, d.timezone);
    if (m.hours() === 0) {
      return pool.height() - opts.tickLength * opts.longTickMultiplier;
    }
    return pool.height() - opts.tickLength;
  };

  dailyx.xPosition = (d) => opts.xScale(d.epoch);
  dailyx.textXPosition = (d) => dailyx.xPosition(d) + opts.textShiftX;
  dailyx.dayYPosition = dailyx.tickLength;

  dailyx.destroy = function() {
    opts = null;
    pool = null;
    mainGroup = null;
    stickyLabel = null;
  };

  return dailyx;
}

export default axesDaily;
