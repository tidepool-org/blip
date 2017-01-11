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

import React, { Component, PropTypes } from 'react';
import { TransitionMotion, spring } from 'react-motion';
import _ from 'lodash';

import { classifyBgValue } from '../../../utils/bloodglucose';
import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './SMBGDatePointsAnimated.css';

export class SMBGDatePointsAnimated extends Component {
  static defaultProps = {
    radiusAnimationConfig: { stiffness: 60, damping: 15 },
  };

  static propTypes = {
    anSmbgRangeAvgIsFocused: PropTypes.bool.isRequired,
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
    radiusAnimationConfig: PropTypes.shape({
      stiffness: PropTypes.number.isRequired,
      damping: PropTypes.number.isRequired,
    }).isRequired,
    smbgOpts: PropTypes.shape({
      maxR: PropTypes.number.isRequired,
      r: PropTypes.number.isRequired,
    }).isRequired,
    someSmbgDataIsFocused: PropTypes.bool.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusSmbg: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.willLeave = this.willLeave.bind(this);
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY, radiusAnimationConfig } = this.props;
    return {
      cx: style.cx,
      cy: spring(defaultY),
      // slow down the radius animation a bit
      r: spring(0, radiusAnimationConfig),
    };
  }


  render() {
    const {
      anSmbgRangeAvgIsFocused,
      bgBounds,
      data,
      date,
      focusSmbg,
      grouped,
      isFocused,
      nonInteractive,
      onSelectDay,
      radiusAnimationConfig,
      smbgOpts,
      someSmbgDataIsFocused,
      tooltipLeftThreshold,
      unfocusSmbg,
      xScale,
      yScale,
    } = this.props;
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
              cy: position.top,
              opacity: 0.5,
              r: 0,
            },
          };
        }) : []}
        styles={data.length ? _.map(data, (smbg, i) => {
          const position = positions[i];
          return {
            key: smbg.id,
            data: {
              classes: styles[classifyBgValue(bgBounds, smbg.value)],
              position,
              smbg,
            },
            style: {
              cx: spring(position.left),
              cy: spring(position.top),
              opacity: (anSmbgRangeAvgIsFocused || someSmbgDataIsFocused) ?
                spring(0.35) : spring(0.8, radiusAnimationConfig),
              // slow down the radius animation a bit
              r: spring(radius, radiusAnimationConfig),
            },
          };
        }) : []}
        willLeave={this.willLeave}
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
                    fillOpacity={style.opacity}
                    pointerEvents={nonInteractive ? 'none' : 'all'}
                  />
                );
              })}
            </g>
          );
        }}
      </TransitionMotion>
    );
  }
}

export default withDefaultYPosition(SMBGDatePointsAnimated);
