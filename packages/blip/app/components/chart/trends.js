/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import moment from 'moment-timezone';
import i18next from 'i18next';
import React from 'react';
import PropTypes from 'prop-types';
import sundial from 'sundial';
import WindowSizeListener from 'react-window-size-listener';
import {
  components as vizComponents,
  containers as vizContainers,
  utils as vizUtils
} from 'tidepool-viz';

import Header from './header';
import SubNav from './trendssubnav';
import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Footer from './footer';
import { RangeDatePicker } from '../datepicker';
import { BG_DATA_TYPES } from '../../core/constants';

const t = i18next.t.bind(i18next);
const CBGDateTraceLabel = vizComponents.CBGDateTraceLabel;
const FocusedRangeLabels = vizComponents.FocusedRangeLabels;
const FocusedSMBGPointLabel = vizComponents.FocusedSMBGPointLabel;
const Loader = vizComponents.Loader;

const TrendsContainer = vizContainers.TrendsContainer;
const reshapeBgClassesToBgBounds = vizUtils.bg.reshapeBgClassesToBgBounds;
const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;

class Trends extends React.Component {
  static propTypes = {
    canPrint: PropTypes.bool.isRequired,
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    dataUtil: PropTypes.object,
    timePrefs: PropTypes.object.isRequired,
    epochLocation: PropTypes.number.isRequired,
    msRange: PropTypes.number.isRequired,
    patient: PropTypes.object,
    tidelineData: PropTypes.object.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    trendsState: PropTypes.object.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onDatetimeLocationChange: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    prefixURL: PropTypes.string,
    profileDialog: PropTypes.func,
  };
  static defaultProps = {
    profileDialog: null,
  };

  constructor(props) {
    super(props);

    this.bgBounds = reshapeBgClassesToBgBounds(props.bgPrefs);
    this.chartType = 'trends';
    this.log = bows('Trends');

    this.state = {
      atMostRecent: true,
      inTransition: false,
      extentSize: 14,
      displayCalendar: false,
    };

    this.chartRef = React.createRef();

    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleClickBack = this.handleClickBack.bind(this);
    this.handleClickDaily = this.handleClickDaily.bind(this);
    this.handleClickForward = this.handleClickForward.bind(this);
    this.handleClickMostRecent = this.handleClickMostRecent.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickTrends = this.handleClickTrends.bind(this);
    this.handleDatetimeLocationChange = this.handleDatetimeLocationChange.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.toggleBgDataSource = this.toggleBgDataSource.bind(this);
    this.toggleBoxOverlay = this.toggleBoxOverlay.bind(this);
    this.toggleDay = this.toggleDay.bind(this);
    this.toggleGrouping = this.toggleGrouping.bind(this);
    this.toggleLines = this.toggleLines.bind(this);
    this.toggleWeekdays = this.toggleWeekdays.bind(this);
    this.toggleWeekends = this.toggleWeekends.bind(this);
  }

  componentDidMount() {
    this.log.debug('Mounting...');
  }

  componentWillUnmount() {
    this.log('Unmounting...');
  }

  getChart() {
    if (this.chartRef.current) {
      return this.chartRef.current.getWrappedInstance();
    }
    return null;
  }

  formatDate(datetime) {
    const timezone = getTimezoneFromTimePrefs(this.props.timePrefs);
    return sundial.formatInTimezone(datetime, timezone, t('MMM D, YYYY'));
  }

  /**
   * @private
   * @returns {string[] | moment.Moment[]} ISO string UTC date range
   */
  getEndpoints(returnMoment = false) {
    /** @type {{ epochLocation: number, msRange: number, timePrefs: object }} */
    const { epochLocation, msRange, timePrefs } = this.props;

    const timezone = getTimezoneFromTimePrefs(timePrefs);
    /** @type {undefined | null | { start: string; end: string }} */
    const dateDomain = this.getChart()?.state?.dateDomain;
    const msRangeDiv2 = Math.round(msRange / 2);
    const start = dateDomain?.start ?? epochLocation - msRangeDiv2;
    const end = dateDomain?.end ?? epochLocation + msRangeDiv2;
    const startDate = moment.tz(start, timezone);
    const endDate = moment.tz(end, timezone);
    if (returnMoment) {
      return [startDate, endDate];
    }
    return [startDate.toISOString(), endDate.toISOString()];
  }

