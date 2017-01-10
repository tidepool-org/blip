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

import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './SMBGAvgAnimated.css';

export class SMBGAvgAnimated extends Component {
  static defaultProps = {
    avgRadius: 7,
  };

  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    datum: PropTypes.shape({
      id: PropTypes.string.isRequired,
      max: PropTypes.number,
      mean: PropTypes.number,
      min: PropTypes.number,
      msX: PropTypes.number.isRequired,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
    }),
    defaultY: PropTypes.number.isRequired,
    focus: PropTypes.func.isRequired,
    avgRadius: PropTypes.number.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocus: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.willEnter = this.willEnter.bind(this);
    this.willLeave = this.willLeave.bind(this);
  }

  willEnter(entered) {
    const { style } = entered;
    const { defaultY } = this.props;
    return {
      cx: style.cx,
      cy: defaultY,
      r: 0,
    };
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY } = this.props;
    return {
      cx: style.cx,
      cy: spring(defaultY),
      r: spring(0),
    };
  }

  render() {
    const { datum, defaultY, focus, avgRadius, unfocus, xScale, yScale } = this.props;
    const xPos = xScale(datum.msX);
    const yPositions = {
      min: yScale(datum.min),
      mean: yScale(datum.mean),
      max: yScale(datum.max),
    };
    const focusAvg = () => {
      focus(datum, {
        left: xPos,
        tooltipLeft: datum.msX > this.props.tooltipLeftThreshold,
        yPositions,
      });
    };

    return (
      <TransitionMotion
        defaultStyles={[{
          key: datum.id,
          style: {
            cx: xPos,
            cy: defaultY,
            r: 0,
          },
        }]}
        styles={datum.mean ? [{
          key: datum.id,
          style: {
            cx: xPos,
            cy: spring(yPositions.mean),
            r: spring(avgRadius),
          },
        }] : []}
      >
        {(interpolated) => {
          if (interpolated.length === 0) {
            return null;
          }
          const { style } = interpolated[0];
          return (
            <circle
              className={styles.smbgAvg}
              id={`smbgAvg-${datum.id}`}
              onMouseOver={focusAvg}
              onMouseOut={unfocus}
              cx={style.cx}
              cy={style.cy}
              r={style.r}
            />
          );
        }}
      </TransitionMotion>
    );
  }
}

export default withDefaultYPosition(SMBGAvgAnimated);
