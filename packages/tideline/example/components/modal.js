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
var crossfilter = require('crossfilter2');
var d3 = window.d3;
var moment = require('moment-timezone');
var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');

var dt = require('../../js/data/util/datetime');

var Header = require('./header');
var SubNav = require('./modalsubnav');
require('../less/modalsubnav.less');
var Footer = require('./footer');

var modalPlugin = require('../../plugins/blip').modalday;
var brush = modalPlugin.brush;
var modalDay = modalPlugin.modalDay;
var MMMM_D_FORMAT = require('../../js/data/util/constants');

var Modal = createReactClass({
  displayName: 'Modal',
  chartType: 'modal',
  log: bows('Modal Day'),

  propTypes: {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToModal: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToWeekly: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    updateDatetimeLocation: PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      title: '',
      visibleDays: 0
    };
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          atMostRecent={null}
          inTransition={null}
          title={this.state.title}
          onClickModal={this.handleClickModal}
          onClickOneDay={this.handleClickDaily}
          onClickTwoWeeks={this.handleClickWeekly}
          onClickSettings={this.handleClickSettings}
        ref="header" />
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
        <div id="tidelineOuterContainer" className="modal">
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
            timePrefs={this.props.chartPrefs.timePrefs}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onSelectDay={this.handleSelectDay}
            ref="chart" />
        </div>
        <Footer
         chartType={this.chartType}
         onClickBoxOverlay={this.toggleBoxOverlay}
         onClickGroup={this.toggleGroup}
         onClickLines={this.toggleLines}
         boxOverlay={this.props.chartPrefs.modal.boxOverlay}
         grouped={this.props.chartPrefs.modal.grouped}
         showingLines={this.props.chartPrefs.modal.showingLines}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },

  formatDate: function(datetime) {
    var timePrefs = this.props.chartPrefs.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return moment.utc(datetime).tz(timezone).format(MMMM_D_FORMAT);
  },

  getTitle: function(datetimeLocationEndpoints) {
    // endpoint is exclusive, so need to subtract a day
    var end = d3.time.day.utc.offset(new Date(datetimeLocationEndpoints[1]), -1);
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  },

  getNewDomain: function(current, extent) {
    var timePrefs = this.props.chartPrefs.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    current = moment(current).tz(timezone).startOf('day').add(1, 'days');
    return [d3.time.day.utc.offset(current, -extent), current];
  },

  updateVisibleDays: function() {
    this.setState({
      visibleDays: d3.select('#modalDays').selectAll('g.modalDay').size()
    });
  },

  // handlers
  handleClickDaily: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToDaily(datetime);
  },

  handleClickModal: function() {
    // when you're on modal view, clicking modal does nothing
    return;
  },

  handleClickOneWeek: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '1 week';
    prefs.modal.extentSize = 7;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 7);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },

  handleClickTwoWeeks: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '2 weeks';
    prefs.modal.extentSize = 14;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 14);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },

  handleClickFourWeeks: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.activeDomain = '4 weeks';
    prefs.modal.extentSize = 28;
    var current = new Date(this.refs.chart.getCurrentDay());
    var newDomain = this.getNewDomain(current, 28);
    this.refs.chart.setExtent(newDomain);
    this.handleDatetimeLocationChange(newDomain, prefs);
  },

  handleClickWeekly: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToWeekly(datetime);
  },

  handleClickSettings: function() {
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

  toggleBoxOverlay: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.boxOverlay = prefs.modal.boxOverlay ? false : true;
    this.props.updateChartPrefs(prefs);
  },

  toggleGroup: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.grouped = prefs.modal.grouped ? false : true;
    this.props.updateChartPrefs(prefs);
  },

  toggleLines: function() {
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
  },
});

var ModalChart = createReactClass({
  displayName: 'ModalChart',
  chartOpts: ['bgClasses', 'bgUnits', 'boxOverlay', 'grouped', 'showingLines'],
  log: bows('Modal Chart'),

  propTypes: {
    activeDays: PropTypes.object.isRequired,
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    extentSize: PropTypes.number.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
    boxOverlay: PropTypes.bool.isRequired,
    grouped: PropTypes.bool.isRequired,
    showingLines: PropTypes.bool.isRequired,
    timePrefs: PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onSelectDay: PropTypes.func.isRequired
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
    this.dataByDate.filter(this.getInitialExtent(domain));
    this.setState({
      bgDomain: d3.extent(this.allData, function(d) { return d.value; }),
      dateDomain: domain
    });
    console.timeEnd('Modal Pre-Mount');
  },

  componentDidMount: function() {
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
    this.brush.emitter.emit('brushed', extent);
    this.brush.render(this.allData);
    this.bindEvents(); // Must be the last action in component did mount due to cascade of calls that results
    // in action being triggered that relies upon refs being set.
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
        // not quite sure why I half to reduce the extent by one here...
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
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="no-scroll"></div>
      );
    /* jshint ignore:end */
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

    var extentSize = this.props.extentSize;
    var extentBasis = this.props.initialDatetimeLocation || domain[1];
    // startOf('day') followed by add(1, 'days') is equivalent to d3's d3.time.day.ceil
    // but we can't use that when dealing with arbitrary timezones :(
    extentBasis = moment.utc(extentBasis).tz(timezone).startOf('day').add(1, 'days');
    var start = d3.time.day.utc.offset(extentBasis, -extentSize);
    if (start.toISOString() < domain[0]) {
      start = moment.utc(domain[0]).tz(timezone).startOf('day');
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
  },
});

module.exports = Modal;
