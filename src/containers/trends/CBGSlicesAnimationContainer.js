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

import _ from 'lodash';
import React, { PropTypes } from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { findTimeOfDayBin, calculateCbgStatsForBin } from '../../utils/trends/data';

import CBGSlice from '../../components/trends/cbg/CBGSlice';

import styles from './CBGSlicesAnimationContainer.css';

export default class CBGSlicesAnimationContainer extends React.Component {
  static propTypes = {
    binSize: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    focusedSlice: PropTypes.shape({
      slice: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        id: PropTypes.string.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        msFrom: PropTypes.number.isRequired,
        msTo: PropTypes.number.isRequired,
        msX: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
      }).isRequired,
      position: PropTypes.shape({
        left: PropTypes.number.isRequired,
        tooltipLeft: PropTypes.bool.isRequired,
        topOptions: PropTypes.shape({
          firstQuartile: PropTypes.number.isRequired,
          max: PropTypes.number.isRequired,
          median: PropTypes.number.isRequired,
          min: PropTypes.number.isRequired,
          ninetiethQuantile: PropTypes.number.isRequired,
          tenthQuantile: PropTypes.number.isRequired,
          thirdQuartile: PropTypes.number.isRequired,
        }).isRequired,
      }).isRequired,
    }),
    focusSlice: PropTypes.func.isRequired,
    margins: PropTypes.shape({
      top: PropTypes.number.isRequired,
      right: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    svgDimensions: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    // thirty-minute bins
    binSize: 1000 * 60 * 30,
  };

  constructor(props) {
    super(props);
    this.state = {
      mungedData: [],
    };
  }

  componentWillMount() {
    const { binSize, data } = this.props;
    this.setState({ mungedData: this.mungeData(binSize, data) });
  }

  componentWillReceiveProps(nextProps) {
    const { binSize, data } = nextProps;
    if (binSize !== this.props.binSize || data !== this.props.data) {
      this.setState({ mungedData: this.mungeData(binSize, data) });
    }
  }

  mungeData(binSize, data) {
    const binned = _.groupBy(data, (d) => (findTimeOfDayBin(binSize, d.msPer24)));
    const binKeys = _.keys(binned);

    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(binned[binKeys[i]], valueExtractor);
      mungedData.push(calculateCbgStatsForBin(binKeys[i], binSize, values));
    }
    return mungedData;
  }

  calcYPositions(mungedData, yScale, transform) {
    const yPositions = [];
    _.each(mungedData, (d) => {
      yPositions.push({
        key: d.id,
        style: _.mapValues(
          _.pick(d, [
            'min',
            'median',
            'max',
            'tenthQuantile',
            'ninetiethQuantile',
            'firstQuartile',
            'thirdQuartile',
          ]),
          (val) => (transform(val))
        ),
      });
    });
    return yPositions;
  }

  render() {
    const { mungedData } = this.state;
    if (_.isEmpty(mungedData)) {
      const { margins, svgDimensions } = this.props;
      const xPos = (svgDimensions.width / 2) - margins.left + margins.right;
      const yPos = (svgDimensions.height / 2) - margins.top + margins.bottom;
      return (
        <text className={styles.noDataMsg} id="noDataMsg" x={xPos + 40} y={yPos}>
          No CGM data for this time period :(
        </text>
      );
    }
    const { focusedSlice, xScale, yScale } = this.props;
    const dataById = {};
    _.each(mungedData, (d) => {
      dataById[d.id] = d;
    });
    const yPositions = this.calcYPositions(
      mungedData, yScale, (d) => (spring(yScale(d)))
    );

    return (
      <TransitionMotion styles={yPositions}>
        {(interpolated) => (
          <g id="cbgAnimationContainer">
            {_.map(interpolated, (config) => (
              <CBGSlice
                aSliceIsFocused={focusedSlice !== null}
                datum={dataById[config.key]}
                focusSlice={this.props.focusSlice}
                isFocused={config.key === _.get(focusedSlice, ['slice', 'id'], null)}
                key={config.key}
                unfocusSlice={this.props.unfocusSlice}
                xScale={xScale}
                yPositions={config.style}
              />
            ))}
          </g>
        )}
      </TransitionMotion>
    );
  }
}
