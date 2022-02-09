/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import React from "react";
import PropTypes from "prop-types";

import CBGDateTraceAnimated from "./CBGDateTraceAnimated";

const CBGDateTracesAnimationContainer = (props) => {
  const { bgBounds, data, onSelectDate, topMargin, xScale, yScale } = props;
  return (
    <g component="g" id="cbgDateTraces">
      {_.map(data, (datum, localDate) => (
        <CBGDateTraceAnimated
          bgBounds={bgBounds}
          data={datum}
          date={localDate}
          key={localDate}
          onSelectDate={onSelectDate}
          topMargin={topMargin}
          xScale={xScale}
          yScale={yScale}
        />
      ))}
    </g>
  );
};

CBGDateTracesAnimationContainer.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }).isRequired,
  data: PropTypes.object,
  dates: PropTypes.arrayOf(PropTypes.string),
  onSelectDate: PropTypes.func.isRequired,
  topMargin: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default CBGDateTracesAnimationContainer;
