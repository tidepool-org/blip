
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

var utils = require('../../core/utils');

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var chartSettingsFactory = tidelineBlip.settings;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Settings')
};


var SettingsChart = React.createClass({
  chartOpts: ['bgUnits'],
  log: bows('Settings Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
  },
  componentDidMount: function() {
    this.mountChart(ReactDOM.findDOMNode(this));
    this.initializeChart(this.props.patientData);
  },
  componentWillUnmount: function() {
    this.unmountChart();
  },
  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    this.chart = chartSettingsFactory(node, _.pick(this.props, this.chartOpts));
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  initializeChart: function(data) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(data);
  },
  render: function() {
    
    return (
      <div id="tidelineContainer" className="patient-data-chart-growing"></div>
      );
    
  }
});

var Settings = React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToModal: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: ''
    };
  },
  render: function() {
    
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickMostRecent={this.handleClickMostRecent}
          onClickBasics={this.props.onSwitchToBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickModal={this.handleClickModal}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.handleClickSettings}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {this.isMissingSettings() ? this.renderMissingSettingsMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
         onClickSettings={this.props.onSwitchToSettings}
        ref="footer" />
      </div>
      );
    
  },
  renderChart: function() {
    
    return (
      <SettingsChart
        bgUnits={this.props.bgPrefs.bgUnits}
        patientData={this.props.patientData}
        ref="chart" />
    );
    
  },
  renderMissingSettingsMessage: function() {
    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Settings');
    };
    
    return (
      <div className="patient-data-message patient-data-message-loading">
        <p>{'Blip\'s Device Settings view shows your basal rates, carb ratios, sensitivity factors and more, but it looks like you haven\'t uploaded pump data yet.'}</p>
        <p>{'To see your Device Settings in Blip,  '}
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a>
          {' your pump.'}</p>
        <p>{'If you just uploaded, try '}
          <a href="" onClick={this.props.onClickRefresh}>refreshing</a>
          {'.'}
        </p>
      </div>
    );
    
  },
  isMissingSettings: function() {
    var data = this.props.patientData;
    var pumpSettings = utils.getIn(data, ['grouped', 'pumpSettings'], false);
    if (pumpSettings === false) {
      return true;
    }
    // the TidelineData constructor currently replaces missing data with
    // an empty array, so we also have to check for content
    else if (_.isEmpty(pumpSettings)) {
      return true;
    }
    return false;
  },
  // handlers
  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToModal();
  },
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  },
  handleClickSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToWeekly();
  }
});

module.exports = Settings;
