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

// TODO: this component should roughly follow the model of the other animation containers
// but since there really isn't any data munging needed (at least not that jebeck can think of now)
// it can probably be a pure functional component that just recalculates xPositions every render
// depending on whether smbgGrouped is true or false

// it is the xPositions for grouping/ungrouping that will be animated via this container
// animating the lines (if turned on) based on grouping/ungrouping is a tougher problem
// because the number of line segments can vary, so we could experiment with it, but it may
// not be possible. if it isn't, it won't be a regression in functionality compared with
// tideline trends view, which also does *not* animate the lines on grouping/ungrouping change

// components to be rendered by this container:
// - SMBGDayPoints
//    + renders a circle for each individual smbg in the day
//    + attaches hover handler for focusing a single smbg
// - SMBGDayLine
//    + render a line connecting smbgs in the day
//    + attaches hover handler for focusing the day of smbgs


import _ from 'lodash';
import React, { PropTypes } from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { THREE_HRS } from '../../utils/datetime';
import { calculateSmbgStatsForBin, findBinForTimeOfDay } from '../../utils/trends/data';

import SMBGDayPoints from '../../components/trends/smbg/SMBGDayPoints';

export default class SMBGDayAnimationContainer extends React.Component {
  static propTypes = {
    binSize: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.shape({
      // here only documenting the properties we actually use rather than the *whole* data model!
      id: PropTypes.string.isRequired,
      msPer24: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    // focusSmbg: PropTypes.func.isRequired,
    // unfocusSmbg: PropTypes.func.isRequired,
    // focusDayLine: PropTypes.func.isRequired,
    // unfocusDayLine: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    binSize: THREE_HRS * 8,
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
            'value',
          ]),
          (val) => (transform(val))
        ),
      });
    });
    return yPositions;
  }

  render() {
    const { mungedData } = this.state;
    const { xScale, yScale } = this.props;
    const yPositions = this.calcYPositions(
      mungedData, yScale, (d) => (spring(yScale(d)))
    );
    return (
      <TransitionMotion styles={yPositions}>
        {(interpolated) => (
          <g id="smbgDayAnimationContainer">
            {_.map(interpolated, (config) => (
              <g className="smbgDay" key={config.key}>
                <SMBGDayPoints
                  data={mungedData}
                  xScale={xScale}
                  yPositions={config.style}
                />
              </g>
            ))}
          </g>
        )}
      </TransitionMotion>
    );
  }
}
