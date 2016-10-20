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
import _ from 'lodash';

import styles from './NoData.css';

const NoData = (props) => {
  const { position, dataType, displayTypes, messageString } = props;
  const noDataMessage = _.template(messageString);

  if (!position) {
    return null;
  }

  let displayType = '';
  if (dataType) {
    displayType = displayTypes[dataType];
  }

  return (
    <text className={styles.noDataMsg} id="noDataMsg" x={position.x} y={position.y}>
      {noDataMessage({ displayType })}
    </text>
  );
};

NoData.defaultProps = {
  displayTypes: { cbg: 'CGM', smbg: 'fingerstick' },
  messageString: 'There is no <%= displayType %> data for this time period :(',
};

NoData.propTypes = {
  messageString: PropTypes.string.isRequired,
  dataType: React.PropTypes.oneOf(['cbg', 'smbg']),
  displayTypes: PropTypes.object.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

export default NoData;
