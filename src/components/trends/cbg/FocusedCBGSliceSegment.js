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

import PropTypes from 'prop-types';

import React from 'react';

import styles from './FocusedCBGSliceSegment.css';

const FocusedCBGSliceSegment = (props) => {
  if (!props.focusedSlice || !props.focusedSliceKeys) {
    return null;
  }
  const { focusedSlice: { position }, focusedSliceKeys, sliceWidth } = props;
  return (
    <rect
      className={styles.segment}
      x={position.left - sliceWidth / 2 + styles.stroke / 2}
      y={position.yPositions[focusedSliceKeys[1]]}
      width={sliceWidth - styles.stroke}
      height={position.yPositions[focusedSliceKeys[0]] - position.yPositions[focusedSliceKeys[1]]}
    />
  );
};

FocusedCBGSliceSegment.defaultProps = {
  sliceWidth: 16,
};

FocusedCBGSliceSegment.propTypes = {
  focusedSlice: PropTypes.shape({
    data: PropTypes.shape({
      firstQuartile: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      median: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      ninetiethQuantile: PropTypes.number.isRequired,
      tenthQuantile: PropTypes.number.isRequired,
      thirdQuartile: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      yPositions: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }),
  focusedSliceKeys: PropTypes.arrayOf(PropTypes.oneOf([
    'firstQuartile',
    'max',
    'median',
    'min',
    'ninetiethQuantile',
    'tenthQuantile',
    'thirdQuartile',
  ])),
  sliceWidth: PropTypes.number.isRequired,
};

export default FocusedCBGSliceSegment;
