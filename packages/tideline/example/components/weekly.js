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
var moment = require('moment-timezone');
var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');

// tideline dependencies & plugins
var chartWeeklyFactory = require('../../plugins/blip').twoweek;

var Header = require('./header');
var Footer = require('./footer');

var MMMM_D_FORMAT = require('../../js/data/util/constants');

var tideline = {
  log: bows('Two Weeks')
};

var Weekly = createReactClass({
  displayName: 'Weekly',
  chartType: 'weekly',
  log: bows('Weekly View'),

  propTypes: {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToModal: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToWeekly: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    updateDatetimeLocation: PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      showingValues: false,
      title: ''
    };
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <Header
          chartType={this.chartType}
          atMostRecent={this.state.atMostRecent}
          inTransition={this.state.inTransition}
          title={this.state.title}
          iconBack={'icon-back-down'}
          iconNext={'icon-next-up'}
          iconMostRecent={'icon-most-recent-up'}
          onClickBack={this.handlePanBack}
          onClickModal={this.handleClickModal}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickSettings={this.props.onSwitchToSettings}
        ref="header" />
        <div id="tidelineOuterContainer">
          <WeeklyChart
            bgClasses={this.props.bgPrefs.bgClasses}
            bgUnits={this.props.bgPrefs.bgUnits}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData}
            timePrefs={this.props.chartPrefs.timePrefs}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onMostRecent={this.handleMostRecent}
            onClickValues={this.toggleValues}
            onSelectSMBG={this.handleSelectSMBG}
            onTransition={this.handleInTransition}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
         onClickValues={this.toggleValues}
         showingValues={this.state.showingValues}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },

  formatDate: function(datetime) {
    return moment(datetime).utc().format(MMMM_D_FORMAT);
  },

  getTitle: function(datetimeLocationEndpoints) {
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(datetimeLocationEndpoints[1]);
  },

  // handlers
  handleClickModal: function() {
    var datetime = this.refs.chart.getCurrentDay(this.props.chartPrefs.timePrefs);
    this.props.onSwitchToModal(datetime);
  },

  handleClickMostRecent: function() {
    this.setState({showingValues: false});
    this.refs.chart.goToMostRecent();
  },

  handleClickOneDay: function() {
    var datetime = this.refs.chart.getCurrentDay(this.props.chartPrefs.timePrefs);
    this.props.onSwitchToDaily(datetime);
  },

  handleClickTwoWeeks: function() {
    // when you're on two-week view, clicking two-week does nothing
    return;
  },

  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      title: this.getTitle(datetimeLocationEndpoints)
    });
    this.props.updateDatetimeLocation(this.refs.chart.getCurrentDay(this.props.chartPrefs.timePrefs));
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

  handlePanBack: function() {
    this.refs.chart.panBack();
  },

  handlePanForward: function() {
    this.refs.chart.panForward();
  },

  handleSelectSMBG: function(datetime) {
    this.props.onSwitchToDaily(datetime);
  },

  toggleValues: function() {
    if (this.state.showingValues) {
      this.refs.chart.hideValues();
    }
    else {
      this.refs.chart.showValues();
    }
    this.setState({showingValues: !this.state.showingValues});
  },
});

var WeeklyChart = createReactClass({
  displayName: 'WeeklyChart',
  chartOpts: ['bgClasses', 'bgUnits', 'timePrefs'],
  log: bows('Weekly Chart'),

  propTypes: {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onMostRecent: PropTypes.func.isRequired,
    onClickValues: PropTypes.func.isRequired,
    onSelectSMBG: PropTypes.func.isRequired,
    onTransition: PropTypes.func.isRequired
  },

  componentDidMount: function() {
    this.mountChart(ReactDOM.findDOMNode(this));
    this.initializeChart(this.props.patientData, this.props.initialDatetimeLocation);
    this.bindEvents();
  },

  componentWillUnmount: function() {
    this.unmountChart();
  },

  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    this.chart = chartWeeklyFactory(node, _.pick(this.props, this.chartOpts));
  },

  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
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
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  },

  // handlers
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
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
  },
});

module.exports = Weekly;
