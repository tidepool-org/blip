/** @jsx React.DOM */
var _ = window._;
var bows = window.bows;
var React = window.React;

// tideline dependencies & plugins
var tideline = window.tideline = require('../../js/index');
var blip = tideline.blip = require('../../plugins/blip/');
var chartSettingsFactory = blip.settings;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Settings')
};

var Settings = React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    patientData: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    switchToDaily: React.PropTypes.func.isRequired,
    switchToSettings: React.PropTypes.func.isRequired,
    switchToWeekly: React.PropTypes.func.isRequired
  },
  render: function() {
    this.log('Rendering...');
    /* jshint ignore:start */
    return (
      <div id="tidelineMain">
        <Header 
          chartType={this.chartType}
          onClickMostRecent={this.handleClickMostRecent}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div id="tidelineOuterContainer">
          <SettingsChart
            bgUnits={this.props.chartPrefs.bgUnits}
            patientData={this.props.patientData}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
         onClickSettings={this.props.switchToSettings}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  // handlers
  handleClickMostRecent: function() {
    return;
  },
  handleClickOneDay: function() {
    this.props.switchToDaily();
  },
  handleClickTwoWeeks: function() {
    this.props.switchToWeekly();
  }
});

var SettingsChart = React.createClass({
  chartOpts: ['bgUnits'],
  log: bows('Settings Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
  },
  componentDidMount: function() {
    this.mountChart(this.getDOMNode());
    this.initializeChart(this.props.patientData);
  },
  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    this.chart = chartSettingsFactory(node, _.pick(this.props, this.chartOpts));
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  initializeChart: function(data) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(data);
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  }
});

module.exports = Settings;