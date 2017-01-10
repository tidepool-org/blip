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
import { TransitionMotion, spring } from 'react-motion';
import _ from 'lodash';
import cx from 'classnames';

import { classifyBgValue } from '../../../utils/bloodglucose';
import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './SMBGDatePointsAnimated.css';

export const SMBGDatePointsAnimated = (props) => {
  const {
    bgBounds,
    data,
    date,
    defaultY,
    focusSmbg,
    grouped,
    isFocused,
    nonInteractive,
    onSelectDay,
    smbgOpts,
    tooltipLeftThreshold,
    unfocusSmbg,
    xScale,
    yScale,
  } = props;
  const radius = isFocused ? smbgOpts.maxR : smbgOpts.r;
  const xPosition = (msPer24) => {
    if (grouped) {
      return xScale(findBinForTimeOfDay(THREE_HRS, msPer24));
    }
    return xScale(msPer24);
  };
  const positions = _.map(data, (smbg) => ({
    left: xPosition(smbg.msPer24),
    top: yScale(smbg.value),
    tooltipLeft: smbg.msPer24 > tooltipLeftThreshold,
  }));

  return (
    <TransitionMotion
      defaultStyles={(data.length || !nonInteractive) ? _.map(data, (smbg, i) => {
        const position = positions[i];
        return {
          key: smbg.id,
          style: {
            cx: position.left,
            cy: defaultY,
            r: 0,
          },
        };
      }) : []}
      styles={data.length ? _.map(data, (smbg, i) => {
        const position = positions[i];
        return {
          key: smbg.id,
          data: {
            classes: cx({
              [styles.smbg]: !isFocused,
              [styles.solid]: isFocused,
              [styles[classifyBgValue(bgBounds, smbg.value)]]: true,
            }),
            position,
            smbg,
          },
          style: {
            cx: spring(position.left),
            cy: spring(position.top),
            // slow down the radius animation a bit
            r: spring(radius, { stiffness: 60, damping: 15 }),
          },
        };
      }) : []}
    >
      {(interpolateds) => {
        if (interpolateds.length === 0) {
          return null;
        }
        return (
          <g id={`smbgDatePoints-${date}`}>
            {_.map(interpolateds, (smbg) => {
              const { key, style } = smbg;
              return (
                <circle
                  className={smbg.data.classes}
                  id={`smbg-${key}`}
                  key={key}
                  onMouseOver={
                    () => focusSmbg(smbg.data.smbg, smbg.data.position, data, positions, date)
                  }
                  onMouseOut={unfocusSmbg}
                  onClick={() => onSelectDay(date)}
                  cx={style.cx}
                  cy={style.cy}
                  r={style.r}
                  pointerEvents={nonInteractive ? 'none' : 'all'}
                />
              );
            })}
          </g>
        );
      }}
    </TransitionMotion>
  );
};

SMBGDatePointsAnimated.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  date: PropTypes.string.isRequired,
  defaultY: PropTypes.number.isRequired,
  focusSmbg: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  isFocused: PropTypes.bool.isRequired,
  nonInteractive: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default withDefaultYPosition(SMBGDatePointsAnimated);
