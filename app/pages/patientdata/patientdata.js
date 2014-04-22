/** @jsx React.DOM */
/**
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
 */

var React = window.React;
var _ = window._;
var moment = window.moment;
var config = window.config;

var utils = require('../../core/utils');
var Chart = require('../../components/chart');
var Messages = require('../../components/messages');

var PatientData = React.createClass({
  propTypes: {
    patientData: React.PropTypes.object,
    patient: React.PropTypes.object,
    fetchingPatientData: React.PropTypes.bool,
    isUserPatient: React.PropTypes.bool,
    uploadUrl: React.PropTypes.string,
    onRefresh: React.PropTypes.func,
    onFetchMessageThread: React.PropTypes.func,
    onSaveComment: React.PropTypes.func,
    onCreateMessage: React.PropTypes.func,
    user: React.PropTypes.object,
    trackMetric: React.PropTypes.func
  },

  DEFAULT_TITLE: 'Data',
  CHARTDAILY_TITLE_DATE_FORMAT: 'dddd, MMMM Do',
  CHARTWEEKLY_TITLE_DATE_FORMAT: 'MMMM Do',

  getDefaultProps: function() {
    return {
      trackMetric: function() {}
    };
  },

  getInitialState: function() {
    return {
      chartType: 'daily',
      title: this.DEFAULT_TITLE,
      datetimeLocation: null,
      showingValuesWeekly: false,
      messages: null,
      createMessage: null
    };
  },

  render: function() {
    var subnav = this.renderSubnav();
    var patientData = this.renderPatientData();
    var footer = this.renderFooter();
    var messages = this.renderMessagesContainer();

    /* jshint ignore:start */
    return (
      <div className="patient-data js-patient-data-page">
        {subnav}
        {messages}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {patientData}
            </div>
          </div>
        </div>
        {footer}
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    var left = null;
    var right = null;
    /* jshint ignore:start */
    center = (
      <div className="patient-data-subnav-text">
        {this.state.title}
      </div>
    );
    /* jshint ignore:end */

    if (!(this.props.fetchingPatientData || this.isEmptyPatientData())) {
      var dailyLinkClass = 'patient-data-subnav-active';
      var weeklyLinkClass = (this.props.patientData.grouped.smbg.length === 0) ? "patient-data-subnav-disabled" : '';
      if (this.state.chartType === 'weekly') {
        dailyLinkClass = null;
        weeklyLinkClass = 'patient-data-subnav-active';
      }
      else if (this.state.chartType === 'settings') {
        dailyLinkClass = null;
        weeklyLinkClass = null;
      }

      /* jshint ignore:start */
      left = (
        <div>
          <div className="grid-item large-three-eighths">
            <a href="" className={dailyLinkClass} onClick={this.handleSwitchToDaily}>One day</a>
          </div>
          <div className="grid-item large-one-half patient-data-subnav-left">
            <a href="" className={weeklyLinkClass} onClick={this.handleSwitchToWeekly}>Two weeks</a>
          </div>
        </div>
      );
      /* jshint ignore:end */

      /* jshint ignore:start */
      center = (
        <div>
          <a href="" onClick={this.handlePanBack} className={(this.state.inTransition || (this.state.chartType === 'settings')) ? "patient-data-subnav-disabled" : ""}>
            <i className="icon-back"></i>
          </a>
          <div className="patient-data-subnav-text patient-data-subnav-text-dates">
            {this.state.title}
          </div>
          <a href="" onClick={this.handlePanForward} className={(this.state.atMostRecent || this.state.inTransition || (this.state.chartType === 'settings')) ? "patient-data-subnav-disabled" : ""}>
            <i className="icon-next"></i>
          </a>
        </div>
      );
      /* jshint ignore:end */

      var self = this;
      var handleClickRefresh = function(e) {
        self.handleRefresh(e);
        self.props.trackMetric('Clicked Chart Refresh', {
          fromChart: self.state.chartType
        });
      };

      /* jshint ignore:start */
      right = (
        <div>
          <div className="grid-item one-whole large-one-half patient-data-subnav-right">
            <a href="" onClick={handleClickRefresh}>Refresh</a>
          </div>
          <div className="grid-item one-whole large-one-half">
            <a href="" onClick={this.handleGoToMostRecent} className={this.state.atMostRecent ? "patient-data-subnav-active" : ""}>Most recent</a>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-quarter">
              {left}
            </div>
            <div className="grid-item one-whole large-one-half patient-data-subnav-center">
              {center}
            </div>
            <div className="grid-item one-whole large-one-quarter">
              {right}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientData: function() {
    if (this.props.fetchingPatientData) {
      return this.renderLoading();
    }

    if (this.isEmptyPatientData()) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  renderLoading: function() {
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-loading">
        Loading data...
      </div>
    );
    /* jshint ignore:end */
  },

  renderNoData: function() {
    var content = 'This patient doesn\'t have any data yet.';

    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked No Data Upload');
    };
    var handleClickRefresh = function(e) {
      self.handleRefresh(e);
      self.props.trackMetric('Clicked No Data Refresh');
    };

    if (this.props.isUserPatient) {
      /* jshint ignore:start */
      content = (
        <div>
          <p>{'It looks like you don\'t have any data yet!'}</p>
          <p>
            <a
              href={this.props.uploadUrl}
              target="_blank"
              onClick={handleClickUpload}>Upload your data</a>
            {' or if you already have, try '}
            <a href="" onClick={handleClickRefresh}>refreshing</a>
            {'.'}
          </p>
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-no-data">
        {content}
      </div>
    );
    /* jshint ignore:end */
  },

  isEmptyPatientData: function() {
    var patientDataLength =
      utils.getIn(this.props.patientData, ['data', 'length'], 0);
    return !Boolean(patientDataLength);
  },

  renderMessagesContainer: function() {
    /* jshint ignore:start */
    if(this.state.createMessageDatetime){
      return (
        <Messages
          createDatetime={this.state.createMessageDatetime}
          user={this.props.user}
          patient={this.props.patient}
          onClose={this.closeMessageCreation}
          onSave={this.props.onCreateMessage}
          onNewMessage={this.handleMessageCreation} />
      );
    }else if(this.state.messages){
      return (
        <Messages
          messages={this.state.messages}
          user={this.props.user}
          patient={this.props.patient}
          onClose={this.closeMessageThread}
          onSave={this.handleReplyToMessage} />
      );
    }
    /* jshint ignore:end */
  },

  closeMessageThread: function(){
    this.setState({ messages: null });
    this.refs.chart.closeMessageThread();
    this.props.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.chart.closeMessageThread();
    this.props.trackMetric('Closed New Message Modal');
  },

  renderChart: function() {
    /* jshint ignore:start */
    return (
      <Chart
        patientData={this.props.patientData}
        chartType={this.state.chartType}
        datetimeLocation={this.state.datetimeLocation}
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDataPoint={this.handleWeeklySelectDataPoint}
        onShowMessageThread={this.handleShowMessageThread}
        onCreateMessage={this.handleShowMessageCreation}
        onTransition={this.handleInTransition}
        onReachedMostRecent={this.handleReachedMostRecent}
        imagesEndpoint={config.IMAGES_ENDPOINT + '/tideline'}
        ref="chart" />
      );
    /* jshint ignore:end */
  },

  renderFooter: function() {
    if (this.props.fetchingPatientData || this.isEmptyPatientData()) {
      return null;
    }

    var settingsLinkClass;
    if (this.state.chartType === 'settings') {
      settingsLinkClass = 'patient-data-subnav-active';
    }
    else {
      settingsLinkClass = (this.props.patientData.grouped.settings.length === 0) ? "patient-data-footer-disabled" : '';
    }

    var left, right;

    /* jshint ignore:start */
    left = (
      <a href="" onClick={this.handleSwitchToSettings} className={settingsLinkClass}>
      Device settings
      </a>
    );
    /* jshint ignore:end */

    if (this.state.chartType === 'weekly') {
      var toggleText = 'Show values';
      if (this.state.showingValuesWeekly) {
        toggleText = 'Hide values';
      }

      /* jshint ignore:start */
      right = (
        <a href="" onClick={this.handleToggleValuesWeekly}>
          {toggleText}
        </a>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-footer-outer">
        <div className="container-box-inner patient-data-footer-inner">
          <div className="grid patient-data-footer">
            <div className="grid-item one-whole medium-one-half patient-data-footer-left">
              {left}
            </div>
            <div className="grid-item one-whole medium-one-half patient-data-footer-right">
              {right}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  handleSwitchToDaily: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.chartType === 'daily') {
      return;
    }

    this.setState({chartType: 'daily'});
    this.props.trackMetric('Clicked Switch To One Day');
  },

  handleSwitchToWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }

    var datetimeLocation;

    if (this.state.chartType === 'weekly') {
      return;
    }
    else if (this.state.chartType === 'daily') {
      datetimeLocation = this.refs.chart.getCurrentDay().toISOString();
    }

    this.setState({
      chartType: 'weekly',
      datetimeLocation: datetimeLocation,
      showingValuesWeekly: false
    });
    this.props.trackMetric('Clicked Switch To Two Week');
  },

  handleSwitchToSettings: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.trackMetric('Clicked Switch To Settings', {
      fromChart: this.state.chartType
    });

    if (this.state.chartType === 'settings') {
      return;
    }

    this.setState({
      chartType: 'settings',
      datetimeLocation: null,
      title: 'Current settings',
      // for now, settings are always at most recent
      atMostRecent: true
    });
  },

  handleGoToMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      datetimeLocation: null
    });
    this.refs.chart.locateToMostRecent();

    this.props.trackMetric('Clicked Go To Most Recent ', {
      fromChart: this.state.chartType
    });
  },

  handleRefresh: function(e) {
    if (e) {
      e.preventDefault();
    }

    var refresh = this.props.onRefresh;
    if (refresh) {
      this.setState({title: this.DEFAULT_TITLE});
      refresh();
    }
  },

  handlePanBack: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this.state.inTransition) {
      this.refs.chart.panBack();
      this.props.trackMetric('Panned Chart', {
        fromChart: this.state.chartType,
        direction: 'back'
      });
    }
  },

  handlePanForward: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this.state.inTransition) {
      this.refs.chart.panForward();
      this.props.trackMetric('Panned Chart', {
        fromChart: this.state.chartType,
        direction: 'forward'
      });
    }
  },

  handleMessageCreation: function(message){
    //Transform to Tideline's own format
    var tidelineMessage = {
        normalTime : message.timestamp,
        messageText : message.messagetext,
        parentMessage : message.parentmessage,
        type: 'message',
        _id: message.id
      };
    this.refs.chart.createMessageThread(tidelineMessage);
    this.props.trackMetric('Created New Message');
  },

  handleReplyToMessage: function(comment, cb) {
    var reply = this.props.onSaveComment;
    if (reply) {
      reply(comment, cb);
    }
    this.props.trackMetric('Replied To Message');
  },

  handleDatetimeLocationChange: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    var title = this.state.title;
    var datetimeLocation = this.state.datetimeLocation;

    if (d && d.length >= 1 && this.state.chartType === 'daily') {
      title = this.getTitleDaily(d);
      datetimeLocation = d[1];
    }
    else if (d && d.length >= 2 && this.state.chartType === 'weekly') {
      title = this.getTitleWeekly(d);
      datetimeLocation = d[1];
    }
    else if (this.state.chartType === 'settings') {
      title = this.getTitleSettings();
      datetimeLocation = null;
    }
    else {
      throw new Error('Expected an array of datetime locations');
    }

    this.setState({
      title: title,
      datetimeLocation: datetimeLocation
    });
  },

  handleShowMessageThread: function(messageThread) {
    var self = this;

    var fetchMessageThread = this.props.onFetchMessageThread;
    if (fetchMessageThread) {
      fetchMessageThread(messageThread,function(thread){
        self.setState({ messages: thread });
      });
    }

    this.props.trackMetric('Clicked Message Icon');
  },

  handleShowMessageCreation : function(datetime){
    this.setState({ createMessageDatetime : datetime });
    this.props.trackMetric('Clicked Message Pool Background');
  },

  handleInTransition: function(inTransition) {
    if (inTransition) {
      this.setState({
        inTransition: true
      });
    }
    else {
      this.setState({
        inTransition: false
      });
    }
  },

  handleReachedMostRecent: function(mostRecent) {
    if (mostRecent) {
      this.setState({
        atMostRecent: true
      });
    }
    else {
      this.setState({
        atMostRecent: false
      });
    }
  },

  getTitleDaily: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    return moment.utc(d[0]).format(this.CHARTDAILY_TITLE_DATE_FORMAT);
  },

  getTitleWeekly: function(datetimeLocationEndpoints) {
    var d = datetimeLocationEndpoints;
    var start = moment.utc(d[0]).format(this.CHARTWEEKLY_TITLE_DATE_FORMAT);
    var end = moment.utc(d[1]).format(this.CHARTWEEKLY_TITLE_DATE_FORMAT);
    return start + ' - ' + end;
  },

  getTitleSettings: function() {
    return 'Current settings';
  },

  handleWeeklySelectDataPoint: function(datetimeLocation) {
    this.setState({
      chartType: 'daily',
      datetimeLocation: datetimeLocation
    });
    this.props.trackMetric('Double Clicked Two Week Value');
  },

  handleToggleValuesWeekly: function(e) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.showingValuesWeekly) {
      this.refs.chart.hideValues();
      this.props.trackMetric('Clicked Hide Two Week Values');
    }
    else {
      this.refs.chart.showValues();
      this.props.trackMetric('Clicked Show Two Week Values');
    }

    this.setState({showingValuesWeekly: !this.state.showingValuesWeekly});
  }
});

module.exports = PatientData;
