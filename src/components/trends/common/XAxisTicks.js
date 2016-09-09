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

import styles from './XAxisTicks.css';

const XAxisTicks = (props) => {
  const { data, margins, tickLength, xScale } = props;
  return (
    <g id="xAxisTicks">
      {_.map(data, (msInDay) => (
        <line
          className={styles.tick}
          key={msInDay}
          x1={xScale(msInDay)}
          x2={xScale(msInDay)}
          y1={margins.top}
          y2={margins.top - tickLength}
        />
      ))}
    </g>
  );
};

XAxisTicks.defaultProps = {
  data: _.map(range(0, 9), (i) => (i * datetime.THREE_HRS)),
  tickLength: 15,
};

XAxisTicks.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  tickLength: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
};

export default XAxisTicks;
