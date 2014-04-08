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
var moment = window.moment;
var config = window.config;

var Chart = require('../../components/chart');

var PatientData = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    fetchingPatientData: React.PropTypes.bool,
    isUserPatient: React.PropTypes.bool,
    uploadUrl: React.PropTypes.string,
    onRefresh: React.PropTypes.func
  },

  DEFAULT_TITLE: 'Your data',
  CHARTDAILY_TITLE_DATE_FORMAT: 'dddd, MMMM Do',
  CHARTWEEKLY_TITLE_DATE_FORMAT: 'MMMM Do',

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
      <div className="patient-data js-patient-data-page">
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
        <div className="grid-item one-whole large-one-quarter">
          <div className="grid-item large-three-eighths">
            <a href="" className={dailyLinkClass} onClick={this.handleSwitchToDaily}>One day</a>
          </div>
          <div className="grid-item large-one-half patient-data-subnav-left">
            <a href="" className={weeklyLinkClass} onClick={this.handleSwitchToWeekly}>Two weeks</a>
          </div>
        </div>
      );
      /* jshint ignore:end */

      /* jshint ignore:start */
      center = (
        <div>
          <a href="" onClick={this.handlePanBack}><i className="icon-back"></i></a>
          <div className="patient-data-subnav-text patient-data-subnav-text-dates">
            {this.state.title}
          </div>
          <a href="" onClick={this.handlePanForward} className={this.state.atMostRecent ? "patient-data-subnav-disabled" : ""}><i className="icon-next"></i></a>
        </div>
      );
      /* jshint ignore:end */

      /* jshint ignore:start */
      right = (
        <div className="grid-item one-whole large-one-quarter">
          <div className="grid-item one-whole large-one-half patient-data-subnav-right">
            <a href="" onClick={this.handleRefresh}>Refresh</a>
          </div>
          <div className="grid-item one-whole large-one-half">
            <a href="" onClick={this.handleGoToMostRecent} className={this.state.atMostRecent ? "patient-data-subnav-active" : ""}>Most recent</a>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
              {left}
            <div className={left ? "grid-item one-whole large-one-half patient-data-subnav-center" : "grid-item one-whole patient-data-subnav-center"}>
              {center}
            </div>
              {right}
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
    /* jshint ignore:start */
    return (
      <Chart
        patientData={this.props.patientData}
        chartType={this.state.chartType}
        datetimeLocation={this.state.datetimeLocation}
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDataPoint={this.handleWeeklySelectDataPoint}
        onReachedMostRecent={this.handleReachedMostRecent}
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

  handleGoToMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      datetimeLocation: null
    });
    this.refs.chart.locateToMostRecent();
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

  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    var title = this.state.title;
    var datetimeLocation = this.state.datetimeLocation;

    if (d && d.length >= 1 && this.state.chartType === 'daily') {
      title = this.getTitleDaily(d);
      datetimeLocation = d[1];
    }
    else if (d && d.length >= 2 && this.state.chartType === 'weekly') {
      title = this.getTitleWeekly(d);
      datetimeLocation = d[1];
    }
    else {
      throw new Error('Expected an array of datetime locations');
    }

    this.setState({
      title: title,
      datetimeLocation: datetimeLocation
    });
  },

  handleReachedMostRecent: function(mostRecent) {
    if (mostRecent) {
      this.setState({
        atMostRecent: true
      });
    }
    else {
      this.setState({
        atMostRecent: false
      });
    }
  },

  getTitleDaily: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    return moment.utc(d[0]).format(this.CHARTDAILY_TITLE_DATE_FORMAT);
  },

  getTitleWeekly: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    var start = moment.utc(d[0]).format(this.CHARTWEEKLY_TITLE_DATE_FORMAT);
    var end = moment.utc(d[1]).format(this.CHARTWEEKLY_TITLE_DATE_FORMAT);
    return start + ' - ' + end;
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
