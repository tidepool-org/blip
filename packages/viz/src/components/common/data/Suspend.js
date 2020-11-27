import _ from 'lodash';

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

import styles from './Basal.css';

const Suspend = props => {
  const { suspends, flushBottomOffset, xScale, yScale } = props;

  if (_.isEmpty(suspends)) {
    return null;
  }

  const groupsToRender = [];

  _.each(suspends, suspend => {
    if (_.isUndefined(suspend.duration)) return;
    const radius = 7;
    const xPos = xScale(suspend.utc);
    const yPos = radius + 2;
    const zeroBasal = yScale.range()[0];
    const flushWithBottomOfScale = zeroBasal + flushBottomOffset;
    const endXPosition = xScale(suspend.utc + suspend.duration);

    groupsToRender.push(
      <g className={styles['marker--automated']} key={`${suspend.id}_start`}>
        <line
          className={styles.markerLine}
          x1={xPos}
          y1={yPos}
          x2={xPos}
          y2={flushWithBottomOfScale}
        />

        <circle className={styles.markerCircle} cx={xPos} cy={yPos} r={radius} />

        <text className={styles.markerText} x={xPos} y={yPos}>
          S
        </text>
      </g>,
      <g className={styles['marker--manual']} key={`${suspend.id}_end`}>
        <line
          className={styles.markerLine}
          x1={endXPosition}
          y1={yPos}
          x2={endXPosition}
          y2={flushWithBottomOfScale}
        />

        <circle className={styles.markerCircle} cx={endXPosition} cy={yPos} r={radius} />

        <text className={styles.markerText} x={endXPosition} y={yPos}>
          R
        </text>
      </g>
    );
  });

  return (
    <g id={`suspends-${suspends[0].id}-thru-${suspends[suspends.length - 1].id}`}>
      {groupsToRender}
    </g>
  );
};

Suspend.defaultProps = {
  flushBottomOffset: -(parseFloat(styles.strokeWidth) / 2),
};

Suspend.propTypes = {
  suspends: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['deviceEvent']).isRequired,
      subType: PropTypes.oneOf(['suspend']).isRequired,
      duration: PropTypes.number,
      utc: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  flushBottomOffset: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default Suspend;
