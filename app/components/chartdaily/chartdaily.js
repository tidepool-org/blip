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

var chartDailyFactory = require('./chartdailyfactory');

var ChartDaily = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    datetimeLocation: React.PropTypes.string,
    onDatetimeLocationChange: React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string
  },

  log: bows('Chart Daily'),

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

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="chart-daily" ref="chart"></div>
    );
    /* jshint ignore:end */
  },

  mountChart: function() {
    this.log('Mounting chart');

    var el = this.refs.chart.getDOMNode();
    var imagesBaseUrl = this.props.imagesEndpoint;

    var chart = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl});
    this.chart = chart;
    this.bindEvents();
  },

  initializeChart: function(data, datetimeLocation) {
    var chart = this.chart;

    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    chart.initialize(data);

    if (datetimeLocation) {
      chart.locate(datetimeLocation);
    }
    else {
      chart.locate();
    }
  },

  unmountChart: function() {
    if (this.chart) {
      this.log('Unmounting chart');
      this.chart.stopListening().destroy();
    }
  },

  bindEvents: function() {
    if (this.props.onDatetimeLocationChange) {
      this.chart.emitter.on('navigated', this.props.onDatetimeLocationChange);
    }
  },

  locate: function(datetime) {
    if (!datetime) {
      return this.chart.locate();
    }

    return this.chart.locate(datetime);
  },

  locateToMostRecent: function() {
    // At the moment, can't just call `chart.locate()` (buggy)
    // Need to re-render completely, which is a bit inefficient,
    // but that might change in the future
    var data = this.props.patientData;
    this.unmountChart();
    this.mountChart();
    this.initializeChart(data);
  },

  panForward: function() {
    return this.chart.panForward();
  },

  panBack: function() {
    return this.chart.panBack();
  },

  getCurrentDay: function() {
    return this.chart.getCurrentDay();
  }
});

module.exports = ChartDaily;