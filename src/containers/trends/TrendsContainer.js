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

const CBG_READINGS_ONE_DAY = 86400000 / (1000 * 60 * 5);

import _ from 'lodash';
import bows from 'bows';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { utcDay } from 'd3-time';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../actions/';
import CBGTrendsContainer from './CBGTrendsContainer';
import * as datetime from '../../utils/datetime';

export class TrendsContainer extends React.Component {
  static propTypes = {
    activeDays: PropTypes.shape({
      monday: PropTypes.bool.isRequired,
      tuesday: PropTypes.bool.isRequired,
      wednesday: PropTypes.bool.isRequired,
      thursday: PropTypes.bool.isRequired,
      friday: PropTypes.bool.isRequired,
      saturday: PropTypes.bool.isRequired,
      sunday: PropTypes.bool.isRequired,
    }).isRequired,
    // new data structure to replace bgClasses
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }).isRequired,
    // legacy data structure for representing target range, &c
    // needed for passed-in legacy tideline smbg component but will phase out!
    bgClasses: PropTypes.shape({
      'very-high': PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      high: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      target: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      low: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      'very-low': PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
    }).isRequired,
    bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
    extentSize: PropTypes.oneOf([7, 14, 28]).isRequired,
    initialDatetimeLocation: PropTypes.string,
    showingSmbg: PropTypes.bool.isRequired,
    showingCbg: PropTypes.bool.isRequired,
    smbgRangeOverlay: PropTypes.bool.isRequired,
    smbgGrouped: PropTypes.bool.isRequired,
    smbgLines: PropTypes.bool.isRequired,
    smbgTrendsComponent: PropTypes.func.isRequired,
    timePrefs: PropTypes.shape({
      timezoneAware: PropTypes.bool.isRequired,
      timezoneName: PropTypes.string.isRequired,
    }).isRequired,
    yScaleClampTop: PropTypes.object.isRequired,
    // data (crossfilter dimensions)
    cbgByDate: PropTypes.object.isRequired,
    cbgByDayOfWeek: PropTypes.object.isRequired,
    smbgByDate: PropTypes.object.isRequired,
    smbgByDayOfWeek: PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onSelectDay: PropTypes.func.isRequired,
    onSwitchBgDataSource: PropTypes.func.isRequired,
    // viz state
    viz: PropTypes.shape({
      trends: PropTypes.shape({
        focusedCbgSlice: PropTypes.object,
        focusedCbgSliceKeys: PropTypes.array,
        touched: PropTypes.bool.isRequired,
      }).isRequired,
    }).isRequired,
    // actions
    focusTrendsCbgSlice: PropTypes.func.isRequired,
    markTrendsViewed: PropTypes.func.isRequired,
    unfocusTrendsCbgSlice: PropTypes.func.isRequired,
  };

  static defaultProps = {
    yScaleClampTop: {
      'mg/dL': 400,
      'mmol/L': 22.5,
    },
  };

  constructor(props) {
    super(props);
    this.log = bows('TrendsContainer');
    this.state = {
      currentCbgData: [],
      currentSmbgData: [],
      dateDomain: null,
      mostRecent: null,
      xScale: null,
      yScale: null,
    };
  }

  componentWillMount() {
    // find BG domain (for yScale construction)
    const { cbgByDate, cbgByDayOfWeek, smbgByDate, smbgByDayOfWeek } = this.props;
    const allBg = cbgByDate.filterAll().top(Infinity).concat(smbgByDate.filterAll().top(Infinity));
    const bgDomain = extent(allBg, d => d.value);

    const { bgBounds, bgUnits, yScaleClampTop } = this.props;
    const upperBound = yScaleClampTop[bgUnits];
    const yScaleDomain = [bgDomain[0], upperBound];
    if (bgDomain[0] > bgBounds.targetLowerBound) {
      yScaleDomain[0] = bgBounds.targetLowerBound;
    }
    const yScale = scaleLinear().domain(yScaleDomain).clamp(true);

    // find initial date domain (based on initialDatetimeLocation or current time)
    const { extentSize, initialDatetimeLocation, timePrefs } = this.props;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const mostRecent = datetime.timezoneAwareCeiling(new Date().valueOf(), timezone);
    const end = initialDatetimeLocation ?
      datetime.timezoneAwareCeiling(initialDatetimeLocation, timezone) : mostRecent;
    const start = utcDay.offset(end, -extentSize);
    const dateDomain = [start.toISOString(), end.toISOString()];

    // filter data according to current activeDays and dateDomain
    this.initialFiltering(cbgByDate, cbgByDayOfWeek, dateDomain);
    this.initialFiltering(smbgByDate, smbgByDayOfWeek, dateDomain);
    this.setState({
      bgDomain: { lo: bgDomain[0], hi: bgDomain[1] },
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: dateDomain[0], end: dateDomain[1] },
      mostRecent: mostRecent.toISOString(),
      xScale: scaleLinear().domain([0, 864e5]),
      yScale,
    }, this.determineDataToShow);
    this.props.onDatetimeLocationChange(dateDomain, end === mostRecent);
  }

  /*
   * NB: we don't do as much here as one might expect
   * because we're using the "expose component functions"
   * strategy of communicating between components
   * (https://facebook.github.io/react/tips/expose-component-functions.html)
   * this is the legacy of blip's interface with the d3.chart-architected
   * smbg version of trends view and thus only remains
   * as a temporary compatibility interface
   */
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.activeDays, this.props.activeDays)) {
      const { cbgByDayOfWeek, smbgByDayOfWeek } = this.props;
      this.refilterByDayOfWeek(cbgByDayOfWeek, nextProps.activeDays);
      this.refilterByDayOfWeek(smbgByDayOfWeek, nextProps.activeDays);
      this.setState({
        currentCbgData: cbgByDayOfWeek.top(Infinity).reverse(),
        currentSmbgData: smbgByDayOfWeek.top(Infinity).reverse(),
      });
    }
  }

  getCurrentDay() {
    const { timePrefs } = this.props;
    const { dateDomain: { end } } = this.state;
    return datetime.localNoonBeforeTimestamp(
      end,
      datetime.getTimezoneFromTimePrefs(timePrefs)
    ).toISOString();
  }

  setExtent(newDomain) {
    const { cbgByDate, smbgByDate } = this.props;
    this.refilterByDate(cbgByDate, newDomain);
    this.refilterByDate(smbgByDate, newDomain);
    this.setState({
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: newDomain[0], end: newDomain[1] },
    });
  }

  goBack() {
    const { dateDomain: { start: newEnd }, mostRecent } = this.state;
    const { timePrefs } = this.props;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const start = datetime.timezoneAwareOffset(newEnd, timezone, {
      amount: -this.props.extentSize,
      units: 'days',
    }).toISOString();
    const newDomain = [start, newEnd];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain, newEnd >= mostRecent);
  }

  goForward() {
    const { dateDomain: { end: newStart }, mostRecent } = this.state;
    const end = utcDay.offset(new Date(newStart), this.props.extentSize).toISOString();
    const newDomain = [newStart, end];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain, end >= mostRecent);
  }

  goToMostRecent() {
    const { mostRecent: end } = this.state;
    const start = utcDay.offset(new Date(end), -this.props.extentSize).toISOString();
    const newDomain = [start, end];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain, true);
  }

  refilterByDate(dataByDate, dateDomain) {
    dataByDate.filter(dateDomain);
  }

  refilterByDayOfWeek(dataByDayOfWeek, activeDays) {
    dataByDayOfWeek.filterFunction(this.filterActiveDaysFn(activeDays));
  }

  initialFiltering(dataByDate, dataByDayOfWeek, dateDomain) {
    const { activeDays } = this.props;
    // clear old filters
    dataByDayOfWeek.filterAll();

    // filter by day of week (Monday, Tuesday, etc.)
    dataByDayOfWeek.filterFunction(this.filterActiveDaysFn(activeDays));

    // filter within date domain
    dataByDate.filter(dateDomain);
  }

  filterActiveDaysFn(activeDays) {
    return (d) => (activeDays[d]);
  }

  determineDataToShow() {
    const { viz: { trends: { touched } } } = this.props;
    if (touched) {
      return;
    }
    const { currentCbgData } = this.state;
    const { extentSize, showingCbg } = this.props;
    const minimumCbgs = (extentSize * CBG_READINGS_ONE_DAY) / 2;
    if (showingCbg && currentCbgData.length < minimumCbgs) {
      this.props.onSwitchBgDataSource();
    }
    this.props.markTrendsViewed();
  }

  render() {
    const { timePrefs } = this.props;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    if (this.props.showingSmbg) {
      const { smbgTrendsComponent: SMBGTrendsContainer } = this.props;
      return (
        <SMBGTrendsContainer
          bgClasses={this.props.bgClasses}
          bgDomain={[this.state.bgDomain.lo, this.state.bgDomain.hi]}
          bgUnits={this.props.bgUnits}
          boxOverlay={this.props.smbgRangeOverlay}
          data={this.state.currentSmbgData}
          grouped={this.props.smbgGrouped}
          onSelectDay={this.props.onSelectDay}
          showingLines={this.props.smbgLines}
          timezone={timezone}
        />
      );
    } else if (this.props.showingCbg) {
      return (
        <CBGTrendsContainer
          bgBounds={this.props.bgBounds}
          bgUnits={this.props.bgUnits}
          data={this.state.currentCbgData}
          focusedSlice={this.props.viz.trends.focusedCbgSlice}
          focusedSliceKeys={this.props.viz.trends.focusedCbgSliceKeys}
          focusSlice={this.props.focusTrendsCbgSlice}
          unfocusSlice={this.props.unfocusTrendsCbgSlice}
          timezone={timezone}
          xScale={this.state.xScale}
          yScale={this.state.yScale}
        />
      );
    }
    return null;
  }
}

export function mapStateToProps(state) {
  return {
    viz: state.viz,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    focusTrendsCbgSlice: actions.focusTrendsCbgSlice,
    markTrendsViewed: actions.markTrendsViewed,
    unfocusTrendsCbgSlice: actions.unfocusTrendsCbgSlice,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => (Object.assign({}, ownProps, stateProps, dispatchProps)),
  { withRef: true },
)(TrendsContainer);
