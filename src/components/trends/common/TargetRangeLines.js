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

import styles from './TargetRangeLines.css';

const TargetRangeLines = (props) => {
  const { bgBounds, smbgOpts, xScale, yScale } = props;
  const x1 = xScale.range()[0] - smbgOpts.maxR;
  const x2 = xScale.range()[1] + smbgOpts.maxR;
  return (
    <g id="targetRange">
      <line
        id="highThreshold"
        className={styles.targetRangeLine}
        x1={x1}
        x2={x2}
        y1={yScale(bgBounds.targetUpperBound)}
        y2={yScale(bgBounds.targetUpperBound)}
      />
      <line
        id="lowThreshold"
        className={styles.targetRangeLine}
        x1={x1}
        x2={x2}
        y1={yScale(bgBounds.targetLowerBound)}
        y2={yScale(bgBounds.targetLowerBound)}
      />
    </g>
  );
};

TargetRangeLines.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }),
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

TargetRangeLines.displayName = 'TargetRangeLines';

export default TargetRangeLines;
