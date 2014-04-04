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
var bows = window.bows;

var tidelineBlip = window.tideline.blip;
var chartDailyFactory = tidelineBlip.oneday;
var chartWeeklyFactory = tidelineBlip.twoweek;

var Chart = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    emitter: React.PropTypes.object,
    chartType: React.PropTypes.string,
    datetimeLocation: React.PropTypes.string,
    onDatetimeLocationChange: React.PropTypes.func,
    onSelectDataPoint: React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string
  },

  log: bows('Chart'),

  chart: null,

  componentDidMount: function() {
    var data = this.props.patientData;
    var datetimeLocation = this.props.datetimeLocation;

    this.mountChart();
    this.initializeChart(data, datetimeLocation);
  },

  componentWillUnmount: function() {
    this.unmountChart();
  },

  componentDidUpdate: function() {
    if (this.chart.type !== this.props.chartType) {
      this.unmountChart();

      var data = this.props.patientData;
      var datetimeLocation = this.props.datetimeLocation;

      this.mountChart();
      this.initializeChart(data, datetimeLocation);
    }
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="patient-data-chart" ref="chart"></div>
    );
    /* jshint ignore:end */
  },

  mountChart: function() {
    if (!this.chart) {
      this.log('Creating new charts; mounting daily chart.');
      var el = this.refs.chart.getDOMNode();
      var imagesBaseUrl = this.props.imagesEndpoint;

      var dailyChart = chartDailyFactory(this.refs.chart.getDOMNode(), this.props.emitter, {imagesBaseUrl: imagesBaseUrl}).setupPools();
      this.chart = dailyChart;
      this.dailyChart = dailyChart;
      var weeklyChart = chartWeeklyFactory(this.refs.chart.getDOMNode(), this.props.emitter, {imagesBaseUrl: imagesBaseUrl});
      this.weeklyChart = weeklyChart;
      this.bindEvents();
    }
    else {
      if (this.props.chartType === 'daily') {
        this.log('Mounting daily chart.');
        this.chart = this.dailyChart;
        this.bindEvents();
      }
      else if (this.props.chartType === 'weekly') {
        this.log('Mounting weekly chart.');
        this.chart = this.weeklyChart;
        this.bindEvents();
      }
    }
  },

  initializeChart: function(data, datetimeLocation) {
    var chart = this.chart;

    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    chart.show().load(data, datetimeLocation);

    if (this.chart.type === 'daily') {
      if (datetimeLocation) {
        chart.locate(datetimeLocation);
      }
      else {
        chart.locate();
      }
    }
  },

  unmountChart: function() {
    if (this.chart) {
      this.log('Unmounting chart');
      this.chart.clear().hide();
    }
  },

  bindEvents: function() {
    if (this.props.onDatetimeLocationChange) {
      this.chart.emitter.on('navigated', this.props.onDatetimeLocationChange);
    }

    if (this.props.onSelectDataPoint) {
      this.chart.emitter.on('selectSMBG', this.props.onSelectDataPoint);
    }
  },

  show: function() {
    return this.chart.show();
  },

  locate: function(datetime) {
    if (!datetime) {
      return this.chart.locate();
    }

    return this.chart.locate(datetime);
  },

  locateToMostRecent: function() {
    this.log('Navigated to most recent data.');
    var data = this.props.patientData;

    switch (this.chart.type) {
      case 'daily':
        this.chart.clear().locate();
        break;
      case 'weekly':
        this.chart.mostRecent();
        break;
    }
  },

  panForward: function() {
    return this.chart.panForward();
  },

  panBack: function() {
    return this.chart.panBack();
  },

  getCurrentDay: function() {
    return this.chart.getCurrentDay();
  },

  showValues: function() {
    return this.chart.emitter.emit('numbers', 'show');
  },

  hideValues: function() {
    return this.chart.emitter.emit('numbers', 'hide');
  }
});

module.exports = Chart;