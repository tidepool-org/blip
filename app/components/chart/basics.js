
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
var React = require('react');
var sundial = require('sundial');

var utils = require('../../core/utils');

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var BasicsChart = tidelineBlip.basics;

var Header = require('./header');
var Footer = require('./footer');

var Basics = React.createClass({
  chartType: 'basics',
  log: bows('Basics View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    permsOfLoggedInUser: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onClickNoDataRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateBasicsData: React.PropTypes.func.isRequired,
    updateBasicsSettings: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: this.getTitle(),
    };
  },

  render: function() {
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickBasics={this.handleClickBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickModal={this.handleClickModal}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.props.onSwitchToSettings}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {this.isMissingBasics() ?
                this.renderMissingBasicsMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
        ref="footer" />
      </div>
      );
  },

  renderChart: function() {
    return (
      <div id="tidelineContainer" className="patient-data-chart-growing">
        <BasicsChart
          bgClasses={this.props.bgPrefs.bgClasses}
          bgUnits={this.props.bgPrefs.bgUnits}
          onSelectDay={this.handleSelectDay}
          patient={this.props.patient}
          patientData={this.props.patientData}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          timePrefs={this.props.timePrefs}
          updateBasicsData={this.props.updateBasicsData}
          updateBasicsSettings={this.props.updateBasicsSettings}
          ref="chart"
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  renderMissingBasicsMessage: function() {
    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Pump Data for Basics');
    };

    return (
      <div className="patient-data-message patient-data-message-loading">
        <p>{'The Basics view shows a summary of your recent device activity, but it looks like you haven\'t uploaded device data yet.'}</p>
        <p>{'To see the Basics, '}
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a>
          {' some device data.'}</p>
        <p>{'If you just uploaded, try '}
          <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>
          {'.'}
        </p>
      </div>
    );
  },

  getTitle: function() {
    if (this.isMissingBasics()) {
      return '';
    }
    var timePrefs = this.props.timePrefs, timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    var basicsData = this.props.patientData.basicsData;
    var dtMask = 'MMM D, YYYY';
    return sundial.formatInTimezone(basicsData.dateRange[0], timezone, dtMask) +
      ' - ' + sundial.formatInTimezone(basicsData.dateRange[1], timezone, dtMask);
  },

  isMissingBasics: function() {
    var basicsData = _.get(this.props, 'patientData.basicsData', {});
    var data;

    if (basicsData.data) {
      data = basicsData.data;
    }
    else {
      return true;
    }

    // require at least one relevant data point to show The Basics
    var basicsDataLength = _.flatten(_.pluck(_.values(data), 'data')).length;
    return basicsDataLength === 0;
  },

  // handlers
  handleClickBasics: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },

  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToModal();
  },

  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  },

  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToWeekly();
  },

  handleSelectDay: function(date, title) {
    this.props.onSwitchToDaily(date, title);
  },
});

module.exports = Basics;
