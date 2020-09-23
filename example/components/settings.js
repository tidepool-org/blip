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
var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');

// tideline dependencies & plugins
var chartSettingsFactory = require('../../plugins/blip').settings;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Settings')
};

var Settings = createReactClass({
  displayName: 'Settings',
  chartType: 'settings',
  log: bows('Settings View'),

  propTypes: {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    patientData: PropTypes.object.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToModal: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToWeekly: PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      atMostRecent: true,
      title: ''
    };
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          atMostRecent={true}
          title={this.state.title}
          onClickModal={this.handleClickModal}
          onClickMostRecent={this.handleClickMostRecent}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickSettings={this.handleClickSettings}
        ref="header" />
        <div id="tidelineOuterContainer">
          <SettingsChart
            bgUnits={this.props.bgPrefs.bgUnits}
            patientData={this.props.patientData}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },

  // handlers
  handleClickModal: function() {
    this.props.onSwitchToModal();
  },

  handleClickMostRecent: function() {
    return;
  },

  handleClickOneDay: function() {
    this.props.onSwitchToDaily();
  },

  handleClickTwoWeeks: function() {
    this.props.onSwitchToWeekly();
  },

  handleClickSettings: function() {
    // when you're on settings view, clicking settings does nothing
    return;
  },
});

var SettingsChart = createReactClass({
  displayName: 'SettingsChart',
  chartOpts: ['bgUnits'],
  log: bows('Settings Chart'),

  propTypes: {
    bgUnits: PropTypes.string.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
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
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  },
});

module.exports = Settings;
