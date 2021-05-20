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
import bows from 'bows';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { utcDay } from 'd3-time';
import moment from 'moment-timezone';
import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../../redux/actions/';
import TrendsSVGContainer from './TrendsSVGContainer';

import {
  CGM_READINGS_ONE_DAY,
  MGDL_CLAMP_TOP,
  MMOLL_CLAMP_TOP,
  MGDL_UNITS,
  MMOLL_UNITS,
  CGM_DATA_KEY,
  BGM_DATA_KEY,
} from '../../../utils/constants';

import * as datetime from '../../../utils/datetime';
import { weightedCGMCount } from '../../../utils/bloodglucose';

/**
 * getAllDatesInRange
 * @param {String} start - Zulu timestamp (Integer hammertime also OK)
 * @param {String} end - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {Array} dates - array of YYYY-MM-DD String dates
 */
export function getAllDatesInRange(start, end, timePrefs) {
  const timezoneName = datetime.getTimezoneFromTimePrefs(timePrefs);
  const dates = [];
  const current = moment.utc(start)
    .tz(timezoneName);
  const excludedBoundary = moment.utc(end);
  while (current.isBefore(excludedBoundary)) {
    dates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }
  return dates;
}

/**
 * getLocalizedNoonBeforeUTC
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {JavaScript Date} the closet noon before the input datetime in the given timezone
 */
export function getLocalizedNoonBeforeUTC(utc, timePrefs) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
  const ceil = datetime.getLocalizedCeiling(utc, timePrefs);
  return moment.utc(ceil.valueOf())
    .tz(timezone)
    .subtract(1, 'day')
    .hours(12)
    .toDate();
}

/**
 * getLocalizedOffset
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} offset - { amount: integer (+/-), units: 'hour', 'day', &c }
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {JavaScript Date} datetime at the specified +/- offset from the input datetime
 *                           inspired by d3-time's offset function: https://github.com/d3/d3-time#interval_offset
 *                           but able to work with an arbitrary timezone
 */
