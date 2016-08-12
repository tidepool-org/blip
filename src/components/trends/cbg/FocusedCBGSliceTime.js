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

import { formatDurationToClocktime } from '../../../utils/datetime';

import styles from './FocusedCBGSliceTime.css';

const FocusedCBGSliceTime = (props) => {
  const { focusedSlice } = props;
  if (!focusedSlice) {
    return null;
  }
  const { slice: { msFrom, msTo } } = focusedSlice;
  const { position: { left, topOptions: { max: top } } } = focusedSlice;
  const timePiecesFrom = formatDurationToClocktime(msFrom);
  const timePiecesTo = formatDurationToClocktime(msTo);
  const displayFrom = `${timePiecesFrom.hours}:${timePiecesFrom.minutes}`;
  const displayTo = `${timePiecesTo.hours}:${timePiecesTo.minutes}`;
  return (
    <div className={styles.container} style={{ top, left }}>
      <span className={styles.text}>{`${displayFrom} - ${displayTo}`}</span>
    </div>
  );
};

FocusedCBGSliceTime.propTypes = {
  focusedSlice: PropTypes.shape({
    slice: PropTypes.shape({
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      topOptions: PropTypes.shape({
        max: PropTypes.number.isRequired,
      }).isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
  }),
};

export default FocusedCBGSliceTime;
