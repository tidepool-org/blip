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
import Tooltip from '../../common/tooltips/Tooltip';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { displayBgValue } from '../../../utils/format';
import { formatDisplayDate, millisecondsAsTimeOfDay, getParsedTime } from '../../../utils/datetime';
import { categorizeSmbgSubtype } from '../../../utils/trends/data';

import styles from './FocusedSMBGPointLabel.css';

// tooltip offsets
const SIMPLE_VALUE_TOP_OFFSET = 10;
const SIMPLE_DAY_TOP_OFFSET = 10;
const SIMPLE_DAY_HORIZ_OFFSET = 30;
const DETAILED_DAY_HORIZ_OFFSET = 10;

const FocusedSMBGPointLabel = (props) => {
  const { focusedPoint } = props;
  if (!focusedPoint) {
    return null;
  }

  const {
    bgUnits,
    focusedPoint: { datum, position, allSmbgsOnDate, allPositions },
    timePrefs,
    lines,
  } = props;

  const parsedTime = getParsedTime(datum, timePrefs);
  const lineDate = formatDisplayDate(parsedTime, timePrefs, 'dddd MMM D');
  const shortDate = formatDisplayDate(parsedTime, timePrefs, 'MMM D');
  const side = position.tooltipLeft ? 'left' : 'right';
  if (!lines) {
    const focusedPointIndex = _.indexOf(allSmbgsOnDate, datum);
    _.pullAt(allSmbgsOnDate, focusedPointIndex);
    _.pullAt(allPositions, focusedPointIndex);
  }
  const pointTooltips = _.map(allSmbgsOnDate, (smbg, i) => (
    <Tooltip
      key={i}
      content={<span className={styles.number}>{displayBgValue(smbg.value, bgUnits)}</span>}
      position={allPositions[i]}
      side={'bottom'}
      tail={false}
      offset={{ top: SIMPLE_VALUE_TOP_OFFSET, left: 0 }}
    />
  ));
  let focusedTooltip;
  if (lines) {
    focusedTooltip = (
      <Tooltip
        title={<span className={styles.explainerText}>{lineDate}</span>}
        position={position}
        side={side}
        offset={{
          top: SIMPLE_DAY_TOP_OFFSET,
          horizontal: SIMPLE_DAY_HORIZ_OFFSET,
        }}
      />
    );
  } else {
    focusedTooltip = (
      <Tooltip
        title={<span className={styles.tipWrapper}>
          <span className={styles.shortDate}>{shortDate}</span>
          <span className={styles.shortTime}>{millisecondsAsTimeOfDay(datum.msPer24)}</span>
        </span>
        }
        content={<span className={styles.tipWrapper}>
          <span className={styles.detailNumber}>{displayBgValue(datum.value, bgUnits)}</span>
          <span className={styles.subType}>{categorizeSmbgSubtype(datum)}</span>
        </span>
        }
        position={position}
        side={side}
        offset={{
          top: 0,
          horizontal: DETAILED_DAY_HORIZ_OFFSET,
        }}
      />
    );
  }
  return (
    <div className={styles.container}>
      {pointTooltips}
      {focusedTooltip}
    </div>
  );
};

FocusedSMBGPointLabel.propTypes = {
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  focusedPoint: PropTypes.shape({
    allPositions: PropTypes.arrayOf(PropTypes.shape({
      tooltipLeft: PropTypes.bool.isRequired,
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })),
    allSmbgsOnDate: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
    })),
    date: PropTypes.string.isRequired,
    datum: PropTypes.shape({
      deviceTime: PropTypes.string,
      msPer24: PropTypes.number.isRequired,
      subType: PropTypes.string,
      time: PropTypes.string,
      value: PropTypes.number.isRequired,
    }),
    position: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
  }),
  grouped: React.PropTypes.bool.isRequired,
  lines: React.PropTypes.bool.isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
  }).isRequired,
};

export default FocusedSMBGPointLabel;
