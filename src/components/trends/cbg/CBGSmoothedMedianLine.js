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

// eslint-disable-next-line import/no-unresolved
import { curveBasis, line } from 'd3-shape';
import React, { PropTypes } from 'react';

import styles from './CBGSmoothedMedianLine.css';

const CBGSmoothedMedianLine = (props) => {
  const { data, fallBackYPositions, xScale, yPositions } = props;

  const generatePath = line()
    .x((d) => (xScale(d.msX)))
    .y((d) => (yPositions[`${d.id}-median`] || fallBackYPositions[`${d.id}-median`]))
    .curve(curveBasis);

  return (
    <path className={styles.medianLine} id="cbgSmoothedMedianLine" d={generatePath(data)} />
  );
};

CBGSmoothedMedianLine.propTypes = {
  data: PropTypes.array.isRequired,
  fallBackYPositions: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
  yPositions: PropTypes.object.isRequired,
};

export default CBGSmoothedMedianLine;
