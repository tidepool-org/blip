/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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

import PropTypes from "prop-types";
import React from "react";

import { getCount as fnGetCount } from "../BasicsUtils";

const nestedShrinkFactor = 4;

function WrapCount(props) {
  const getCount = fnGetCount.bind({ props });

  const generateDots = (start, end, dotSize) => {
    const count = getCount(props.subtotalType);
    const dots = [];

    dotSize = Math.round(dotSize);

    for (let i = start; i <= end; ++i) {
      if (i <= count) {
        dots.push(
          <svg key={i} width={dotSize} height={dotSize}>
            <circle cx={dotSize / 2} cy={dotSize / 2} r={dotSize / 2} />
          </svg>
        );
      }
    }

    return dots;
  };

  const renderDots = () => {
    var count = getCount(props.subtotalType);
    var dots = [];

    if (props.chartWidth) {
      var dotSize = props.chartWidth / 56;

      if (count > 9) {
        dots = generateDots(1, 8, dotSize);
        dots.push(
          <div key="nested" className="NestedCount">
            {generateDots(9, 17, dotSize / nestedShrinkFactor)}
          </div>
        );
      } else {
        dots = generateDots(1, 9, dotSize);
      }
    }

    return dots;
  };

  const dots = renderDots();
  return <div className="WrapCount">{dots}</div>;
}

WrapCount.propTypes = {
  chartWidth: PropTypes.number.isRequired,
  data: PropTypes.object,
  date: PropTypes.string.isRequired,
  subtotalType: PropTypes.string,
};

export default WrapCount;
