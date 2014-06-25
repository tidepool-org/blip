/** @jsx React.DOM */
var _ = window._;
var bows = window.bows;
var moment = window.moment;
var React = window.React;

// tideline dependencies & plugins
var tideline = window.tideline = require('../../js/index');
var blip = tideline.blip = require('../../plugins/blip/');
var chartWeeklyFactory = blip.twoweek;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Two Weeks')
};

var TwoWeeks = React.createClass({
  chartType: 'weekly',
  log: bows('Two-Week View'),
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
      showingValues: false
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
          <WeeklyChart
            bgUnits={this.props.chartPrefs.bgUnits}
            imagesBaseUrl={this.props.imagesBaseUrl}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onMostRecent={this.handleMostRecent}
            onClickValues={this.toggleValues}
            onSelectSMBG={this.handleSelectSMBG}
            onTransition={this.handleInTransition}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
         onClickSettings={this.props.switchToSettings}
         onClickValues={this.toggleValues}
         showingValues={this.state.showingValues}
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
    var datetime = this.refs.chart.getCurrentDay();
    this.props.switchToDaily(datetime);
  },
  handleClickTwoWeeks: function() {
    return;
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    function formatDate(datetime) {
      return moment(datetime).utc().format('MMMM Do');
    }
    var title = formatDate(datetimeLocationEndpoints[0]) + ' - ' + formatDate(datetimeLocationEndpoints[1]);
    this.refs.header.updateTitle(title);
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
  handleSelectSMBG: function(datetime) {
    this.props.switchToDaily(datetime);
  },
  toggleValues: function() {
    if (this.state.showingValues) {
      this.refs.chart.hideValues();
    }
    else {
      this.refs.chart.showValues();
    }
    this.setState({showingValues: !this.state.showingValues});
  }
});

var WeeklyChart = React.createClass({
  chartOpts: ['bgUnits'],
  log: bows('Weekly Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onClickValues: React.PropTypes.func.isRequired,
    onSelectSMBG: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired
  },
  componentDidMount: function() {
    this.mountChart(this.getDOMNode());
    this.initializeChart(this.props.patientData, this.props.initialDatetimeLocation);
  },
  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    chartOpts = chartOpts || {imagesBaseUrl: this.props.imagesBaseUrl};
    this.chart = chartWeeklyFactory(node, _.assign(chartOpts, _.pick(this.props, this.chartOpts)));
    this.bindEvents();
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  bindEvents: function() {
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('selectSMBG', this.props.onSelectSMBG);
  },
  initializeChart: function(data, datetimeLocation) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    if (datetimeLocation) {
      this.chart.load(data, datetimeLocation);
    }
    else {
      this.chart.load(data);
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
    this.chart.clear();
    this.bindEvents();
    this.chart.load(this.props.patientData);
  },
  hideValues: function() {
    this.chart.hideValues();
  },
  panBack: function() {
    this.chart.panBack();
  },
  panForward: function() {
    this.chart.panForward();
  },
  showValues: function() {
    this.chart.showValues();
  }
});

module.exports = TwoWeeks;