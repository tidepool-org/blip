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
import sizeMe from 'react-sizeme';
import _ from 'lodash';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import { THREE_HRS } from '../../../utils/datetime';
import { findDatesIntersectingWithCbgSliceSegment } from '../../../utils/trends/data';
import Background from './Background';
import CBGDateTracesAnimationContainer from '../cbg/CBGDateTracesAnimationContainer';
import CBGSlicesContainer from '../cbg/CBGSlicesContainer';
import FocusedCBGSliceSegment from '../cbg/FocusedCBGSliceSegment';
import SMBGsByDateContainer from '../smbg/SMBGsByDateContainer';
import SMBGRangeAvgContainer from '../smbg/SMBGRangeAvgContainer';
import SMBGRangeAnimated from '../smbg/SMBGRangeAnimated';
import SMBGMeanAnimated from '../smbg/SMBGMeanAnimated';

import NoData from './NoData';
import TargetRangeLines from './TargetRangeLines';
import XAxisLabels from './XAxisLabels';
import XAxisTicks from './XAxisTicks';
import YAxisLabelsAndTicks from './YAxisLabelsAndTicks';

export class TrendsSVGContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      focusedSegmentDataGroupedByDate: null,
      size: this.props.size,
      chartWidth: this.props.size.width - 70,
    };
  }

  componentWillMount() {
    this.setScales();
  }

  componentWillReceiveProps(nextProps) {
    const width = nextProps.size.width || this.state.size.width;
    const height = nextProps.size.height || this.state.size.height;

    this.setState({
      size: {
        width,
        height,
      },
      chartWidth: width - 70,
    });

    if (nextProps.yScale !== this.props.yScale) {
      this.setScales(nextProps);
    }

    const { showingCbgDateTraces } = nextProps;
    if (!showingCbgDateTraces) {
      // if we just flipped the showingCbgDateTraces flag from true to false
      // then we need to reset the focusedSegmentDataGroupedByDate to `null`
      if (this.props.showingCbgDateTraces) {
        this.setState({
          focusedSegmentDataGroupedByDate: null,
        });
      }
      return;
    }
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

  setScales(props = this.props) {
    const { margins, smbgOpts, xScale, yScale } = props;
    const { width, height } = this.state.size;
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
    const { activeDays, margins } = this.props;
    const { width, height } = this.state.size;

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
        bgBounds={this.props.bgPrefs.bgBounds}
        data={data}
        key={componentKey}
        smbgComponent={smbgComponent}
        someSmbgDataIsFocused={this.props.focusedSmbg !== null}
        tooltipLeftThreshold={this.props.tooltipLeftThreshold}
        xScale={this.props.xScale}
        yScale={this.props.yScale}
        width={(this.state.chartWidth / 8) - 3}
      />
    );
  }

  renderCbg() {
    if (this.props.showingCbg) {
      const slices = (
        <CBGSlicesContainer
          bgBounds={this.props.bgPrefs.bgBounds}
          sliceWidth={this.state.chartWidth / 56}
          data={this.props.cbgData}
          displayFlags={this.props.displayFlags}
          showingCbgDateTraces={this.props.showingCbgDateTraces}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          topMargin={this.props.margins.top}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      );

      const { focusedSegmentDataGroupedByDate } = this.state;
      const dateTraces = (
        <CBGDateTracesAnimationContainer
          bgBounds={this.props.bgPrefs.bgBounds}
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
            sliceWidth={this.state.chartWidth / 56}
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
          bgBounds={this.props.bgPrefs.bgBounds}
          data={this.props.smbgData}
          dates={this.props.dates}
          grouped={this.props.smbgGrouped}
          key="smbgDaysContainer"
          lines={this.props.smbgLines}
          onSelectDate={this.props.onSelectDate}
          smbgOpts={this.props.smbgOpts}
          someSmbgDataIsFocused={this.props.focusedSmbg !== null}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
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
          bgBounds={this.props.bgPrefs.bgBounds}
          data={this.props.focusedSmbg.allSmbgsOnDate}
          dates={[this.props.focusedSmbg.date]}
          focusedSmbg={this.props.focusedSmbg}
          grouped={this.props.smbgGrouped}
          key="focusedSmbgDayContainer"
          lines={this.props.smbgLines}
          nonInteractive
          onSelectDate={this.props.onSelectDate}
          smbgOpts={this.props.smbgOpts}
          someSmbgDataIsFocused={false}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          xScale={this.props.xScale}
          yScale={this.props.yScale}
        />
      ) : null;

      return (
        <g id="smbgTrends">
          {this.renderOverlay(SMBGRangeAnimated, 'SMBGRangeContainer')}
          {allSmbgsByDate}
          {this.renderOverlay(SMBGMeanAnimated, 'SMBGMeanContainer')}
          {focusedSmbgDate}
        </g>
      );
    }
    return null;
  }

  render() {
    const { width, height } = this.state.size;

    return (
      <div>
        <svg height={height} width="100%">
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
            bgPrefs={this.props.bgPrefs}
            bgUnits={this.props.bgUnits}
            margins={this.props.margins}
            yScale={this.props.yScale}
          />
          {this.renderCbg()}
          {this.renderSmbg()}
          <TargetRangeLines
            bgBounds={this.props.bgPrefs.bgBounds}
            smbgOpts={this.props.smbgOpts}
            xScale={this.props.xScale}
            yScale={this.props.yScale}
          />
          {this.renderNoDataMessage(this.props.showingCbg ? 'cbg' : 'smbg')}
        </svg>
      </div>
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
  bgPrefs: PropTypes.shape({
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
  }).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
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
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  onSelectDate: PropTypes.func.isRequired,
  showingCbg: PropTypes.bool.isRequired,
  showingCbgDateTraces: PropTypes.bool.isRequired,
  showingSmbg: PropTypes.bool.isRequired,
  smbgGrouped: PropTypes.bool.isRequired,
  smbgLines: PropTypes.bool.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  smbgRangeOverlay: PropTypes.bool.isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default sizeMe({ monitorHeight: true })(TrendsSVGContainer);
