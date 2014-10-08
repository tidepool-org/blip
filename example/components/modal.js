/** @jsx React.DOM */
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
var moment = require('moment');
var React = require('react');

var Header = require('./header');
var Footer = require('./footer');

var Brush = require('../modalday/Brush');
var SMBGMean = require('../modalday/brushopts/SMBGMean');
var SMBGMeanHeat = require('../modalday/brushopts/SMBGMeanHeat');
var ModalDay = require('../modalday/ModalDay');
require('../modalday/modalday.less');

var Modal = React.createClass({
  chartType: 'modal',
  log: bows('Modal Day'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToModal: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      title: ''
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
          onClickOneDay={this.handleClickOneDay}
          onClickTwoWeeks={this.handleClickTwoWeeks}
          onClickSettings={this.handleClickSettings}
        ref="header" />
        <div id="tidelineOuterContainer">
          <ModalChart
            activeDays={this.props.chartPrefs.modal.activeDays}
            bgClasses={this.props.bgPrefs.bgClasses}
            bgType={this.props.chartPrefs.modal.bgType}
            bgUnits={this.props.bgPrefs.bgUnits}
            extentSize={this.props.chartPrefs.modal.extentSize}
            initialDatetimeLocation={this.props.initialDatetimeLocation}
            patientData={this.props.patientData.data}
            showingLines={this.props.chartPrefs.modal.showingLines}
            // handlers
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            onSelectDay={this.handleSelectDay}
            ref="chart" />
        </div>
        <Footer
         activeDays={this.props.chartPrefs.modal.activeDays} 
         chartType={this.chartType}
         onClickDay={this.toggleDay}
         onClickLines={this.toggleLines}
         showingLines={this.props.chartPrefs.modal.showingLines}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  formatDate: function(datetime) {
    return moment(datetime).utc().format('MMMM Do');
  },
  getTitle: function(datetimeLocationEndpoints) {
    // endpoint is exclusive, so need to subtract a day
    var end = d3.time.day.utc.offset(datetimeLocationEndpoints[1], -1);
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  },
  // handlers
  handleClickModal: function() {
    // when you're on modal view, clicking modal does nothing
    return;
  },
  handleClickOneDay: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToDaily(datetime);
  },
  handleClickTwoWeeks: function() {
    var datetime = this.refs.chart.getCurrentDay();
    this.props.onSwitchToWeekly(datetime);
  },
  handleClickSettings: function() {
    this.props.onSwitchToSettings();
  },
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    if (this.isMounted()) {
      this.setState({
        title: this.getTitle(datetimeLocationEndpoints)
      });
      var prefs = _.cloneDeep(this.props.chartPrefs);
      prefs.modal.extentSize = (Date.parse(datetimeLocationEndpoints[1]) - Date.parse(datetimeLocationEndpoints[0]))/864e5;
      this.props.updateChartPrefs(prefs);
      this.props.updateDatetimeLocation(this.refs.chart.getCurrentDay());
    }
  },
  handleSelectDay: function(date) {
    this.props.onSwitchToDaily(date + 'T12:00:00.000Z');
  },
  toggleLines: function() {
    var prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.modal.showingLines = prefs.modal.showingLines ? false : true;
    this.props.updateChartPrefs(prefs);
  },
  toggleDay: function(day) {
    var self = this;
    return function() {
      var prefs = _.cloneDeep(self.props.chartPrefs);
      prefs.modal.activeDays[day] = prefs.modal.activeDays[day] ? false : true;
      self.props.updateChartPrefs(prefs);
    };
  }
});

var ModalChart = React.createClass({
  chartOpts: ['bgClasses', 'bgUnits', 'showingLines'],
  log: bows('Modal Chart'),
  propTypes: {
    activeDays: React.PropTypes.object.isRequired,
    bgClasses: React.PropTypes.object.isRequired,
    bgType: React.PropTypes.string.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    extentSize: React.PropTypes.number.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.array.isRequired,
    showingLines: React.PropTypes.bool.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onSelectDay: React.PropTypes.func.isRequired
  },
  componentWillMount: function() {
    console.time('Modal Mount');
    this.filterData = crossfilter(this.props.patientData);
    this.dataByDate = this.filterData.dimension(function(d) { return new Date(d.normalTime); });
    this.dataByType = this.filterData.dimension(function(d) { return d.type; });
    this.dataByDayOfWeek = this.filterData.dimension(function(d) {
      return moment(d.normalTime).utc().format('dddd').toLowerCase();
    });
    this.dataByType.filter(this.props.bgType);
    this.allData = this.dataByType.top(Infinity);
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
    console.timeEnd('Modal Mount');
  },
  componentDidMount: function() {
    this.log('Mounting...');
    var el = this.getDOMNode();
    console.time('Modal Draw');
    this.chart = ModalDay.create(el, {bgDomain: this.state.bgDomain, clampTop: true});
    this.chart.render(this.dataByDate.top(Infinity), _.pick(this.props, this.chartOpts));
    var domain = this.state.dateDomain;
    var extent = this.getInitialExtent(domain);
    this.brush = Brush.create(el, domain, {
      initialExtent: extent
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
    // refilter by type if necessary
    if (this.props.bgType !== nextProps.bgType) {
      this.dataByType.filter(nextProps.bgType); 
    }
  },
  componentDidUpdate: function() {
    this.chart.render(this.dataByDate.top(Infinity), _.pick(this.props, this.chartOpts));
  },
  componentWillUnmount: function() {
    this.log('Unmounting...');
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
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  },
  getCurrentDay: function() {
    return this.brush.getCurrentDay().toISOString();
  },
  getInitialExtent: function(domain) {
    var extentSize = this.props.extentSize;
    var extentBasis = this.props.initialDatetimeLocation || domain[1];
    var start = d3.time.day.utc.offset(d3.time.day.utc.ceil(new Date(extentBasis)), -extentSize);
    if (start.toISOString() < domain[0]) {
      start = d3.time.day.utc.floor(new Date(domain[0]));
    }
    return [
      start,
      d3.time.day.utc.ceil(new Date(extentBasis))
    ];
  },
  // handlers
  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    this.dataByDate.filter(datetimeLocationEndpoints);
    this.chart.render(this.dataByDate.top(Infinity), _.pick(this.props, this.chartOpts));
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  }
});

module.exports = Modal;