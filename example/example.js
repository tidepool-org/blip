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
    var that = this;
    function getChart(state) {
      window.data = state.chartData;
      switch (state.chartType) {
        case 'daily':
          /* jshint ignore:start */
          return (
            <Daily 
              patientData={state.chartData}
              chartPrefs={state.chartPrefs}
              initialDatetimeLocation={state.initialDatetimeLocation}
              switchToDaily={that.handleSwitchToDaily}
              switchToSettings={that.handleSwitchToSettings}
              switchToWeekly={that.handleSwitchToWeekly} />
            );
          /* jshint ignore:end */
        case 'weekly':
          /* jshint ignore:start */
          return (
            <Weekly 
              patientData={state.chartData}
              chartPrefs={state.chartPrefs}
              initialDatetimeLocation={state.initialDatetimeLocation}
              switchToDaily={that.handleSwitchToDaily}
              switchToSettings={that.handleSwitchToSettings}
              switchToWeekly={that.handleSwitchToWeekly} />
            );
          /* jshint ignore:end */
        case 'settings':
          /* jshint ignore:start */
          return (
            <Settings 
              patientData={state.chartData}
              chartPrefs={state.chartPrefs}
              switchToDaily={that.handleSwitchToDaily}
              switchToSettings={that.handleSwitchToSettings}
              switchToWeekly={that.handleSwitchToWeekly} />
            );
          /* jshint ignore:end */
      }
    }
    var chart = getChart(this.state);
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