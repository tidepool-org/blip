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
import bows from 'bows';

import BackgroundWithTargetRange from '../../components/trends/common/BackgroundWithTargetRange';
import XAxisLabels from '../../components/trends/common/XAxisLabels';
import XAxisTicks from '../../components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../components/trends/common/YAxisLabelsAndTicks';
import CBGSlicesContainer from '../../components/trends/cbg/CBGSlicesContainer';
import TargetRangeLines from '../../components/trends/common/TargetRangeLines';
import FocusedCBGSlice from '../../components/trends/cbg/FocusedCBGSlice';

/*
 * TODO: DISCUSS
 * Is this how we want to approach defaults/constants in the Reactified viz components?
 * Here, the approach is to use global constants. Then, the options that are required
 * in child components as well are assigned to default props, but those that are only used
 * in this parent/container component are just used directly as constants.
 */
const BUMPERS = {
  top: 30,
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
    bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']),
    data: PropTypes.array.isRequired,
    focusedSlice: PropTypes.object,
    focusedSliceKeys: PropTypes.array,
    focusSlice: PropTypes.func.isRequired,
    margins: PropTypes.object.isRequired,
    smbgOpts: PropTypes.object.isRequired,
    // dimensions only used in React storybook!
    svgDimensions: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    timezone: PropTypes.string.isRequired,
    unfocusSlice: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.log = bows('CBGTrendsContainer');
    this.state = {
      mungedData: [],
    };
  }

  componentWillMount() {
    const { svgDimensions, xScale, yScale } = this.props;
    xScale.range([
      MARGINS.left + Math.round(SMBG_OPTS.maxR),
      svgDimensions.width - MARGINS.right - Math.round(SMBG_OPTS.maxR),
    ]);
    yScale.range([
      svgDimensions.height - MARGINS.bottom - BUMPERS.bottom,
      MARGINS.top + BUMPERS.top,
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
        <CBGSlicesContainer
          data={this.props.data}
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
        <FocusedCBGSlice
          bgUnits={this.props.bgUnits}
          focusedSlice={this.props.focusedSlice}
          focusedSliceKeys={this.props.focusedSliceKeys}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      </svg>
    );
  }
}

export default CBGTrendsContainer;
