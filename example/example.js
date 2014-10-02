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
var React = require('react');
var d3 = require('d3');

var Empty = require('./components/empty');
var Daily = require('./components/daily');
var Weekly = require('./components/weekly');
var Settings = require('./components/settings');
// tideline dependencies & plugins
var nurseshark = require('../plugins/nurseshark/');
var TidelineData = require('../js/tidelinedata');

require('../css/tideline.less');
require('./less/example.less');

var example = {
  log: bows('Example')
};

var dataUrl = process.env.DATA;
if (_.isEmpty(dataUrl)) {
  dataUrl = 'device-data.json';
}
dataUrl = 'data/' + dataUrl;

var Example = React.createClass({
  log: bows('Example'),
  componentDidMount: function() {
    this.fetchData();
  },
  getInitialState: function() {
    return {
      chartPrefs: {
        hiddenPools: {
          basalSettings: true
        }
      },
      datetimeLocation: null,
      initialDatetimeLocation: null,
      chartType: 'empty'
    };
  },
  render: function() {
    var chart = this.renderChart();
    /* jshint ignore:start */
    return (
      <div>
        <div className="vSpace"></div>
          {chart}
        <div className="vSpace"></div>
      </div>
    );
    /* jshint ignore:end */
  },
  renderChart: function() {
    switch (this.state.chartType) {
      case 'empty':
        /* jshint ignore:start */
        return (
          <Empty />
          );
        /* jshint ignore:end */
      case 'daily':
        /* jshint ignore:start */
        return (
          <Daily
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.state.chartData}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation} />
          );
        /* jshint ignore:end */
      case 'weekly':
        /* jshint ignore:start */
        return (
          <Weekly
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.state.chartData}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation} />
          );
        /* jshint ignore:end */
      case 'settings':
        /* jshint ignore:start */
        return (
          <Settings
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            patientData={this.state.chartData}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly} />
          );
        /* jshint ignore:end */
    }
  },
  // fetch & process
  fetchData: function() {
    this.log('Fetching data...');
    d3.json(dataUrl, this.processData);
  },
  processData: function(err, data) {
    this.log('Processing data...');
    if (err) {
      throw new Error('Could not fetch data file at ' + dataUrl);
    }
    // run nurseshark on data that isn't generated demo data
    // i.e., real data exported from current blip
    if (dataUrl !== 'data/device-data.json') {
      console.time('Nurseshark');
      data = nurseshark.processData(data).processedData;
      console.timeEnd('Nurseshark');
    }
    this.updateData(data);
  },
  updateData: function(data) {
    var tidelineData = new TidelineData(data);
    window.tidelineData = tidelineData;
    this.setState({
      chartData: tidelineData,
      bgPrefs: {
        bgClasses: tidelineData.bgClasses,
        bgUnits: tidelineData.bgUnits
      },
      chartType: 'daily'
    });
  },
  // handlers
  handleSwitchToDaily: function(datetime) {
    this.setState({
      chartType: 'daily',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },
  handleSwitchToSettings: function() {
    this.setState({
      chartType: 'settings'
    });
  },
  handleSwitchToWeekly: function(datetime) {
    this.setState({
      chartType: 'weekly',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },
  updateChartPrefs: function(newChartPrefs) {
    var currentPrefs = _.clone(this.state.chartPrefs);
    _.assign(currentPrefs, newChartPrefs);
    this.setState({
      chartPrefs: currentPrefs
    }, function() {
      // this.log('Global example state changed:', JSON.stringify(this.state));
    });
  },
  updateDatetimeLocation: function(datetime) {
    this.setState({
      datetimeLocation: datetime
    }, function() {
      // this.log('Global example state changed:', JSON.stringify(this.state));
    });
  }
});

React.renderComponent(
  /* jshint ignore:start */
  <Example/>,
  /* jshint ignore:end */
  document.body
);
