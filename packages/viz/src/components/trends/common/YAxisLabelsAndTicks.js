import _ from 'lodash';

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

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { formatBgValue } from '../../../utils/format';

import styles from './YAxisLabelsAndTicks.css';

const YAxisLabels = (props) => {
  const { bgPrefs, margins, textToTickGap, tickWidth, yScale } = props;
  const { bgBounds } = bgPrefs;

  return (
    <g id="yAxisLabels">
      {_.map(['targetLowerBound', 'targetUpperBound', 'veryHighThreshold', 'veryLowThreshold'],
        (boundKey) => (
          <g id="yAxisLabel" key={boundKey}>
            <text
              className={styles.text}
              x={margins.left - tickWidth - textToTickGap}
              y={yScale(bgBounds[boundKey])}
            >
              {formatBgValue(bgBounds[boundKey], bgPrefs)}
            </text>
            <line
              className={styles.tick}
              x1={margins.left - tickWidth}
              x2={margins.left}
              y1={yScale(bgBounds[boundKey])}
              y2={yScale(bgBounds[boundKey])}
            />
          </g>
        ))
      }
    </g>
  );
};

YAxisLabels.defaultProps = {
  textToTickGap: 2,
  tickWidth: 8,
};

YAxisLabels.propTypes = {
  bgPrefs: PropTypes.shape({
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }),
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  }),
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  textToTickGap: PropTypes.number.isRequired,
  tickWidth: PropTypes.number.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default YAxisLabels;
