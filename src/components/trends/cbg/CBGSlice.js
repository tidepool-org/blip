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

import { THREE_HRS } from '../../../utils/datetime';

import styles from './CBGSlice.css';

const CBGSlice = (props) => {
  const { datum } = props;
  if (!datum) {
    return null;
  }
  const { aSliceIsFocused, isFocused } = props;
  const { medianRadius, sliceCapRadius, xScale, yPositions } = props;
  const { focusSlice, unfocusSlice } = props;

  function getClass(category) {
    if (aSliceIsFocused) {
      return isFocused ? styles[category] : styles[`${category}Backgrounded`];
    }
    return styles[category];
  }

  const focusMedian = () => {
    const left = xScale(datum.msX);
    focusSlice(datum, {
      left,
      tooltipLeft: datum.msX > props.tooltipLeftThreshold,
      topOptions: yPositions,
    }, ['median']);
  };
  const unfocus = unfocusSlice.bind(null);

  function renderLine(category, y1Accessor, y2Accessor) {
    const left = xScale(datum.msX);
    const focus = () => {
      focusSlice(datum, {
        left,
        tooltipLeft: datum.msX > props.tooltipLeftThreshold,
        topOptions: yPositions,
      }, [y1Accessor, y2Accessor]);
    };
    return (
      <rect
        className={getClass(category)}
        key={`${category}-${datum.id}`}
        onMouseOver={focus}
        onMouseOut={unfocus}
        x={left - sliceCapRadius}
        width={2 * sliceCapRadius}
        y={yPositions[y2Accessor]}
        height={yPositions[y1Accessor] - yPositions[y2Accessor]}
        rx={sliceCapRadius}
        ry={sliceCapRadius}
      />
    );
  }

  return (
    <g id="cbgSlice">
      {[
        renderLine('rangeSlice', 'min', 'max'),
        renderLine('outerSlice', 'tenthQuantile', 'ninetiethQuantile'),
        renderLine('quartileSlice', 'firstQuartile', 'thirdQuartile'),
        <circle
          className={getClass('cbgMedian')}
          key={`individualMedian-${datum.id}`}
          onMouseOver={focusMedian}
          onMouseOut={unfocus}
          cx={xScale(datum.msX)}
          cy={yPositions.median}
          r={medianRadius}
        />,
      ]}
    </g>
  );
};

CBGSlice.defaultProps = {
  medianRadius: 7,
  sliceCapRadius: 9,
  // for time values after 6 p.m. (1800), float the tooltips left instead of right
  tooltipLeftThreshold: 6 * THREE_HRS,
};

CBGSlice.propTypes = {
  aSliceIsFocused: PropTypes.bool.isRequired,
  datum: PropTypes.object,
  focusSlice: PropTypes.func.isRequired,
  isFocused: PropTypes.bool.isRequired,
  medianRadius: PropTypes.number.isRequired,
  sliceCapRadius: PropTypes.number.isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  unfocusSlice: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yPositions: PropTypes.object.isRequired,
};

export default CBGSlice;
