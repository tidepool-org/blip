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
import Tooltip from '../../common/tooltips/Tooltip';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { displayBgValue } from '../../../utils/format';
import { millisecondsAsTimeOfDay } from '../../../utils/datetime';

import styles from './FocusedSMBGRangeLabels.css';

const FocusedSMBGRangeLabels = (props) => {
  const { focusedRange } = props;
  if (!focusedRange) {
    return null;
  }

  const { bgUnits, focusedRange: { data, position } } = props;
  const timeFrom = millisecondsAsTimeOfDay(data.msFrom);
  const timeTo = millisecondsAsTimeOfDay(data.msTo);
  const maxPosition = { top: position.yPositions.max, left: position.left };
  const meanPosition = { top: position.yPositions.mean, left: position.left };
  const meanSide = position.tooltipLeft ? 'left' : 'right';
  const minPosition = { top: position.yPositions.min, left: position.left };
  return (
    <div className={styles.container}>
      <Tooltip
        content={<span className={styles.number}>{displayBgValue(data.max, bgUnits)}</span>}
        position={maxPosition}
        side={'top'}
        tail={false}
        offset={{ top: -5, left: 0 }}
      />
      <Tooltip
        title={<span className={styles.explainerText}>{timeFrom} - {timeTo}</span>}
        content={
          <span className={styles.number}>
            Average {displayBgValue(data.mean, bgUnits)}
          </span>
        }
        side={meanSide}
        position={meanPosition}
        offset={{ top: 0, left: position.tooltipLeft ? -10 : 10 }}
      />
      <Tooltip
        content={<span className={styles.number}>{displayBgValue(data.min, bgUnits)}</span>}
        position={minPosition}
        side={'bottom'}
        tail={false}
        offset={{ top: 5, left: 0 }}
      />
    </div>
  );
};

FocusedSMBGRangeLabels.propTypes = {
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  focusedRange: PropTypes.shape({
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      max: PropTypes.number.isRequired,
      mean: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      msX: PropTypes.number.isRequired,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      yPositions: PropTypes.shape({
        max: PropTypes.number.isRequired,
        mean: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }),
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
  }).isRequired,
};

export default FocusedSMBGRangeLabels;
