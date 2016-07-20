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
import React from 'react';
// eslint-disable-next-line import/no-unresolved
import stats from 'simple-statistics';
// eslint-disable-next-line import/no-unresolved
import { Motion, spring } from 'react-motion';

import CBGSlices from './CBGSlices';

export default class CBGSlicesContainer extends React.Component {
  static propTypes = {
    binSize: React.PropTypes.number.isRequired,
    data: React.PropTypes.array.isRequired,
    xScale: React.PropTypes.func.isRequired,
    yScale: React.PropTypes.func.isRequired,
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
    this.setState({ mungedData: this.mungeData(binSize, data) });
  }

  mungeData(binSize, data) {
    const binned = _.groupBy(data, (d) => (
      Math.ceil(d.msPer24 / binSize) * binSize - (binSize / 2)
    ));
    const binKeys = Object.keys(binned);
    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(binned[binKeys[i]], valueExtractor);
      mungedData.push({
        id: binKeys[i],
        min: stats.min(values),
        tenthQuantile: stats.quantile(values, 0.1),
        firstQuartile: stats.quantile(values, 0.25),
        thirdQuartile: stats.quantile(values, 0.75),
        ninetiethQuantile: stats.quantile(values, 0.9),
        max: stats.max(values),
        median: stats.median(values),
        msX: parseInt(binKeys[i], 10),
        data: binned[binKeys[i]],
      });
    }
    return mungedData;
  }

  calcYPositions(mungedData, yScale) {
    const transform = (d) => (spring(yScale(d)));
    const yPositions = {};
    _.each(mungedData, (d, i) => {
      yPositions[`${i}-min`] = transform(d.min);
      yPositions[`${i}-tenthQuantile`] = transform(d.tenthQuantile);
      yPositions[`${i}-firstQuartile`] = transform(d.firstQuartile);
      yPositions[`${i}-thirdQuartile`] = transform(d.thirdQuartile);
      yPositions[`${i}-ninetiethQuantile`] = transform(d.ninetiethQuantile);
      yPositions[`${i}-max`] = transform(d.max);
    });
    return yPositions;
  }

  render() {
    const { xScale, yScale } = this.props;
    const { mungedData } = this.state;
    return (
      <Motion style={this.calcYPositions(mungedData, yScale)}>
        {(interpolatedStyle) => (
          <CBGSlices data={mungedData} xScale={xScale} yPositions={interpolatedStyle} />
        )}
      </Motion>
    );
  }
}
