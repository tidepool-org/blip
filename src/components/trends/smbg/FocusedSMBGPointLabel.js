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
import Tooltip from '../common/Tooltip';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { displayBgValue } from '../../../utils/format';
import { formatTooltipDate } from '../../../utils/datetime';

import styles from './FocusedSMBGPointLabel.css';

const FocusedSMBGPointLabel = (props) => {
  const { focusedPoint } = props;
  if (!focusedPoint) {
    return null;
  }

  const { bgUnits, focusedPoint: { data, position }, timePrefs } = props;
  let uploadedTime;
  if (timePrefs.timezoneAware) {
    if (data.time) {
      uploadedTime = formatTooltipDate(Date.parse(data.time), timePrefs);
    }
  } else {
    if (data.deviceTime) {
      uploadedTime = formatTooltipDate(Date.parse(data.deviceTime), timePrefs);
    }
  }
  return (
    <div className={styles.container}>
      <Tooltip
        content={<span className={styles.number}>{displayBgValue(data.value, bgUnits)}</span>}
        position={position}
        side={'bottom'}
        tail={false}
        offset={{ top: 15, left: 0 }}
      />
      <Tooltip
        title={<span className={styles.explainerText}>{uploadedTime}</span>}
        position={position}
        side={'right'}
        offset={{ top: 0, left: 30 }}
      />
    </div>
  );
};

FocusedSMBGPointLabel.defaultProps = {};

FocusedSMBGPointLabel.propTypes = {
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  focusedPoint: PropTypes.shape({
    data: PropTypes.shape({
      value: PropTypes.number.isRequired,
      time: PropTypes.string,
      deviceTime: PropTypes.string,
    }).isRequired,
    position: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
  }),
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
  }).isRequired,
};

export default FocusedSMBGPointLabel;
