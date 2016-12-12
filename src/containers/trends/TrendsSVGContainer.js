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
import _ from 'lodash';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import { THREE_HRS } from '../../utils/datetime';
import BackgroundWithTargetRange from '../../components/trends/common/BackgroundWithTargetRange';
import CBGSlicesAnimationContainer from './CBGSlicesAnimationContainer';
import SMBGsByDateContainer from './SMBGsByDateContainer';
import SMBGRangeAvgAnimationContainer from './SMBGRangeAvgAnimationContainer';
import SMBGAvg from '../../components/trends/smbg/SMBGAvg';
import SMBGRange from '../../components/trends/smbg/SMBGRange';

import NoData from '../../components/trends/common/NoData';
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

  renderNoDataMessage(dataType) {
    const { containerHeight: height, containerWidth: width, margins } = this.props;
    const xPos = (width / 2) + margins.right;
    const yPos = (height / 2) + margins.bottom;
    const messagePosition = { x: xPos, y: yPos };
    return (
      <NoData
        dataType={dataType}
        position={messagePosition}
      />
    );
  }

  renderOverlay(smbgComponent, componentKey) {
    if (this.props.smbgRangeOverlay) {
      return (
        <SMBGRangeAvgAnimationContainer
          data={this.props.smbgData}
          focus={this.props.focusRange}
          key={componentKey}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          unfocus={this.props.unfocusRange}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
          smbgComponent={smbgComponent}
        />
      );
    }
    return null;
  }

  renderCbg() {
    if (this.props.showingCbg) {
      if (_.isEmpty(this.props.cbgData)) {
        return this.renderNoDataMessage('cbg');
      }

      const { containerHeight: height, containerWidth: width } = this.props;

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
      if (_.isEmpty(this.props.smbgData)) {
        return this.renderNoDataMessage('smbg');
      }
      const days = (
        <SMBGsByDateContainer
          key="smbgDaysContainer"
          data={this.props.smbgData}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
          focusSmbg={this.props.focusSmbg}
          unfocusSmbg={this.props.unfocusSmbg}
          lines={this.props.smbgLines}
          grouped={this.props.smbgGrouped}
          onSelectDay={this.props.onSelectDay}
          smbgOpts={this.props.smbgOpts}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
        />
      );
      // Focused day will be rendered last, on top of everything else but flagged
      // as nonInteractive to allow mouse events to be handled exclusively by normally
      // rendered points and lines
      const focusedDay = this.props.focusedSmbg ? (
        <SMBGsByDateContainer
          key="focusedSmbgDayContainer"
          data={this.props.focusedSmbg.dayPoints}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
          focusedSmbg={this.props.focusedSmbg}
          focusSmbg={() => {}}
          unfocusSmbg={() => {}}
          lines={this.props.smbgLines}
          grouped={this.props.smbgGrouped}
          onSelectDay={this.props.onSelectDay}
          smbgOpts={this.props.smbgOpts}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          nonInteractive
        />
      ) : null;

      return (
        <g id="smbgTrends">
        {this.renderOverlay(SMBGRange, 'SMBGRangeAnimationContainer')}
        {days}
        {this.renderOverlay(SMBGAvg, 'SMBGAvgAnimationContainer')}
        {focusedDay}
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
    data: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    position: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
    date: PropTypes.string.isRequired,
    dayPoints: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
    })),
    positions: PropTypes.arrayOf(PropTypes.shape({
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
  onSelectDay: PropTypes.func.isRequired,
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
