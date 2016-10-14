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

import React, { PropTypes } from 'react';
import dimensions from 'react-dimensions';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import { THREE_HRS } from '../../utils/datetime';
import BackgroundWithTargetRange from '../../components/trends/common/BackgroundWithTargetRange';
import CBGSlicesAnimationContainer from './CBGSlicesAnimationContainer';
import SMBGDaysAnimationContainer from './SMBGDaysAnimationContainer';
import SMBGRangeAvgAnimationContainer from './SMBGRangeAvgAnimationContainer';
import TargetRangeLines from '../../components/trends/common/TargetRangeLines';
import XAxisLabels from '../../components/trends/common/XAxisLabels';
import XAxisTicks from '../../components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../components/trends/common/YAxisLabelsAndTicks';

export class TrendsSVGContainer extends React.Component {
  componentWillMount() {
    const { containerHeight: height, containerWidth: width } = this.props;
    const { margins, smbgOpts, xScale, yScale } = this.props;
    xScale.range([
      margins.left + Math.round(smbgOpts.maxR),
      width - margins.right - Math.round(smbgOpts.maxR),
    ]);
    yScale.range([
      height - margins.bottom - BUMPERS.bottom,
      margins.top + BUMPERS.top,
    ]);
  }

  renderCbg() {
    const { containerHeight: height, containerWidth: width } = this.props;
    if (this.props.showingCbg) {
      return (
        <CBGSlicesAnimationContainer
          data={this.props.cbgData}
          focusedSlice={this.props.focusedSlice}
          focusSlice={this.props.focusSlice}
          margins={this.props.margins}
          svgDimensions={{ height, width }}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          unfocusSlice={this.props.unfocusSlice}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      );
    }
    return null;
  }

  renderSmbg() {
    if (this.props.showingSmbg) {
      const rangeOverlay = this.props.smbgRangeOverlay ?
        (<SMBGRangeAvgAnimationContainer
          data={this.props.smbgData}
          focusRange={this.props.focusRange}
          key="SMBGRangeAvgAnimationContainer"
          smbgRangeOverlay={this.props.smbgRangeOverlay}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          unfocusRange={this.props.unfocusRange}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />) : null;

      const daysOverlay = (
        <SMBGDaysAnimationContainer
          key="smbgDayAnimationContainer"
          data={this.props.smbgData}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
          focusedSmbg={this.props.focusedSmbg}
          focusSmbg={this.props.focusSmbg}
          unfocusSmbg={this.props.unfocusSmbg}
          lines={this.props.smbgLines}
          grouped={this.props.smbgGrouped}
        />
      );

      return (
        <g id="smbgTrends">
        {[rangeOverlay]}
        {[daysOverlay]}
          // TODO: render SMBGRangeAvgAnimationContainer if rangeOverlay passing in onl
          //   SMBGRange as the component to render (bottom layer)
          // TODO: replace with the two layers of SMBGRangeAvgAnimationContainer
          //   described above and below
          // TODO: render individual smbgs grouped by day in layers with most recent day on top
          //   probably this will be mapping through the data grouped by days
          //   and rendering a SMBGDayAnimationContainer for each day
          //   skipping a day (if any) that is focused through hover
          // TODO: render SMBGRangeAvgAnimationContainer if rangeOverlay passing in only SMBGAvg
          //   as the component to render (top layer when nothing focused)
          // TODO: if a day of smbgs or an individual smbg is focused through hover,
          //   render it here (topmost layer)
        </g>
      );
    }
    return null;
  }

  render() {
    const { containerHeight: height, containerWidth: width } = this.props;
    return (
      <svg height={height} width={width}>
        <BackgroundWithTargetRange
          bgBounds={this.props.bgBounds}
          linesAtThreeHrs
          margins={this.props.margins}
          smbgOpts={this.props.smbgOpts}
          svgDimensions={{ height, width }}
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
        {this.renderCbg()}
        {this.renderSmbg()}
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

TrendsSVGContainer.defaultProps = {
  margins: MARGINS,
  smbgOpts: SMBG_OPTS,
  // for time values after 6 p.m. (1800), float the tooltips left instead of right
  tooltipLeftThreshold: 6 * THREE_HRS,
};

TrendsSVGContainer.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }).isRequired,
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  containerHeight: PropTypes.number.isRequired,
  containerWidth: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })),
  smbgData: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  cbgData: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  focusedSlice: PropTypes.shape({
    data: PropTypes.shape({
      firstQuartile: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      median: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
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
  focusedSmbg: PropTypes.shape({
    smbgData: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    smbgPosition: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
    day: PropTypes.string.isRequired,
    smbgDay: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
    })),
    smbgPositions: PropTypes.arrayOf(PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })),
  }),
  focusRange: PropTypes.func.isRequired,
  focusSmbg: PropTypes.func.isRequired,
  focusSlice: PropTypes.func.isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  showingCbg: PropTypes.bool.isRequired,
  showingSmbg: PropTypes.bool.isRequired,
  smbgGrouped: PropTypes.bool.isRequired,
  smbgLines: PropTypes.bool.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  smbgRangeOverlay: PropTypes.bool.isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  unfocusRange: PropTypes.func.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  unfocusSlice: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default dimensions()(TrendsSVGContainer);
