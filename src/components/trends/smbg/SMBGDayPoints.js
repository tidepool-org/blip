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

// TODO: this component should render each of the smbgs in a given day as a circle
// it also attaches onMouseOver and onMouseOut handlers to each circle
// for focusing that particular smbg
// when an smbg is focused, it's circle gets bigger
// and so do the circles for every smbg in the day and the line too (see notes in SMBGDayLine)

import React, { PropTypes } from 'react';

import { findClassForValue } from '../../../utils/bgBoundary';

import styles from './SMBGDayPoints.css';

const SMBGDayPoints = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { radius, xScale, yScale } = props;

  const smbgs = _.each(data, (smbg) => (
    <circle
      className={findClassForValue(smbg.value)}
      key={`smbg-${smbg.id}`}
      id={`smbg-${smbg.id}`}
      cx={xScale(smbg.msX)}
      cy={yScale(smbg.value)}
      r={radius}
    />
  ));

  return (
    <g id='smbgs'}>
      {smbgs}
    </g>
  );
};

SMBGDayPoints.defaultProps = {
  radius: 7,
};

SMBGDayPoints.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msX: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
	xScale: PropTypes.func.isRequired,
	yScale: PropTypes.func.isRequired,
	radius: PropTypes.number.isRequired,
};

export default SMBGDayPoints;
