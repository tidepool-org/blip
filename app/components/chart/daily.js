
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

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var chartDailyFactory = tidelineBlip.oneday;

var Header = require('./header');
var Footer = require('./footer');

import { selectDailyViewData } from '@tidepool/viz';

var DailyChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits', 'bolusRatio', 'dynamicCarbs', 'timePrefs'],
  log: bows('Daily Chart'),
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    bolusRatio: React.PropTypes.number,
    dynamicCarbs: React.PropTypes.bool,
    initialDatetimeLocation: React.PropTypes.string,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // other handlers
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
  },
  componentWillUnmount: function() {
    this.unmountChart();
  },
  mountChart: function() {
    this.log('Mounting...');
    this.chart = chartDailyFactory(ReactDOM.findDOMNode(this), _.pick(this.props, this.chartOpts))
      .setupPools();
    this.bindEvents();
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  bindEvents: function() {
    this.chart.emitter.on('createMessage', this.props.onCreateMessage);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('messageThread', this.props.onShowMessageThread);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
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
    else if (this.state.datetimeLocation !== null) {
      this.chart.locate(this.state.datetimeLocation);
    }
    else {
      this.chart.locate();
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
  },
  // methods for messages
  closeMessage: function() {
    return this.chart.closeMessage();
  },
  createMessage: function(message) {
    return this.chart.createMessage(message);
  },
  editMessage: function(message) {
    return this.chart.editMessage(message);
  }
});

var Daily = React.createClass({
  chartType: 'daily',
  log: bows('Daily View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    pdf: React.PropTypes.object.isRequired,
    // refresh handler
    onClickRefresh: React.PropTypes.func.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // navigation handlers
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToPrint: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    // PatientData state updaters
    updateDatetimeLocation: React.PropTypes.func.isRequired
  },
  componentDidMount: function() {
    const dData = this.props.patientData.diabetesData;
    const bgUnits = this.props.bgPrefs.bgUnits.replace('/', '').toLowerCase();
    window.downloadDailyPrintViewData = () => {
      console.save(selectDailyViewData(
        dData[dData.length - 1].normalTime,
        _.pick(
          this.props.patientData.grouped,
          // TODO: add back deviceEvent later (not in first prod release)
          ['basal', 'bolus', 'cbg', 'message', 'smbg']
        ),
        6,
        this.props.timePrefs,
      ), `daily-print-view-${bgUnits}.json`);
    };
  },
  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      title: '',
    };
  },
  render: function() {

    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          printReady={!!this.props.pdf.url}
          inTransition={this.state.inTransition}
          atMostRecent={this.state.atMostRecent}
          title={this.state.title}
          iconBack={'icon-back'}
          iconNext={'icon-next'}
          iconMostRecent={'icon-most-recent'}
          onClickBack={this.handlePanBack}
          onClickBasics={this.props.onSwitchToBasics}
          onClickModal={this.handleClickModal}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickSettings={this.props.onSwitchToSettings}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickPrint={this.handleClickPrint}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <DailyChart
                bgClasses={this.props.bgPrefs.bgClasses}
                bgUnits={this.props.bgPrefs.bgUnits}
                bolusRatio={this.props.chartPrefs.bolusRatio}
                dynamicCarbs={this.props.chartPrefs.dynamicCarbs}
                initialDatetimeLocation={this.props.initialDatetimeLocation}
                patientData={this.props.patientData}
                timePrefs={this.props.timePrefs}
                // message handlers
                onCreateMessage={this.props.onCreateMessage}
                onShowMessageThread={this.props.onShowMessageThread}
                // other handlers
                onDatetimeLocationChange={this.handleDatetimeLocationChange}
                onHideBasalSettings={this.handleHideBasalSettings}
                onMostRecent={this.handleMostRecent}
                onShowBasalSettings={this.handleShowBasalSettings}
                onTransition={this.handleInTransition}
                ref="chart" />
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
        ref="footer" />
      </div>
      );

  },
  getTitle: function(datetime) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return sundial.formatInTimezone(datetime, timezone, 'ddd, MMM D, YYYY');
  },
  // handlers
  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToModal(datetime);
  },
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.goToMostRecent();
  },
  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickPrint: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.props.pdf.url) {
      const printWindow = window.open(this.props.pdf.url);
      printWindow.focus();
      printWindow.print();
    }

    // Send tracking metric
    this.props.onSwitchToPrint();
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
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
  handlePanBack: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panBack();
  },
  handlePanForward: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panForward();
  },
  // methods for messages
  closeMessageThread: function() {
    return this.refs.chart.closeMessage();
  },
  createMessageThread: function(message) {
    return this.refs.chart.createMessage(message);
  },
  editMessageThread: function(message) {
    return this.refs.chart.editMessage(message);
  }
});

module.exports = Daily;
