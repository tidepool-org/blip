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
import React, { PropTypes, PureComponent } from 'react';
import { range } from 'd3-array';

import { THREE_HRS, TWENTY_FOUR_HRS } from '../../../utils/datetime';
import {
  findBinForTimeOfDay, findOutOfRangeAnnotations, calculateSmbgStatsForBin,
} from '../../../utils/trends/data';

export default class SMBGRangeAvgContainer extends PureComponent {
  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    binSize: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    smbgComponent: PropTypes.func.isRequired,
    someSmbgDataIsFocused: PropTypes.bool.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    binSize: THREE_HRS,
    width: 108,
  };

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
    const binned = _.groupBy(data, (d) => (findBinForTimeOfDay(binSize, d.msPer24)));
    const outOfRanges = findOutOfRangeAnnotations(data);
    // we need *all* possible keys for TransitionMotion to work on enter/exit
    // and the range starts with binSize/2 because the keys are centered in each bin
    const binKeys = _.map(range(binSize / 2, TWENTY_FOUR_HRS, binSize), (d) => String(d));

    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(binned[binKeys[i]], valueExtractor);
      mungedData.push(calculateSmbgStatsForBin(binKeys[i], binSize, values, outOfRanges));
    }
    return mungedData;
  }

  render() {
    const { mungedData } = this.state;
    const { smbgComponent: SMBGComponent, width } = this.props;

    return (
      <g className="smbgAggContainer">
        {_.map(mungedData, (datum) => (
          <SMBGComponent
            bgBounds={this.props.bgBounds}
            datum={datum}
            key={datum.id}
            someSmbgDataIsFocused={this.props.someSmbgDataIsFocused}
            tooltipLeftThreshold={this.props.tooltipLeftThreshold}
            xScale={this.props.xScale}
            yScale={this.props.yScale}
            width={width}
          />
        ))}
      </g>
    );
  }
}
