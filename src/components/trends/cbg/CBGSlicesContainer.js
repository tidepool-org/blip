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
import stats from 'simple-statistics';
import { Motion, spring } from 'react-motion';

import CBGSlice from './CBGSlice';

import styles from './CBGSlicesContainer.css';

export default class CBGSlicesContainer extends React.Component {
  static propTypes = {
    binSize: PropTypes.number.isRequired,
    data: PropTypes.array.isRequired,
    focusSlice: PropTypes.func.isRequired,
    margins: PropTypes.object.isRequired,
    svgDimensions: PropTypes.object.isRequired,
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
    const binned = _.groupBy(data, (d) => {
      if (d.msPer24 === 0) {
        return binSize / 2;
      }
      return Math.ceil(d.msPer24 / binSize) * binSize - (binSize / 2);
    });
    const binKeys = Object.keys(binned);
    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(binned[binKeys[i]], valueExtractor);
      const msX = parseInt(binKeys[i], 10);
      const msFrom = msX - (binSize / 2);
      const msTo = msX + (binSize / 2);
      mungedData.push({
        id: binKeys[i],
        min: stats.min(values),
        tenthQuantile: stats.quantile(values, 0.1),
        firstQuartile: stats.quantile(values, 0.25),
        thirdQuartile: stats.quantile(values, 0.75),
        ninetiethQuantile: stats.quantile(values, 0.9),
        max: stats.max(values),
        median: stats.median(values),
        msX,
        msFrom,
        msTo,
        data: binned[binKeys[i]],
      });
    }
    return mungedData;
  }

  calcMedianPositions(mungedData, yScale, transform) {
    const medians = {};
    _.each(mungedData, (d) => {
      medians[d.id] = transform(d.median);
    });
    return medians;
  }

  calcYPositions(mungedData, yScale, transform) {
    const yPositions = {};
    _.each(mungedData, (d) => {
      yPositions[d.id] = _.mapValues(
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
      );
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
    const { xScale, yScale } = this.props;
    const dataById = {};
    _.each(mungedData, (d) => {
      dataById[d.id] = d;
    });
    const yPositions = this.calcYPositions(
      mungedData, yScale, (d) => (spring(yScale(d)))
    );

    return (
      <g id="cbgAnimationContainer">
        {_.map(yPositions, (val, id) => (
          <Motion key={id} style={yPositions[id]}>
            {(interpolated) => (
              <CBGSlice
                datum={dataById[id]}
                focusSlice={this.props.focusSlice}
                key={id}
                unfocusSlice={this.props.unfocusSlice}
                xScale={xScale}
                yPositions={interpolated}
              />
            )}
          </Motion>
        ))}
      </g>
    );
  }
}
