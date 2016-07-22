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

import styles from './FocusedCBGSlice.css';

const FocusedCBGSlice = (props) => {
  const { focusedSlice: slice, xScale, yOffset, yScale } = props;
  if (slice === null) {
    return null;
  }
  return (
    <g id="focusedCbgSliceLabels">
      <text className={styles.text} x={xScale(slice.msX)} y={yScale(slice.thirdQuartile) - yOffset}>
        {slice.thirdQuartile}
      </text>
      <text className={styles.text} x={xScale(slice.msX)} y={yScale(slice.firstQuartile) + yOffset}>
        {slice.firstQuartile}
      </text>
    </g>
  );
};

FocusedCBGSlice.defaultProps = {
  yOffset: 18,
};

FocusedCBGSlice.propTypes = {
  focusedSlice: PropTypes.object,
  xScale: PropTypes.func.isRequired,
  yOffset: PropTypes.number.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default FocusedCBGSlice;
