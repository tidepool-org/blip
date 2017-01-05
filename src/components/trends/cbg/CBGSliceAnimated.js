/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import _ from 'lodash';
import cx from 'classnames';
import React, { Component, PropTypes } from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { classifyBgValue } from '../../../utils/bloodglucose';

import styles from './CBGSliceAnimated.css';

class CBGSliceAnimated extends Component {
  static defaultProps = {
    medianHeight: 10,
    sliceWidth: 16,
  };

  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    datum: PropTypes.shape({
      firstQuartile: PropTypes.number,
      id: PropTypes.string.isRequired,
      max: PropTypes.number,
      median: PropTypes.number,
      min: PropTypes.number,
      msFrom: PropTypes.number.isRequired,
      msTo: PropTypes.number.isRequired,
      msX: PropTypes.number.isRequired,
      ninetiethQuantile: PropTypes.number,
      tenthQuantile: PropTypes.number,
      thirdQuartile: PropTypes.number,
    }).isRequired,
    displayFlags: PropTypes.shape({
      cbg100Enabled: PropTypes.bool.isRequired,
      cbg80Enabled: PropTypes.bool.isRequired,
      cbg50Enabled: PropTypes.bool.isRequired,
      cbgMedianEnabled: PropTypes.bool.isRequired,
    }).isRequired,
    focusSlice: PropTypes.func.isRequired,
    isFocused: PropTypes.bool.isRequired,
    medianHeight: PropTypes.number.isRequired,
    sliceWidth: PropTypes.number.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.willEnter = this.willEnter.bind(this);
    this.willLeave = this.willLeave.bind(this);
  }

  getDefaultYPosition(bgBounds, yScale) {
    const { targetLowerBound, targetUpperBound } = bgBounds;
    // default Y position is the center of the target range
    // i.e., 100 mg/dL if target range is 80-120 mg/dL
    return yScale(targetUpperBound - (targetUpperBound - targetLowerBound) / 2);
  }

  willEnter(entered) {
    const { style } = entered;
    const { bgBounds, yScale } = this.props;
    const defaultY = this.getDefaultYPosition(bgBounds, yScale);

    return {
      binLeftX: style.binLeftX,
      bottom10Height: 0,
      firstQuartile: defaultY,
      innerQuartilesHeight: 0,
      lower15Height: 0,
      max: defaultY,
      medianHeight: 0,
      median: defaultY,
      ninetiethQuantile: defaultY,
      tenthQuantile: defaultY,
      thirdQuartile: defaultY,
      top10Height: 0,
      upper15Height: 0,
    };
  }

  willLeave(exited) {
    const { style } = exited;
    const { bgBounds, yScale } = this.props;
    const defaultYSpring = spring(this.getDefaultYPosition(bgBounds, yScale));
    const shrinkOut = spring(0);
    return {
      binLeftX: style.binLeftX,
      bottom10Height: shrinkOut,
      firstQuartile: defaultYSpring,
      innerQuartilesHeight: shrinkOut,
      lower15Height: shrinkOut,
      max: defaultYSpring,
      medianHeight: shrinkOut,
      median: defaultYSpring,
      ninetiethQuantile: defaultYSpring,
      tenthQuantile: defaultYSpring,
      thirdQuartile: defaultYSpring,
      top10Height: shrinkOut,
      upper15Height: shrinkOut,
    };
  }

  render() {
    const { displayFlags, medianHeight, sliceWidth } = this.props;
    const { bgBounds, datum, isFocused, xScale, yScale } = this.props;

    const medianClasses = cx({
      [styles.median]: true,
      [styles.medianTransparent]: isFocused,
      [styles[classifyBgValue(bgBounds, datum.median)]]: !isFocused,
    });

    const renderPieces = {
      top10: {
        className: styles.rangeSegment,
        displayFlag: 'cbg100Enabled',
        height: 'top10Height',
        heightKeys: ['ninetiethQuantile', 'max'],
        key: 'top10',
        y: 'max',
      },
      bottom10: {
        className: styles.rangeSegment,
        displayFlag: 'cbg100Enabled',
        height: 'bottom10Height',
        heightKeys: ['min', 'tenthQuantile'],
        key: 'bottom10',
        y: 'tenthQuantile',
      },
      upper15: {
        className: styles.outerSegment,
        displayFlag: 'cbg80Enabled',
        height: 'upper15Height',
        heightKeys: ['thirdQuartile', 'ninetiethQuantile'],
        key: 'upper15',
        y: 'ninetiethQuantile',
      },
      lower15: {
        className: styles.outerSegment,
        displayFlag: 'cbg80Enabled',
        height: 'lower15Height',
        heightKeys: ['tenthQuantile', 'firstQuartile'],
        key: 'lower15',
        y: 'firstQuartile',
      },
      innerQuartiles: {
        className: styles.innerQuartilesSegment,
        displayFlag: 'cbg50Enabled',
        height: 'innerQuartilesHeight',
        heightKeys: ['firstQuartile', 'thirdQuartile'],
        key: 'innerQuartiles',
        y: 'thirdQuartile',
      },
      median: {
        className: medianClasses,
        displayFlag: 'cbgMedianEnabled',
        height: 'medianHeight',
        key: 'median',
        y: 'median',
      },
    };
    const toRender = _.filter(renderPieces, (piece) => (displayFlags[piece.displayFlag]));

    const defaultY = this.getDefaultYPosition(bgBounds, yScale);
    const binLeftX = xScale(datum.msX) - sliceWidth / 2 + styles.stroke / 2;
    const widthWidthStroke = sliceWidth - styles.stroke;
    return (
      <TransitionMotion
        defaultStyles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => ({
          key: segment.key,
          style: {
            binLeftX,
            [segment.height]: 0,
            [segment.y]: defaultY,
          },
        })) : []}
        styles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => ({
          key: segment.key,
          style: {
            binLeftX,
            [segment.height]: segment.key === 'median' ?
              spring(medianHeight) :
              spring(yScale(datum[segment.heightKeys[0]]) - yScale(datum[segment.heightKeys[1]])),
            [segment.y]: spring(yScale(datum[segment.y])),
          },
        })) : []}
        willEnter={this.willEnter}
        willLeave={this.willLeave}
      >
        {(interpolateds) => {
          if (interpolateds.length === 0) {
            return null;
          }
          return (
            <g id={`cbgSlice-${datum.id}`}>
              {_.map(interpolateds, (piece) => {
                const { key, style } = piece;
                const segment = renderPieces[key];
                return (
                  <rect
                    className={segment.className}
                    key={key}
                    width={widthWidthStroke}
                    height={style[renderPieces[key].height]}
                    x={binLeftX}
                    y={style[renderPieces[key].y]}
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

export default CBGSliceAnimated;
