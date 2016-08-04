/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import React, { PropTypes } from 'react';

import styles from './CBGSlice.css';

const CBGSlice = (props) => {
  const { datum, radius, xScale, yPositions } = props;
  const { focusSlice, unfocusSlice } = props;

  const focusMedian = focusSlice.bind(null, datum, ['median']);
  const unfocus = unfocusSlice.bind(null);

  function renderLine(category, y1Accessor, y2Accessor) {
    const focus = focusSlice.bind(null, datum, [y1Accessor, y2Accessor]);
    if (yPositions[y1Accessor] && yPositions[y2Accessor]) {
      return (
        <line
          className={styles[category]}
          key={`${category}-${datum.id}`}
          onMouseOver={focus}
          onMouseOut={unfocus}
          x1={xScale(datum.msX)}
          x2={xScale(datum.msX)}
          y1={yPositions[y1Accessor]}
          y2={yPositions[y2Accessor]}
        />
      );
    }
    return null;
  }

  return (
    <g id="cbgSlice">
      {[
        renderLine('rangeSlice', 'min', 'max'),
        renderLine('outerSlice', 'tenthQuantile', 'ninetiethQuantile'),
        renderLine('quartileSlice', 'firstQuartile', 'thirdQuartile'),
        <circle
          className={styles.cbgMedian}
          key={`individualMedian-${datum.id}`}
          onMouseOver={focusMedian}
          onMouseOut={unfocus}
          cx={xScale(datum.msX)}
          cy={yPositions.median}
          r={radius}
        />,
      ]}
    </g>
  );
};

CBGSlice.defaultProps = {
  radius: 7,
};

CBGSlice.propTypes = {
  datum: PropTypes.object.isRequired,
  focusSlice: PropTypes.func.isRequired,
  radius: PropTypes.number.isRequired,
  unfocusSlice: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yPositions: PropTypes.object.isRequired,
};

export default CBGSlice;
