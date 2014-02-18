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

var chartDailyFactory = require('./chartdailyfactory');

var ChartDaily = React.createClass({
  propTypes: {
    patientData: React.PropTypes.array,
    datetimeLocation: React.PropTypes.string,
    onDatetimeLocationChange: React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string
  },

  chart: null,

  componentDidMount: function() {
    this.mountNewChart();
  },

  componentWillUnmount: function() {
    if (this.chart) {
      this.chart.stopListening().destroy();
    }
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="chart-daily" ref="chart"></div>
    );
    /* jshint ignore:end */
  },

  mountNewChart: function() {
    var el = this.refs.chart.getDOMNode();
    var imagesBaseUrl = this.props.imagesEndpoint;
    var data = this.props.patientData;
    var datetimeLocation = this.props.datetimeLocation;

    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    var chart = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl});
    this.chart = chart;
    this.bindEvents();

    chart.initialize(data);

    if (datetimeLocation) {
      chart.locate(datetimeLocation);
    }
    else {
      chart.locate();
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