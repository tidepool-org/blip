import _ from 'lodash';
import cx from 'classnames';

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

import PropTypes from 'prop-types';

import React, { PureComponent } from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { springConfig } from '../../../utils/constants';
import withDefaultYPosition from '../common/withDefaultYPosition';

import CBGSliceSegment from './CBGSliceSegment';

import styles from './CBGSliceAnimated.css';

export class CBGSliceAnimated extends PureComponent {
  static defaultProps = {
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
    showingCbgDateTraces: PropTypes.bool.isRequired,
    sliceWidth: PropTypes.number.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    topMargin: PropTypes.number.isRequired,
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

    return _.mapValues(style, (val, key) => {
      if (key === 'opacity') {
        return 0;
      } else if (key.search('Height') !== -1) {
        return 0;
      }
      return defaultY;
    });
  }

  willLeave(exited) {
    const { style } = exited;
    const { defaultY } = this.props;
    const shrinkOut = spring(0, springConfig);
    return _.mapValues(style, (val, key) => {
      if (key === 'opacity') {
        return shrinkOut;
      } else if (key.search('Height') !== -1) {
        return shrinkOut;
      }
      return spring(defaultY, springConfig);
    });
  }

  render() {
    const {
      datum,
      defaultY,
      displayFlags,
      sliceWidth,
      showingCbgDateTraces,
      tooltipLeftThreshold,
      topMargin,
      xScale,
      yScale,
    } = this.props;

    const renderPieces = {
      top10: {
        classKey: 'rangeSegment',
        displayFlag: 'cbg100Enabled',
        height: 'top10Height',
        heightKeys: ['ninetiethQuantile', 'max'],
        key: 'top10',
        y: 'max',
      },
      bottom10: {
        classKey: 'rangeSegment',
        displayFlag: 'cbg100Enabled',
        height: 'bottom10Height',
        heightKeys: ['min', 'tenthQuantile'],
        key: 'bottom10',
        y: 'tenthQuantile',
      },
      upper15: {
        classKey: 'outerSegment',
        displayFlag: 'cbg80Enabled',
        height: 'upper15Height',
        heightKeys: ['thirdQuartile', 'ninetiethQuantile'],
        key: 'upper15',
        y: 'ninetiethQuantile',
      },
      lower15: {
        classKey: 'outerSegment',
        displayFlag: 'cbg80Enabled',
        height: 'lower15Height',
        heightKeys: ['tenthQuantile', 'firstQuartile'],
        key: 'lower15',
        y: 'firstQuartile',
      },
      innerQuartiles: {
        classKey: 'innerQuartilesSegment',
        displayFlag: 'cbg50Enabled',
        height: 'innerQuartilesHeight',
        heightKeys: ['firstQuartile', 'thirdQuartile'],
        key: 'innerQuartiles',
        y: 'thirdQuartile',
      },
    };
    const toRender = _.filter(renderPieces, (piece) => (displayFlags[piece.displayFlag]));
    const yPositions = {
      firstQuartile: yScale(datum.firstQuartile),
      max: yScale(datum.max),
      median: yScale(datum.median),
      min: yScale(datum.min),
      ninetiethQuantile: yScale(datum.ninetiethQuantile),
      tenthQuantile: yScale(datum.tenthQuantile),
      thirdQuartile: yScale(datum.thirdQuartile),
      topMargin,
    };

    const strokeWidth = sliceWidth / 8;
    const binLeftX = xScale(datum.msX) - sliceWidth / 2 + strokeWidth / 2;
    const width = sliceWidth - strokeWidth;

    return (
      <TransitionMotion
        defaultStyles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => ({
          key: segment.key,
          style: {
            [segment.y]: defaultY,
            [segment.height]: 0,
            opacity: 0,
          },
        })) : []}
        styles={_.get(datum, 'min') !== undefined ? _.map(toRender, (segment) => ({
          key: segment.key,
          style: {
            [segment.y]: spring(yScale(datum[segment.y]), springConfig),
            [segment.height]: spring(
              yScale(datum[segment.heightKeys[0]]) - yScale(datum[segment.heightKeys[1]]),
              springConfig
            ),
            opacity: spring(1.0, springConfig),
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
              {_.map(interpolateds, (interpolated) => {
                const segment = renderPieces[interpolated.key];
                const classes = cx({
                  [styles.segment]: true,
                  [styles[segment.classKey]]: !showingCbgDateTraces,
                  [styles[`${segment.classKey}Faded`]]: showingCbgDateTraces,
                });
                return (
                  <CBGSliceSegment
                    classes={classes}
                    datum={datum}
                    interpolated={interpolated}
                    key={interpolated.key}
                    positionData={{
                      left: xScale(datum.msX),
                      tooltipLeft: datum.msX > tooltipLeftThreshold,
                      yPositions,
                    }}
                    segment={segment}
                    width={width}
                    x={binLeftX}
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
