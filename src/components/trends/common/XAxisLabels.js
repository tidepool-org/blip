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

import {
  formatClocktimeFromMsPer24,
  THREE_HRS,
  SIMPLE_HOUR_FORMAT_SPACE,
} from '../../../utils/datetime';

import styles from './XAxisLabels.css';

const XAxisLabels = (props) => {
  const { data, margins, xOffset, xScale, yOffset } = props;
  const yPos = margins.top - yOffset;

  return (
    <g id="xAxisLabels">
      {_.map(data, (msInDay) => {
        const displayTime = formatClocktimeFromMsPer24(msInDay, SIMPLE_HOUR_FORMAT_SPACE);
        return (
          <text
            className={styles.text}
            key={msInDay}
            x={xScale(msInDay) + xOffset}
            y={yPos}
          >
            {displayTime}
          </text>
        );
      })}
    </g>
  );
};

XAxisLabels.defaultProps = {
  data: _.map(range(0, 8), (i) => (i * THREE_HRS)),
  xOffset: 5,
  yOffset: 5,
};

XAxisLabels.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  xOffset: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yOffset: PropTypes.number.isRequired,
};

export default XAxisLabels;
