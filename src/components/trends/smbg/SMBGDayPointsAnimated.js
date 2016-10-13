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

import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import styles from './SMBGDayPointsAnimated.css';

const SMBGDayPointsAnimated = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const { day, xScale, yScale, focusSmbg, unfocusSmbg, grouped } = props;
  const radius = 7;
  const xPosition = (msPer24) => {
    if (grouped) {
      return xScale(findBinForTimeOfDay(THREE_HRS, msPer24));
    }
    return xScale(msPer24);
  };
  const positions = _.map(data, (smbg) => ({
    left: xPosition(smbg.msPer24), top: yScale(smbg.value),
  }));
  return (
    <g id={`smbgDayPoints-${day}`}>
      {_.map(data, (smbg) => {
        const cx = xPosition(smbg.msPer24);
        const cy = yScale(smbg.value);
        const position = { left: cx, top: cy };
        const focus = () => {
          console.log('focused on: ', smbg, data);
          focusSmbg(smbg, position, data, positions);
        };
        const unfocus = () => {
          console.log('unfocus:', smbg.id);
          unfocusSmbg();
        };

        return (
          <Motion style={{ xPos: spring(xPosition(smbg.msPer24)) }}>
            {(interpolated) => (
              <circle
                className={styles.smbg}
                key={`smbg-${smbg.id}`}
                id={`smbg-${smbg.id}`}
                onMouseOver={focus}
                onMouseOut={unfocus}
                cx={interpolated.xPos}
                cy={yScale(smbg.value)}
                r={radius}
              />
            )}
          </Motion>
        );
      })}
    </g>
  );
};

SMBGDayPointsAnimated.propTypes = {
  day: PropTypes.string.isRequired,
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
};

export default SMBGDayPointsAnimated;