  /**
   * @private
   * @returns {string} ISO string UTC
   */
  getInitialDatetimeLocation() {
    /** @type {{ epochLocation: number }} */
    const { epochLocation, timePrefs } = this.props;
    const m = moment.tz(epochLocation, timePrefs.timezoneName ?? 'UTC');
    return m.toISOString();
  }

  getExtendSize(domain) {
    const timezone = getTimezoneFromTimePrefs(this.props.timePrefs);
    const startDate = moment.tz(domain[0], timezone);
    const endDate = moment.tz(domain[1], timezone);
    return Math.round(endDate.diff(startDate, 'days', true));
  }

  getTitle() {
    const { loading, tidelineData } = this.props;
    const { displayCalendar } = this.state;

    if (loading) {
      return t('Loading...');
    }

    /** @type {[moment.Moment, moment.Moment]} */
    const [startDate, endDate] = this.getEndpoints(true);

    const mFormat = t('MMM D, YYYY');
    const displayStartDate = startDate.format(mFormat);
    const displayEndDate = endDate.format(mFormat);

    const handleClickTitle = (e) => {
      e.stopPropagation();
      this.setState({ displayCalendar: true });
    };
    const handleKeyboard = (/** @type {React.KeyboardEvent<HTMLDivElement>} */ e) => {
      e.stopPropagation();
      if (e.key === 'Enter' || e.key === ' ') {
        this.setState({ displayCalendar: true });
      }
    };
    const handleChange = (/** @type {moment.Moment} */ begin, /** @type {moment.Moment} */ end) => {
      const newDomain = [begin.toISOString(), end.add(1, 'days').subtract(1, 'millisecond').toISOString()];
      this.log.debug("Calendar newDomain", newDomain);
      this.setState({ displayCalendar: false }, () => {
        const prefs = _.cloneDeep(this.props.chartPrefs);
        const extentSize = this.getExtendSize(newDomain);
        prefs.trends.extentSize = extentSize;
        this.props.updateChartPrefs(prefs, () => {
          const chart = this.getChart();
          chart?.setExtent(newDomain);
        });
      });
    };

    const handleCancel = () => {
      this.setState({ displayCalendar: false });
    };

    let calendar = null;
    let divClass = 'chart-title-clickable';
    if (displayCalendar) {
      const timezone = getTimezoneFromTimePrefs(this.props.timePrefs);
      const minDate = moment.tz(tidelineData.endpoints[0], timezone);
      const maxDate = moment.tz(tidelineData.endpoints[1], timezone);
      calendar = (
        <RangeDatePicker
          timezone={timezone}
          begin={startDate}
          end={endDate}
          min={minDate}
          max={maxDate}
          minDuration={1}
          maxDuration={90}
          aboveMaxDurationMessage={t('The period must be less than {{days}} days', { days: 90 })}
          allowSelectDateOutsideDuration={true}
          onChange={handleChange}
          onCancel={handleCancel}
          value={startDate}
        />
      );
      divClass = `${divClass} active`;
    }

    return (
      <div className={divClass} onClick={handleClickTitle} onKeyPress={handleKeyboard} role="button" tabIndex={0}>
        <span>
          {displayStartDate}&nbsp;-&nbsp;{displayEndDate}
        </span>
        {calendar}
      </div>
    );
  }

  handleWindowResize(/* windowSize */) {
    this.getChart()?.mountData(false);
  }

  handleClickBack(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.trackMetric("Trends", { action: "pan-back" });
    this.getChart()?.goBack();
  }

  handleClickDaily(e) {
    const { epochLocation, timePrefs } = this.props;
    if (e) {
      e.preventDefault();
    }
    const extentSize = this.props.chartPrefs.trends.extentSize;
    const m = moment.tz(epochLocation, timePrefs.timezoneName ?? 'UTC').add(Math.round(extentSize / 2), 'days');
    this.props.onSwitchToDaily(m);
  }

  handleClickForward(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.props.trackMetric("Trends", { action: "pan-forward" });
    this.getChart()?.goForward();
  }

