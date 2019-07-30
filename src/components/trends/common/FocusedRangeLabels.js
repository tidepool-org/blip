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
import { formatBgValue } from '../../../utils/format';
import { formatClocktimeFromMsPer24 } from '../../../utils/datetime';

import styles from './FocusedRangeLabels.css';

const FocusedRangeLabels = (props) => {
  const { focusedKeys, focusedRange, focusedSlice } = props;
  if (!(focusedRange || (focusedKeys && focusedSlice))) {
    return null;
  }
  // no range labels when focus is the median only on cbg version
  if (focusedKeys && focusedKeys.length === 1) {
    return null;
  }

  const { bgPrefs, dataType } = props;
  const isCbg = dataType === 'cbg';
  const dataBucket = isCbg ? 'focusedSlice' : 'focusedRange';
  const { [dataBucket]: { data, position } } = props;
  const timeFrom = formatClocktimeFromMsPer24(data.msFrom);
  const timeTo = formatClocktimeFromMsPer24(data.msTo);
  const top = isCbg ? focusedKeys[1] : 'max';
  const center = isCbg ? 'median' : 'mean';
  const bottom = isCbg ? focusedKeys[0] : 'min';
  const topPosition = {
    top: position.yPositions[top],
    left: position.left,
  };
  const bottomPosition = {
    top: position.yPositions[bottom],
    left: position.left,
  };
  const centerPosition = {
    top: position.yPositions[center],
    left: position.left,
  };
  const centerSide = position.tooltipLeft ? 'left' : 'right';
  return (
    <div className={styles.container}>
      {isCbg ? (
        <Tooltip
          title={<span className={styles.timeLabel}>{timeFrom} - {timeTo}</span>}
          borderWidth={0}
          position={{ left: position.left, top: position.yPositions.topMargin }}
          side={'bottom'}
          tail={false}
        />
      ) : null}
      <Tooltip
        content={
          <span className={styles.number}>
            {formatBgValue(data[top], bgPrefs, data.outOfRangeThresholds)}
          </span>
        }
        backgroundColor={'transparent'}
        borderColor={'transparent'}
        offset={{ left: 0, top: isCbg ? props.numberOffsets.top : 0 }}
        position={topPosition}
        side={'top'}
        tail={false}
      />
      {isCbg ? null : (
        <Tooltip
          title={<span className={styles.explainerText}>{timeFrom} - {timeTo}</span>}
          content={
            <span className={styles.number}>
              {`Average ${formatBgValue(data[center], bgPrefs, data.outOfRangeThresholds)}`}
            </span>
          }
          offset={{ top: 0, horizontal: props.numberOffsets.horizontal }}
          position={centerPosition}
          side={centerSide}
        />
      )}
      <Tooltip
        content={
          <span className={styles.number}>
            {formatBgValue(data[bottom], bgPrefs, data.outOfRangeThresholds)}
          </span>
        }
        backgroundColor={'transparent'}
        borderColor={'transparent'}
        offset={{ left: 0, top: isCbg ? props.numberOffsets.bottom : 0 }}
        position={bottomPosition}
        side={'bottom'}
        tail={false}
      />
    </div>
  );
};

FocusedRangeLabels.defaultProps = {
  numberOffsets: {
    bottom: -5,
    horizontal: 10,
    top: 5,
  },
};

FocusedRangeLabels.propTypes = {
  bgPrefs: PropTypes.shape({
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    // only the bgUnits required in this component
    // so leaving off specification of bgBounds shape
  }).isRequired,
  dataType: PropTypes.oneOf(['cbg', 'smbg']).isRequired,
  focusedKeys: PropTypes.arrayOf(PropTypes.oneOf([
    'firstQuartile',
    'max',
    'median',
    'min',
    'ninetiethQuantile',
    'tenthQuantile',
    'thirdQuartile',
  ])),
  focusedRange: PropTypes.shape({
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      max: PropTypes.number.isRequired,
      mean: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      msX: PropTypes.number.isRequired,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
      outOfRangeThresholds: PropTypes.shape({
        low: PropTypes.number,
        high: PropTypes.number,
      }),
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
  focusedSlice: PropTypes.shape({
    data: PropTypes.shape({
      firstQuartile: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      max: PropTypes.number.isRequired,
      median: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
      msX: PropTypes.number.isRequired,
      ninetiethQuantile: PropTypes.number.isRequired,
      outOfRangeThresholds: PropTypes.shape({
        low: PropTypes.number,
        high: PropTypes.number,
      }),
      tenthQuantile: PropTypes.number.isRequired,
      thirdQuartile: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      yPositions: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
        topMargin: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }),
  numberOffsets: PropTypes.shape({
    bottom: PropTypes.number.isRequired,
    horizontal: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
  }).isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.string,
  }).isRequired,
};

export default FocusedRangeLabels;
