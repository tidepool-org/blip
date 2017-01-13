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

import { springConfig } from '../../../utils/constants';
import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './SMBGRangeAnimated.css';

export class SMBGRangeAnimated extends Component {
  static defaultProps = {
    rectWidth: 18,
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
    rectWidth: PropTypes.number.isRequired,
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
      width: style.width,
      height: 0,
      opacity: 0,
    };
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY } = this.props;
    const shrinkOut = spring(0, springConfig);
    return {
      x: style.x,
      y: spring(defaultY, springConfig),
      width: style.width,
      height: shrinkOut,
      opacity: shrinkOut,
    };
  }

  render() {
    const { datum, defaultY, focus, rectWidth, unfocus, xScale, yScale } = this.props;
    const xPos = xScale(datum.msX);
    const yPositions = {
      min: yScale(datum.min),
      mean: yScale(datum.mean),
      max: yScale(datum.max),
    };
    const focusRange = () => {
      focus(datum, {
        left: xPos,
        tooltipLeft: datum.msX > this.props.tooltipLeftThreshold,
        yPositions,
      });
    };

    const rectLeftEdge = xPos - rectWidth / 2;

    return (
      <TransitionMotion
        defaultStyles={[{
          key: datum.id,
          style: {
            x: rectLeftEdge,
            y: defaultY,
            width: rectWidth,
            height: 0,
            opacity: 0,
          },
        }]}
        styles={datum.min ? [{
          key: datum.id,
          style: {
            x: rectLeftEdge,
            y: spring(yPositions.max, springConfig),
            width: rectWidth,
            height: spring(yPositions.min - yPositions.max, springConfig),
            opacity: spring(1.0, springConfig),
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
            className={styles.smbgRange}
            id={`smbgRange-${datum.id}`}
            onMouseOver={focusRange}
            onMouseOut={unfocus}
            x={style.x}
            y={style.y}
            width={style.width}
            height={style.height}
            opacity={style.opacity}
          />
        );
      }}
      </TransitionMotion>
    );
  }
}

export default withDefaultYPosition(SMBGRangeAnimated);