  handleClickMostRecent(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.props.trackMetric("Trends", { action: "pan-most-recent" });
    this.getChart()?.goToMostRecent();
  }

  handleClickPresetWeeks(e, extentSize) {
    if (e) {
      e.preventDefault();
    }
    const { timePrefs, chartPrefs, tidelineData, updateChartPrefs } = this.props;
    const chart = this.getChart();

    // if no change, return early
    if (chartPrefs.trends.extentSize !== extentSize && chart !== null) {
      const timezone = getTimezoneFromTimePrefs(timePrefs);
      const prefs = _.cloneDeep(chartPrefs);

      // Use the endDate as a reference point in time
      const endDate = moment.tz(chart.state.dateDomain.end, timezone);
      let startDate = moment.tz(endDate.valueOf(), timezone).subtract(extentSize, 'days').add(1, 'millisecond');
      const minDate = moment.tz(tidelineData.endpoints[0], timezone);
      if (startDate.isBefore(minDate)) {
        startDate = minDate;
        this.log.info(`Require more days than available changing from ${extentSize} to ${endDate.diff(startDate, 'days')}`);
      }

      prefs.trends.extentSize = Math.round(endDate.diff(startDate, 'days', true));
      const oldDomain = [chart.state.dateDomain.start, chart.state.dateDomain.end];
      const newDomain = [startDate.toISOString(), endDate.toISOString()];

      this.log.info(`Changing number of displays days to ${prefs.trends.extentSize} days`, { oldDomain, newDomain });

      updateChartPrefs(prefs, () => {
        chart.setExtent(newDomain, oldDomain);
      });
    }
  }

  handleClickSettings(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToSettings();
  }

  handleClickTrends(e) {
    if (e) {
      e.preventDefault();
    }
    // when you're on Trends view, clicking Trends does nothing
    return;
  }

  /**
   * @param {string[]} endpoints
   * @param {boolean} atMostRecent
   * @return Promise<boolean>
   */
  handleDatetimeLocationChange(endpoints, atMostRecent) {
    if (typeof atMostRecent !== 'boolean') {
      this.log.error('handleDatetimeLocationChange: Invalid parameter atMostRecent');
      atMostRecent = false;
    }

    this.log.debug('handleDatetimeLocationChange', { endpoints, atMostRecent });

    this.setState({ atMostRecent });
    const start = moment.utc(endpoints[0]).valueOf();
    const end = moment.utc(endpoints[1]).valueOf();
    const range = end - start;
    const center = start + Math.round(range / 2);
    return this.props.onDatetimeLocationChange(center, range);
  }

  handleSelectDate(date) {
    this.props.onSwitchToDaily(date);
  }

  toggleBgDataSource(e, bgSource) {
    if (e) {
      e.preventDefault();
    }

    const showingCbg = bgSource === 'cbg';
    const changedTo = showingCbg ? 'CGM' : 'BGM';
    this.props.trackMetric(`Trends Click to ${changedTo}`);

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.showingCbg = showingCbg;
    prefs.trends.showingSmbg = !showingCbg;
    prefs.trends.bgSource = bgSource;
    this.props.updateChartPrefs(prefs);
  }

