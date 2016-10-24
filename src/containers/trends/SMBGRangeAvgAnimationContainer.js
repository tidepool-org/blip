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

import { THREE_HRS } from '../../utils/datetime';
import { calculateSmbgStatsForBin, findBinForTimeOfDay } from '../../utils/trends/data';

export default class SMBGRangeAvgAnimationContainer extends React.Component {
  static propTypes = {
    binSize: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    focus: PropTypes.func.isRequired,
    tooltipLeftThreshold: PropTypes.number.isRequired,
    unfocus: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
    smbgComponent: PropTypes.func.isRequired,
  };

  static defaultProps = {
    binSize: THREE_HRS,
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
    const binKeys = _.keys(binned);

    const valueExtractor = (d) => (d.value);
    const mungedData = [];
    for (let i = 0; i < binKeys.length; ++i) {
      const values = _.map(binned[binKeys[i]], valueExtractor);
      mungedData.push(calculateSmbgStatsForBin(binKeys[i], binSize, values));
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
            'mean',
            'max',
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
      return (null);
    }

    const { xScale, yScale } = this.props;
    const { smbgComponent: SMBGComponent } = this.props;
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
          <g id="smbgRangeAvgAnimationContainer">
            {_.map(interpolated, (config) => (
              <SMBGComponent
                key={config.key}
                datum={dataById[config.key]}
                focus={this.props.focus}
                tooltipLeftThreshold={this.props.tooltipLeftThreshold}
                unfocus={this.props.unfocus}
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
