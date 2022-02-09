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
import PropTypes from "prop-types";
import React from "react";
import sizeMe from "react-sizeme";
import _ from "lodash";
import { scaleLinear } from "d3-scale";
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY } from "tideline";

import { THREE_HRS } from "../../../utils/datetime";
import { findDatesIntersectingWithCbgSliceSegment } from "../../../utils/trends/data";
import Background from "./Background";
import CBGDateTracesAnimationContainer from "../cbg/CBGDateTracesAnimationContainer";
import CBGSlicesContainer from "../cbg/CBGSlicesContainer";
import FocusedCBGSliceSegment from "../cbg/FocusedCBGSliceSegment";
import NoData from "./NoData";
import TargetRangeLines from "./TargetRangeLines";
import XAxisLabels from "./XAxisLabels";
import XAxisTicks from "./XAxisTicks";
import YAxisLabelsAndTicks from "./YAxisLabelsAndTicks";

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

const CHART_WIDTH_M_SIZE = 70;

export class TrendsSVGContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedSegmentDataGroupedByDate: null,
      xScale: scaleLinear().domain([0, MS_IN_DAY]),
      yScale: null,
    };
  }

  componentDidMount() {
    this.setScales();
  }

  componentDidUpdate(prevProps) {
    const sizeChanged = !_.isEqual(this.props.size, prevProps.size);
    const yDomainChanged = !_.isEqual(this.props.yScaleDomain, prevProps.yScaleDomain);
    if (sizeChanged || yDomainChanged) {
      this.setScales();
    }

    if (this.props.showingCbgDateTraces) {
      const { cbgData, focusedSlice, focusedSliceKeys } = this.props;
      const shouldGenData = !_.isNil(focusedSlice) && !_.isNil(focusedSliceKeys) && (
        this.state.focusedSegmentDataGroupedByDate === null
        || !_.isEqual(focusedSlice, prevProps.focusedSlice)
        || !_.isEqual(focusedSliceKeys, prevProps.focusedSliceKeys)
      );

      if (shouldGenData) {
        const intersectingDates = findDatesIntersectingWithCbgSliceSegment(cbgData, focusedSlice, focusedSliceKeys);
        const focusedSegmentDataGroupedByDate = _.groupBy(
          _.filter(cbgData, (d) => (_.includes(intersectingDates, d.localDate))),
          "localDate"
        );
        this.setState({
          focusedSegmentDataGroupedByDate,
        });
      }

    } else if (this.state.focusedSegmentDataGroupedByDate !== null) {
      this.setState({
        focusedSegmentDataGroupedByDate: null,
      });
    }
  }

  setScales() {
    const { margins, smbgOpts, yScaleDomain } = this.props;
    const { width, height } = this.props.size;
    const xScale = scaleLinear().domain([0, MS_IN_DAY]).range([
      margins.left + Math.round(smbgOpts.maxR),
      width - margins.right - Math.round(smbgOpts.maxR),
    ]);
    const yScale = scaleLinear().domain(yScaleDomain).clamp(true).range([
      height - margins.bottom - BUMPERS.bottom,
      margins.top + BUMPERS.top,
    ]);
    this.setState({ xScale, yScale });
  }

  renderNoDataMessage(dataType) {
    if (_.isEmpty(this.props.cbgData)) {
      const { activeDays, margins } = this.props;
      const { width, height } = this.props.size;

      const xPos = (width / 2) + margins.right;
      const yPos = (height / 2) + margins.bottom;
      const messagePosition = { x: xPos, y: yPos };
      const unselectedAll = _.every(activeDays, (flag) => (!flag));
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

  renderCbg() {
    const { margins, focusedSlice, focusedSliceKeys } = this.props;
    const sliceWidth = (this.props.size.width - CHART_WIDTH_M_SIZE) / 56;
    const { xScale, yScale } = this.state;

    let dateTraces = null;
    let focused = null;
    if (focusedSlice) {
      const { focusedSegmentDataGroupedByDate } = this.state;
      dateTraces = focusedSegmentDataGroupedByDate === null ? null : (
        <CBGDateTracesAnimationContainer
          bgBounds={this.props.bgPrefs.bgBounds}
          data={focusedSegmentDataGroupedByDate}
          onSelectDate={this.props.onSelectDate}
          topMargin={margins.top}
          xScale={xScale}
          yScale={yScale}
        />
      );
      focused = (
        <FocusedCBGSliceSegment
          focusedSlice={focusedSlice}
          focusedSliceKeys={focusedSliceKeys}
          sliceWidth={sliceWidth}
        />
      );
    }

    return (
      <g id="cbgTrends">
        <CBGSlicesContainer
          bgBounds={this.props.bgPrefs.bgBounds}
          sliceWidth={sliceWidth}
          data={this.props.cbgData}
          displayFlags={this.props.displayFlags}
          showingCbgDateTraces={this.props.showingCbgDateTraces}
          tooltipLeftThreshold={this.props.tooltipLeftThreshold}
          topMargin={margins.top}
          xScale={xScale}
          yScale={yScale}
        />
        {focused}
        {dateTraces}
      </g>
    );
  }

  render() {
    const { width, height } = this.props.size;
    const { xScale, yScale } = this.state;

    if (xScale === null || yScale === null) {
      return null;
    }

    return (
      <div id="trends-svg-container">
        <svg id="trends-svg" height={height} width="100%">
          <Background
            linesAtThreeHrs
            margins={this.props.margins}
            svgDimensions={{ height, width }}
            xScale={xScale}
          />
          <XAxisLabels
            margins={this.props.margins}
            xScale={xScale}
          />
          <XAxisTicks
            margins={this.props.margins}
            xScale={xScale}
          />
          <YAxisLabelsAndTicks
            bgPrefs={this.props.bgPrefs}
            margins={this.props.margins}
            yScale={yScale}
          />
          {this.renderCbg()}
          <TargetRangeLines
            bgBounds={this.props.bgPrefs.bgBounds}
            smbgOpts={this.props.smbgOpts}
            xScale={xScale}
            yScale={yScale}
          />
          {this.renderNoDataMessage("cbg")}
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
  size: {
    width: 640,
    height: 480,
  },
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
    "firstQuartile",
    "max",
    "median",
    "min",
    "ninetiethQuantile",
    "tenthQuantile",
    "thirdQuartile",
  ])),
  margins: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  onSelectDate: PropTypes.func.isRequired,
  showingCbgDateTraces: PropTypes.bool.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }),
  tooltipLeftThreshold: PropTypes.number.isRequired,
  yScaleDomain: PropTypes.arrayOf(PropTypes.number),
};

export default sizeMe({ monitorHeight: true })(TrendsSVGContainer);
