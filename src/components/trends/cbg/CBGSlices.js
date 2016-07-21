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
import cx from 'classnames';

import styles from './CBGSlices.css';

const CBGSlices = (props) => {
  const { data, fallBackYPositions, xScale, yPositions } = props;

  function renderLine(d, category, y1Access, y2Access) {
    const y1 = yPositions[y1Access] || fallBackYPositions[y1Access];
    const y2 = yPositions[y2Access] || fallBackYPositions[y2Access];
    if (y1 && y2) {
      return (
        <line
          className={cx({ [styles.cbgSlice]: true, [styles[category]]: true })}
          key={`${category}-${d.id}`}
          x1={xScale(d.msX)}
          x2={xScale(d.msX)}
          y1={y1}
          y2={y2}
        />
      );
    }
    return null;
  }

  return (
    <g id="cbgSlices">
      <g id="rangeSlices">
        {_.map(data, (d) => (
          renderLine(d, 'rangeSlice', `${d.id}-min`, `${d.id}-max`)
        ))}
      </g>
      <g id="outerSlices">
        {_.map(data, (d) => (
          renderLine(d, 'outerSlice', `${d.id}-tenthQuantile`, `${d.id}-ninetiethQuantile`)
        ))}
      </g>
      <g id="quartileSlices">
        {_.map(data, (d) => (
          renderLine(d, 'quartileSlice', `${d.id}-firstQuartile`, `${d.id}-thirdQuartile`)
        ))}
      </g>
    </g>
  );
};

CBGSlices.propTypes = {
  data: PropTypes.array.isRequired,
  fallBackYPositions: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
  yPositions: PropTypes.object.isRequired,
};

export default CBGSlices;
