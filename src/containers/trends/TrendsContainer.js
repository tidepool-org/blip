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

// eslint-disable-next-line import/no-unresolved
import _ from 'lodash';
import bows from 'bows';
// eslint-disable-next-line import/no-unresolved
import { extent } from 'd3-array';
// eslint-disable-next-line import/no-unresolved
import { utcDay } from 'd3-time';
// eslint-disable-next-line import/no-unresolved
import moment from 'moment-timezone';
import React, { PropTypes } from 'react';

class TrendsContainer extends React.Component {
  static propTypes = {
    activeDays: PropTypes.object.isRequired,
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    extentSize: PropTypes.number.isRequired,
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
    onSelectDay: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.log = bows('TrendsContainer');
    this.state = {
      bgDomain: null,
      currentCbgData: [],
      currentSmbgData: [],
      dateDomain: null,
    };
  }

  componentWillMount() {
    // find BG domain (for yScale construction)
    const { cbgByDate, cbgByDayOfWeek, smbgByDate, smbgByDayOfWeek } = this.props;
    const allBg = cbgByDate.filterAll().top(Infinity).concat(smbgByDate.filterAll().top(Infinity));
    const bgDomain = extent(allBg, d => d.value);

    // find initial date domain (based on initialDatetimeLocation or current time)
    const { extentSize, initialDatetimeLocation } = this.props;
    const { timePrefs: { timezoneAware, timezoneName } } = this.props;
    let timezone = 'UTC';
    if (timezoneAware) {
      timezone = timezoneName || 'UTC';
    }
    const end = moment.utc(initialDatetimeLocation || new Date().valueOf())
      .tz(timezone)
      .startOf('day')
      .add(1, 'day')
      .toDate();
    const start = utcDay.offset(end, -extentSize);
    const dateDomain = [start.toISOString(), end.toISOString()];

    // filter data according to current activeDays and dateDomain
    this.initialFiltering(cbgByDate, cbgByDayOfWeek, dateDomain);
    this.initialFiltering(smbgByDate, smbgByDayOfWeek, dateDomain);
    this.setState({
      bgDomain: { lo: bgDomain[0], hi: bgDomain[1] },
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: dateDomain[0], end: dateDomain[1], type: this.determineDataToShow() },
    });
    this.props.onDatetimeLocationChange(dateDomain);
  }

  // componentWillReceiveProps(nextProps) {

  // }

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

  refilterByDate(dataByDate, dateDomain) {
    dataByDate.filter(dateDomain);
  }

  refilterByDayOfWeek(dataByDayOfWeek) {
    const { activeDays } = this.props;
    dataByDayOfWeek.filterFunction(this.filterActiveDaysFn(activeDays));
  }

  saveCurrentData() {
    const { cbgByDate, smbgByDate } = this.props;
    this.setState({
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
    });
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
    const { extentSize } = this.props;
    const minimumCbgs = (extentSize * CBG_READINGS_ONE_DAY) / 2;
    if (currentCbgData.length >= minimumCbgs) {
      return 'cbg';
    }
    return 'smbg';
  }

  render() {
    const type = _.get(this.state, ['dateDomain', 'type'], null);
    if (type === 'smbg') {
      const { smbgTrendsComponent: SMBGTrends } = this.props;
      // TODO: refactor `timezone` assignment - repeated from above!
      const { timePrefs: { timezoneAware, timezoneName } } = this.props;
      let timezone = 'UTC';
      if (timezoneAware) {
        timezone = timezoneName || 'UTC';
      }
      return (
        <SMBGTrends
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
    }
    return null;
  }
}

export default TrendsContainer;
