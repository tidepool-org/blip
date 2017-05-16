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

import getBasalPaths from '../../../modules/render/basal';

import styles from './Basal.css';

const Basal = (props) => {
  const { basalSequence, xScale, yScale } = props;
  const paths = getBasalPaths(basalSequence, xScale, yScale);

  if (_.isEmpty(paths)) {
    return null;
  }

  return (
    <g id={`basalSequence-${basalSequence[0].id}`}>
      {_.map(paths, (path) => (<path className={styles[path.type]} d={path.d} key={path.key} />))}
    </g>
  );
};

Basal.propTypes = {
  basalSequence: PropTypes.arrayOf(PropTypes.shape({
    type: 'basal',
  }).isRequired).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default Basal;
