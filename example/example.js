/** @jsx React.DOM */
var bows = window.bows;
var React = window.React;

var data = require('./data/device-data.json');

var Daily = require('./components/daily');
var Weekly = require('./components/weekly');
var Settings = require('./components/settings');
// tideline dependencies & plugins
var tideline = window.tideline = require('../js/index');
var preprocess = tideline.preprocess = require('../plugins/data/preprocess/');

var example = {
  log: bows('Example')
};

var Example = React.createClass({
  getInitialState: function() {
    return {
      chartData: preprocess.processData(data),
      chartPrefs: {
        bgUnits: 'mg/dL'
      },
      chartType: 'daily'
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
    window.data = this.state.chartData;
    switch (this.state.chartType) {
      case 'daily':
        /* jshint ignore:start */
        return (
          <Daily 
            patientData={this.state.chartData}
            chartPrefs={this.state.chartPrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            switchToDaily={this.handleSwitchToDaily}
            switchToSettings={this.handleSwitchToSettings}
            switchToWeekly={this.handleSwitchToWeekly} />
          );
        /* jshint ignore:end */
      case 'weekly':
        /* jshint ignore:start */
        return (
          <Weekly 
            patientData={this.state.chartData}
            chartPrefs={this.state.chartPrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            switchToDaily={this.handleSwitchToDaily}
            switchToSettings={this.handleSwitchToSettings}
            switchToWeekly={this.handleSwitchToWeekly} />
          );
        /* jshint ignore:end */
      case 'settings':
        /* jshint ignore:start */
        return (
          <Settings 
            patientData={this.state.chartData}
            chartPrefs={this.state.chartPrefs}
            switchToDaily={this.handleSwitchToDaily}
            switchToSettings={this.handleSwitchToSettings}
            switchToWeekly={this.handleSwitchToWeekly} />
          );
        /* jshint ignore:end */
    }
  },
  // handlers
  handleSwitchToDaily: function(datetime) {
    this.setState({
      chartType: 'daily',
      initialDatetimeLocation: datetime
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
      initialDatetimeLocation: datetime
    });
  }
});

React.renderComponent(
  /* jshint ignore:start */
  <Example />,
  /* jshint ignore:end */
  document.body
);