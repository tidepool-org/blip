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
import { springConfig } from '../../../utils/constants';
import withDefaultYPosition from '../common/withDefaultYPosition';

import styles from './CBGSliceAnimated.css';

export class CBGSliceAnimated extends Component {
  static defaultProps = {
    medianHeight: 10,
    medianWidth: 14,
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
    defaultY: PropTypes.number.isRequired,
    displayFlags: PropTypes.shape({
      cbg100Enabled: PropTypes.bool.isRequired,
      cbg80Enabled: PropTypes.bool.isRequired,
      cbg50Enabled: PropTypes.bool.isRequired,
      cbgMedianEnabled: PropTypes.bool.isRequired,
    }).isRequired,
    focusSlice: PropTypes.func.isRequired,
    isFocused: PropTypes.bool.isRequired,
    medianHeight: PropTypes.number.isRequired,
    medianWidth: PropTypes.number.isRequired,
    sliceWidth: PropTypes.number.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.getBinLeftX = this.getBinLeftX.bind(this);
    this.willEnter = this.willEnter.bind(this);
    this.willLeave = this.willLeave.bind(this);
  }

  getBinLeftX(width) {
    const { datum, xScale } = this.props;
    return xScale(datum.msX) - width / 2 + styles.stroke / 2;
  }

  getWidth(width) {
    return width - styles.stroke;
  }

  isMedian(segment) {
    return segment.key === 'median';
  }

  willEnter(entered) {
    const { style } = entered;
    const { defaultY } = this.props;

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
      opacity: 0,
      tenthQuantile: defaultY,
      thirdQuartile: defaultY,
      top10Height: 0,
      upper15Height: 0,
      width: style.width,
    };
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY } = this.props;
    const defaultYSpring = spring(defaultY, springConfig);
    const shrinkOut = spring(0, springConfig);
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
      opacity: shrinkOut,
      tenthQuantile: defaultYSpring,
      thirdQuartile: defaultYSpring,
      top10Height: shrinkOut,
      upper15Height: shrinkOut,
      width: style.width,
    };
  }

  render() {
    const {
      bgBounds,
      datum,
      defaultY,
      displayFlags,
      isFocused,
      medianHeight,
      medianWidth,
      sliceWidth,
      yScale,
    } = this.props;

    const medianClasses = cx({
      [styles.median]: true,
      [styles.medianTransparent]: isFocused,
      // you can mix and match objects and params that are string classnames with cx/classnames
    }, (
      (datum.median && !isFocused) ?
        styles[classifyBgValue(bgBounds, datum.median)] :
        styles.medianTransparent)
    );

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

    return (
      <TransitionMotion
        defaultStyles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => {
          const baseWidth = this.isMedian(segment) ? medianWidth : sliceWidth;
          return {
            key: segment.key,
            style: {
              binLeftX: this.getBinLeftX(baseWidth),
              [segment.y]: defaultY,
              width: this.getWidth(baseWidth),
              [segment.height]: 0,
              opacity: 0,
            },
          };
        }) : []}
        styles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => {
          const baseWidth = this.isMedian(segment) ? medianWidth : sliceWidth;
          return {
            key: segment.key,
            style: {
              binLeftX: this.getBinLeftX(baseWidth),
              [segment.y]: this.isMedian(segment) ?
                spring(yScale(datum.median) - medianHeight / 2, springConfig) :
                spring(yScale(datum[segment.y]), springConfig),
              width: this.getWidth(baseWidth),
              [segment.height]: this.isMedian(segment) ?
                spring(medianHeight, springConfig) :
                spring(
                  yScale(datum[segment.heightKeys[0]]) - yScale(datum[segment.heightKeys[1]]),
                  springConfig
                ),
              opacity: spring(1.0, springConfig),
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
            <g id={`cbgSlice-${datum.id}`}>
              {_.map(interpolateds, (piece) => {
                const { key, style } = piece;
                const segment = renderPieces[key];
                return (
                  <rect
                    className={segment.className}
                    key={key}
                    id={key}
                    width={style.width}
                    height={style[renderPieces[key].height]}
                    x={style.binLeftX}
                    y={style[renderPieces[key].y]}
                    opacity={style.opacity}
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

export default withDefaultYPosition(CBGSliceAnimated);
