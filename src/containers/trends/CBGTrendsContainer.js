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

import React, { PropTypes } from 'react';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import BackgroundWithTargetRange from '../../components/trends/common/BackgroundWithTargetRange';
import XAxisLabels from '../../components/trends/common/XAxisLabels';
import XAxisTicks from '../../components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../components/trends/common/YAxisLabelsAndTicks';
import CBGSlicesAnimationContainer from './CBGSlicesAnimationContainer';
import TargetRangeLines from '../../components/trends/common/TargetRangeLines';

/*
 * TODO: DISCUSS
 * Is this how we want to approach defaults/constants in the Reactified viz components?
 * Here, the approach is to use global constants. Then, the options that are required
 * in child components as well are assigned to default props, but those that are only used
 * in this parent/container component are just used directly as constants.
 */
const BUMPERS = {
  top: 50,
  bottom: 30,
};

const MARGINS = {
  top: 30,
  right: 10,
  bottom: 10,
  left: 40,
};

const SMBG_OPTS = {
  maxR: 7.5,
  r: 6,
};

class CBGTrendsContainer extends React.Component {
  static defaultProps = {
    margins: MARGINS,
    smbgOpts: SMBG_OPTS,
    svgDimensions: {
      width: 960,
      height: 520,
    },
  };

  static propTypes = {
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }),
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
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
    focusedSliceKeys: PropTypes.arrayOf(PropTypes.oneOf([
      'firstQuartile',
      'max',
      'median',
      'min',
      'ninetiethQuantile',
      'tenthQuantile',
      'thirdQuartile',
    ])),
    focusSlice: PropTypes.func.isRequired,
    margins: PropTypes.shape({
      top: PropTypes.number.isRequired,
      right: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    smbgOpts: PropTypes.shape({
      maxR: PropTypes.number.isRequired,
      r: PropTypes.number.isRequired,
    }).isRequired,
    svgDimensions: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    timezone: PropTypes.string.isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const { margins, svgDimensions, xScale, yScale } = this.props;
    xScale.range([
      margins.left + Math.round(SMBG_OPTS.maxR),
      svgDimensions.width - margins.right - Math.round(SMBG_OPTS.maxR),
    ]);
    yScale.range([
      svgDimensions.height - margins.bottom - BUMPERS.bottom,
      margins.top + BUMPERS.top,
    ]);
  }

  render() {
    return (
      <svg {...this.props.svgDimensions}>
        <BackgroundWithTargetRange
          bgBounds={this.props.bgBounds}
          linesAtThreeHrs
          margins={this.props.margins}
          smbgOpts={this.props.smbgOpts}
          svgDimensions={this.props.svgDimensions}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
        <XAxisLabels
          margins={this.props.margins}
          useRangeLabels={false}
          xScale={this.props.xScale}
        />
        <XAxisTicks
          margins={this.props.margins}
          xScale={this.props.xScale}
        />
        <YAxisLabelsAndTicks
          bgBounds={this.props.bgBounds}
          bgUnits={this.props.bgUnits}
          margins={this.props.margins}
          yScale={this.props.yScale}
        />
        <CBGSlicesAnimationContainer
          data={this.props.data}
          focusedSlice={this.props.focusedSlice}
          focusSlice={this.props.focusSlice}
          margins={this.props.margins}
          svgDimensions={this.props.svgDimensions}
          unfocusSlice={this.props.unfocusSlice}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
        <TargetRangeLines
          bgBounds={this.props.bgBounds}
          smbgOpts={this.props.smbgOpts}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      </svg>
    );
  }
}

export default CBGTrendsContainer;
