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

import _ from 'lodash';
import React, { PropTypes } from 'react';

import { calculateBasalPath, getBasalSequencePaths } from '../../../modules/render/basal';
import { getBasalSequences, getBasalPathGroups, getBasalPathGroupType } from '../../../utils/basal';

import styles from './Basal.css';

const Basal = (props) => {
  const { basals, flushBottomOffset, xScale, yScale } = props;

  if (_.isEmpty(basals)) {
    return null;
  }

  const sequences = getBasalSequences(basals);
  const pathSets = _.map(sequences, seq => (getBasalSequencePaths(seq, xScale, yScale)));

  const basalPathGroups = getBasalPathGroups(basals);

  // Split delivered path into individual segments based on subType
  const deliveredPaths = [];
  _.each(basalPathGroups, group => {
    deliveredPaths.push(_.assign({}, group[0], {
      d: calculateBasalPath(group, xScale, yScale, {
        endAtZero: false,
        flushBottomOffset,
        isFilled: false,
        startAtZero: false,
      }),
    }));
  });

  const pathsToRender = [];

  _.each(pathSets, paths => {
    _.each(paths, path => {
      pathsToRender.push((<path className={styles[path.type]} d={path.d} key={path.key} />));
    });
  });

  _.each(deliveredPaths, (basal, index) => {
    const deliveryType = getBasalPathGroupType(basal);

    pathsToRender.push(
      <path
        className={styles[`border--delivered--${deliveryType}`]}
        d={basal.d}
        key={`basalPathDelivered-${basal.id}`}
      />
    );

    // Render group markers
    if (index > 0) {
      const radius = 7;
      const xPos = xScale(basal.utc);
      const yPos = radius + 2;
      const zeroBasal = yScale.range()[0];
      const flushWithBottomOfScale = zeroBasal + flushBottomOffset;

      pathsToRender.push(
        <g className={styles[`marker--${deliveryType}`]} key={basal.id}>
          <line
            className={styles.markerLine}
            x1={xPos}
            y1={yPos}
            x2={xPos}
            y2={flushWithBottomOfScale}
          />

          <circle
            className={styles.markerCircle}
            cx={xPos}
            cy={yPos}
            r={radius}
          />

          <text
            key={basal.id}
            className={styles.markerText}
            x={xPos}
            y={yPos}
          >
            {deliveryType === 'automated' ? 'A' : 'R'}
          </text>
        </g>
      );
    }
  });

  return (
    <g id={`basals-${basals[0].id}-thru-${basals[basals.length - 1].id}`}>
      {pathsToRender}
    </g>
  );
};

Basal.defaultProps = {
  flushBottomOffset: -(parseFloat(styles.strokeWidth) / 2),
};

Basal.propTypes = {
  basals: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['basal']).isRequired,
    subType: PropTypes.oneOf(['scheduled', 'temp', 'suspend', 'automated']).isRequired,
    duration: PropTypes.number.isRequired,
    rate: PropTypes.number.isRequired,
    utc: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  flushBottomOffset: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default Basal;
