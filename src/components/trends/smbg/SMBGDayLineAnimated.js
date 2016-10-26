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
import { TransitionMotion, spring } from 'react-motion';
import { line } from 'd3-shape';
import _ from 'lodash';
import cx from 'classnames';

import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import styles from './SMBGDayLineAnimated.css';

const SMBGDayLineAnimated = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { date, xScale, yScale, grouped, focusLine, unfocusLine, focusedDay } = props;

  const xPosition = (msPer24) => {
    if (grouped) {
      return findBinForTimeOfDay(THREE_HRS, msPer24);
    }
    return msPer24;
  };

  const positions = _.map(data, (smbg) => ({
    left: xScale(xPosition(smbg.msPer24)),
    top: yScale(smbg.value),
  }));

  const getPoints = (smbgs) => {
    const points = [];
    _.map(smbgs, (d) => {
      points.push({
        key: d.id,
        style: {
          x: spring(xScale(xPosition(d.msPer24))),
          y: spring(yScale(d.value)),
        } },
      );
    });
    return points;
  };

  const classes = cx({
    [styles.smbgPath]: true,
    [styles.highlightPath]: focusedDay === date,
  });

  // NOTE: This mapping is required due to the differing
  // expectations of TransitionMotion and d3 line
  const mapObject = (obj, fn) => _.map(_.keys(obj), (key) => fn(obj[key], key, obj));

  return (
    <g id={`smbgDayLine-${date}`}>
      <TransitionMotion styles={getPoints(data)}>
        {(interpolated) => (
          <path
            d={line()(mapObject(_.pluck(interpolated, 'style'), ({ x, y }) => [x, y]))}
            className={classes}
            onMouseOver={() => { focusLine(data[0], positions[0], data, positions, date); }}
            onMouseOut={() => { unfocusLine(); }}
          />
        )}
      </TransitionMotion>
    </g>
  );
};

SMBGDayLineAnimated.propTypes = {
  date: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  focusLine: PropTypes.func.isRequired,
  unfocusLine: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  focusedDay: PropTypes.string.isRequired,
};

export default SMBGDayLineAnimated;
