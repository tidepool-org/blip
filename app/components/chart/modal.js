
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
var crossfilter = require('crossfilter');
var d3 = window.d3;
var React = require('react');
var ReactDOM = require('react-dom');
var sundial = require('sundial');

var Header = require('./header');
var SubNav = require('./modalsubnav');
var Footer = require('./footer');

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var brush = tidelineBlip.modalday.brush;
var modalDay = tidelineBlip.modalday.modalDay;

var ModalChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits', 'boxOverlay', 'grouped', 'showingLines'],
  log: bows('Modal Chart'),
  propTypes: {
    activeDays: React.PropTypes.object.isRequired,
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    extentSize: React.PropTypes.number.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    boxOverlay: React.PropTypes.bool.isRequired,
    grouped: React.PropTypes.bool.isRequired,
    showingLines: React.PropTypes.bool.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onSelectDay: React.PropTypes.func.isRequired
  },
  componentWillMount: function() {
    console.time('Modal Pre-Mount');
    var timezone;
    if (!this.props.timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = this.props.timePrefs.timezoneName || 'UTC';
    }
    var data = this.props.patientData;
    this.filterData = data.filterData;
    this.dataByDate = data.smbgByDate.filterAll();
    this.dataByDayOfWeek = data.smbgByDayOfWeek.filterAll();
    this.allData = this.dataByDate.top(Infinity);
    var activeDays = this.props.activeDays;
    this.dataByDayOfWeek.filterFunction(function(d) {
      return activeDays[d];
    });
    var domain = d3.extent(this.allData, function(d) { return d.normalTime; });
    // extend the domain to 28 days if existing data is less than that
    if (Math.floor((Date.parse(domain[1]) - Date.parse(domain[0]))/864e5) < 28) {
      domain[0] = d3.time.day.utc.offset(Date.parse(domain[1]), -28).toISOString();
    }
    this.dataByDate.filter(this.getInitialExtent(domain));
    this.setState({
      bgDomain: d3.extent(this.allData, function(d) { return d.value; }),
      dateDomain: domain
    });
    console.timeEnd('Modal Pre-Mount');
  },
  mount: function() {
    this.log('Mounting...');
    var el = ReactDOM.findDOMNode(this);
    var timezone;
    if (!this.props.timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = this.props.timePrefs.timezoneName || 'UTC';
    }
    this.chart = modalDay.create(el, {
      bgClasses: this.props.bgClasses,
      bgDomain: this.state.bgDomain,
      bgUnits: this.props.bgUnits,
      clampTop: true,
      timezone: timezone
    });
    console.time('Modal Draw');
    this.chart.render(this.dataByDate.top(Infinity), _.pick(this.props, this.chartOpts));
    var domain = this.state.dateDomain;
    var extent = this.getInitialExtent(domain);
    this.brush = brush.create(document.getElementById('modalScroll'), domain, {
      initialExtent: extent,
      timezone: timezone
    });
    this.bindEvents();
    this.brush.emitter.emit('brushed', extent);
    this.brush.render(this.allData);
    console.timeEnd('Modal Draw');
  },
  componentWillReceiveProps: function(nextProps) {
    // refilter by active days if necessary
    var activeDays = nextProps.activeDays;
    if (!_.isEqual(this.props.activeDays, activeDays)) {
      this.dataByDayOfWeek.filterFunction(function(d) {
        return activeDays[d];
      });
    }
    // refilter by time if necessary
    if (this.props.extentSize !== nextProps.extentSize) {
      var current = this.getCurrentDay();
      this.dataByDate.filter([
        // not quite sure why I have to reduce the extent by one here...
        d3.time.day.utc.offset(new Date(current), -(nextProps.extentSize - 1)).toISOString(),
        current
      ]);
    }
  },
  componentDidUpdate: function() {
    var data = this.dataByDate.top(Infinity).reverse();
    this.chart.render(data, _.pick(this.props, this.chartOpts));
  },
  componentWillUnmount: function() {
    this.log('Unmounting...');
    this.clearAllFilters();
    this.chart.destroy();
    this.brush.destroy();
  },
  bindEvents: function() {
    this.brush.emitter.on('brushed', this.handleDatetimeLocationChange);
    this.chart.emitter.on('selectDay', this.props.onSelectDay);
  },
  render: function() {
    
    return (
      <div id="tidelineContainer" className="patient-data-chart-modal"></div>
      );
    
  },
  clearAllFilters: function() {
    this.dataByDate.filterAll();
    this.dataByDayOfWeek.filterAll();
  },
  getCurrentDay: function() {
    return this.brush.getCurrentDay().toISOString();
  },
  getInitialExtent: function(domain) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }

    var extentSize = this.props.extentSize, extentBasis;
    // only use passed in initialDatetimeLocation as extentBasis if it doesn't
    // go past the domain of available smbg data
    if (this.props.initialDatetimeLocation && this.props.initialDatetimeLocation < domain[1]) {
      extentBasis = this.props.initialDatetimeLocation;
    }
    else {
      extentBasis = domain[1];
    }
    // startOf('day') followed by add(1, 'days') is equivalent to d3's d3.time.day.ceil
    // but we can't use that when dealing with arbitrary timezones :(
    extentBasis = sundial.ceil(extentBasis, 'day', timezone);
    var start = d3.time.day.utc.offset(extentBasis, -extentSize);
    if (start.toISOString() < domain[0]) {
      start = sundial.floor(domain[0], 'day', timezone);
      extentBasis = d3.time.day.utc.offset(start, extentSize);
    }
    return [
      start.toISOString(),
      extentBasis.toISOString()
    ];
  },
  setExtent: function(domain) {
    this.brush.setExtent(domain);
  },
  // handlers
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.dataByDate.filter(datetimeLocationEndpoints);
    this.chart.render(this.dataByDate.top(Infinity), _.pick(this.props, this.chartOpts));
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  }
});

