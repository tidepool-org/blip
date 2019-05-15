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
import React, { PropTypes, PureComponent } from 'react';
import { range } from 'd3-array';

import { THIRTY_MINS, TWENTY_FOUR_HRS } from '../../../utils/datetime';
import {
  findBinForTimeOfDay, findOutOfRangeAnnotations, calculateCbgStatsForBin,
} from '../../../utils/trends/data';

import CBGMedianAnimated from './CBGMedianAnimated';
import CBGSliceAnimated from './CBGSliceAnimated';

export default class CBGSlicesContainer extends PureComponent {
  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    binSize: PropTypes.number.isRequired,
    sliceWidth: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    displayFlags: PropTypes.shape({
      cbg100Enabled: PropTypes.bool.isRequired,
      cbg80Enabled: PropTypes.bool.isRequired,
      cbg50Enabled: PropTypes.bool.isRequired,
      cbgMedianEnabled: PropTypes.bool.isRequired,
    }).isRequired,
    showingCbgDateTraces: PropTypes.bool.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    topMargin: PropTypes.number.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    binSize: THIRTY_MINS,
    sliceWidth: 16,
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
    const binned = _.groupBy(data, (d) => (findBinForTimeOfDay(binSize, d.msPer24)));
    const outOfRanges = findOutOfRangeAnnotations(data);
    // we need *all* possible keys for TransitionMotion to work on enter/exit
    // and the range starts with binSize/2 because the keys are centered in each bin
    const binKeys = _.map(range(binSize / 2, TWENTY_FOUR_HRS, binSize), (d) => String(d));

    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(_.get(binned, binKeys[i], []), valueExtractor);
      mungedData.push(calculateCbgStatsForBin(binKeys[i], binSize, values, outOfRanges));
    }
    return mungedData;
  }

  render() {
    const { mungedData } = this.state;
    const { xScale, yScale, sliceWidth } = this.props;

    return (
      <g id="cbgSlices">
        {_.map(mungedData, (bin) => (
          <g id={`cbgBin-${bin.id}`} key={bin.id}>
            <CBGSliceAnimated
              bgBounds={this.props.bgBounds}
              datum={bin}
              displayFlags={this.props.displayFlags}
              focusSlice={this.props.focusSlice}
              showingCbgDateTraces={this.props.showingCbgDateTraces}
              tooltipLeftThreshold={this.props.tooltipLeftThreshold}
              topMargin={this.props.topMargin}
              unfocusSlice={this.props.unfocusSlice}
              xScale={xScale}
              yScale={yScale}
              sliceWidth={sliceWidth}
            />
            <CBGMedianAnimated
              bgBounds={this.props.bgBounds}
              datum={bin}
              displayingMedian={this.props.displayFlags.cbgMedianEnabled}
              showingCbgDateTraces={this.props.showingCbgDateTraces}
              xScale={xScale}
              yScale={yScale}
              sliceWidth={sliceWidth}
            />
          </g>
        ))}
      </g>
    );
  }
}
