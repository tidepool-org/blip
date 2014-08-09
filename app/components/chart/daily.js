/** @jsx React.DOM */
var _ = require('lodash');
var bows = require('bows');
var moment = require('moment');
var React = require('react');

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var chartDailyFactory = tidelineBlip.oneday;

var Header = require('./header');
var Footer = require('./footer');

var Daily = React.createClass({
  chartType: 'daily',
  log: bows('Daily View'),
  propTypes: {
    chartPrefs: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    // refresh handler
    onClickRefresh: React.PropTypes.func.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // navigation handlers
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    // PatientData state updaters
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      title: ''
    };
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          inTransition={this.state.inTransition}
          atMostRecent={this.state.atMostRecent}
          title={this.state.title}
          iconBack={'icon-back'}
          iconNext={'icon-next'}
          iconMostRecent={'icon-most-recent'}
          onClickBack={this.handlePanBack}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickSettings={this.props.onSwitchToSettings}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <DailyChart
                bgUnits={this.props.chartPrefs.bgUnits}
                bolusRatio={this.props.chartPrefs.bolusRatio}
                dynamicCarbs={this.props.chartPrefs.dynamicCarbs}
                hiddenPools={this.props.chartPrefs.hiddenPools}
                imagesBaseUrl={this.props.imagesBaseUrl}
                initialDatetimeLocation={this.props.initialDatetimeLocation}
                patientData={this.props.patientData}
                // message handlers
                onCreateMessage={this.props.onCreateMessage}
                onShowMessageThread={this.props.onShowMessageThread}
                // other handlers
                onDatetimeLocationChange={this.handleDatetimeLocationChange}
                onHideBasalSettings={this.handleHideBasalSettings}
                onMostRecent={this.handleMostRecent}
                onShowBasalSettings={this.handleShowBasalSettings}
                onTransition={this.handleInTransition}
                ref="chart" />
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  getTitle: function(datetime) {
    return moment(datetime).utc().format('dddd, MMMM Do');
  },
  // handlers
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.goToMostRecent();
  },
  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToWeekly(datetime);
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints[1])
    });
    this.props.updateDatetimeLocation(datetimeLocationEndpoints[1]);
  },
  handleHideBasalSettings: function() {
    this.props.updateChartPrefs({
      hiddenPools: {
        basalSettings: true
      }
    });
    this.setState({
      hiddenPools: {
        basalSettings: true
      }
    }, this.refs.chart.rerenderChart);
  },
  handleInTransition: function(inTransition) {
    this.setState({
      inTransition: inTransition
    });

  },
  handleMostRecent: function(atMostRecent) {
    this.setState({
      atMostRecent: atMostRecent
    });
  },
  handlePanBack: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panBack();
  },
  handlePanForward: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panForward();
  },
  handleShowBasalSettings: function() {
    this.props.updateChartPrefs({
      hiddenPools: {
        basalSettings: false
      }
    });
    this.setState({
      hiddenPools: {
        basalSettings: false
      }
    }, this.refs.chart.rerenderChart);
  },
  // methods for messages
  closeMessageThread: function() {
    return this.refs.chart.closeMessage();
  },
  createMessageThread: function(message) {
    return this.refs.chart.createMessage(message);
  },
  editMessageThread: function(message) {
    return this.refs.chart.editMessage(message);
  }
});

var DailyChart = React.createClass({
  chartOpts: ['bgUnits', 'dynamicCarbs', 'bolusRatio', 'hiddenPools', 'imagesBaseUrl'],
  log: bows('Daily Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    hiddenPools: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // other handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onHideBasalSettings: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onShowBasalSettings: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      datetimeLocation: null
    };
  },
  componentDidMount: function() {
    this.mountChart();
    this.initializeChart(this.props.initialDatetimeLocation);
  },
  componentWillUnmount: function() {
    this.unmountChart();
  },
  mountChart: function() {
    this.log('Mounting...');
    this.chart = chartDailyFactory(this.getDOMNode(), _.pick(this.props, this.chartOpts))
      .setupPools();
    this.bindEvents();
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  bindEvents: function() {
    this.chart.emitter.on('createMessage', this.props.onCreateMessage);
    this.chart.emitter.on('hideBasalSettings', this.props.onHideBasalSettings);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('messageThread', this.props.onShowMessageThread);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('showBasalSettings', this.props.onShowBasalSettings);
  },
  initializeChart: function(datetime) {
    this.log('Initializing...');
    if (_.isEmpty(this.props.patientData)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(this.props.patientData);
    if (datetime) {
      this.chart.locate(datetime);
    }
    else if (this.state.datetimeLocation != null) {
      this.chart.locate(this.state.datetimeLocation);
    }
    else {
      this.chart.locate();
    }
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="patient-data-chart"></div>
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
  rerenderChart: function() {
    this.unmountChart();
    this.mountChart();
    this.initializeChart();
  },
  getCurrentDay: function() {
    return this.chart.getCurrentDay().toISOString();
  },
  goToMostRecent: function() {
    this.chart.setAtDate(null, true);
  },
  panBack: function() {
    this.chart.panBack();
  },
  panForward: function() {
    this.chart.panForward();
  },
  // methods for messages
  closeMessage: function() {
    return this.chart.closeMessage();
  },
  createMessage: function(message) {
    return this.chart.createMessage(message);
  },
  editMessage: function(message) {
    return this.chart.editMessage(message);
  }
});

module.exports = Daily;
