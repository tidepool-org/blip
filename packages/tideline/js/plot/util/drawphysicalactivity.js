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

import picto from "../../../img/physicalactivity.png";

function drawPhysicalActivity(pool, opts) {
  const height = pool.height() - 20;
  const offset = height / 5;

  const calculateWidth = (d) => opts.xScale(d.epochEnd) - opts.xScale(d.epoch);
  const xPos = (d) => opts.xScale(d.epoch);

  return {
    picto: function (pa) {
      pa.append("rect").attr({
        x: xPos,
        y: _.constant(0),
        width: calculateWidth,
        height: _.constant(offset),
        class: "d3-rect-pa d3-pa",
        id: (d) => `pa_img_${d.id}`,
      });

      pa.append("image").attr({
        "x": xPos,
        "y": _.constant(0),
        "width": calculateWidth,
        "height": _.constant(offset),
        "xlink:href": picto,
      });
    },

    activity: function (pa) {
      pa.append("rect").attr({
        x: xPos,
        y: _.constant(offset),
        width: calculateWidth,
        height: _.constant(pool.height() - offset),
        class: "d3-rect-pa d3-pa",
        id: (d) => `pa_rect_${d.id}`,
      });
    },

    tooltip: {
      add: function (d, rect) {
        if (_.get(opts, "onPhysicalHover", false)) {
          opts.onPhysicalHover({
            data: d,
            rect: rect,
          });
        }
      },
      remove: function (d) {
        if (_.get(opts, "onPhysicalOut", false)) {
          opts.onPhysicalOut({
            data: d,
          });
        }
      },
    },
  };
}

export default drawPhysicalActivity;
