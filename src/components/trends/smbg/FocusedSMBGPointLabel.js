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

  const {
    bgUnits,
    focusedPoint: { data, position, dayPoints, positions },
    timePrefs,
    grouped,
    lines,
  } = props;

  let smbgTime;
  if (timePrefs.timezoneAware) {
    if (data.time) {
      smbgTime = formatTooltipDate(Date.parse(data.time), timePrefs);
    }
  } else {
    if (data.deviceTime) {
      smbgTime = formatTooltipDate(Date.parse(data.deviceTime), timePrefs);
    }
  }
  const pointTooltips = _.map(dayPoints, (smbg, i) => (
    <Tooltip
      key={i}
      content={<span className={styles.number}>{displayBgValue(smbg.value, bgUnits)}</span>}
      position={positions[i]}
      side={'bottom'}
      tail={false}
      offset={{ top: 15, left: 0 }}
    />
  ));
  return (
    <div className={styles.container}>
      {lines && !grouped && pointTooltips}
      <Tooltip
        title={<span className={styles.explainerText}>{smbgTime}</span>}
        position={position}
        side={'right'}
        offset={{ top: 10, left: 30 }}
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
  grouped: React.PropTypes.bool.isRequired,
  lines: React.PropTypes.bool.isRequired,
};

export default FocusedSMBGPointLabel;
