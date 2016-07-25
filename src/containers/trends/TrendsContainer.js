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
    bgBounds: PropTypes.shape({
      veryHighThreshold: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
      targetLowerBound: PropTypes.number.isRequired,
      veryLowThreshold: PropTypes.number.isRequired,
    }),
    bgClasses: PropTypes.shape({
      'very-high': PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      high: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      target: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      low: PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
      'very-low': PropTypes.shape({ boundary: PropTypes.number.isRequired }).isRequired,
    }).isRequired,
    bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']),
    extentSize: PropTypes.oneOf([7, 14, 28]),
    initialDatetimeLocation: PropTypes.string,
    showingSmbg: PropTypes.bool.isRequired,
    showingCbg: PropTypes.bool.isRequired,
    smbgRangeOverlay: PropTypes.bool.isRequired,
    smbgGrouped: PropTypes.bool.isRequired,
    smbgLines: PropTypes.bool.isRequired,
    smbgTrendsComponent: PropTypes.func.isRequired,
    timePrefs: PropTypes.object.isRequired,
    // data (crossfilter dimensions)
    cbgByDate: PropTypes.object.isRequired,
    cbgByDayOfWeek: PropTypes.object.isRequired,
    smbgByDate: PropTypes.object.isRequired,
    smbgByDayOfWeek: PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onSwitchBgDataSource: PropTypes.func.isRequired,
    // viz state
    viz: PropTypes.shape({
      trends: PropTypes.shape({
        focusedCbgSlice: PropTypes.object,
      }).isRequired,
    }).isRequired,
    // actions
    focusTrendsCbgSlice: PropTypes.func.isRequired,
    unfocusTrendsCbgSlice: PropTypes.func.isRequired,
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

    const { bgBounds, bgUnits } = this.props;
    const upperBound = (bgUnits === 'mg/dL') ? 400 : 22.5;
    const yScaleDomain = [bgDomain[0], upperBound];
    if (bgDomain[0] > bgBounds.targetLowerBound) {
      yScaleDomain[0] = bgBounds.targetLowerBound;
    }
    const yScale = scaleLinear().domain(yScaleDomain);

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
    this.props.onDatetimeLocationChange(dateDomain);
  }

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
    const { dateDomain: { end } } = this.state;
    // TODO: replace with more robust code for finding noon of the local timezone day
    return new Date(Date.parse(end) - (864e5 / 2));
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
    const { dateDomain: { start: newEnd } } = this.state;
    const start = utcDay.offset(new Date(newEnd), -this.props.extentSize).toISOString();
    const newDomain = [start, newEnd];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain);
  }

  goForward() {
    const { dateDomain: { end: newStart }, mostRecent } = this.state;
    const end = utcDay.offset(new Date(newStart), this.props.extentSize).toISOString();
    const newDomain = [newStart, end];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain);
    return (end === mostRecent);
  }

  goToMostRecent() {
    const { mostRecent: end } = this.state;
    const start = utcDay.offset(new Date(end), -this.props.extentSize).toISOString();
    const newDomain = [start, end];
    this.setExtent(newDomain);
    this.props.onDatetimeLocationChange(newDomain);
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
    const { currentCbgData } = this.state;
    const { extentSize, showingCbg } = this.props;
    const minimumCbgs = (extentSize * CBG_READINGS_ONE_DAY) / 5;
    if (currentCbgData.length >= minimumCbgs && !showingCbg) {
      this.props.onSwitchBgDataSource();
    }
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
    unfocusTrendsCbgSlice: actions.unfocusTrendsCbgSlice,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => (Object.assign({}, ownProps, stateProps, dispatchProps)),
  { withRef: true },
)(TrendsContainer);
