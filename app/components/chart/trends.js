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
import React, { PropTypes, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import sundial from 'sundial';
import { translate } from 'react-i18next';

import Header from './header';
import SubNav from './trendssubnav';
import Footer from './footer';

import * as viz from '@tidepool/viz';
const CBGDateTraceLabel = viz.components.CBGDateTraceLabel;
const FocusedRangeLabels = viz.components.FocusedRangeLabels;
const FocusedSMBGPointLabel = viz.components.FocusedSMBGPointLabel;
const TrendsContainer = viz.containers.TrendsContainer;
const reshapeBgClassesToBgBounds = viz.utils.reshapeBgClassesToBgBounds;
const Loader = viz.components.Loader;

const Trends = translate()(class Trends extends PureComponent {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    timePrefs: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patient: React.PropTypes.object,
    patientData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    trendsState: PropTypes.object.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToWeekly: PropTypes.func.isRequired,
    onUpdateChartDateRange: React.PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    updateDatetimeLocation: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.bgBounds = reshapeBgClassesToBgBounds(props.bgPrefs);
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
    this.handleClickBack = this.handleClickBack.bind(this);
    this.handleClickDaily = this.handleClickDaily.bind(this);
    this.handleClickForward = this.handleClickForward.bind(this);
    this.handleClickFourWeeks = this.handleClickFourWeeks.bind(this);
    this.handleClickMostRecent = this.handleClickMostRecent.bind(this);
    this.handleClickOneWeek = this.handleClickOneWeek.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickTrends = this.handleClickTrends.bind(this);
    this.handleClickTwoWeeks = this.handleClickTwoWeeks.bind(this);
    this.handleClickWeekly = this.handleClickWeekly.bind(this);
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

  formatDate(datetime) {
    const { timePrefs, t } = this.props;
    let timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return sundial.formatInTimezone(datetime, timezone, t('MMM D, YYYY'));
  }

  getNewDomain(current, extent) {
    const { timePrefs } = this.props;
    let timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    current = sundial.ceil(current, 'day', timezone);
    return [d3.time.day.utc.offset(current, -extent).toISOString(), current.toISOString()];
  }

  getTitle(datetimeLocationEndpoints) {
    // endpoint is exclusive, so need to subtract a day
    const end = d3.time.day.utc.offset(new Date(datetimeLocationEndpoints[1]), -1);
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
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

  handleClickWeekly(e) {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.chart ? this.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToWeekly(datetime);
  }

  handleDatetimeLocationChange(datetimeLocationEndpoints, atMostRecent) {
    this.setState({
      atMostRecent: atMostRecent,
      title: this.getTitle(datetimeLocationEndpoints)
    });
    this.props.updateDatetimeLocation(datetimeLocationEndpoints[1]);

    // Update the chart date range in the patientData component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocationEndpoints);

    this.setState({ debouncedDateRangeUpdate });
  }

  handleSelectDate(date) {
    this.props.onSwitchToDaily(date);
  }

  toggleBgDataSource(e) {
    if (e) {
      e.preventDefault();
      if (this.props.chartPrefs.trends.showingCbg) {
        this.props.trackMetric('Trends Click to BGM');
      } else {
        this.props.trackMetric('Trends Click to CGM');
      }
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.showingCbg = !prefs.trends.showingCbg;
    prefs.trends.showingSmbg = !prefs.trends.showingSmbg;
    this.props.updateChartPrefs(prefs);
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
    const { currentPatientInViewId } = this.props;
    return (
      <div id="tidelineMain">
        {this.renderHeader()}
        {this.renderSubNav()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              <div id="tidelineContainer" className="patient-data-chart-trends">
                {this.renderChart()}
              </div>
              {this.renderFocusedCbgDateTraceLabel()}
              {this.renderFocusedSMBGPointLabel()}
              {this.renderFocusedRangeLabels()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickBoxOverlay={this.toggleBoxOverlay}
         onClickGroup={this.toggleGrouping}
         onClickLines={this.toggleLines}
         onClickRefresh={this.props.onClickRefresh}
         onClickBgDataToggle={this.toggleBgDataSource}
         boxOverlay={this.props.chartPrefs.trends.smbgRangeOverlay}
         grouped={this.props.chartPrefs.trends.smbgGrouped}
         showingLines={this.props.chartPrefs.trends.smbgLines}
         showingCbg={this.props.chartPrefs.trends.showingCbg}
         showingSmbg={this.props.chartPrefs.trends.showingSmbg}
         displayFlags={this.props.trendsState[currentPatientInViewId].cbgFlags}
         currentPatientInViewId={currentPatientInViewId}
         ref="footer" />
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
        onClickTwoWeeks={this.handleClickWeekly}
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
        bgPrefs={{
          bgBounds: this.bgBounds,
          bgUnits: this.props.bgPrefs.bgUnits,
        }}
        currentPatientInViewId={this.props.currentPatientInViewId}
        extentSize={this.props.chartPrefs.trends.extentSize}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
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
      ref="chart" />
    );
  }

  renderFocusedCbgDateTraceLabel() {
    const { currentPatientInViewId, trendsState } = this.props;
    const focusedCbgDateTrace = _.get(trendsState, [currentPatientInViewId, 'focusedCbgDateTrace']);
    if (focusedCbgDateTrace) {
      return (
        <CBGDateTraceLabel focusedDateTrace={focusedCbgDateTrace} />
      );
    }
    return null;
  }

  renderFocusedRangeLabels() {
    const { currentPatientInViewId, trendsState } = this.props;
    const { chartPrefs: { trends: { showingCbg, showingSmbg } } } = this.props;
    if (showingCbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'cbg'}
          focusedKeys={trendsState[currentPatientInViewId].focusedCbgSliceKeys}
          focusedSlice={trendsState[currentPatientInViewId].focusedCbgSlice}
          timePrefs={this.props.timePrefs} />
      );
    } else if (showingSmbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={this.props.bgPrefs}
          dataType={'smbg'}
          focusedRange={trendsState[currentPatientInViewId].focusedSmbgRangeAvg}
          timePrefs={this.props.timePrefs} />
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
        focusedPoint={this.props.trendsState[currentPatientInViewId].focusedSmbg} />
    );
  }
});

export default Trends;
