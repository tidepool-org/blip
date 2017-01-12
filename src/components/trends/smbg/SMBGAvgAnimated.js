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

import cx from 'classnames';
import React, { Component, PropTypes } from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { classifyBgValue } from '../../../utils/bloodglucose';
import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './SMBGAvgAnimated.css';

export class SMBGAvgAnimated extends Component {
  static defaultProps = {
    cornerRadius: 2,
    meanHeight: 10,
    rectWidth: 16,
  };

  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    cornerRadius: PropTypes.number.isRequired,
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
    meanHeight: PropTypes.number.isRequired,
    rectWidth: PropTypes.number.isRequired,
    someSmbgDataIsFocused: PropTypes.bool.isRequired,
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
      x: style.x,
      y: defaultY,
      height: 0,
      opacity: 0,
    };
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY } = this.props;
    return {
      x: style.x,
      y: spring(defaultY),
      height: spring(0),
      opacity: spring(0.0),
    };
  }

  render() {
    const {
      bgBounds,
      cornerRadius,
      datum,
      defaultY,
      focus,
      meanHeight,
      rectWidth,
      someSmbgDataIsFocused,
      tooltipLeftThreshold,
      unfocus,
      xScale,
      yScale,
    } = this.props;
    const xPos = xScale(datum.msX) - rectWidth / 2 - styles.stroke / 2;
    const yPositions = {
      min: yScale(datum.min),
      mean: yScale(datum.mean),
      max: yScale(datum.max),
    };
    const focusAvg = () => {
      focus(datum, {
        left: xScale(datum.msX),
        tooltipLeft: datum.msX > tooltipLeftThreshold,
        yPositions,
      });
    };

    return (
      <TransitionMotion
        defaultStyles={datum.mean ? [{
          key: datum.id,
          style: {
            x: xPos,
            y: defaultY,
            height: 0,
            opacity: 0.5,
          },
        }] : []}
        styles={datum.mean ? [{
          key: datum.id,
          style: {
            x: xPos,
            y: spring(yPositions.mean - meanHeight / 2),
            height: spring(meanHeight),
            opacity: someSmbgDataIsFocused ? spring(0.0) : spring(1.0),
          },
        }] : []}
        willEnter={this.willEnter}
        willLeave={this.willLeave}
      >
        {(interpolated) => {
          if (interpolated.length === 0) {
            return null;
          }
          const { style } = interpolated[0];
          return (
            <rect
              className={cx({
                [styles.smbgAvg]: true,
              },
                (datum.mean) ?
                  [styles[classifyBgValue(bgBounds, datum.mean)]] :
                  styles.smbgAvgTransparent
              )}
              id={`smbgAvg-${datum.id}`}
              onMouseOver={focusAvg}
              onMouseOut={unfocus}
              x={style.x}
              y={style.y}
              rx={cornerRadius}
              ry={cornerRadius}
              width={rectWidth}
              height={style.height}
              fillOpacity={style.opacity}
            />
          );
        }}
      </TransitionMotion>
    );
  }
}

export default withDefaultYPosition(SMBGAvgAnimated);
