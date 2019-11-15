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

const d3 = window.d3;

import _ from 'lodash';
import bows from 'bows';
import moment from 'moment';
import React, { PropTypes, PureComponent } from 'react';
import sundial from 'sundial';
import WindowSizeListener from 'react-window-size-listener';
import { translate } from 'react-i18next';

import Header from './header';
import SubNav from './trendssubnav';
import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Footer from './footer';

import {
  components as vizComponents,
  containers as vizContainers,
  utils as vizUtils,
} from '@tidepool/viz';

const TrendsContainer = vizContainers.TrendsContainer;
const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;
const trendsText = vizUtils.text.trendsText;
const {
  ClipboardButton,
  Loader,
  CBGDateTraceLabel,
  FocusedRangeLabels,
  FocusedSMBGPointLabel,
} = vizComponents;

const Trends = translate()(class Trends extends PureComponent {
  static propTypes = {
    chartPrefs: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    mostRecentDatetimeLocation: PropTypes.string,
    onClickRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onUpdateChartDateRange: PropTypes.func.isRequired,
    patient: PropTypes.object,
    queryDataCount: React.PropTypes.number.isRequired,
    stats: PropTypes.array.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.chartType = 'trends';
    this.log = bows('Trends');

    this.state = {
      atMostRecent: true,
      inTransition: false,
      title: '',
      visibleDays: 0,
    };

    this.formatDate = this.formatDate.bind(this);
    this.getNewDomain = this.getNewDomain.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleClickBack = this.handleClickBack.bind(this);
    this.handleClickDaily = this.handleClickDaily.bind(this);
    this.handleClickForward = this.handleClickForward.bind(this);
    this.handleClickFourWeeks = this.handleClickFourWeeks.bind(this);
    this.handleClickMostRecent = this.handleClickMostRecent.bind(this);
    this.handleClickOneWeek = this.handleClickOneWeek.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickTrends = this.handleClickTrends.bind(this);
    this.handleClickTwoWeeks = this.handleClickTwoWeeks.bind(this);
    this.handleClickBgLog = this.handleClickBgLog.bind(this);
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
    if (this.refs.chart) {
      // necessary to get a ref from the redux connect()ed TrendsContainer
      this.chart = this.refs.chart.getWrappedInstance();
    }
  }

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  // componentWillReceiveProps(nextProps) {
  //   const newDataLoaded = this.props.loading && !nextProps.loading;

  //   if (newDataLoaded) {
  //     // Trigger a reset of the endpoints state so that the stats will know to update
  //     const endpoints = this.state.endpoints;
  //     this.setState({
  //       endpoints: []
  //     }, this.setState({ endpoints }))
  //   }
  // }

  formatDate(datetime) {
    const { t } = this.props;
    const timezone = getTimezoneFromTimePrefs(_.get(this.props, 'data.timePrefs', {}));

    return sundial.formatInTimezone(datetime, timezone, t('MMM D, YYYY'));
  }

  getNewDomain(current, extent) {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const timezone = getTimezoneFromTimePrefs(timePrefs);
    const end = getLocalizedCeiling(current.valueOf(), timePrefs);
    const start = moment(end.toISOString()).tz(timezone).subtract(extent, 'days');
    const dateDomain = [start.toISOString(), end.toISOString()];

    return dateDomain;
  }

  getTitle(datetimeLocationEndpoints) {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const timezone = getTimezoneFromTimePrefs(timePrefs);

    // endpoint is exclusive, so need to subtract a day
    const end = moment(datetimeLocationEndpoints[1]).tz(timezone).subtract(1, 'day');

    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  }

  handleWindowResize(windowSize) {
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
    const datetime = this.chart ? this.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToDaily(datetime);
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

  handleClickFourWeeks(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '4 weeks' && prefs.trends.extentSize === 28) {
      return;
    }
    const current = new Date(this.chart.getCurrentDay());
    const oldDomain = this.getNewDomain(current, prefs.trends.extentSize);
    prefs.trends.activeDomain = '4 weeks';
    prefs.trends.extentSize = 28;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 28);
    this.chart.setExtent(newDomain, oldDomain);
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

  handleClickOneWeek(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '1 week' && prefs.trends.extentSize === 7) {
      return;
    }
    const current = new Date(this.chart.getCurrentDay());
    const oldDomain = this.getNewDomain(current, prefs.trends.extentSize);
    prefs.trends.activeDomain = '1 week';
    prefs.trends.extentSize = 7;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 7);
    this.chart.setExtent(newDomain, oldDomain);
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

  handleClickTwoWeeks(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '2 weeks' && prefs.trends.extentSize === 14) {
      return;
    }
    const current = new Date(this.chart.getCurrentDay());
    const oldDomain = this.getNewDomain(current, prefs.trends.extentSize);
    prefs.trends.activeDomain = '2 weeks';
    prefs.trends.extentSize = 14;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 14);
    this.chart.setExtent(newDomain, oldDomain);
  }

  handleClickBgLog(e) {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.chart ? this.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToBgLog(datetime);
  }

  handleDatetimeLocationChange(datetimeLocationEndpoints) {
    this.setState({
      title: this.getTitle(datetimeLocationEndpoints),
    });

    // Update the chart date range in the data component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const dateCeiling = getLocalizedCeiling(datetimeLocationEndpoints[1], _.get(this.props, 'data.timePrefs', {}));

    const datetimeLocation = moment.utc(dateCeiling.valueOf()).toISOString();

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocation);

    this.setState({ debouncedDateRangeUpdate });
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
    this.props.updateChartPrefs(prefs, false, true);
  }

  toggleBoxOverlay() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgRangeOverlay = prefs.trends.smbgRangeOverlay ? false : true;
    this.props.updateChartPrefs(prefs);
  }

  toggleDay(day) {
    const self = this;
    return function(e) {
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
      'monday': !allActive,
      'tuesday': !allActive,
      'wednesday': !allActive,
      'thursday': !allActive,
      'friday': !allActive,
      'saturday': prefs.trends.activeDays.saturday,
      'sunday': prefs.trends.activeDays.sunday
    };
    this.props.updateChartPrefs(prefs);
  }

  toggleWeekends(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      'monday': prefs.trends.activeDays.monday,
      'tuesday': prefs.trends.activeDays.tuesday,
      'wednesday': prefs.trends.activeDays.wednesday,
      'thursday': prefs.trends.activeDays.thursday,
      'friday': prefs.trends.activeDays.friday,
      'saturday': !allActive,
      'sunday': !allActive
    };
    this.props.updateChartPrefs(prefs);
  }

  render() {
    const { currentPatientInViewId, t } = this.props;

    return (
      <div id="tidelineMain" className="trends grid">
        {this.renderHeader()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            {this.renderSubNav()}
            <div className="patient-data-content">
              <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />
              <div id="tidelineContainer" className="patient-data-chart-trends">
                {this.renderChart()}
              </div>
              {this.renderFocusedCbgDateTraceLabel()}
              {this.renderFocusedSMBGPointLabel()}
              {this.renderFocusedRangeLabels()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <ClipboardButton
                buttonTitle={t('For email or notes')}
                onSuccess={this.handleCopyTrendsClicked}
                getText={trendsText.bind(this, this.props.patient, this.props.data, this.props.stats, this.props.chartPrefs[this.chartType])}
              />
              <BgSourceToggle
                bgSources={_.get(this.props, 'data.metaData.bgSources', {})}
                chartPrefs={this.props.chartPrefs}
                chartType={this.chartType}
                onClickBgSourceToggle={this.toggleBgDataSource}
              />
              <Stats
                bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
                chartPrefs={this.props.chartPrefs}
                stats={this.props.stats}
              />
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickBoxOverlay={this.toggleBoxOverlay}
         onClickGroup={this.toggleGrouping}
         onClickLines={this.toggleLines}
         onClickRefresh={this.props.onClickRefresh}
         boxOverlay={this.props.chartPrefs.trends.smbgRangeOverlay}
         grouped={this.props.chartPrefs.trends.smbgGrouped}
         showingLines={this.props.chartPrefs.trends.smbgLines}
         showingCbg={this.props.chartPrefs.trends.showingCbg}
         showingSmbg={this.props.chartPrefs.trends.showingSmbg}
         displayFlags={this.props.chartPrefs.trends.cbgFlags}
         currentPatientInViewId={currentPatientInViewId}
         ref="footer" />
         <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }

  renderHeader() {
    return (
      <Header
        chartType={this.chartType}
        patient={this.props.patient}
        inTransition={this.state.inTransition}
        atMostRecent={this.state.atMostRecent}
        title={this.state.title}
        iconBack={'icon-back'}
        iconNext={'icon-next'}
        iconMostRecent={'icon-most-recent'}
        onClickBack={this.handleClickBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handleClickForward}
        onClickOneDay={this.handleClickDaily}
        onClickBgLog={this.handleClickBgLog}
        onClickSettings={this.handleClickSettings}
        ref="header" />
    );
  }

  renderSubNav() {
    return (
      <SubNav
        activeDays={this.props.chartPrefs.trends.activeDays}
        activeDomain={this.props.chartPrefs.trends.activeDomain}
        extentSize={this.props.chartPrefs.trends.extentSize}
        domainClickHandlers={{
         '1 week': this.handleClickOneWeek,
         '2 weeks': this.handleClickTwoWeeks,
         '4 weeks': this.handleClickFourWeeks
        }}
        onClickDay={this.toggleDay}
        toggleWeekdays={this.toggleWeekdays}
        toggleWeekends={this.toggleWeekends}
        ref="subnav" />
    );
  }

  renderChart() {
    return (
      <TrendsContainer
        activeDays={this.props.chartPrefs.trends.activeDays}
        bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
        currentPatientInViewId={this.props.currentPatientInViewId}
        extentSize={this.props.chartPrefs.trends.extentSize}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        loading={this.props.loading}
        showingSmbg={this.props.chartPrefs.trends.showingSmbg}
        showingCbg={this.props.chartPrefs.trends.showingCbg}
        smbgRangeOverlay={this.props.chartPrefs.trends.smbgRangeOverlay}
        smbgGrouped={this.props.chartPrefs.trends.smbgGrouped}
        smbgLines={this.props.chartPrefs.trends.smbgLines}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        // data
        data={this.props.data}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDate={this.handleSelectDate}
        onSwitchBgDataSource={this.toggleBgDataSource}
        ref="chart"
      />
    );
  }

  renderFocusedCbgDateTraceLabel() {
    const focusedCbgDateTrace = _.get(this.props, 'chartPrefs.trends.focusedCbgDateTrace');
    if (focusedCbgDateTrace) {
      return (
        <CBGDateTraceLabel focusedDateTrace={focusedCbgDateTrace} />
      );
    }
    return null;
  }

  renderFocusedRangeLabels() {
    const { chartPrefs: { trends: {
      showingCbg,
      showingSmbg,
      focusedCbgSliceKeys,
      focusedCbgSlice,
      focusedSmbgRangeAvg,
    } } } = this.props;

    if (showingCbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
          dataType={'cbg'}
          focusedKeys={focusedCbgSliceKeys}
          focusedSlice={focusedCbgSlice}
          timePrefs={_.get(this.props, 'data.timePrefs', {})} />
      );
    } else if (showingSmbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
          dataType={'smbg'}
          focusedRange={focusedSmbgRangeAvg}
          timePrefs={_.get(this.props, 'data.timePrefs', {})} />
      );
    }
    return null;
  }

  renderFocusedSMBGPointLabel() {
    if (!this.props.chartPrefs.trends.showingSmbg) {
      return null;
    }
    return (
      <FocusedSMBGPointLabel
        bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        grouped={this.props.chartPrefs.trends.smbgGrouped}
        lines={this.props.chartPrefs.trends.smbgLines}
        focusedPoint={_.get(this.props, 'chartPrefs.trends.focusedSmbg')} />
    );
  }

  handleCopyTrendsClicked = () => {
    this.props.trackMetric('Clicked Copy Settings', { source: 'Trends' });
  };
});

export default Trends;
