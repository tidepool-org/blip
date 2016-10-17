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
import { formatDisplayDate, millisecondsAsTimeOfDay } from '../../../utils/datetime';

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

  let parsedTime;
  if (timePrefs.timezoneAware) {
    if (data.time) {
      parsedTime = Date.parse(data.time);
    }
  } else {
    if (data.deviceTime) {
      parsedTime = Date.parse(data.deviceTime);
    }
  }
  const smbgTime = formatDisplayDate(parsedTime, timePrefs, 'dddd MMM D');
  const shortDate = formatDisplayDate(parsedTime, timePrefs, 'MMM D');
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
  const simpleTime = (<Tooltip
    title={<span className={styles.explainerText}>{smbgTime}</span>}
    position={position}
    side={'right'}
    offset={{ top: 10, left: 30 }}
  />);
  const singleDetailed = (<Tooltip
    title={<span className={styles.tipWrapper}>
      <span className={styles.shortDate}>{shortDate}</span>
      <span className={styles.shortTime}>{millisecondsAsTimeOfDay(data.msPer24)}</span>
    </span>
    }
    content={<span className={styles.tipWrapper}>
      <span className={styles.detailNumber}>{displayBgValue(data.value, bgUnits)}</span>
      <span className={styles.subType}>{data.subType}</span>
    </span>
    }
    position={position}
    side={'right'}
    offset={{ top: 0, left: 5 }}
  />);
  return (
    <div className={styles.container}>
      {!grouped && pointTooltips}
      {!lines || (grouped && lines) ? singleDetailed : simpleTime}
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
      subType: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
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
