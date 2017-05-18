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
import { getBasalSequences } from '../../../utils/basal';

import styles from './Basal.css';

const Basal = (props) => {
  const { basals, flushBottomOffset, xScale, yScale } = props;

  if (_.isEmpty(basals)) {
    return null;
  }

  const sequences = getBasalSequences(basals);
  const pathSets = _.map(sequences, (seq) => (getBasalSequencePaths(seq, xScale, yScale)));
  const deliveredPath = calculateBasalPath(basals, xScale, yScale, {
    endAtZero: false,
    flushBottomOffset,
    isFilled: false,
    startAtZero: false,
  });

  const pathsToRender = [];

  _.each(pathSets, (paths) => {
    _.each(paths, (path) => {
      pathsToRender.push((<path className={styles[path.type]} d={path.d} key={path.key} />));
    });
  });

  pathsToRender.push(
    <path
      className={styles['border--delivered']}
      d={deliveredPath}
      key={`basalPathDelivered-${basals[0].id}`}
    />
  );

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
    subType: PropTypes.oneOf(['scheduled', 'temp', 'suspend']).isRequired,
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
