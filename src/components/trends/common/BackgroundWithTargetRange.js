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

import _ from 'lodash';
import { range } from 'd3-array';
import React, { PropTypes } from 'react';

import * as datetime from '../../../utils/datetime';

import styles from './BackgroundWithTargetRange.css';

const BackgroundWithTargetRange = (props) => {
  const { bgBounds, data, margins, svgDimensions, xScale, yScale } = props;

  const width = svgDimensions.width - margins.left - margins.right;

  const lines = props.linesAtThreeHrs ? _.map(data, (val, i) => (
    <line
      className={styles.threeHrLine}
      key={`threeHrLine-${i}`}
      x1={xScale(val)}
      x2={xScale(val)}
      y1={margins.top}
      y2={svgDimensions.height - margins.bottom}
    />
  )) : null;

  return (
    <g id="background">
      <rect
        className={styles.nonTargetBackground}
        x={margins.left}
        y={margins.top}
        width={width}
        height={yScale(bgBounds.targetUpperBound) - margins.top}
      />
      <rect
        className={styles.targetBackground}
        x={margins.left}
        y={yScale(bgBounds.targetUpperBound)}
        width={width}
        height={yScale(bgBounds.targetLowerBound) - yScale(bgBounds.targetUpperBound)}
      />
      <rect
        className={styles.nonTargetBackground}
        x={margins.left}
        y={yScale(bgBounds.targetLowerBound)}
        width={width}
        height={svgDimensions.height - margins.bottom - yScale(bgBounds.targetLowerBound)}
      />
      {lines}
    </g>
  );
};

BackgroundWithTargetRange.defaultProps = {
  data: _.map(range(1, 8), (i) => (i * datetime.THREE_HRS)),
  linesAtThreeHrs: false,
};

BackgroundWithTargetRange.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }).isRequired,
  data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  linesAtThreeHrs: PropTypes.bool.isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  svgDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default BackgroundWithTargetRange;
