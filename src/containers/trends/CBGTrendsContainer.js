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
import bows from 'bows';

import BackgroundWithTargetRange from '../../components/trends/common/BackgroundWithTargetRange';
import XAxisLabels from '../../components/trends/common/XAxisLabels';
import YAxisLabels from '../../components/trends/common/YAxisLabels';
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
      svgDimensions: null,
      yScale: null,
    };
  }

  componentWillMount() {
    const el = document.getElementById('tidelineContainer');
    const svgDimensions = {
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
    const { xScale, yScale } = this.props;
    xScale.range([
      MARGINS.left + Math.round(SMBG_OPTS.maxR),
      svgDimensions.width - MARGINS.right - Math.round(SMBG_OPTS.maxR),
    ]);
    yScale.range([
      svgDimensions.height - MARGINS.bottom - BUMPERS.bottom,
      MARGINS.top + BUMPERS.top,
    ]);
    this.setState({ svgDimensions });
  }

  render() {
    const { svgDimensions } = this.state;
    let focusedRange = null;
    if (this.props.focusedSlice !== null) {
      focusedRange = _.pick(this.props.focusedSlice, ['msFrom', 'msTo']);
    }
    return (
      <svg {...svgDimensions}>
        <BackgroundWithTargetRange
          bgBounds={this.props.bgBounds}
          margins={this.props.margins}
          smbgOpts={this.props.smbgOpts}
          svgDimensions={this.state.svgDimensions}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
        <XAxisLabels
          focusedRange={focusedRange}
          margins={this.props.margins}
          useRangeLabels={false}
          xScale={this.props.xScale}
        />
        <YAxisLabels
          bgBounds={this.props.bgBounds}
          margins={this.props.margins}
          yScale={this.props.yScale}
        />
        <CBGSlicesContainer
          data={this.props.data}
          focusedSlice={this.props.focusedSlice}
          focusSlice={this.props.focusSlice}
          margins={this.props.margins}
          svgDimensions={this.state.svgDimensions}
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
