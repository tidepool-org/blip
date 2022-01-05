/**
 * Copyright (c) 2021, Diabeloop
 * WarmUp display
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import _ from "lodash";

import warmUpDexcom from "warmup-dexcom.svg";
import utils from "./util/utils";

/**
 * @typedef {import("../tidelinedata").default} TidelineData
 * @typedef {import("../tidelinedata").Datum} Datum
 * @typedef {import("../pool").default} Pool
 */

/**
 *
 * @param {Pool} pool
 * @param {{ onParameterHover: (p: any) => void, onParameterOut: () => void, tidelineData: TidelineData }} opts
 * @returns {(data: Datum[]) => void}
 */
function plotWarmUp(pool, opts) {
  const d3 = window.d3;
  const width = 40;

  function warmUp(selection) {
    const offset = pool.height() / 5;
    const xScale = pool.xScale().copy();
    selection.each(function () {
      const warmUpEvents = pool.filterDataForRender(opts.tidelineData.warmUpEvents);
      if (warmUpEvents.length < 1) {
        d3.select(this).selectAll("g.d3-warmup-group").remove();
        return;
      }

      const allWarmUps = d3
        .select(this)
        .selectAll("circle.d3-warmup")
        .data(warmUpEvents, (d) => d.id);

      const warmUpGroup = allWarmUps
        .enter()
        .append("g")
        .attr({
          class: "d3-warmup-group",
          id: (d) => `warmup_group_${d.id}`,
        });

      warmUpGroup.append("image").attr({
        "x": (d) => xScale(d.epoch),
        "y": _.constant(0),
        width,
        "height": offset,
        "xlink:href": warmUpDexcom,
      });

      allWarmUps.exit().remove();

      // tooltips
      selection.selectAll(".d3-warmup-group").on("mouseover", function () {
        opts.onWarmUpHover({
          data: d3.select(this).datum(),
          rect: utils.getTooltipContainer(this),
        });
      });

      selection.selectAll(".d3-warmup-group").on("mouseout", opts.onWarmUpOut);
    });
  }

  return warmUp;
}

export default plotWarmUp;
