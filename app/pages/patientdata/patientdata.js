/** @jsx React.DOM */
/**
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
 */

var React = window.React;
var _ = window._;
var config = window.config;

var ChartDaily = require('../../components/chartdaily');
var ChartWeekly = require('../../components/chartweekly');

var PatientData = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    fetchingPatientData: React.PropTypes.bool,
    isUserPatient: React.PropTypes.bool,
    uploadUrl: React.PropTypes.string,
    onRefresh: React.PropTypes.func
  },

  DEFAULT_TITLE: 'Patient data',

  getInitialState: function() {
    return {
      chartType: 'daily',
      title: this.DEFAULT_TITLE,
      datetimeLocation: null,
      showingValuesWeekly: false
    };
  },

  render: function() {
    var subnav = this.renderSubnav();
    var patientData = this.renderPatientData();
    var footer = this.renderFooter();

    /* jshint ignore:start */
    return (
      <div className="patient-data">
        {subnav}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {patientData}
            </div>
          </div>
        </div>
        {footer}
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    var left = null;
    var right = null;
    /* jshint ignore:start */
    center = (
      <div className="patient-data-subnav-text">
        {this.state.title}
      </div>
    );
    /* jshint ignore:end */

    if (!(this.props.fetchingPatientData || _.isEmpty(this.props.patientData))) {
      var dailyLinkClass = 'patient-data-subnav-active';
      var weeklyLinkClass = null;
      if (this.state.chartType === 'weekly') {
        dailyLinkClass = null;
        weeklyLinkClass = 'patient-data-subnav-active';
      }

      /* jshint ignore:start */
      left = (
        <div>
          <a href="" className={dailyLinkClass} onClick={this.handleSwitchToDaily}>One day</a>
          <a href="" className={weeklyLinkClass} onClick={this.handleSwitchToWeekly}>Two weeks</a>
        </div>
      );
      /* jshint ignore:end */

      /* jshint ignore:start */
      right = (
        <div>
          <a href="" onClick={this.handleRefresh}>Refresh</a>
        </div>
      );
      /* jshint ignore:end */

      if (this.state.chartType === 'daily') {
        /* jshint ignore:start */
        center = (
          <div>
            <a href="" onClick={this.handlePanBack}><i className="icon-back"></i></a>
            <div className="patient-data-subnav-text patient-data-subnav-text-dates">
              {this.state.title}
            </div>
            <a href="" onClick={this.handlePanForward}><i className="icon-next"></i></a>
          </div>
        );
        /* jshint ignore:end */

        /* jshint ignore:start */
        right = (
          <div>
            <a href="" onClick={this.handleRefresh}>Refresh</a>
            <a href="" onClick={this.handleGoToMostRecentDaily}>Most recent</a>
          </div>
        );
        /* jshint ignore:end */
      }
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-quarter patient-data-subnav-left">
              {left}
            </div>
            <div className="grid-item one-whole large-two-quarters patient-data-subnav-center">
              {center}
            </div>
            <div className="grid-item one-whole large-one-quarter patient-data-subnav-right">
              {right}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientData: function() {
    if (this.props.fetchingPatientData) {
      return this.renderLoading();
    }

    if (_.isEmpty(this.props.patientData)) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  renderLoading: function() {
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-loading">
        Loading data...
      </div>
    );
    /* jshint ignore:end */
  },

  renderNoData: function() {
    var content = 'This patient doesn\'t have any data yet.';

    if (this.props.isUserPatient) {
      /* jshint ignore:start */
      content = (
        <div>
          <p>{'It looks like you don\'t have any data yet!'}</p>
          <p>
            <a href={this.props.uploadUrl} target="_blank">Upload your data</a>
            {' or if you already have, try '}
            <a href="" onClick={this.handleRefresh}>refreshing</a>
            {'.'}
          </p>
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-no-data">
        {content}
      </div>
    );
    /* jshint ignore:end */
  },

  renderChart: function() {
    if (this.state.chartType === 'weekly') {
      /* jshint ignore:start */
      return (
        <ChartWeekly
          patientData={this.props.patientData}
          datetimeLocation={this.state.datetimeLocation}
          onDatetimeLocationChange={this.handleDatetimeLocationChange}
          onSelectDataPoint={this.handleWeeklySelectDataPoint}
          imagesEndpoint={config.IMAGES_ENDPOINT + '/tideline'}
          ref="chart" />
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <ChartDaily
        patientData={this.props.patientData}
        datetimeLocation={this.state.datetimeLocation}
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        imagesEndpoint={config.IMAGES_ENDPOINT + '/tideline'}
        ref="chart" />
    );
    /* jshint ignore:end */
  },

  renderFooter: function() {
    if (this.props.fetchingPatientData || _.isEmpty(this.props.patientData)) {
      return null;
    }

    var right;

    if (this.state.chartType === 'weekly') {
      var toggleText = 'Show values';
      if (this.state.showingValuesWeekly) {
        toggleText = 'Hide values';
      }

      /* jshint ignore:start */
      right = (
        <a href="" onClick={this.handleToggleValuesWeekly}>
          {toggleText}
        </a>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-footer-outer">
        <div className="container-box-inner patient-data-footer-inner">
          <div className="grid patient-data-footer">
            <div className="grid-item one-whole medium-one-half patient-data-footer-left">
            </div>
            <div className="grid-item one-whole medium-one-half patient-data-footer-right">
              {right}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  handleSwitchToDaily: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.chartType === 'daily') {
      return;
    }

    this.setState({chartType: 'daily'});
  },

  handleSwitchToWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.chartType === 'weekly') {
      return;
    }

    var datetimeLocation = this.refs.chart.getCurrentDay();
    datetimeLocation = datetimeLocation.toISOString();
    this.setState({
      chartType: 'weekly',
      datetimeLocation: datetimeLocation,
      showingValuesWeekly: false
    });
  },

  handleGoToMostRecentDaily: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.chartType === 'daily') {
      this.setState({datetimeLocation: null});
      this.refs.chart.locateToMostRecent();
      return;
    }

    this.setState({
      chartType: 'daily',
      datetimeLocation: null
    });
  },

  handleRefresh: function(e) {
    if (e) {
      e.preventDefault();
    }

    var refresh = this.props.onRefresh;
    if (refresh) {
      this.setState({title: this.DEFAULT_TITLE});
      refresh();
    }
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

  handleDatetimeLocationChange: function(datetimeLocationString) {
    this.setState({title: datetimeLocationString});
  },

  handleWeeklySelectDataPoint: function(datetimeLocation) {
    this.setState({
      chartType: 'daily',
      datetimeLocation: datetimeLocation
    });
  },

  handleToggleValuesWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.showingValuesWeekly) {
      this.refs.chart.hideValues();
    }
    else {
      this.refs.chart.showValues();
    }

    this.setState({showingValuesWeekly: !this.state.showingValuesWeekly});
  }
});

module.exports = PatientData;