export function getLocalizedOffset(utc, offset, timePrefs) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
  return moment.utc(utc)
    .tz(timezone)
    .add(offset.amount, offset.units)
    .toDate();
}

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
    bgPrefs: PropTypes.shape({
      bgBounds: PropTypes.shape({
        veryHighThreshold: PropTypes.number.isRequired,
        targetUpperBound: PropTypes.number.isRequired,
        targetLowerBound: PropTypes.number.isRequired,
        veryLowThreshold: PropTypes.number.isRequired,
      }).isRequired,
      bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    }).isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    extentSize: PropTypes.number.isRequired,
    initialDatetimeLocation: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    showingSmbg: PropTypes.bool.isRequired,
    showingCbg: PropTypes.bool.isRequired,
    smbgRangeOverlay: PropTypes.bool.isRequired,
    smbgGrouped: PropTypes.bool.isRequired,
    smbgLines: PropTypes.bool.isRequired,
    timePrefs: PropTypes.shape({
      timezoneAware: PropTypes.bool.isRequired,
      timezoneName: PropTypes.string,
    }).isRequired,
    yScaleClampTop: PropTypes.shape({
      [MGDL_UNITS]: PropTypes.number.isRequired,
      [MMOLL_UNITS]: PropTypes.number.isRequired,
    }).isRequired,
    // data (crossfilter dimensions)
    tidelineData: PropTypes.object.isRequired,
    cbgByDate: PropTypes.object.isRequired,
    cbgByDayOfWeek: PropTypes.object.isRequired,
    smbgByDate: PropTypes.object.isRequired,
    smbgByDayOfWeek: PropTypes.object.isRequired,
    // handlers
    markTrendsViewed: PropTypes.func.isRequired,
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onSelectDate: PropTypes.func.isRequired,
    onSwitchBgDataSource: PropTypes.func.isRequired,
    // viz state
    trendsState: PropTypes.shape({
      cbgFlags: PropTypes.shape({
        cbg100Enabled: PropTypes.bool.isRequired,
        cbg80Enabled: PropTypes.bool.isRequired,
        cbg50Enabled: PropTypes.bool.isRequired,
        cbgMedianEnabled: PropTypes.bool.isRequired,
      }).isRequired,
      focusedCbgSlice: PropTypes.shape({
        data: PropTypes.shape({
          firstQuartile: PropTypes.number.isRequired,
          id: PropTypes.string.isRequired,
          max: PropTypes.number.isRequired,
          median: PropTypes.number.isRequired,
          min: PropTypes.number.isRequired,
          msFrom: PropTypes.number.isRequired,
          msTo: PropTypes.number.isRequired,
          msX: PropTypes.number.isRequired,
          ninetiethQuantile: PropTypes.number.isRequired,
          tenthQuantile: PropTypes.number.isRequired,
          thirdQuartile: PropTypes.number.isRequired,
        }),
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
          }),
        }),
      }),
      focusedCbgSliceKeys: PropTypes.arrayOf(PropTypes.oneOf([
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
      focusedSmbgRangeAvg: PropTypes.shape({
        data: PropTypes.shape({
          id: PropTypes.string.isRequired,
          max: PropTypes.number.isRequired,
          mean: PropTypes.number.isRequired,
          min: PropTypes.number.isRequired,
          msX: PropTypes.number.isRequired,
          msFrom: PropTypes.number.isRequired,
          msTo: PropTypes.number.isRequired,
        }).isRequired,
        position: PropTypes.shape({
          left: PropTypes.number.isRequired,
          tooltipLeft: PropTypes.bool.isRequired,
          yPositions: PropTypes.shape({
            max: PropTypes.number.isRequired,
            mean: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
          }).isRequired,
        }).isRequired,
      }),
      touched: PropTypes.bool.isRequired,
    }).isRequired,
    unfocusCbgSlice: PropTypes.func.isRequired,
    unfocusSmbg: PropTypes.func.isRequired,
    unfocusSmbgRangeAvg: PropTypes.func.isRequired,
  };

  static defaultProps = {
    yScaleClampTop: {
      [MGDL_UNITS]: MGDL_CLAMP_TOP,
      [MMOLL_UNITS]: MMOLL_CLAMP_TOP,
    },
    initialDatetimeLocation: new Date().toISOString(),
  };

  constructor(props) {
    super(props);
    this.log = bows('TrendsContainer');
    this.state = {
      currentCbgData: [],
      currentSmbgData: [],
      dateDomain: null,
      mostRecent: null,
      previousDateDomain: null,
      xScale: null,
      yScale: null,
    };

    /** Avoid infinite mount data loop */
    this.mountingData = false;
    this.selectDate = this.selectDate.bind(this);
    this.determineDataToShow = this.determineDataToShow.bind(this);
  }

  componentDidMount() {
    this.mountData();
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
  componentDidUpdate(prevProps) {
    const newDataLoaded = prevProps.loading && !this.props.loading;

    if (newDataLoaded) {
      this.mountData();
    } else if (!_.isEqual(prevProps.activeDays, this.props.activeDays)) {
      this.filterCurrentData();
    }
  }

  componentWillUnmount() {
    const {
      currentPatientInViewId,
      trendsState,
      unfocusCbgSlice,
      unfocusSmbg,
      unfocusSmbgRangeAvg,
    } = this.props;
    if (_.get(trendsState, 'focusedCbgSlice') !== null) {
      unfocusCbgSlice(currentPatientInViewId);
    }
    if (_.get(trendsState, 'focusedSmbg') !== null) {
      unfocusSmbg(currentPatientInViewId);
    }
    if (_.get(trendsState, 'focusedSmbgRangeAvg') !== null) {
      unfocusSmbgRangeAvg(currentPatientInViewId);
    }
  }

  mountData() {
    const { extentSize, initialDatetimeLocation, timePrefs } = this.props;
    this.log.debug("mountData", this.mountingData, { initialDatetimeLocation, extentSize }, new Error("stack"));
    if (this.mountingData) {
      return;
    }
    this.mountingData = true;
    // find BG domain (for yScale construction)
    const { cbgByDate, cbgByDayOfWeek, smbgByDate, smbgByDayOfWeek, tidelineData } = this.props;
    const allBg = cbgByDate.filterAll().top(Infinity).concat(smbgByDate.filterAll().top(Infinity));
    const bgDomain = extent(allBg, d => d.value);

    const { bgPrefs: { bgBounds, bgUnits }, yScaleClampTop } = this.props;
    const upperBound = yScaleClampTop[bgUnits];
    const yScaleDomain = [bgDomain[0], upperBound];
    if (bgDomain[0] > bgBounds.veryLowThreshold) {
      yScaleDomain[0] = bgBounds.veryLowThreshold;
    }
    const yScale = scaleLinear().domain(yScaleDomain).clamp(true);

    // find initial date domain (based on initialDatetimeLocation or current time)
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    // Remove 1 miliseconds here, because there is 1 added in tidelinedata
    const mostRecent = moment.tz(tidelineData.endpoints[1], timezone).subtract(1, 'millisecond');
    let end = moment.tz(initialDatetimeLocation, timezone).endOf('day').add(Math.round(extentSize / 2), 'days');
    if (end.valueOf() > mostRecent.valueOf()) {
      this.log.info('End after most recent, update it', { end: end.toISOString(), mostRecent: mostRecent.toISOString() });
      end = moment.tz(mostRecent.valueOf(), timezone);
    }
    let start = moment.tz(end.valueOf(), timezone).subtract(extentSize, 'days');
    const dateDomain = [start.toISOString(), end.toISOString()];

    // filter data according to current activeDays and dateDomain
    this.initialFiltering(cbgByDate, cbgByDayOfWeek, dateDomain);
    this.initialFiltering(smbgByDate, smbgByDayOfWeek, dateDomain);

    const state = {
      bgDomain: { lo: bgDomain[0], hi: bgDomain[1] },
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: dateDomain[0], end: dateDomain[1] },
      mostRecent: mostRecent.toISOString(),
      xScale: scaleLinear().domain([0, 864e5]),
      yScale,
    };

    this.setState(state, this.determineDataToShow);
    const atMostRecent = Math.abs(end.diff(mostRecent, 'hours').valueOf()) < 1;
    this.props.onDatetimeLocationChange(dateDomain, atMostRecent).catch((reason) => {
      this.log.error(reason);
    }).finally(() => {
      this.mountingData = false;
      this.log.debug("Mouting done", { initialDatetimeLocation, dateDomain: state.dateDomain, mostRecent: state.mostRecent, timezone });
    });
  }

  filterCurrentData() {
    const { cbgByDayOfWeek, smbgByDayOfWeek, smbgByDate, cbgByDate } = this.props;
    this.refilterByDayOfWeek(cbgByDayOfWeek, this.props.activeDays);
    this.refilterByDayOfWeek(smbgByDayOfWeek, this.props.activeDays);
    this.setState({
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
    });
  }

  getCurrentDay() {
    const { dateDomain } = this.state;
    if (dateDomain) {
      return getLocalizedNoonBeforeUTC(dateDomain.end, this.props.timePrefs).toISOString();
    } else {
      return null;
    }
  }

  setExtent(newDomain, oldDomain) {
    const { cbgByDate, smbgByDate } = this.props;
    const { mostRecent } = this.state;
    this.refilterByDate(cbgByDate, newDomain);
    this.refilterByDate(smbgByDate, newDomain);
    this.setState({
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: newDomain[0], end: newDomain[1] },
      previousDateDomain: oldDomain ?
        { start: oldDomain[0], end: oldDomain[1] } :
        null,
    }, () => {
      this.props.onDatetimeLocationChange(newDomain, newDomain[1] >= mostRecent);
    });
  }

  selectDate() {
    const { timePrefs } = this.props;
    return (date) => {
      const noonOnDate = moment.tz(date, datetime.getTimezoneFromTimePrefs(timePrefs))
        .startOf('day')
        .add(12, 'hours')
        .toISOString();
      this.props.onSelectDate(noonOnDate);
    };
  }

  goBack() {
    const { timePrefs, extentSize, tidelineData } = this.props;
    const { dateDomain } = this.state;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const mMostAncient = moment.tz(tidelineData.endpoints[0], timezone);
    let start = moment.tz(dateDomain.start, timezone).subtract(extentSize, 'days');
    if (start.valueOf() < mMostAncient.valueOf()) {
      start = mMostAncient;
    }
    const end = moment.tz(start, timezone).add(extentSize, 'days');
    this.setExtent([start.toISOString(), end.toISOString()], dateDomain);
  }

  goForward() {
    const { timePrefs, extentSize } = this.props;
    const { dateDomain, mostRecent } = this.state;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const mMostRecent = moment.tz(mostRecent, timezone);
    let end = moment.tz(dateDomain.end, timezone).add(extentSize, 'days');
    if (end.valueOf() > mMostRecent.valueOf()) {
      end = mMostRecent;
    }
    const start = moment.tz(end.valueOf(), timezone).subtract(extentSize, 'days');
    this.setExtent([start.toISOString(), end.toISOString()], dateDomain);
  }

  goToMostRecent() {
    const { timePrefs, extentSize } = this.props;
    const { mostRecent } = this.state;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const end = moment.tz(mostRecent, timezone);
    const start = moment.tz(end.valueOf(), timezone).subtract(extentSize, 'days');
    this.setExtent([start.toISOString(), end.toISOString()]);
  }

  refilterByDate(dataByDate, dateDomain) {
    // eslint-disable-next-line lodash/prefer-lodash-method
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
    // eslint-disable-next-line lodash/prefer-lodash-method
    dataByDate.filter(dateDomain);
  }

  filterActiveDaysFn(activeDays) {
    return (d) => (activeDays[d]);
  }

  determineDataToShow() {
    const { currentPatientInViewId, trendsState: { touched } } = this.props;
    if (touched) {
      return;
    }
    const { currentCbgData, currentSmbgData } = this.state;
    const { extentSize, showingCbg } = this.props;
    const minimumCbgs = (extentSize * CGM_READINGS_ONE_DAY) / 2;

    // If we're set to show CBG data, but have less than 50% coverage AND we have SMBG data,
    // switch to SBMG view
    if (showingCbg && weightedCGMCount(currentCbgData) < minimumCbgs && currentSmbgData.length) {
      this.props.onSwitchBgDataSource(null, showingCbg ? BGM_DATA_KEY : CGM_DATA_KEY);
    }
    this.props.markTrendsViewed(currentPatientInViewId);
  }

  render() {
    const { dateDomain } = this.state;

    if (_.isNull(dateDomain)) {
      // Datas have not yet been mounted.
      return (<div />);
    }

    const { start: currentStart, end: currentEnd } = dateDomain;

    const prevStart = _.get(this.state, ['previousDateDomain', 'start']);
    const prevEnd = _.get(this.state, ['previousDateDomain', 'end']);
    let start = currentStart;
    let end = currentEnd;
    if (prevStart && prevEnd) {
      if (currentStart < prevStart) {
        end = prevEnd;
      } else if (prevStart < currentStart) {
        start = prevStart;
      }
    }

    return (
      <TrendsSVGContainer
        activeDays={this.props.activeDays}
        bgPrefs={this.props.bgPrefs}
        smbgData={this.state.currentSmbgData}
        cbgData={this.state.currentCbgData}
        dates={getAllDatesInRange(start, end, this.props.timePrefs)}
        focusedSlice={this.props.trendsState.focusedCbgSlice}
        focusedSliceKeys={this.props.trendsState.focusedCbgSliceKeys}
        focusedSmbgRangeAvgKey={_.get(
          this.props, ['trendsState', 'focusedSmbgRangeAvg', 'data', 'id'], null
        )}
        focusedSmbg={this.props.trendsState.focusedSmbg}
        displayFlags={this.props.trendsState.cbgFlags}
        showingCbg={this.props.showingCbg}
        showingCbgDateTraces={_.get(
          this.props, ['trendsState', 'showingCbgDateTraces'], false
        )}
        showingSmbg={this.props.showingSmbg}
        smbgGrouped={this.props.smbgGrouped}
        smbgLines={this.props.smbgLines}
        smbgRangeOverlay={this.props.smbgRangeOverlay}
        onSelectDate={this.selectDate()}
        xScale={this.state.xScale}
        yScale={this.state.yScale}
      />
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const userId = _.get(ownProps, 'currentPatientInViewId');
  return {
    trendsState: _.get(state, ['viz', 'trends', userId], {}),
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    markTrendsViewed: actions.markTrendsViewed,
    unfocusCbgSlice: actions.unfocusTrendsCbgSlice,
    unfocusSmbg: actions.unfocusTrendsSmbg,
    unfocusSmbgRangeAvg: actions.unfocusTrendsSmbgRangeAvg,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => (_.assign({}, ownProps, stateProps, dispatchProps)),
  { withRef: true },
)(TrendsContainer);