var Modal = React.createClass({
  chartType: 'modal',
  log: bows('Modal Day'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    // refresh handler
    onClickRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToModal: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: '',
      visibleDays: 0
    };
  },
  componentDidMount: function() {
    if (this.refs.chart) {
      this.refs.chart.mount();
    }
  },
  render: function() {
    
    return (
      <div id="tidelineMain">
        {this.isMissingSMBG() ? this.renderMissingSMBGHeader() : this.renderHeader()}
        {this.isMissingSMBG() ? null : this.renderSubNav()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {this.isMissingSMBG() ? this.renderMissingSMBGMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.isMissingSMBG() ? 'no-data' : this.chartType}
         onClickBoxOverlay={this.toggleBoxOverlay}
         onClickGroup={this.toggleGroup}
         onClickLines={this.toggleLines}
         onClickRefresh={this.props.onClickRefresh}
         boxOverlay={this.props.chartPrefs.modal.boxOverlay}
         grouped={this.props.chartPrefs.modal.grouped}
         showingLines={this.props.chartPrefs.modal.showingLines}
        ref="footer" />
      </div>
      );
    
  },
  renderHeader: function() {
    
    return (
      <Header
        chartType={this.chartType}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={this.state.title}
        onClickBasics={this.props.onSwitchToBasics}
        onClickModal={this.handleClickModal}
        onClickOneDay={this.handleClickDaily}
        onClickTwoWeeks={this.handleClickWeekly}
        onClickSettings={this.handleClickSettings}
      ref="header" />
      );
  },
  renderSubNav: function() {
    
    return (
      <SubNav
       activeDays={this.props.chartPrefs.modal.activeDays}
       activeDomain={this.props.chartPrefs.modal.activeDomain}
       extentSize={this.props.chartPrefs.modal.extentSize}
       domainClickHandlers={{
        '1 week': this.handleClickOneWeek,
        '2 weeks': this.handleClickTwoWeeks,
        '4 weeks': this.handleClickFourWeeks
       }}
       onClickDay={this.toggleDay}
       toggleWeekdays={this.toggleWeekdays}
       toggleWeekends={this.toggleWeekends}
       ref="subnav" />
      );
    
  },
  renderChart: function() {
    
    return (
      <ModalChart
        activeDays={this.props.chartPrefs.modal.activeDays}
        bgClasses={this.props.bgPrefs.bgClasses}
        bgUnits={this.props.bgPrefs.bgUnits}
        extentSize={this.props.chartPrefs.modal.extentSize}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        patientData={this.props.patientData}
        boxOverlay={this.props.chartPrefs.modal.boxOverlay}
        grouped={this.props.chartPrefs.modal.grouped}
        showingLines={this.props.chartPrefs.modal.showingLines}
        timePrefs={this.props.timePrefs}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDay={this.handleSelectDay}
        ref="chart" />
      );
    
  },
  renderMissingSMBGHeader: function() {
    
    return (
      <Header
        chartType={this.chartType}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={''}
        onClickOneDay={this.handleClickDaily}
        onClickSettings={this.handleClickSettings}
        onClickTwoWeeks={this.handleClickWeekly}
      ref="header" />
    );
    
  },
  renderMissingSMBGMessage: function() {
    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No SMBG');
    };
    
    return (
      <div className="patient-data-message patient-data-message-loading">
        <p>{'Blip\'s Trends view shows patterns in your finger stick BG data, but it looks like you haven\'t uploaded finger stick data yet.'}</p>
        <p>{'To see your finger stick BG patterns, '}
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a>
          {' your pump or BG meter.'}</p>
        <p>{'If you just uploaded, try '}
          <a href="" onClick={this.props.onClickRefresh}>refreshing</a>
          {'.'}
        </p>
      </div>
    );
    
  },
  formatDate: function(datetime) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return sundial.formatInTimezone(datetime, timezone, 'MMM D, YYYY');
  },
  getTitle: function(datetimeLocationEndpoints) {
    // endpoint is exclusive, so need to subtract a day
    var end = d3.time.day.utc.offset(new Date(datetimeLocationEndpoints[1]), -1);
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  },
  getNewDomain: function(current, extent) {
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    current = sundial.ceil(current, 'day', timezone);
    return [d3.time.day.utc.offset(current, -extent), current];
  },
  isMissingSMBG: function() {
    var data = this.props.patientData;
    if (_.isEmpty(data.grouped) || _.isEmpty(data.grouped.smbg)) {
      return true;
    }
    return false;
  },
  updateVisibleDays: function() {
    this.setState({
      visibleDays: d3.select('#modalDays').selectAll('g.modalDay').size()
    });
  },
  // handlers
  handleClickDaily: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.refs.chart ? this.refs.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToDaily(datetime);
  },
  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    // when you're on modal view, clicking modal does nothing
    return;
  },
  handleClickOneWeek: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '1 week';
    prefs.modal.extentSize = 7;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 7);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '2 weeks';
    prefs.modal.extentSize = 14;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 14);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },
  handleClickFourWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '4 weeks';
    prefs.modal.extentSize = 28;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 28);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },
  handleClickWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }
    var datetime = this.refs.chart ? this.refs.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToWeekly(datetime);
  },
  handleClickSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToSettings();
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints, prefs) {
    if (this.isMounted()) {
      this.setState({
        title: this.getTitle(datetimeLocationEndpoints)
      });
      prefs = prefs || _.cloneDeep(this.props.chartPrefs);
      prefs.modal.extentSize = (Date.parse(datetimeLocationEndpoints[1]) - Date.parse(datetimeLocationEndpoints[0]))/864e5;
      this.props.updateChartPrefs(prefs);
      this.props.updateDatetimeLocation(this.refs.chart.getCurrentDay());
    }
  },
  handleSelectDay: function(date) {
    this.props.onSwitchToDaily(date);
  },
  toggleDay: function(day) {
    var self = this;
    return function(e) {
      e.stopPropagation();
      var prefs = _.cloneDeep(self.props.chartPrefs);
      prefs.modal.activeDays[day] = prefs.modal.activeDays[day] ? false : true;
      self.props.updateChartPrefs(prefs);
    };
  },
  toggleBoxOverlay: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.boxOverlay = prefs.modal.boxOverlay ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleGroup: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.grouped = prefs.modal.grouped ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleLines: function(e) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.showingLines = prefs.modal.showingLines ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleWeekdays: function(allActive) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDays = {
      'monday': !allActive,
      'tuesday': !allActive,
      'wednesday': !allActive,
      'thursday': !allActive,
      'friday': !allActive,
      'saturday': prefs.modal.activeDays.saturday,
      'sunday': prefs.modal.activeDays.sunday
    };
    this.props.updateChartPrefs(prefs);
  },
  toggleWeekends: function(allActive) {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDays = {
      'monday': prefs.modal.activeDays.monday,
      'tuesday': prefs.modal.activeDays.tuesday,
      'wednesday': prefs.modal.activeDays.wednesday,
      'thursday': prefs.modal.activeDays.thursday,
      'friday': prefs.modal.activeDays.friday,
      'saturday': !allActive,
      'sunday': !allActive
    };
    this.props.updateChartPrefs(prefs);
  }
});

module.exports = Modal;
