
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
var React = require('react');
var ReactDOM = require('react-dom');
var sundial = require('sundial');
import { translate, Trans } from 'react-i18next';

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var chartWeeklyFactory = tidelineBlip.twoweek;

var vizComponents = require('@tidepool/viz').components;
var Loader = vizComponents.Loader;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Two Weeks')
};

var WeeklyChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits', 'timePrefs'],
  log: bows('Weekly Chart'),
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onClickValues: React.PropTypes.func.isRequired,
    onSelectSMBG: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    isClinicAccount: React.PropTypes.bool.isRequired,
  },

  mount: function() {
    this.mountChart(ReactDOM.findDOMNode(this));
    this.initializeChart(this.props.patientData, this.props.initialDatetimeLocation);
  },

  componentWillUnmount: function() {
    this.unmountChart();
  },

  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    chartOpts = chartOpts || {};
    this.chart = chartWeeklyFactory(node, _.assign(chartOpts, _.pick(this.props, this.chartOpts)));
    this.chart.node = node;
    this.bindEvents();
  },

  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },

  rerenderChart: function() {
    this.log('Rerendering...');
    this.unmountChart();
    this.mount();
    this.chart.emitter.emit('inTransition', false);
  },

  bindEvents: function() {
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('selectSMBG', this.props.onSelectSMBG);
  },

  initializeChart: function(data, datetimeLocation) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    if (datetimeLocation) {
      this.chart.load(data, datetimeLocation);
    }
    else {
      this.chart.load(data);
    }
    if (this.props.isClinicAccount){
      this.chart.showValues();
    }
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="patient-data-chart"></div>
      );
    /* jshint ignore:end */
  },

  // handlers
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1]
    });
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  },

  getCurrentDay: function(timePrefs) {
    return this.chart.getCurrentDay(timePrefs).toISOString();
  },

  goToMostRecent: function() {
    this.chart.clear();
    this.bindEvents();
    this.chart.load(this.props.patientData);
  },

  hideValues: function() {
    this.chart.hideValues();
  },

  panBack: function() {
    this.chart.panBack();
  },

  panForward: function() {
    this.chart.panForward();
  },

  showValues: function() {
    this.chart.showValues();
  }
});

var Weekly = translate()(React.createClass({
  chartType: 'weekly',
  log: bows('Weekly View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    isClinicAccount: React.PropTypes.bool.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onClickNoDataRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    onUpdateChartDateRange: React.PropTypes.func.isRequired,
    patientData: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      showingValues: this.props.isClinicAccount,
      title: ''
    };
  },

  componentDidMount:function () {
    if (this.refs.chart) {
      this.refs.chart.mount();
    }
  },

  componentWillReceiveProps:function (nextProps) {
    if (this.props.loading && !nextProps.loading) {
      this.refs.chart.getWrappedInstance().rerenderChart();
    }
  },

  render: function() {
    return (
      <div id="tidelineMain" className="grid">
        {this.isMissingSMBG() ? this.renderMissingSMBGHeader() : this.renderHeader()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              {this.isMissingSMBG() ? this.renderMissingSMBGMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.isMissingSMBG() ? 'no-data' : this.chartType}
         onClickValues={this.toggleValues}
         onClickRefresh={this.props.onClickRefresh}
         showingValues={this.state.showingValues}
        ref="footer" />
      </div>
    );
  },

  renderChart: function() {
    return (
      <WeeklyChart
        bgClasses={this.props.bgPrefs.bgClasses}
        bgUnits={this.props.bgPrefs.bgUnits}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        patientData={this.props.patientData}
        timePrefs={this.props.timePrefs}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onMostRecent={this.handleMostRecent}
        onClickValues={this.toggleValues}
        onSelectSMBG={this.handleSelectSMBG}
        onTransition={this.handleInTransition}
        ref="chart"
        isClinicAccount={this.props.isClinicAccount} />
    );
  },

  renderHeader: function() {
    return (
      <Header
        chartType={this.chartType}
        patient={this.props.patient}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={this.state.title}
        iconBack={'icon-back-down'}
        iconNext={'icon-next-up'}
        iconMostRecent={'icon-most-recent-up'}
        onClickBack={this.handlePanBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handlePanForward}
        onClickOneDay={this.handleClickOneDay}
        onClickSettings={this.props.onSwitchToSettings}
        onClickTwoWeeks={this.handleClickTwoWeeks}
      ref="header" />
    );
  },

  renderMissingSMBGHeader: function() {
    return (
      <Header
        chartType={this.chartType}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={''}
        onClickOneDay={this.handleClickOneDay}
        onClickTrends={this.handleClickTrends}
        onClickSettings={this.props.onSwitchToSettings}
        onClickTwoWeeks={this.handleClickTwoWeeks}
      ref="header" />
    );
  },

  renderMissingSMBGMessage: function() {
    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No SMBG');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading">
        <p>The Weekly view shows a history of your finger stick BG data, but it looks like you haven't uploaded finger stick data yet.</p>
        <p>To see your data in the Weekly view,&nbsp;
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a>&nbsp;
          your pump or BG meter.</p>
        <p>If you just uploaded, try&nbsp;
          <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>
          .
        </p>
      </Trans>
    );
  },

  formatDate: function(datetime) {
    const { t } = this.props;
    // even when timezoneAware, labels should be generated as if UTC; just trust me (JEB)
    return sundial.formatInTimezone(datetime, 'UTC', t('MMM D, YYYY'));
  },

  getTitle: function(datetimeLocationEndpoints) {
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(datetimeLocationEndpoints[1]);
  },

  isMissingSMBG: function() {
    var data = this.props.patientData;
    if (_.isEmpty(data.grouped.smbg)) {
      return true;
    }
    return false;
  },

  // handlers
  handleClickTrends: function(e) {
    if(e) {
      e.preventDefault();
    }
    var datetime;
    if (this.refs.chart) {
      datetime = this.refs.chart.getWrappedInstance().getCurrentDay(this.props.timePrefs);
    }
    this.props.onSwitchToTrends(datetime);
  },

  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({showingValues: false});
    this.refs.chart.getWrappedInstance().goToMostRecent();
  },

  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime;
    if (this.refs.chart) {
      datetime = this.refs.chart.getCurrentDay(this.props.timePrefs);
    }
    this.props.onSwitchToDaily(datetime);
  },

  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },

  handleDatetimeLocationChange: function(datetimeLocationEndpoints, chart = this.refs.chart) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints)
    });
    this.props.updateDatetimeLocation(chart.getWrappedInstance().getCurrentDay());

    // Update the chart date range in the patientData component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocationEndpoints, this.refs.chart);

    this.setState({ debouncedDateRangeUpdate });
  },

  handleInTransition: function(inTransition) {
    this.setState({
      inTransition: inTransition
    });
  },

  handleMostRecent: function(atMostRecent) {
    this.setState({
      atMostRecent: atMostRecent
    });
  },

  handlePanBack: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.getWrappedInstance().panBack();
  },

  handlePanForward: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.getWrappedInstance().panForward();
  },

  handleSelectSMBG: function(datetime) {
    this.props.onSwitchToDaily(datetime);
  },

  toggleValues: function(e) {
    if (this.state.showingValues) {
      this.props.trackMetric('Clicked Show Values Off');
      this.refs.chart.getWrappedInstance().hideValues();
    }
    else {
      this.props.trackMetric('Clicked Show Values On');
      this.refs.chart.getWrappedInstance().showValues();
    }
    this.setState({showingValues: !this.state.showingValues});
  }
}));

module.exports = Weekly;
