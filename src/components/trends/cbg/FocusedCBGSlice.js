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
import React, { PropTypes } from 'react';

import { displayBgValue } from '../../../utils/format';

import styles from './FocusedCBGSlice.css';

const FocusedCBGSlice = (props) => {
  const { focusedSliceKeys: keys, focusedSlice: slice } = props;
  const { bgUnits, xScale, yOffset, yScale } = props;

  if (keys === null || slice === null) {
    return null;
  }

  if (_.isEqual(keys, ['median'])) {
    return (
      <text className={styles.median} x={xScale(slice.msX)} y={yScale(slice.median) - yOffset}>
        {displayBgValue(slice.median, bgUnits)}
      </text>
    );
  }
  return (
    <g id="focusedCbgSliceLabels">
      <text className={styles.text} x={xScale(slice.msX)} y={yScale(slice[keys[1]]) - yOffset}>
        {displayBgValue(slice[keys[1]], bgUnits)}
      </text>
      <text className={styles.text} x={xScale(slice.msX)} y={yScale(slice[keys[0]]) + yOffset}>
        {displayBgValue(slice[keys[0]], bgUnits)}
      </text>
    </g>
  );
};

FocusedCBGSlice.defaultProps = {
  yOffset: 18,
};

FocusedCBGSlice.propTypes = {
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  focusedSlice: PropTypes.object,
  focusedSliceKeys: PropTypes.array,
  xScale: PropTypes.func.isRequired,
  yOffset: PropTypes.number.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default FocusedCBGSlice;
