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
import { Motion, spring } from 'react-motion';
import _ from 'lodash';
import cx from 'classnames';

import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import styles from './SMBGDayPointsAnimated.css';

const SMBGDayPointsAnimated = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { date,
    xScale,
    yScale,
    focusSmbg,
    unfocusSmbg,
    grouped,
    focusedDay,
    smbgOpts,
    onSelectDay,
    nonInteractive } = props;
  const radius = (date === focusedDay) ? smbgOpts.maxR : smbgOpts.r;
  const xPosition = (msPer24) => {
    if (grouped) {
      return xScale(findBinForTimeOfDay(THREE_HRS, msPer24));
    }
    return xScale(msPer24);
  };
  const positions = _.map(data, (smbg) => ({
    left: xPosition(smbg.msPer24),
    top: yScale(smbg.value),
    tooltipLeft: smbg.msPer24 > props.tooltipLeftThreshold,
  }));
  return (
    <g id={`smbgDayPoints-${date}`}>
      {_.map(data, (smbg) => {
        const xPos = xPosition(smbg.msPer24);
        const yPos = yScale(smbg.value);
        const position = {
          tooltipLeft: smbg.msPer24 > props.tooltipLeftThreshold,
          left: xPos,
          top: yPos,
        };
        const focus = () => {
          focusSmbg(smbg, position, data, positions, date);
        };
        const unfocus = () => {
          unfocusSmbg();
        };
        const selectDay = () => {
          onSelectDay(date);
        };
        const classes = cx({
          [styles.smbg]: true,
          [styles.solid]: date === focusedDay,
        });

        return (
          <Motion style={{ xPos: spring(xPosition(smbg.msPer24)) }} key={`smbg-${smbg.id}`}>
            {(interpolated) => (
              <circle
                className={classes}
                id={`smbg-${smbg.id}`}
                onMouseOver={focus}
                onMouseOut={unfocus}
                onDoubleClick={selectDay}
                cx={interpolated.xPos}
                cy={yScale(smbg.value)}
                r={radius}
                pointerEvents={nonInteractive ? 'none' : 'all'}
              />
            )}
          </Motion>
        );
      })}
    </g>
  );
};

SMBGDayPointsAnimated.propTypes = {
  date: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  focusSmbg: PropTypes.func.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  focusedDay: PropTypes.string.isRequired,
  onSelectDay: PropTypes.func.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  nonInteractive: PropTypes.bool,
};

export default SMBGDayPointsAnimated;
