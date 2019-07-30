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

import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TransitionMotion, spring } from 'react-motion';
import _ from 'lodash';

import { classifyBgValue } from '../../../utils/bloodglucose';
import { springConfig } from '../../../utils/constants';
import { THREE_HRS } from '../../../utils/datetime';
import { findBinForTimeOfDay } from '../../../utils/trends/data';

import { focusTrendsSmbg, unfocusTrendsSmbg } from '../../../redux/actions/trends';

import styles from './SMBGDatePointsAnimated.css';

export class SMBGDatePointsAnimated extends PureComponent {
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
    focusSmbg: PropTypes.func.isRequired,
    grouped: PropTypes.bool.isRequired,
    isFocused: PropTypes.bool.isRequired,
    nonInteractive: PropTypes.bool,
    onSelectDate: PropTypes.func.isRequired,
    smbgOpts: PropTypes.shape({
      maxR: PropTypes.number.isRequired,
      r: PropTypes.number.isRequired,
    }).isRequired,
    someSmbgDataIsFocused: PropTypes.bool.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusSmbg: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.getPositions = this.getPositions.bind(this);
    this.getXPosition = this.getXPosition.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.willEnter = this.willEnter.bind(this);
    this.willLeave = this.willLeave.bind(this);
  }

  getPositions() {
    const { data, tooltipLeftThreshold, yScale } = this.props;
    return _.map(data, (d) => ({
      left: this.getXPosition(d.msPer24),
      top: yScale(d.value),
      tooltipLeft: d.msPer24 > tooltipLeftThreshold,
    }));
  }

  getXPosition(msPer24) {
    const { grouped, xScale } = this.props;
    if (grouped) {
      return xScale(findBinForTimeOfDay(THREE_HRS, msPer24));
    }
    return xScale(msPer24);
  }

  handleClick() {
    const { date, onSelectDate } = this.props;
    onSelectDate(date);
  }

  handleMouseOut() {
    const { unfocusSmbg, userId } = this.props;
    unfocusSmbg(userId);
  }

  willEnter(entered) {
    const { data } = entered;
    const { xScale } = this.props;
    return {
      cx: xScale(data.smbg.msPer24),
      opacity: 0.5,
      r: 0,
    };
  }

  willLeave(exited) {
    const { data } = exited;
    const { anSmbgRangeAvgIsFocused, someSmbgDataIsFocused, xScale } = this.props;
    return {
      cx: spring(xScale(data.smbg.msPer24), springConfig),
      opacity: (anSmbgRangeAvgIsFocused || someSmbgDataIsFocused) ?
        spring(0.35, springConfig) : spring(0.8, springConfig),
      r: spring(0, springConfig),
    };
  }

  render() {
    const {
      anSmbgRangeAvgIsFocused,
      bgBounds,
      data,
      date,
      focusSmbg,
      isFocused,
      nonInteractive,
      smbgOpts,
      someSmbgDataIsFocused,
      userId,
    } = this.props;
    const radius = isFocused ? smbgOpts.maxR : smbgOpts.r;
    const positions = this.getPositions();

    return (
      <TransitionMotion
        defaultStyles={(data.length || !nonInteractive) ? _.map(data, (smbg, i) => {
          const position = positions[i];
          return {
            key: smbg.id,
            style: {
              cx: position.left,
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
              classes: styles[classifyBgValue(bgBounds, smbg.value, 'fiveWay')],
              position,
              smbg,
            },
            style: {
              cx: spring(position.left, springConfig),
              opacity: (anSmbgRangeAvgIsFocused || someSmbgDataIsFocused) ?
                spring(0.35, springConfig) : spring(0.8, springConfig),
              r: spring(radius, springConfig),
            },
          };
        }) : []}
        willEnter={this.willEnter}
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
                    onMouseOver={() => focusSmbg(
                      userId, smbg.data.smbg, smbg.data.position, data, positions, date
                    )}
                    onMouseOut={this.handleMouseOut}
                    onClick={this.handleClick}
                    cx={style.cx}
                    cy={smbg.data.position.top}
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

export function mapStateToProps(state) {
  const { blip: { currentPatientInViewId } } = state;
  return {
    userId: currentPatientInViewId,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    focusSmbg: focusTrendsSmbg,
    unfocusSmbg: unfocusTrendsSmbg,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SMBGDatePointsAnimated);
