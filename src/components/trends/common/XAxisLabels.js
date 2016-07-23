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

import styles from './XAxisLabels.css';

const XAxisLabels = (props) => {
  const { data, margins, xOffset, xScale, yOffset } = props;
  return (
    <g id="xAxisLabels">
      {_.map(data, (msInDay) => (
        <text className={styles.text} x={xScale(msInDay) + xOffset} y={margins.top - yOffset}>
          {datetime.formatDurationToClocktime(msInDay)}
        </text>
      ))}
    </g>
  );
};

XAxisLabels.defaultProps = {
  data: _.map(range(0, 8), (i) => (i * datetime.THREE_HRS)),
  xOffset: 5,
  yOffset: 5,
};

XAxisLabels.propTypes = {
  data: PropTypes.array.isRequired,
  focusedRange: PropTypes.object,
  margins: PropTypes.object.isRequired,
  useRangeLabels: PropTypes.bool.isRequired,
  xOffset: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yOffset: PropTypes.number.isRequired,
};

export default XAxisLabels;
