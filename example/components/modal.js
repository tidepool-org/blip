/** @jsx React.DOM */
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
var moment = require('moment');
var React = require('react');

var Header = require('./header');
var Footer = require('./footer');

var ModalDay = require('../modalday/ModalDay');

var Modal = React.createClass({
  chartType: 'modal',
  log: bows('Modal Day'),
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
      inTransition: false,
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
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickMostRecent={this.handleClickMostRecent}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickSettings={this.handleClickSettings}
        ref="header" />
        <div id="tidelineOuterContainer">
          <ModalChart
            bgClasses={this.props.bgPrefs.bgClasses}
            bgUnits={this.props.bgPrefs.bgUnits}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData.data}
            onDatetimeLocationChange={this.props.updateDatetimeLocation}
            onMostRecent={this.handleClickMostRecent}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
         onClickModal={this.props.onSwitchToModal}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  // handlers
  handleClickModal: function() {
    // when you're on modal view, clicking modal does nothing
    return;
  },
  handleClickMostRecent: function() {
    // TODO!!!
    return;
  },
  handleClickOneDay: function() {
    this.props.onSwitchToDaily();
  },
  handleClickTwoWeeks: function() {
    this.props.onSwitchToWeekly();
  },
  handleClickSettings: function() {
    this.props.onSwitchToSettings();
  }
});

var ModalChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits'],
  log: bows('Modal Chart'),
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.array.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      datetimeLocation: null
    };
  },
  componentDidMount: function() {
    this.log('Mounting...');
    var el = this.getDOMNode();
    this.chart = ModalDay.create(el);
    this.chart.render(this.props.patientData);
  },
  componentDidUpdate: function() {
    this.log('Updating...');
    this.chart.render(this.props.patientData);
  },
  componentWillUnmount: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  }
});

module.exports = Modal;