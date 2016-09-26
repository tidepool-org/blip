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

import React, { PropTypes } from 'react';

import styles from './NoData.css';

const NoData = (props) => {
  const { margins, dimensions, message } = props;

  if (!margins || !dimensions) {
    return null;
  }

  const xPos = (dimensions.width / 2) - margins.left + margins.right;
  const yPos = (dimensions.height / 2) - margins.top + margins.bottom;

  return (
    <text className={styles.noDataMsg} id="noDataMsg" x={xPos + 40} y={yPos}>
      {message}
    </text>
  );
};

NoData.propTypes = {
  message: PropTypes.string.isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
};

export default NoData;
