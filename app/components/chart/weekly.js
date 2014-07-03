/** @jsx React.DOM */
var _ = window._;
var bows = window.bows;
var moment = window.moment;
var React = window.React;

// tideline dependencies & plugins
var tidelineBlip = window.tideline.blip;
var chartWeeklyFactory = tidelineBlip.twoweek;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Two Weeks')
};

var Weekly = React.createClass({
  chartType: 'weekly',
  log: bows('Weekly View'),
  propTypes: {
    chartPrefs: React.PropTypes.object.isRequired,
    imagesBaseUrl: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false,
      showingValues: false,
      title: ''
    };
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <Header 
          chartType={this.chartType}
          atMostRecent={this.state.atMostRecent}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickBack={this.handlePanBack}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickRefresh={this.props.onClickRefresh}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
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
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickSettings={this.props.onSwitchToSettings}
         onClickValues={this.toggleValues}
         showingValues={this.state.showingValues}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  formatDate: function(datetime) {
    return moment(datetime).utc().format('MMMM Do');
  },
  getTitle: function(datetimeLocationEndpoints) {
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(datetimeLocationEndpoints[1]);
  },
  // handlers
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({showingValues: false});
    this.refs.chart.goToMostRecent();
  },
  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToDaily(datetime);
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints)
    });
    this.props.updateDatetimeLocation(this.refs.chart.getCurrentDay());
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
  handleSelectSMBG: function(datetime) {
    this.props.onSwitchToDaily(datetime);
  },
  toggleValues: function(e) {
    if (e) {
      e.preventDefault();
    }
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
  componentWillUnmount: function() {
    this.unmountChart();
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

module.exports = Weekly;