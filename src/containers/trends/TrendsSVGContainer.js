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

import React, { PropTypes, PureComponent } from 'react';
import dimensions from 'react-dimensions';
import _ from 'lodash';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import { THREE_HRS } from '../../utils/datetime';
import { findDatesIntersectingWithCbgSliceSegment } from '../../utils/trends/data';
import Background from '../../components/trends/common/Background';
import CBGDateTracesAnimationContainer from './CBGDateTracesAnimationContainer';
import CBGSlicesContainer from './CBGSlicesContainer';
import FocusedCBGSliceSegment from '../../components/trends/cbg/FocusedCBGSliceSegment';
import SMBGsByDateContainer from './SMBGsByDateContainer';
import SMBGRangeAvgContainer from './SMBGRangeAvgContainer';
import SMBGRangeAnimated from '../../components/trends/smbg/SMBGRangeAnimated';

import NoData from '../../components/trends/common/NoData';
import TargetRangeLines from '../../components/trends/common/TargetRangeLines';
import XAxisLabels from '../../components/trends/common/XAxisLabels';
import XAxisTicks from '../../components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../components/trends/common/YAxisLabelsAndTicks';

export class TrendsSVGContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      focusedSegmentDataGroupedByDate: null,
    };
  }

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

  componentWillReceiveProps(nextProps) {
    const { cbgData, focusedSlice, focusedSliceKeys } = nextProps;
    if (focusedSlice) {
      const intersectingDates = findDatesIntersectingWithCbgSliceSegment(
        cbgData, focusedSlice, focusedSliceKeys
      );
      const focusedSegmentDataGroupedByDate = _.groupBy(
        _.filter(cbgData, (d) => (_.includes(intersectingDates, d.localDate))),
        (d) => (d.localDate)
      );
      this.setState({
        focusedSegmentDataGroupedByDate,
      });
    } else {
      // only reset focusedSegmentDataGroupedByDate to null if previous props had a focused slice
      // but nextProps do not! (i.e., you've just rolled off a segment and not onto another one)
      if (this.props.focusedSlice) {
        this.setState({
          focusedSegmentDataGroupedByDate: null,
        });
      }
    }
  }

  renderNoDataMessage(dataType) {
    const { activeDays, containerHeight: height, containerWidth: width, margins } = this.props;
    const xPos = (width / 2) + margins.right;
    const yPos = (height / 2) + margins.bottom;
    const messagePosition = { x: xPos, y: yPos };
    const unselectedAll = _.every(activeDays, (flag) => (!flag));
    if ((this.props.showingCbg && _.isEmpty(this.props.cbgData)) ||
      (this.props.showingSmbg && _.isEmpty(this.props.smbgData))) {
      return (
        <NoData
          dataType={dataType}
          position={messagePosition}
          unselectedAllData={unselectedAll}
        />
      );
    }
    return null;
  }

  renderOverlay(smbgComponent, componentKey) {
    const data = this.props.smbgRangeOverlay ? this.props.smbgData : [];
    return (
      <SMBGRangeAvgContainer
        bgBounds={this.props.bgBounds}
        data={data}
        key={componentKey}
        smbgComponent={smbgComponent}
        someSmbgDataIsFocused={this.props.focusedSmbg !== null}
        tooltipLeftThreshold={this.props.tooltipLeftThreshold}
        xScale={this.props.xScale}
        yScale={this.props.yScale}
      />
    );
  }

  renderCbg() {
    if (this.props.showingCbg) {
      const slices = (
        <CBGSlicesContainer
          bgBounds={this.props.bgBounds}
          data={this.props.cbgData}
          displayFlags={this.props.displayFlags}
          focusedSliceKey={_.get(this.props.focusedSlice, ['data', 'id'], null)}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          topMargin={this.props.margins.top}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      );

      const { focusedSegmentDataGroupedByDate } = this.state;
      const dateTraces = (
        <CBGDateTracesAnimationContainer
          bgBounds={this.props.bgBounds}
          data={focusedSegmentDataGroupedByDate}
          dates={_.keys(focusedSegmentDataGroupedByDate) || []}
          onSelectDate={this.props.onSelectDate}
          topMargin={this.props.margins.top}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      );

      let focused = null;
      const { focusedSlice, focusedSliceKeys } = this.props;
      if (!_.isEmpty(focusedSlice) && !_.isEmpty(focusedSliceKeys)) {
        focused = (
          <FocusedCBGSliceSegment
            focusedSlice={focusedSlice}
            focusedSliceKeys={focusedSliceKeys}
          />
        );
      }

      return (
        <g id="cbgTrends">
          {slices}
          {dateTraces}
          {focused}
        </g>
      );
    }
    return null;
  }

  renderSmbg() {
    if (this.props.showingSmbg) {
      const allSmbgsByDate = (
        <SMBGsByDateContainer
          anSmbgRangeAvgIsFocused={this.props.focusedSmbgRangeAvgKey !== null}
          bgBounds={this.props.bgBounds}
          data={this.props.smbgData}
          dates={this.props.dates}
          focusSmbg={this.props.focusSmbg}
          grouped={this.props.smbgGrouped}
          key="smbgDaysContainer"
          lines={this.props.smbgLines}
          onSelectDate={this.props.onSelectDate}
          smbgOpts={this.props.smbgOpts}
          someSmbgDataIsFocused={this.props.focusedSmbg !== null}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          unfocusSmbg={this.props.unfocusSmbg}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      );
      // Focused date will be rendered last, on top of everything else but flagged
      // as nonInteractive to allow mouse events to be handled exclusively by normally
      // rendered points and lines
      const focusedSmbgDate = this.props.focusedSmbg ? (
        <SMBGsByDateContainer
          anSmbgRangeAvgIsFocused={false}
          bgBounds={this.props.bgBounds}
          data={this.props.focusedSmbg.allSmbgsOnDate}
          dates={[this.props.focusedSmbg.date]}
          focusedSmbg={this.props.focusedSmbg}
          focusSmbg={() => {}}
          grouped={this.props.smbgGrouped}
          key="focusedSmbgDayContainer"
          lines={this.props.smbgLines}
          nonInteractive
          onSelectDate={this.props.onSelectDate}
          smbgOpts={this.props.smbgOpts}
          someSmbgDataIsFocused={false}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          unfocusSmbg={() => {}}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      ) : null;

      return (
        <g id="smbgTrends">
        {this.renderOverlay(SMBGRangeAnimated, 'SMBGRangeContainer')}
        {allSmbgsByDate}
        {focusedSmbgDate}
        </g>
      );
    }
    return null;
  }

  render() {
    const { containerHeight: height, containerWidth: width } = this.props;
    return (
      <svg height={height} width={width}>
        <Background
          linesAtThreeHrs
          margins={this.props.margins}
          smbgOpts={this.props.smbgOpts}
          svgDimensions={{ height, width }}
          xScale={this.props.xScale}
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
        {this.renderNoDataMessage(this.props.showingCbg ? 'cbg' : 'smbg')}
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
  activeDays: PropTypes.shape({
    monday: PropTypes.bool.isRequired,
    tuesday: PropTypes.bool.isRequired,
    wednesday: PropTypes.bool.isRequired,
    thursday: PropTypes.bool.isRequired,
    friday: PropTypes.bool.isRequired,
    saturday: PropTypes.bool.isRequired,
    sunday: PropTypes.bool.isRequired,
  }).isRequired,
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
    localDate: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  cbgData: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    localDate: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  displayFlags: PropTypes.shape({
    cbg100Enabled: PropTypes.bool.isRequired,
    cbg80Enabled: PropTypes.bool.isRequired,
    cbg50Enabled: PropTypes.bool.isRequired,
    cbgMedianEnabled: PropTypes.bool.isRequired,
  }).isRequired,
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
      yPositions: PropTypes.shape({
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
  focusedSmbg: PropTypes.shape({
    allPositions: PropTypes.arrayOf(PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })),
    allSmbgsOnDate: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
    })),
    date: PropTypes.string.isRequired,
    datum: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    position: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
  }),
  focusedSmbgRangeAvgKey: PropTypes.string,
  focusSmbg: PropTypes.func.isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  onSelectDate: PropTypes.func.isRequired,
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
  unfocusSmbg: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default dimensions()(TrendsSVGContainer);
