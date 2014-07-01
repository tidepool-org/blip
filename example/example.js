/** @jsx React.DOM */
var _ = window._;
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
  log: bows('Example'),
  propTypes: {
    chartData: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired
  },
  getDefaultProps: function() {
    return {
      chartData: preprocess.processData(data),
      imagesBaseUrl: 'img'
    };
  },
  getInitialState: function() {
    return {
      chartPrefs: {
        bgUnits: 'mg/dL',
        hiddenPools: {
          basalSettings: true
        }
      },
      datetimeLocation: null,
      initialDatetimeLocation: null,
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
            chartPrefs={this.state.chartPrefs}
            imagesBaseUrl={this.props.imagesBaseUrl}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.props.chartData}
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
            chartPrefs={this.state.chartPrefs}
            imagesBaseUrl={this.props.imagesBaseUrl}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.props.chartData}
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
            chartPrefs={this.state.chartPrefs}
            patientData={this.props.chartData}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly} />
          );
        /* jshint ignore:end */
    }
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
  <Example />,
  /* jshint ignore:end */
  document.body
);
