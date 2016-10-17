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

import styles from './NoData.css';

const NoData = (props) => {
  const noDataMessage = _.template('There is no <%= type %> data for this time period :(');
  const { position, dataType } = props;

  if (!position) {
    return null;
  }

  return (
    <text className={styles.noDataMsg} id="noDataMsg" x={position.x} y={position.y}>
      {noDataMessage({ type: dataType })}
    </text>
  );
};

NoData.defaultProps = {
  dataType: 'CBG',
};

NoData.propTypes = {
  dataType: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

export default NoData;
