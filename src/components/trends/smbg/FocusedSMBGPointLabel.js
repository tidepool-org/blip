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
import cx from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from '../common/Tooltip';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { displayBgValue } from '../../../utils/format';

import styles from './FocusedSMBGPointLabel.css';

const FocusedSMBGPointLabel = (props) => {
  console.log(props);
  const { focusedPoint } = props;
  if (!focusedPoint) {
    return null;
  }

  const { bgUnits, focusedPoint: { data, position } } = props;
  return (
    <div className={styles.container}>
      <Tooltip
        content={displayBgValue(data.value, bgUnits)}
        position={position}
        side={'bottom'}
        tail={false}
        offset={{ top: 15, left: 0 }}
      />
    </div>
  );
};

FocusedSMBGPointLabel.defaultProps = {};

FocusedSMBGPointLabel.propTypes = {
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  focusedKeys: PropTypes.arrayOf(PropTypes.oneOf([
    'firstQuartile',
    'max',
    'median',
    'min',
    'ninetiethQuantile',
    'tenthQuantile',
    'thirdQuartile',
  ])),
  focusedPoint: PropTypes.object,
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
      tenthQuantile: PropTypes.number.isRequired,
      thirdQuartile: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      topOptions: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }),
};

export default FocusedSMBGPointLabel;
