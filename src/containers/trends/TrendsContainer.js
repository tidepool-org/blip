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

import * as actions from '../../redux/actions/';
import TrendsSVGContainer from './TrendsSVGContainer';
import {
  MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP, MGDL_UNITS, MMOLL_UNITS, trends,
} from '../../utils/constants';
const { extentSizes: { ONE_WEEK, TWO_WEEKS, FOUR_WEEKS } } = trends;
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
    }).isRequired,
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    extentSize: PropTypes.oneOf([ONE_WEEK, TWO_WEEKS, FOUR_WEEKS]).isRequired,
    initialDatetimeLocation: PropTypes.string,
    showingSmbg: PropTypes.bool.isRequired,
    showingCbg: PropTypes.bool.isRequired,
    smbgRangeOverlay: PropTypes.bool.isRequired,
    smbgGrouped: PropTypes.bool.isRequired,
    smbgLines: PropTypes.bool.isRequired,
    timePrefs: PropTypes.shape({
      timezoneAware: PropTypes.bool.isRequired,
      timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
    }).isRequired,
    yScaleClampTop: PropTypes.shape({
      [MGDL_UNITS]: PropTypes.number.isRequired,
      [MMOLL_UNITS]: PropTypes.number.isRequired,
    }).isRequired,
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
    trendsState: PropTypes.shape({
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
      touched: PropTypes.bool.isRequired,
    }).isRequired,
    // actions
    focusTrendsCbgSlice: PropTypes.func.isRequired,
    focusTrendsSmbgRangeAvg: PropTypes.func.isRequired,
    focusTrendsSmbg: PropTypes.func.isRequired,
    markTrendsViewed: PropTypes.func.isRequired,
    unfocusTrendsCbgSlice: PropTypes.func.isRequired,
    unfocusTrendsSmbgRangeAvg: PropTypes.func.isRequired,
    unfocusTrendsSmbg: PropTypes.func.isRequired,
  };

  static defaultProps = {
    yScaleClampTop: {
      [MGDL_UNITS]: MGDL_CLAMP_TOP,
      [MMOLL_UNITS]: MMOLL_CLAMP_TOP,
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
      selectDay: (date) => {
        this.props.onSelectDay(datetime.midDayForDate(date, timePrefs));
      },
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
    const { mostRecent } = this.state;
    this.refilterByDate(cbgByDate, newDomain);
    this.refilterByDate(smbgByDate, newDomain);
    this.setState({
      currentCbgData: cbgByDate.top(Infinity).reverse(),
      currentSmbgData: smbgByDate.top(Infinity).reverse(),
      dateDomain: { start: newDomain[0], end: newDomain[1] },
    });
    this.props.onDatetimeLocationChange(newDomain, newDomain[1] >= mostRecent);
  }

  goBack() {
    const { dateDomain: { start: newEnd } } = this.state;
    const { timePrefs } = this.props;
    const timezone = datetime.getTimezoneFromTimePrefs(timePrefs);
    const start = datetime.timezoneAwareOffset(newEnd, timezone, {
      // negative because we are moving backward in time
      amount: -this.props.extentSize,
      units: 'days',
    }).toISOString();
    const newDomain = [start, newEnd];
    this.setExtent(newDomain);
  }

  goForward() {
    const { dateDomain: { end: newStart } } = this.state;
    const end = utcDay.offset(new Date(newStart), this.props.extentSize).toISOString();
    const newDomain = [newStart, end];
    this.setExtent(newDomain);
  }

  goToMostRecent() {
    const { mostRecent: end } = this.state;
    const start = utcDay.offset(new Date(end), -this.props.extentSize).toISOString();
    const newDomain = [start, end];
    this.setExtent(newDomain);
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
    const { trendsState: { touched } } = this.props;
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
    return (
      <TrendsSVGContainer
        bgBounds={this.props.bgBounds}
        bgUnits={this.props.bgUnits}
        smbgData={this.state.currentSmbgData}
        cbgData={this.state.currentCbgData}
        focusedSlice={this.props.trendsState.focusedCbgSlice}
        focusedSliceKeys={this.props.trendsState.focusedCbgSliceKeys}
        focusedSmbg={this.props.trendsState.focusedSmbg}
        focusRange={this.props.focusTrendsSmbgRangeAvg}
        focusSmbg={this.props.focusTrendsSmbg}
        focusSlice={this.props.focusTrendsCbgSlice}
        showingCbg={this.props.showingCbg}
        showingSmbg={this.props.showingSmbg}
        smbgGrouped={this.props.smbgGrouped}
        smbgLines={this.props.smbgLines}
        smbgRangeOverlay={this.props.smbgRangeOverlay}
        onSelectDay={this.state.selectDay}
        xScale={this.state.xScale}
        yScale={this.state.yScale}
        unfocusRange={this.props.unfocusTrendsSmbgRangeAvg}
        unfocusSmbg={this.props.unfocusTrendsSmbg}
        unfocusSlice={this.props.unfocusTrendsCbgSlice}
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

export function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators({
    focusTrendsCbgSlice: _.partial(
      actions.focusTrendsCbgSlice, ownProps.currentPatientInViewId
    ),
    focusTrendsSmbgRangeAvg: _.partial(
      actions.focusTrendsSmbgRangeAvg, ownProps.currentPatientInViewId
    ),
    focusTrendsSmbg: _.partial(
      actions.focusTrendsSmbg, ownProps.currentPatientInViewId
    ),
    markTrendsViewed: _.partial(
      actions.markTrendsViewed, ownProps.currentPatientInViewId
    ),
    unfocusTrendsCbgSlice: _.partial(
      actions.unfocusTrendsCbgSlice, ownProps.currentPatientInViewId
    ),
    unfocusTrendsSmbgRangeAvg: _.partial(
      actions.unfocusTrendsSmbgRangeAvg, ownProps.currentPatientInViewId
    ),
    unfocusTrendsSmbg: _.partial(
      actions.unfocusTrendsSmbg, ownProps.currentPatientInViewId
    ),
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => (_.assign({}, ownProps, stateProps, dispatchProps)),
  { withRef: true },
)(TrendsContainer);
