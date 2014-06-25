/** @jsx React.DOM */
var _ = window._;
var bows = window.bows;
var moment = window.moment;
var React = window.React;

// tideline dependencies & plugins
var tideline = window.tideline = require('../../js/index');
var blip = tideline.blip = require('../../plugins/blip/');
var chartDailyFactory = blip.oneday;

var Header = require('./header');
var Footer = require('./footer');

var Daily = React.createClass({
  chartType: 'daily',
  log: bows('One-Day View'),
  propTypes: {
    patientData: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    switchToDaily: React.PropTypes.func.isRequired,
    switchToSettings: React.PropTypes.func.isRequired,
    switchToWeekly: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      hiddenPools: {
        basalSettings: true
      }
    };
  },
  render: function() {
    this.log('Rendering...');
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <Header 
          chartType={this.chartType}
          onClickBack={this.handlePanBack}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div id="tidelineOuterContainer">
          <DailyChart
            bgUnits={this.props.chartPrefs.bgUnits}
            hiddenPools={this.state.hiddenPools}
            imagesBaseUrl={this.props.imagesBaseUrl}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onHideBasalSettings={this.handleHideBasalSettings}
            onMostRecent={this.handleMostRecent}
            onShowBasalSettings={this.handleShowBasalSettings}
            onTransition={this.handleInTransition}
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
    this.refs.chart.goToMostRecent();
  },
  handleClickOneDay: function() {
    return;
  },
  handleClickTwoWeeks: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.switchToWeekly(datetime);
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    console.log('Datetime location changed!');
    var title = moment(datetimeLocationEndpoints[1]).utc().format('dddd, MMMM Do');
    this.refs.header.updateTitle(title);
  },
  handleHideBasalSettings: function() {
    this.setState({
      hiddenPools: {
        basalSettings: true
      }
    });
    var chartOpts = {imagesBaseUrl: this.props.imagesBaseUrl};
    _.assign(chartOpts, this.state, this.props.chartPrefs);
    var chart = this.refs.chart;
    chart.unmountChart();
    chart.mountChart(chart.getDOMNode(), chartOpts);
    chart.initializeChart(this.props.patientData, chart.state.datetimeLocation);
  },
  handleInTransition: function(inTransition) {
    this.refs.header.arrowsInTransition(inTransition);
  },
  handleMostRecent: function(mostRecent) {
    this.refs.header.updateMostRecent(mostRecent);
  },
  handlePanBack: function() {
    this.refs.chart.panBack();
  },
  handlePanForward: function() {
    this.refs.chart.panForward();
  },
  handleShowBasalSettings: function() {
    this.setState({
      hiddenPools: {
        basalSettings: false
      }
    });
    var chartOpts = {imagesBaseUrl: this.props.imagesBaseUrl};
    _.assign(chartOpts, this.state, this.props.chartPrefs);
    var chart = this.refs.chart;
    chart.unmountChart();
    chart.mountChart(chart.getDOMNode(), chartOpts);
    chart.initializeChart(this.props.patientData, chart.state.datetimeLocation);
  }
});

var DailyChart = React.createClass({
  chartOpts: ['bgUnits', 'hiddenPools'],
  log: bows('Daily Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    hiddenPools: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onHideBasalSettings: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onShowBasalSettings: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired
  },
  componentDidMount: function() {
    this.mountChart(this.getDOMNode());
    this.initializeChart(this.props.patientData, this.props.initialDatetimeLocation);
  },
  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    chartOpts = chartOpts || {imagesBaseUrl: this.props.imagesBaseUrl};
    this.chart = chartDailyFactory(node, _.assign(chartOpts, _.pick(this.props, this.chartOpts)))
      .setupPools();
    this.bindEvents();
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  bindEvents: function() {
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('hideBasalSettings', this.props.onHideBasalSettings);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('showBasalSettings', this.props.onShowBasalSettings);
  },
  initializeChart: function(data, datetimeLocation) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(data);
    if (datetimeLocation) {
      this.chart.locate(datetimeLocation);
    }
    else {
      this.chart.locate();
    }
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  },
  // handlers
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1]
    });
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  },
  getCurrentDay: function() {
    return this.chart.getCurrentDay().toISOString();
  },
  goToMostRecent: function() {
    this.chart.locate();
  },
  panBack: function() {
    this.chart.panBack();
  },
  panForward: function() {
    this.chart.panForward();
  }
});

module.exports = Daily;