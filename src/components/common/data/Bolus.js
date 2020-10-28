/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import PropTypes from 'prop-types';
import React from 'react';

import { getBolusFromInsulinEvent, getCarbs, getMaxValue } from '../../../utils/bolus';
import getBolusPaths from '../../../modules/render/bolus';

import styles from './Bolus.css';

const Bolus = (props) => {
  const {
    insulinEvent,
    bolusWidth,
    carbCircleOffset,
    carbCircleRadius,
    extendedLineThickness,
    interruptedLineThickness,
    triangleHeight,
    xScale,
    yScale,
  } = props;
  const bolus = getBolusFromInsulinEvent(insulinEvent);
  const paths = getBolusPaths(insulinEvent, xScale, yScale, {
    bolusWidth, extendedLineThickness, interruptedLineThickness, triangleHeight,
  });
  if (_.isEmpty(paths)) {
    return null;
  }

  const toRender = _.map(
    paths, (path) => (<path className={styles[path.type]} d={path.d} key={path.key} />)
  );

  // add the carb circle if wizard event with
  const carbs = getCarbs(insulinEvent);
  // truthiness is exactly the logic desired here
  // because it excludes: NaN, null, and 0
  if (carbs) {
    const carbsX = xScale(bolus.utc);
    const carbsY = yScale(getMaxValue(insulinEvent)) - carbCircleOffset - carbCircleRadius;
    toRender.push(
      <circle
        className={styles.carbCircle}
        cx={carbsX}
        cy={carbsY}
        r={carbCircleRadius}
      />
    );
    toRender.push(
      <text
        className={styles.carbText}
        x={carbsX}
        y={carbsY}
      >
        {carbs}
      </text>
    );
  }

  return (
    <g id={`bolus-${bolus.id}`}>
      {toRender}
    </g>
  );
};

Bolus.defaultProps = {
  bolusWidth: 12,
  carbCircleOffset: 4,
  carbCircleRadius: 14,
  extendedLineThickness: 2,
  interruptedLineThickness: 2,
  triangleHeight: 5,
};

Bolus.propTypes = {
  insulinEvent: PropTypes.oneOfType([
    PropTypes.shape({
      normal: PropTypes.number,
      expectedNormal: PropTypes.number,
      extended: PropTypes.number,
      expectedExtended: PropTypes.number,
      duration: PropTypes.number,
      expectedDuration: PropTypes.number,
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bolus']).isRequired,
      utc: PropTypes.number.isRequired,
    }).isRequired,
    PropTypes.shape({
      bolus: PropTypes.shape({
        id: PropTypes.string.isRequired,
        normal: PropTypes.number,
        expectedNormal: PropTypes.number,
        extended: PropTypes.number,
        expectedExtended: PropTypes.number,
        duration: PropTypes.number,
        expectedDuration: PropTypes.number,
        type: PropTypes.oneOf(['bolus']).isRequired,
        utc: PropTypes.number.isRequired,
      }).isRequired,
      recommended: PropTypes.shape({
        carb: PropTypes.number,
        correction: PropTypes.number,
        net: PropTypes.number,
      }).isRequired,
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['wizard']).isRequired,
    }).isRequired,
  ]).isRequired,
  bolusWidth: PropTypes.number.isRequired,
  carbCircleOffset: PropTypes.number.isRequired,
  carbCircleRadius: PropTypes.number.isRequired,
  extendedLineThickness: PropTypes.number.isRequired,
  interruptedLineThickness: PropTypes.number.isRequired,
  triangleHeight: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default Bolus;
