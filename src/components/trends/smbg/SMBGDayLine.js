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

// TODO: this component should render a line connecting the smbgs from a single day
// it has two or three potential states:
// - grouping on: the y-position of each point on the line segment
//   is the average of all the smbgs in the group
//   NB: when grouping is on, no line hover interaction
// - grouping off: just connect the dots!
//   but also include a 2nd, fatter invisible line with onMouseOver & onMouseOut handlers
//   for the line to "focus" the whole day
//   (there seems to be a regression on prod re: the rendering of the fatter invisible lines)
// - [maybe] day is focused (through hover) fatter & solid line connecting the dots
//   this style also applies when a single smbg is focused

import React, { PropTypes } from 'react';
import { line } from 'd3-shape';
import _ from 'lodash';

import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

const SMBGDayLine = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { day, xScale, yScale, grouped } = props;

  // TODO: const mapObject = (obj, fn) => _.mapKeys(obj, key => fn(obj[key], key, obj));
  const mapObject = (obj, fn) => Object.keys(obj).map(key => fn(obj[key], key, obj));

  const xPosition = (msPer24) => {
    if (grouped) {
      return findBinForTimeOfDay(THREE_HRS, msPer24);
    }
    return msPer24;
  };

  const getPoints = (smbgs) => {
    const points = [];
    _.map(smbgs, (d, i) => {
      points[String(i)] = {
        x: xScale(xPosition(d.msPer24)),
        y: yScale(d.value),
      };
    });
    return points;
  };

  const smbgDayLine = line()(mapObject(getPoints(data), ({ x, y }) => [x, y]));

  return (
    <g id={`smbgDayLine-${day}`}>
      <path
        d={smbgDayLine}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={1}
      />
    </g>
  );
};

SMBGDayLine.propTypes = {
  day: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
};

export default SMBGDayLine;
