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
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;

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
    patientData: PropTypes.object.isRequired,
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
    uploadUrl: PropTypes.string.isRequired,
    profileDialog: PropTypes.func.isRequired,
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
      visibleDays: 0,
      displayCalendar: false,
    };

    this.chartRef = React.createRef();
    this.chart = null;

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
    if (this.chartRef.current) {
      // necessary to get a ref from the redux connect()ed TrendsContainer
      this.chart = this.chartRef.current.getWrappedInstance();
    }
  }

  componentWillUnmount() {
    this.log('Unmounting...');
    this.chart = null;
  }

  formatDate(datetime) {
    const timezone = getTimezoneFromTimePrefs(this.props.timePrefs);

    return sundial.formatInTimezone(datetime, timezone, t('MMM D, YYYY'));
  }

  /**
   * @private
   * @returns {string[]} ISO string UTC date range
   */
  getEndpoints() {
    /** @type {{ epochLocation: number, msRange: number }} */
    const { epochLocation, msRange } = this.props;
    return [
      (moment.utc(epochLocation - msRange / 2)).toISOString(),
      (moment.utc(epochLocation + msRange / 2)).toISOString(),
    ];
  }

  /**
   * @private
   * @returns {string} ISO string UTC
   */
  getInitialDatetimeLocation() {
    /** @type {{ epochLocation: number }} */
    const { epochLocation } = this.props;
    return moment.utc(epochLocation).toISOString();
  }

  getNewDomain(current, extent) {
    const timezone = getTimezoneFromTimePrefs(this.props.timePrefs);
    const end = getLocalizedCeiling(current.valueOf(), this.props.timePrefs);
    const start = moment.utc(end.toISOString()).tz(timezone).subtract(extent, 'days');
    const dateDomain = [start.toISOString(), end.toISOString()];

    return dateDomain;
  }

  getExtendSize(domain) {
    const startDate = moment.utc(domain[0]);
    const endDate = moment.utc(domain[1]);
    return endDate.diff(startDate, 'days');
  }

  getTitle() {
    const { timePrefs, loading } = this.props;
    const { displayCalendar } = this.state;

    if (loading) {
      return t('Loading...');
    }

    const endpoints = this.getEndpoints();

    const timezone = getTimezoneFromTimePrefs(timePrefs);
    const startDate = moment.utc(endpoints[0]).tz(timezone);
    // endpoint is exclusive, so need to subtract a day:
    const endDate = moment.utc(endpoints[1]).tz(timezone).subtract(1, 'days');

    const displayStartDate = this.formatDate(startDate);
    const displayEndDate = this.formatDate(endDate);

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
    const handleChange = (begin, end) => {
      const newDomain = [begin.toISOString(), end.add(1, 'days').toISOString()];
      this.setState({ displayCalendar: false }, () => {
        const prefs = _.cloneDeep(this.props.chartPrefs);
        const extentSize = this.getExtendSize(newDomain);
        prefs.trends.extentSize = extentSize;
        this.props.updateChartPrefs(prefs, () => {
          this.chart.setExtent(newDomain);
        });
      });
    };

    const handleCancel = () => {
      this.setState({ displayCalendar: false });
    };

    let calendar = null;
    let divClass = 'chart-title-clickable';
    if (displayCalendar) {
      calendar = (
        <RangeDatePicker
          timezone={timezone}
          begin={startDate}
          end={endDate}
          max={moment.utc().add(1, 'days').utc().startOf('day')}
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
    this.chart.mountData();
  }

  handleClickBack(e) {
    if (e) {
      e.preventDefault();
    }
    this.chart.goBack();
  }

  handleClickDaily(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  }

  handleClickForward(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.chart.goForward();
  }

  handleClickMostRecent(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.chart.goToMostRecent();
  }

  handleClickPresetWeeks(e, extentSize) {
    if (e) {
      e.preventDefault();
    }
    // no change, return early
    if (this.props.chartPrefs.trends.extentSize !== extentSize) {
      const prefs = _.cloneDeep(this.props.chartPrefs);
      const current = moment.utc(this.chart.getCurrentDay());
      const oldDomain = this.getNewDomain(current, prefs.trends.extentSize);
      const newDomain = this.getNewDomain(current, extentSize);
      prefs.trends.extentSize = extentSize;
      this.props.updateChartPrefs(prefs, () => {
        this.chart.setExtent(newDomain, oldDomain);
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

  handleDatetimeLocationChange(endpoints, atMostRecent) {
    if (typeof atMostRecent !== 'boolean') {
      this.log.error('handleDatetimeLocationChange: Invalid parameter atMostRecent');
      atMostRecent = false;
    }

    this.setState({ atMostRecent });
    const start = moment.utc(endpoints[0]).valueOf();
    const end = moment.utc(endpoints[1]).valueOf();
    const range = end - start;
    const center = start + range/2;
    this.props.onDatetimeLocationChange(center, range);
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
        cbgByDate={this.props.patientData.cbgByDate}
        cbgByDayOfWeek={this.props.patientData.cbgByDayOfWeek}
        smbgByDate={this.props.patientData.smbgByDate}
        smbgByDayOfWeek={this.props.patientData.smbgByDayOfWeek}
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
    if (showingCbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'cbg'}
          focusedKeys={trendsState[currentPatientInViewId].focusedCbgSliceKeys}
          focusedSlice={trendsState[currentPatientInViewId].focusedCbgSlice}
          timePrefs={this.props.timePrefs}
        />
      );
    } else if (showingSmbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'smbg'}
          focusedRange={trendsState[currentPatientInViewId].focusedSmbgRangeAvg}
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
    const { currentPatientInViewId } = this.props;
    return (
      <FocusedSMBGPointLabel
        bgPrefs={this.props.bgPrefs}
        timePrefs={this.props.timePrefs}
        grouped={this.props.chartPrefs.trends.smbgGrouped}
        lines={this.props.chartPrefs.trends.smbgLines}
        focusedPoint={this.props.trendsState[currentPatientInViewId].focusedSmbg}
      />
    );
  }
}

export default Trends;
