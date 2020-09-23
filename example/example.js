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

/* jshint esversion:6 */

var _ = require('lodash');
var bows = require('bows');
var React = require('react');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');

var d3 = require('d3');

var Empty = require('./components/empty');
var Daily = require('./components/daily');
var Modal = require('./components/modal');
var Weekly = require('./components/weekly');
var Settings = require('./components/settings');
// tideline dependencies & plugins
var nurseshark = require('../plugins/nurseshark/');
var TidelineData = require('../js/tidelinedata');

var dt = require('../js/data/util/datetime');

var { MGDL_UNITS, MMOLL_UNITS } = require('../js/data/util/constants');

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

var Example = createReactClass({
  displayName: 'Example',
  log: bows('Example'),

  componentDidMount: function() {
    this.fetchData();
  },

  getInitialState: function() {
    return {
      bgPrefs: {
        bgUnits: MGDL_UNITS
        // bgUnits: MMOLL_UNITS
      },
      chartPrefs: {
        modal: {
          activeDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          activeDomain: '2 weeks',
          extentSize: 14,
          boxOverlay: false,
          grouped: false,
          showingLines: true
        },
        timePrefs: {
          // timezoneAware: false,
          timezoneAware: true,
          // timezoneName: 'Pacific/Auckland'
          // timezoneName: 'Europe/Paris'
          // timezoneName: 'US/Eastern'
          timezoneName: 'US/Pacific'
          // timezoneName: 'US/Hawaii'
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
        <div className='vSpace'></div>
          {chart}
        <div className='vSpace'></div>
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
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation} />
          );
        /* jshint ignore:end */
      case 'modal':
        /* jshint ignore:start */
        return (
          <Modal
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.state.chartData}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
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
            onSwitchToModal={this.handleSwitchToModal}
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
            onSwitchToModal={this.handleSwitchToModal}
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
    console.time('Nurseshark Total');
    data = nurseshark.processData(data, this.state.bgPrefs.bgUnits);
    console.timeEnd('Nurseshark Total');
    this.updateData(data.processedData);
  },

  updateData: function(data) {
    console.time('TidelineData Total');
    var tidelineData = new TidelineData(data, {
      bgUnits: this.state.bgPrefs.bgUnits,
      timePrefs: this.state.chartPrefs.timePrefs
    });
    console.timeEnd('TidelineData Total');
    window.tidelineData = tidelineData;
    this.setState({
      chartData: tidelineData,
      bgPrefs: {
        bgClasses: tidelineData.bgClasses,
        bgUnits: this.state.bgPrefs.bgUnits
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

  handleSwitchToModal: function(datetime) {
    this.setState({
      chartType: 'modal',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },

  handleSwitchToSettings: function() {
    this.setState({
      chartType: 'settings'
    });
  },

  handleSwitchToWeekly: function(datetime) {
    datetime = datetime || this.state.datetimeLocation;
    if (this.state.chartPrefs.timePrefs.timezoneAware) {
      datetime = dt.applyOffset(datetime, -dt.getOffset(datetime, this.state.chartPrefs.timePrefs.timezoneName));
    }
    this.setState({
      chartType: 'weekly',
      initialDatetimeLocation: datetime
    });
  },

  updateChartPrefs: function(newChartPrefs) {
    var currentPrefs = _.cloneDeep(this.state.chartPrefs);
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
  },
});

ReactDOM.render(
  /* jshint ignore:start */
  <Example/>,
  /* jshint ignore:end */
  document.getElementById('app')
);
