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
// eslint-disable-next-line import/no-unresolved
import cx from 'classnames';
// eslint-disable-next-line import/no-unresolved
import { range } from 'd3-array';
import React, { PropTypes } from 'react';

const FILL_CLASSES = [
  'backgroundDarkest',
  'backgroundDark',
  'backgroundLighter',
  'backgroundLight',
  'backgroundLightest',
  'backgroundLighter',
  'backgroundDark',
  'backgroundDarker',
];

const THREE_HRS = 10800000;

import styles from '../../styles/background.css';

const ModalBackground = (props) => {
  const { data, margins, smbgOpts, svgDimensions, xScale } = props;
  return (
    <g id="trendsBackgroundRects">
      {_.map(data, (val, i) => {
        const xRange = xScale.range();
        const baseWidth = (xRange[1] - xRange[0]) / props.data.length;
        return (
          <rect
            className={cx({ [styles[FILL_CLASSES[i]]]: true })}
            key={`trendsBackroundRect-${i}`}
            x={(i === 0) ? margins.left : xScale(val)}
            y={margins.top}
            width={_.includes([0, 7], i) ? baseWidth + smbgOpts.maxR : baseWidth}
            height={svgDimensions.height - margins.bottom - margins.top}
          >
          </rect>
        );
      })}
    </g>
  );
};

ModalBackground.defaultProps = {
  data: _.map(range(0, 8), (i) => (i * THREE_HRS)),
};

ModalBackground.propTypes = {
  data: PropTypes.array.isRequired,
  margins: PropTypes.object.isRequired,
  smbgOpts: PropTypes.object.isRequired,
  svgDimensions: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
};

export default ModalBackground;