  toggleBoxOverlay() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgRangeOverlay = prefs.trends.smbgRangeOverlay ? false : true;
    this.props.updateChartPrefs(prefs);
  }

  toggleDay(day) {
    const self = this;
    return function (e) {
      e.stopPropagation();
      const prefs = _.cloneDeep(self.props.chartPrefs);
      prefs.trends.activeDays[day] = prefs.trends.activeDays[day] ? false : true;
      self.props.updateChartPrefs(prefs);
    };
  }

  toggleGrouping() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgGrouped = prefs.trends.smbgGrouped ? false : true;
    this.props.updateChartPrefs(prefs);
  }

  toggleLines() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgLines = prefs.trends.smbgLines ? false : true;
    this.props.updateChartPrefs(prefs);
  }

  toggleWeekdays(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      monday: !allActive,
      tuesday: !allActive,
      wednesday: !allActive,
      thursday: !allActive,
      friday: !allActive,
      saturday: prefs.trends.activeDays.saturday,
      sunday: prefs.trends.activeDays.sunday,
    };
    this.props.updateChartPrefs(prefs);
  }

  toggleWeekends(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      monday: prefs.trends.activeDays.monday,
      tuesday: prefs.trends.activeDays.tuesday,
      wednesday: prefs.trends.activeDays.wednesday,
      thursday: prefs.trends.activeDays.thursday,
      friday: prefs.trends.activeDays.friday,
      saturday: !allActive,
      sunday: !allActive,
    };
    this.props.updateChartPrefs(prefs);
  }

  render() {
    const {
      currentPatientInViewId,
      chartPrefs,
      trendsState,
    } = this.props;

    if (_.isEmpty(_.get(trendsState, currentPatientInViewId))) {
      return <Loader />;
    }

    const trendsChartPrefs = chartPrefs.trends;
    const endpoints = this.getEndpoints();

    let rightFooter = null;
    if (trendsChartPrefs.showingSmbg) {
      rightFooter = (
        <div className="footer-right-options">
          <label htmlFor="overlayCheckbox">
            <input type="checkbox" name="overlayCheckbox" id="overlayCheckbox"
              checked={trendsChartPrefs.smbgRangeOverlay}
              onChange={this.toggleBoxOverlay} />{t('Range & Average')}
          </label>

          <label htmlFor="groupCheckbox">
            <input type="checkbox" name="groupCheckbox" id="groupCheckbox"
              checked={trendsChartPrefs.smbgGrouped}
              onChange={this.toggleGrouping} />{t('Group')}
          </label>

          <label htmlFor="linesCheckbox">
            <input type="checkbox" name="linesCheckbox" id="linesCheckbox"
              checked={trendsChartPrefs.smbgLines}
              onChange={this.toggleLines} />{t('Lines')}
          </label>
        </div>
      );
    } else {
      // Get the component here, for the tests: Avoid having redux set
      const { RangeSelect } = vizComponents;
      rightFooter = (
        <RangeSelect displayFlags={trendsState[currentPatientInViewId].cbgFlags} currentPatientInViewId={currentPatientInViewId} />
      );
    }

    return (
      <div id='tidelineMain' className='trends grid'>
        {this.renderHeader()}
        <div className='container-box-outer patient-data-content-outer'>
          <div className='container-box-inner patient-data-content-inner'>
            {this.renderSubNav()}
            <div className='patient-data-content'>
              <Loader show={this.props.loading} overlay={true} />
              <div id='tidelineContainer' className='patient-data-chart-trends'>
                {this.renderChart()}
              </div>
              {this.renderFocusedCbgDateTraceLabel()}
              {this.renderFocusedSMBGPointLabel()}
              {this.renderFocusedRangeLabels()}
            </div>
          </div>
          <div className='container-box-inner patient-data-sidebar'>
            <div className='patient-data-sidebar-inner'>
              <BgSourceToggle
                bgSource={this.props.dataUtil.bgSource}
                bgSources={this.props.dataUtil.bgSources}
                chartPrefs={chartPrefs}
                chartType={this.chartType}
                dataUtil={this.props.dataUtil}
                onClickBgSourceToggle={this.toggleBgDataSource}
              />
              <Stats
                bgPrefs={this.props.bgPrefs}
                bgSource={this.props.dataUtil.bgSource}
                chartPrefs={chartPrefs}
                chartType={this.chartType}
                dataUtil={this.props.dataUtil}
                endpoints={endpoints}
              />
            </div>
          </div>
        </div>
        <Footer onClickRefresh={this.props.onClickRefresh}>
          {rightFooter}
        </Footer>
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }

  renderHeader() {
    const title = this.getTitle();
    return (
      <Header
        profileDialog={this.props.profileDialog}
        chartType={this.chartType}
        patient={this.props.patient}
        inTransition={this.state.inTransition}
        atMostRecent={this.state.atMostRecent}
        title={title}
        prefixURL={this.props.prefixURL}
        canPrint={this.props.canPrint}
        trackMetric={this.props.trackMetric}
        iconBack={'icon-back'}
        iconNext={'icon-next'}
        iconMostRecent={'icon-most-recent'}
        permsOfLoggedInUser={this.props.permsOfLoggedInUser}
        onClickBack={this.handleClickBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handleClickForward}
        onClickOneDay={this.handleClickDaily}
        onClickSettings={this.handleClickSettings} />
    );
  }

  renderSubNav() {
    return (
      <SubNav
        activeDays={this.props.chartPrefs.trends.activeDays}
        extentSize={this.props.chartPrefs.trends.extentSize}
        domainClickHandlers={{
          '1 week': (e) => this.handleClickPresetWeeks(e, 7),
          '2 weeks': (e) => this.handleClickPresetWeeks(e, 14),
          '4 weeks': (e) => this.handleClickPresetWeeks(e, 28),
          '3 months': (e) => this.handleClickPresetWeeks(e, 90),
        }}
        onClickDay={this.toggleDay}
        toggleWeekdays={this.toggleWeekdays}
        toggleWeekends={this.toggleWeekends} />
    );
  }

  renderChart() {
    const initialDatetimeLocation = this.getInitialDatetimeLocation();
    return (
      <TrendsContainer
        activeDays={this.props.chartPrefs.trends.activeDays}
        bgPrefs={{
          bgBounds: this.bgBounds,
          bgUnits: this.props.bgPrefs.bgUnits,
        }}
        currentPatientInViewId={this.props.currentPatientInViewId}
        extentSize={this.props.chartPrefs.trends.extentSize}
        initialDatetimeLocation={initialDatetimeLocation}
        loading={this.props.loading}
        showingSmbg={this.props.chartPrefs.trends.showingSmbg}
        showingCbg={this.props.chartPrefs.trends.showingCbg}
        smbgRangeOverlay={this.props.chartPrefs.trends.smbgRangeOverlay}
        smbgGrouped={this.props.chartPrefs.trends.smbgGrouped}
        smbgLines={this.props.chartPrefs.trends.smbgLines}
        timePrefs={this.props.timePrefs}
        // data
        tidelineData={this.props.tidelineData}
        cbgByDate={this.props.tidelineData.cbgByDate}
        cbgByDayOfWeek={this.props.tidelineData.cbgByDayOfWeek}
        smbgByDate={this.props.tidelineData.smbgByDate}
        smbgByDayOfWeek={this.props.tidelineData.smbgByDayOfWeek}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDate={this.handleSelectDate}
        onSwitchBgDataSource={this.toggleBgDataSource}
        ref={this.chartRef}
      />
    );
  }

  renderFocusedCbgDateTraceLabel() {
    const { currentPatientInViewId, trendsState } = this.props;
    const focusedCbgDateTrace = _.get(trendsState, `${currentPatientInViewId}.focusedCbgDateTrace`);
    if (focusedCbgDateTrace) {
      return <CBGDateTraceLabel focusedDateTrace={focusedCbgDateTrace} />;
    }
    return null;
  }

  renderFocusedRangeLabels() {
    const { currentPatientInViewId, trendsState } = this.props;
    const {
      chartPrefs: {
        trends: { showingCbg, showingSmbg },
      },
    } = this.props;

    const userTrendsState = _.get(trendsState, currentPatientInViewId);

    if (_.isEmpty(userTrendsState)) {
      return null;
    } else if (showingCbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'cbg'}
          focusedKeys={userTrendsState.focusedCbgSliceKeys}
          focusedSlice={userTrendsState.focusedCbgSlice}
          timePrefs={this.props.timePrefs}
        />
      );
    } else if (showingSmbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'smbg'}
          focusedRange={userTrendsState.focusedSmbgRangeAvg}
          timePrefs={this.props.timePrefs}
        />
      );
    }
    return null;
  }

  renderFocusedSMBGPointLabel() {
    if (!this.props.chartPrefs.trends.showingSmbg) {
      return null;
    }
    const { currentPatientInViewId, trendsState } = this.props;
    const userTrendsState = _.get(trendsState, currentPatientInViewId);

    if (_.isEmpty(userTrendsState)) {
      return null;
    }

    return (
      <FocusedSMBGPointLabel
        bgPrefs={this.props.bgPrefs}
        timePrefs={this.props.timePrefs}
        grouped={this.props.chartPrefs.trends.smbgGrouped}
        lines={this.props.chartPrefs.trends.smbgLines}
        focusedPoint={userTrendsState.focusedSmbg}
      />
    );
  }
}

export default Trends;
