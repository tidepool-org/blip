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

var PatientData = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    fetchingPatientData: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      chartType: 'daily',
      title: 'Patient data'
    };
  },

  render: function() {
    var subnav = this.renderSubnav();
    var patientData = this.renderPatientData();

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
          <a href="" onClick={this.handleGoToMostRecentDaily}>Most recent</a>
        );
        /* jshint ignore:end */

        // NOTE: Temporarily disable "Most recent" function until fixed
        right = null;
      }
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-fifth patient-data-subnav-left">
              {left}
            </div>
            <div className="grid-item one-whole large-three-fifths patient-data-subnav-center">
              {center}
            </div>
            <div className="grid-item one-whole large-one-fifth patient-data-subnav-right">
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
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-no-data">
        {'This patient doesn\'t have any data yet.'}
      </div>
    );
    /* jshint ignore:end */
  },

  renderChart: function() {
    if (this.state.chartType === 'weekly') {
      /* jshint ignore:start */
      return (
        <div>Weekly chart</div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <ChartDaily
        patientData={this.props.patientData}
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        imagesEndpoint={config.IMAGES_ENDPOINT + '/tideline'}
        ref="chart" />
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

    this.setState({chartType: 'weekly'});
  },

  handleGoToMostRecentDaily: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.chartType === 'daily') {
      this.refs.chart.locate();
      return;
    }

    this.setState({chartType: 'daily'});
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
  }
});

module.exports = PatientData;