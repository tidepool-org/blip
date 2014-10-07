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
var moment = require('moment');
var React = require('react');

var Header = require('./header');
var Footer = require('./footer');

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
      activeDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      bgType: 'smbg',
      title: '',
      showingLines: true
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
            activeDays={this.state.activeDays}
            bgClasses={this.props.bgPrefs.bgClasses}
            bgType={this.state.bgType}
            bgUnits={this.props.bgPrefs.bgUnits}
            patientData={this.props.patientData.data}
            showingLines={this.state.showingLines}
            ref="chart" />
        </div>
        <Footer
         activeDays={this.state.activeDays} 
         chartType={this.chartType}
         onClickDay={this.toggleDay}
         onClickLines={this.toggleLines}
         showingLines={this.state.showingLines}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  // handlers
  handleClickModal: function() {
    // when you're on modal view, clicking modal does nothing
    return;
  },
  handleClickOneDay: function() {
    this.props.onSwitchToDaily();
  },
  handleClickTwoWeeks: function() {
    this.props.onSwitchToWeekly();
  },
  handleClickSettings: function() {
    this.props.onSwitchToSettings();
  },
  toggleLines: function() {
    var linesShowing = this.state.showingLines;
    this.setState({
      showingLines: !linesShowing
    });
  },
  toggleDay: function(day) {
    var self = this;
    return function() {
      var activeDays = self.state.activeDays;
      activeDays[day] = activeDays[day] ? false : true;
      self.setState({
        activeDays: activeDays
      });
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
    patientData: React.PropTypes.array.isRequired,
    showingLines: React.PropTypes.bool.isRequired
  },
  componentWillMount: function() {
    console.time('Modal Mount');
    this.filterData = crossfilter(this.props.patientData);
    this.dataByDate = this.filterData.dimension(function(d) { return d.normalTime; });
    this.dataByType = this.filterData.dimension(function(d) { return d.type; });
    this.dataByDayOfWeek = this.filterData.dimension(function(d) {
      return moment(d.normalTime).utc().format('dddd').toLowerCase();
    });
    var activeDays = this.props.activeDays;
    this.dataByType.filter(this.props.bgType);
    this.dataByDayOfWeek.filterFunction(function(d) {
      return activeDays[d];
    });
    var bgData = _.groupBy(this.dataByDayOfWeek.top(Infinity), function(d) {
      return d.normalTime.slice(0,10);
    });
    this.setState({
      bgData: bgData
    });
    console.timeEnd('Modal Mount');
  },
  componentDidMount: function() {
    this.log('Mounting...');
    var el = this.getDOMNode();
    console.time('Modal Draw');
    this.chart = ModalDay.create(el);
    this.chart.render(this.state.bgData, _.pick(this.props, this.chartOpts));
    console.timeEnd('Modal Draw');
  },
  componentWillReceiveProps: function(nextProps) {
    console.time('Modal Update');
    this.clearFilters();
    var activeDays = nextProps.activeDays;
    this.dataByType.filter(nextProps.bgType);
    this.dataByDayOfWeek.filterFunction(function(d) {
      return activeDays[d];
    });
    var bgData = _.groupBy(this.dataByDayOfWeek.top(Infinity), function(d) {
      return d.normalTime.slice(0,10);
    });
    this.setState({
      bgData: bgData
    });
  },
  componentDidUpdate: function() {
    this.log('Updating...');
    this.chart.render(this.state.bgData, _.pick(this.props, this.chartOpts));
    console.timeEnd('Modal Update');
  },
  componentWillUnmount: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer"></div>
      );
    /* jshint ignore:end */
  },
  clearFilters: function() {
    this.dataByDate.filterAll();
    this.dataByType.filterAll();
    this.dataByDayOfWeek.filterAll();
  }
});

module.exports = Modal;