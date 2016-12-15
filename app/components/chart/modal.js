/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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
var _ = require('lodash');
var bows = require('bows');
var d3 = window.d3;
var React = require('react');
var ReactDOM = require('react-dom');
var sundial = require('sundial');

var Header = require('./header');
var SubNav = require('./modalsubnav');
var Footer = require('./footer');

import * as viz from '@tidepool/viz';
const CBGDateTraceLabel = viz.components.CBGDateTraceLabel;
const FocusedRangeLabels = viz.components.FocusedRangeLabels;
const FocusedSMBGPointLabel = viz.components.FocusedSMBGPointLabel;
const TrendsContainer = viz.containers.TrendsContainer;

var Modal = React.createClass({
  chartType: 'modal',
  log: bows('Modal Day'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    currentPatientInViewId: React.PropTypes.string.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    trendsState: React.PropTypes.object.isRequired,
    // refresh handler
    onClickRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToModal: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: '',
      visibleDays: 0
    };
  },
  componentDidMount: function() {
    if (this.refs.chart) {
      // necessary to get a ref from the redux connect()ed TrendsContainer
      this.chart = this.refs.chart.getWrappedInstance();
    }
  },
  render: function() {
    return (
      <div id="tidelineMain">
        {this.renderHeader()}
        {this.renderSubNav()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <div id="tidelineContainer" className="patient-data-chart-modal">
                {this.renderChart()}
              </div>
              {this.renderCBGDateTraceLabel()}
              {this.renderFocusedSMBGPointLabel()}
              {this.renderFocusedRangeLabels()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickBoxOverlay={this.toggleBoxOverlay}
         onClickGroup={this.toggleGroup}
         onClickLines={this.toggleLines}
         onClickRefresh={this.props.onClickRefresh}
         onClickBgDataToggle={this.toggleBgDataSource}
         boxOverlay={this.props.chartPrefs.modal.smbgRangeOverlay}
         grouped={this.props.chartPrefs.modal.smbgGrouped}
         showingLines={this.props.chartPrefs.modal.smbgLines}
         showingCbg={this.props.chartPrefs.modal.showingCbg}
         showingSmbg={this.props.chartPrefs.modal.showingSmbg}
        ref="footer" />
      </div>
    );
  },
  renderHeader: function() {
    return (
      <Header
        chartType={this.chartType}
        inTransition={this.state.inTransition}
        atMostRecent={this.state.atMostRecent}
        title={this.state.title}
        iconBack={'icon-back'}
        iconNext={'icon-next'}
        iconMostRecent={'icon-most-recent'}
        onClickBack={this.handleClickBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickModal={this.handleClickModal}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handleClickForward}
        onClickOneDay={this.handleClickDaily}
        onClickTwoWeeks={this.handleClickWeekly}
        onClickSettings={this.handleClickSettings}
      ref="header" />
    );
  },
  renderSubNav: function() {
    return (
      <SubNav
       activeDays={this.props.chartPrefs.modal.activeDays}
       activeDomain={this.props.chartPrefs.modal.activeDomain}
       extentSize={this.props.chartPrefs.modal.extentSize}
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
  },
  renderChart: function() {
    const { bgPrefs: { bgClasses, bgUnits } } = this.props;
    let bgBounds = {
      veryHighThreshold: bgClasses.high.boundary,
      targetUpperBound: bgClasses.target.boundary,
      targetLowerBound: bgClasses.low.boundary,
      veryLowThreshold: bgClasses['very-low'].boundary,
    };
    return (
      <TrendsContainer
        activeDays={this.props.chartPrefs.modal.activeDays}
        bgBounds={bgBounds}
        bgUnits={this.props.bgPrefs.bgUnits}
        currentPatientInViewId={this.props.currentPatientInViewId}
        extentSize={this.props.chartPrefs.modal.extentSize}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        showingSmbg={this.props.chartPrefs.modal.showingSmbg}
        showingCbg={this.props.chartPrefs.modal.showingCbg}
        smbgRangeOverlay={this.props.chartPrefs.modal.smbgRangeOverlay}
        smbgGrouped={this.props.chartPrefs.modal.smbgGrouped}
        smbgLines={this.props.chartPrefs.modal.smbgLines}
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
  },
  renderCBGDateTraceLabel: function() {
    const { currentPatientInViewId, trendsState } = this.props;
    const { chartPrefs: { modal: { showingCbg } } } = this.props;
    const focusedCbgDate = _.get(trendsState, [currentPatientInViewId, 'focusedCbgDate']);
    if (showingCbg && focusedCbgDate) {
      return (
        <CBGDateTraceLabel
          focusedCbgDate={trendsState[currentPatientInViewId].focusedCbgDate}
        />
      );
    }
    return null;
  },
  renderFocusedRangeLabels: function() {
    const { currentPatientInViewId, trendsState } = this.props;
    const { chartPrefs: { modal: { showingCbg, showingSmbg } } } = this.props;
    const showingCbgWithLabels = showingCbg && _.get(trendsState, [currentPatientInViewId, 'showingCbgSliceLabels']);
    // exclusive or!
    if ((showingCbgWithLabels && !showingSmbg) || (!showingCbgWithLabels && showingSmbg)) {
      if (showingCbg) {
        return (
          <FocusedRangeLabels
            bgUnits={this.props.bgPrefs.bgUnits}
            dataType={'cbg'}
            focusedKeys={trendsState[currentPatientInViewId].focusedCbgSliceKeys}
            focusedSlice={trendsState[currentPatientInViewId].focusedCbgSlice}
            timePrefs={this.props.timePrefs} />
        );
      } else if (showingSmbg) {
        return (
          <FocusedRangeLabels
            bgUnits={this.props.bgPrefs.bgUnits}
            dataType={'smbg'}
            focusedRange={trendsState[currentPatientInViewId].focusedSmbgRangeAvg}
            timePrefs={this.props.timePrefs} />
        );
      }
    }
    return null;
  },
  renderFocusedSMBGPointLabel: function() {
    if (!this.props.chartPrefs.modal.showingSmbg) {
      return null;
    }
    const { currentPatientInViewId } = this.props;
    return (
      <FocusedSMBGPointLabel
        bgUnits={this.props.bgPrefs.bgUnits}
        timePrefs={this.props.timePrefs}
        grouped={this.props.chartPrefs.modal.smbgGrouped}
        lines={this.props.chartPrefs.modal.smbgLines}
        focusedPoint={this.props.trendsState[currentPatientInViewId].focusedSmbg} />
    );
  },
  renderMissingSMBGHeader: function() {
    return (
      <Header
        chartType={this.chartType}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={''}
        onClickOneDay={this.handleClickDaily}
        onClickSettings={this.handleClickSettings}
        onClickTwoWeeks={this.handleClickWeekly}
      ref="header" />
    );
  },
  formatDate: function(datetime) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return sundial.formatInTimezone(datetime, timezone, 'MMM D, YYYY');
  },
  getTitle: function(datetimeLocationEndpoints) {
    // endpoint is exclusive, so need to subtract a day
    var end = d3.time.day.utc.offset(new Date(datetimeLocationEndpoints[1]), -1);
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  },
  getNewDomain: function(current, extent) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    current = sundial.ceil(current, 'day', timezone);
    return [d3.time.day.utc.offset(current, -extent).toISOString(), current.toISOString()];
  },
  updateVisibleDays: function() {
    this.setState({
      visibleDays: d3.select('#modalDays').selectAll('g.modalDay').size()
    });
  },
  // handlers
  handleClickBack: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.chart.goBack();
  },
  handleClickForward: function(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.chart.goForward();
  },
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    this.chart.goToMostRecent();
  },
  handleClickDaily: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.chart ? this.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToDaily(datetime);
  },
  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    // when you're on modal view, clicking modal does nothing
    return;
  },
  handleClickOneWeek: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.activeDomain === '1 week' && prefs.extentSize === 7) {
      return;
    }
    prefs.modal.activeDomain = '1 week';
    prefs.modal.extentSize = 7;
    this.props.updateChartPrefs(prefs);
    var current = new Date(this.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 7);
    this.chart.setExtent(newDomain);
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.activeDomain === '2 weeks' && prefs.extentSize === 14) {
      return;
    }
    prefs.modal.activeDomain = '2 weeks';
    prefs.modal.extentSize = 14;
    this.props.updateChartPrefs(prefs);
    var current = new Date(this.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 14);
    this.chart.setExtent(newDomain);
  },
  handleClickFourWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.activeDomain === '4 weeks' && prefs.extentSize === 28) {
      return;
    }
    prefs.modal.activeDomain = '4 weeks';
    prefs.modal.extentSize = 28;
    this.props.updateChartPrefs(prefs);
    var current = new Date(this.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 28);
    this.chart.setExtent(newDomain);
  },
  handleClickWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.chart ? this.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToWeekly(datetime);
  },
  handleClickSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToSettings();
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints, atMostRecent) {
    if (this.isMounted()) {
      this.setState({
        atMostRecent: atMostRecent,
        title: this.getTitle(datetimeLocationEndpoints)
      });
      this.props.updateDatetimeLocation(datetimeLocationEndpoints[1]);
    }
  },
  handleSelectDate: function(date) {
    this.props.onSwitchToDaily(date);
  },
  toggleDay: function(day) {
    var self = this;
    return function(e) {
      e.stopPropagation();
      var prefs = _.cloneDeep(self.props.chartPrefs);
      prefs.modal.activeDays[day] = prefs.modal.activeDays[day] ? false : true;
      self.props.updateChartPrefs(prefs);
    };
  },
  toggleBgDataSource: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.showingCbg = !prefs.modal.showingCbg;
    prefs.modal.showingSmbg = !prefs.modal.showingSmbg;
    this.props.updateChartPrefs(prefs);
  },
  toggleBoxOverlay: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.smbgRangeOverlay = prefs.modal.smbgRangeOverlay ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleGroup: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.smbgGrouped = prefs.modal.smbgGrouped ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleLines: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.smbgLines = prefs.modal.smbgLines ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleWeekdays: function(allActive) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDays = {
      'monday': !allActive,
      'tuesday': !allActive,
      'wednesday': !allActive,
      'thursday': !allActive,
      'friday': !allActive,
      'saturday': prefs.modal.activeDays.saturday,
      'sunday': prefs.modal.activeDays.sunday
    };
    this.props.updateChartPrefs(prefs);
  },
  toggleWeekends: function(allActive) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDays = {
      'monday': prefs.modal.activeDays.monday,
      'tuesday': prefs.modal.activeDays.tuesday,
      'wednesday': prefs.modal.activeDays.wednesday,
      'thursday': prefs.modal.activeDays.thursday,
      'friday': prefs.modal.activeDays.friday,
      'saturday': !allActive,
      'sunday': !allActive
    };
    this.props.updateChartPrefs(prefs);
  }
});

module.exports = Modal;
