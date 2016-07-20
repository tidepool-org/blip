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

import styles from './CBGIndividualMedians.css';

const CBGIndividualMedians = (props) => {
  const { data, radius, xScale, yPositions } = props;

  return (
    <g id="cbgIndividualMedians">
      {_.map(data, (d, i) => (
        <circle
          className={styles.cbgMedian}
          key={`individualMedian-${i}`}
          cx={xScale(d.msX)}
          cy={yPositions[`${i}-median`]}
          r={radius}
        />)
      )}
    </g>
  );
};

CBGIndividualMedians.defaultProps = {
  radius: 7,
};

CBGIndividualMedians.propTypes = {
  data: PropTypes.array.isRequired,
  radius: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yPositions: PropTypes.object.isRequired,
};

export default CBGIndividualMedians;
