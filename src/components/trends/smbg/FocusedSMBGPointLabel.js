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

import PropTypes from 'prop-types';

import React from 'react';
import _ from 'lodash';
import Tooltip from '../../common/tooltips/Tooltip';
import SMBGToolTip from '../../daily/smbgtooltip/SMBGTooltip';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { formatBgValue } from '../../../utils/format';
import { getOutOfRangeThreshold } from '../../../utils/bloodglucose';
import {
  formatClocktimeFromMsPer24,
  formatLocalizedFromUTC,
  getHammertimeFromDatumWithTimePrefs,
} from '../../../utils/datetime';

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
    bgPrefs,
    focusedPoint: { datum, position, allSmbgsOnDate, allPositions },
    timePrefs,
    lines,
  } = props;

  const hammertime = getHammertimeFromDatumWithTimePrefs(datum, timePrefs);
  const lineDate = formatLocalizedFromUTC(hammertime, timePrefs);
  const shortDate = formatLocalizedFromUTC(hammertime, timePrefs, 'MMM D');
  const side = position.tooltipLeft ? 'left' : 'right';
  const smbgsOnDate = allSmbgsOnDate.slice();
  const positions = allPositions.slice();
  if (!lines) {
    const focusedPointIndex = _.findIndex(allSmbgsOnDate, (d) => (d.value === datum.value));
    _.pullAt(smbgsOnDate, focusedPointIndex);
    _.pullAt(positions, focusedPointIndex);
  }
  const pointTooltips = _.map(smbgsOnDate, (smbg, i) => (
    <Tooltip
      key={i}
      content={
        <span className={styles.number}>
          {formatBgValue(smbg.value, bgPrefs, getOutOfRangeThreshold(smbg))}
        </span>
      }
      position={positions[i]}
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
      <SMBGToolTip
        title={
          <span className={styles.tipWrapper}>
            <span className={styles.dateTime}>
              {`${shortDate}, ${formatClocktimeFromMsPer24(datum.msPer24)}`}
            </span>
          </span>
        }
        position={position}
        side={side}
        offset={{
          top: 0,
          horizontal: DETAILED_DAY_HORIZ_OFFSET,
        }}
        smbg={datum}
        bgPrefs={bgPrefs}
        timePrefs={timePrefs}
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
  bgPrefs: PropTypes.shape({
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    // only the bgUnits required in this component
    // so leaving off specification of bgBounds shape
  }).isRequired,
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
  grouped: PropTypes.bool.isRequired,
  lines: PropTypes.bool.isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool.isRequired,
    timezoneName: PropTypes.string,
  }).isRequired,
};

export default FocusedSMBGPointLabel;
