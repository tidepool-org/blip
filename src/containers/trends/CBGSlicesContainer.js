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
import { range } from 'd3-array';

import { THIRTY_MINS, TWENTY_FOUR_HRS } from '../../utils/datetime';
import { findBinForTimeOfDay, calculateCbgStatsForBin } from '../../utils/trends/data';

import CBGSliceAnimated from '../../components/trends/cbg/CBGSliceAnimated';

export default class CBGSlicesContainer extends React.Component {
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
    displayFlags: PropTypes.shape({
      cbg100Enabled: PropTypes.bool.isRequired,
      cbg80Enabled: PropTypes.bool.isRequired,
      cbg50Enabled: PropTypes.bool.isRequired,
      cbgMedianEnabled: PropTypes.bool.isRequired,
    }).isRequired,
    focusedSliceKey: PropTypes.string,
    focusSlice: PropTypes.func.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    binSize: THIRTY_MINS,
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
    // we need *all* possible keys for TransitionMotion to work on enter/exit
    // and the range starts with binSize/2 because the keys are centered in each bin
    const binKeys = _.map(range(binSize / 2, TWENTY_FOUR_HRS, binSize), (d) => String(d));

    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(_.get(binned, binKeys[i], []), valueExtractor);
      mungedData.push(calculateCbgStatsForBin(binKeys[i], binSize, values));
    }
    return mungedData;
  }

  render() {
    const { mungedData } = this.state;
    const { focusedSliceKey, xScale, yScale } = this.props;

    return (
      <g id="cbgSlices">
        {_.map(mungedData, (bin) => (
          <CBGSliceAnimated
            bgBounds={this.props.bgBounds}
            datum={bin}
            displayFlags={this.props.displayFlags}
            focusSlice={this.props.focusSlice}
            isFocused={bin.id === focusedSliceKey}
            key={bin.id}
            tooltipLeftThreshold={this.props.tooltipLeftThreshold}
            unfocusSlice={this.props.unfocusSlice}
            xScale={xScale}
            yScale={yScale}
          />
        ))}
      </g>
    );
  }
}
