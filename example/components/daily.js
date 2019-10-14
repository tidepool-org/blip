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
var React = require('react');
var ReactDOM = require('react-dom');

// tideline dependencies & plugins
var chartDailyFactory = require('../../plugins/blip').oneday;

var Header = require('./header');
var Footer = require('./footer');

var DDDD_MMMM_D_FORMAT = require('../../js/data/util/constants');

var Daily = React.createClass({
  chartType: 'daily',
  log: bows('Daily View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToModal: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      title: ''
    };
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <Header
          chartType={this.chartType}
          inTransition={this.state.inTransition}
          atMostRecent={this.state.atMostRecent}
          title={this.state.title}
          iconBack={'icon-back'}
          iconNext={'icon-next'}
          iconMostRecent={'icon-most-recent'}
          onClickBack={this.handlePanBack}
          onClickModal={this.handleClickModal}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickSettings={this.props.onSwitchToSettings}
        ref="header" />
        <div id="tidelineOuterContainer">
          <DailyChart
            bgClasses={this.props.bgPrefs.bgClasses}
            bgUnits={this.props.bgPrefs.bgUnits}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData}
            timePrefs={this.props.chartPrefs.timePrefs}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onMostRecent={this.handleMostRecent}
            onTransition={this.handleInTransition}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  getTitle: function(datetime) {
    if (this.props.chartPrefs.timePrefs.timezoneAware) {
      return moment(datetime).tz(this.props.chartPrefs.timePrefs.timezoneName).format('dddd, MMMM D');
    }
    return moment(datetime).utc().format(DDDD_MMMM_D_FORMAT);
  },
  // handlers
  handleClickModal: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToModal(datetime);
  },
  handleClickMostRecent: function() {
    this.refs.chart.goToMostRecent();
  },
  handleClickOneDay: function() {
    // when you're on one-day view, clicking one-day does nothing
    return;
  },
  handleClickTwoWeeks: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToWeekly(datetime);
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints[1])
    });
    this.props.updateDatetimeLocation(datetimeLocationEndpoints[1]);
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
  }
});

var DailyChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits', 'timePrefs'],
  log: bows('Daily Chart'),
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      datetimeLocation: null
    };
  },
  componentDidMount: function() {
    this.mountChart();
    this.initializeChart(this.props.initialDatetimeLocation);
    this.bindEvents();
  },
  componentWillUnmount: function() {
    this.unmountChart();
  },
  mountChart: function() {
    this.log('Mounting...');
    this.chart = chartDailyFactory(ReactDOM.findDOMNode(this), _.pick(this.props, this.chartOpts))
      .setupPools();
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  bindEvents: function() {
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
  },
  initializeChart: function(datetime) {
    this.log('Initializing...');
    if (_.isEmpty(this.props.patientData)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(this.props.patientData);
    if (datetime) {
      this.chart.locate(datetime);
    }
    else if (this.state.datetimeLocation != null) {
      this.chart.locate(this.state.datetimeLocation);
    }
    else {
      this.chart.locate();
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
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1]
    });
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  },
  rerenderChart: function() {
    this.unmountChart();
    this.mountChart();
    this.initializeChart();
  },
  getCurrentDay: function() {
    return this.chart.getCurrentDay().toISOString();
  },
  goToMostRecent: function() {
    this.chart.setAtDate(null, true);
  },
  panBack: function() {
    this.chart.panBack();
  },
  panForward: function() {
    this.chart.panForward();
  }
});

module.exports = Daily;
