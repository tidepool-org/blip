
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

import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';

import config from '../../config';
import loadingGif from './loading.gif';

import * as actions from '../../redux/actions';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';
import { header as Header } from '../../components/chart';
import { basics as Basics } from '../../components/chart';
import { daily as Daily } from '../../components/chart';
import { modal as Modal } from '../../components/chart';
import { weekly as Weekly } from '../../components/chart';
import { settings as Settings } from '../../components/chart';

import nurseShark from 'tideline/plugins/nurseshark/';

import Messages from '../../components/messages';

export let PatientData = React.createClass({
  propTypes: {
    bgPrefs: React.PropTypes.object,
    timePrefs: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object,
    patient: React.PropTypes.object,
    messageThread: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingPatientData: React.PropTypes.bool.isRequired,
    isUserPatient: React.PropTypes.bool,
    queryParams: React.PropTypes.object.isRequired,
    uploadUrl: React.PropTypes.string,
    onRefresh: React.PropTypes.func,
    onFetchMessageThread: React.PropTypes.func,
    onSaveComment: React.PropTypes.func,
    onEditMessage: React.PropTypes.func,
    onCreateMessage: React.PropTypes.func,
    onUpdatePatientData: React.PropTypes.func,
    user: React.PropTypes.object,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    var state = {
      chartPrefs: {
        modal: {
          activeDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          activeDomain: '2 weeks',
          extentSize: 14,
          boxOverlay: true,
          grouped: true,
          showingLines: false
        }
      },
      chartType: 'basics',
      createMessage: null,
      createMessageDatetime: null,
      datetimeLocation: null,
      initialDatetimeLocation: null
    };

    return state;
  },

  componentWillMount: function() {
    this.doFetching(this.props);
    var params = this.props.queryParams;

    if (!_.isEmpty(params)) {
      var prefs = _.cloneDeep(this.state.chartPrefs);
      prefs.bolusRatio = params.dynamicCarbs ? 0.5 : 0.35;
      prefs.dynamicCarbs = params.dynamicCarbs;
      this.setState({
        chartPrefs: prefs
      });
    }
  },

  log: bows('PatientData'),

  render: function() {
    var patientData = this.renderPatientData();
    var messages = this.renderMessagesContainer();

    
    return (
      <div className="patient-data js-patient-data-page">
        {messages}
        {patientData}
      </div>
    );
    
  },

  renderPatientData: function() {
    if (this.props.fetchingPatient || this.props.fetchingPatientData) {
      return this.renderLoading();
    }

    if (this.isEmptyPatientData() || this.isInsufficientPatientData()) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  renderEmptyHeader: function() {
    
    return (
      <Header
        chartType={'no-data'}
        inTransition={false}
        atMostRecent={false}
        title={'Data'}
        ref="header" />
      );
    
  },

  renderLoading: function() {
    var header = this.renderEmptyHeader();
    
    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <img className='patient-data-loading-image' src={loadingGif} alt="Loading animation" />
              <div className="patient-data-message patient-data-loading-message">
                Loading data...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    
  },

  renderNoData: function() {
    var content = personUtils.patientFullName(this.props.patient) + ' does not have any data yet.';
    var header = this.renderEmptyHeader();

    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked No Data Upload');
    };

    if (this.props.isUserPatient) {
      
      content = (
        <div className="patient-data-message-no-data">
          <p>{'There is no data in here yet!'}</p>
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>Upload data</a>
          <p>
            {'Or try '}<a href="" onClick={this.handleClickRefresh}>refreshing</a>{' the page.'}
          </p>
        </div>
      );
      
    }

    
    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <div className="patient-data-message">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    
  },

  isEmptyPatientData: function() {
    // Make sure the patient object and userid is set to prevent TypeErrors
    // when not setting this prop
    if (!utils.getIn(this.props, ['patient', 'userid'])) {
      return true;
    }

    var patientDataLength =
      utils.getIn(this.props.patientData, [this.props.patient.userid, 'data', 'length'], 0);
    return !Boolean(patientDataLength);
  },

  isInsufficientPatientData: function() {
    var data = this.props.patientData[this.props.patient.userid].data;
    // add additional checks against data and return false iff:
    // only messages data
    if (_.reject(data, function(d) { return d.type === 'message'; }).length === 0) {
      this.log('Sorry, tideline is kind of pointless with only messages.');
      return true;
    }
    return false;
  },

  renderChart: function() {
    switch (this.state.chartType) {
      case 'basics':

        return (
          <Basics
            bgPrefs={this.props.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.props.timePrefs}
            patientData={this.props.patientData[this.props.patient.userid]}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateBasicsData={this.updateBasicsData.bind(null, this.props.patient.userid)}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
          );

      case 'daily':
        
        return (
          <Daily
            bgPrefs={this.props.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.props.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.props.patientData[this.props.patient.userid]}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateDatetimeLocation={this.updateDatetimeLocation}
            ref="tideline" />
          );
        
      case 'modal':
        
        return (
          <Modal
            bgPrefs={this.props.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.props.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.props.patientData[this.props.patient.userid]}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
          );
        
      case 'weekly':
        
        return (
          <Weekly
            bgPrefs={this.props.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.props.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.props.patientData[this.props.patient.userid]}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            trackMetric={this.props.trackMetric}
            updateDatetimeLocation={this.updateDatetimeLocation}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
          );
        
      case 'settings':
        
        return (
          <Settings
            bgPrefs={this.props.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.props.timePrefs}
            patientData={this.props.patientData[this.props.patient.userid]}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
          );
        
    }
  },

  renderMessagesContainer: function() {
    
    if (this.state.createMessageDatetime) {
      return (
        <Messages
          createDatetime={this.state.createMessageDatetime}
          user={this.props.user}
          patient={this.props.patient}
          onClose={this.closeMessageCreation}
          onSave={this.props.onCreateMessage}
          onNewMessage={this.handleMessageCreation}
          onEdit={this.handleEditMessage}
          timePrefs={this.props.timePrefs} />
      );
    } else if(this.props.messageThread) {
      return (
        <Messages
          messages={this.props.messageThread}
          user={this.props.user}
          patient={this.props.patient}
          onClose={this.closeMessageThread}
          onSave={this.handleReplyToMessage}
          onEdit={this.handleEditMessage}
          timePrefs={this.props.timePrefs} />
      );
    }
    
  },

  closeMessageThread: function(){
    this.closeMessageThread();
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed New Message Modal');
  },

  handleMessageCreation: function(message){
    var data = this.refs.tideline.createMessageThread(nurseShark.reshapeMessage(message));
    this.props.onUpdatePatientData(this.props.patient.userid, data);
    this.props.trackMetric('Created New Message');
  },

  handleReplyToMessage: function(comment, cb) {
    var reply = this.props.onSaveComment;
    if (reply) {
      reply(comment, cb);
    }
    this.props.trackMetric('Replied To Message');
  },

  handleEditMessage: function(message, cb) {
    var edit = this.props.onEditMessage;
    if (edit) {
      edit(message, cb);
    }
    var data = this.refs.tideline.editMessageThread(nurseShark.reshapeMessage(message));
    this.props.onUpdatePatientData(this.props.patient.userid, data);
    this.props.trackMetric('Edit To Message');
  },

  handleShowMessageThread: function(messageThread) {
    var self = this;

    var fetchMessageThread = this.props.onFetchMessageThread;
    if (fetchMessageThread) {
      fetchMessageThread(messageThread);
    }

    this.props.trackMetric('Clicked Message Icon');
  },

  handleShowMessageCreation: function(datetime) {
    this.setState({ createMessageDatetime : datetime });
    this.props.trackMetric('Clicked Message Pool Background');
  },

  handleSwitchToBasics: function(e) {
    this.props.trackMetric('Clicked Switch To Basics', {
      fromChart: this.state.chartType
    });
    if (e) {
      e.preventDefault();
    }
    this.setState({
      chartType: 'basics'
    });
  },

  handleSwitchToDaily: function(datetime) {
    this.props.trackMetric('Clicked Switch To One Day', {
      fromChart: this.state.chartType
    });
    this.setState({
      chartType: 'daily',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },

  handleSwitchToModal: function(datetime) {
    this.props.trackMetric('Clicked Switch To Modal', {
      fromChart: this.state.chartType
    });
    this.setState({
      chartType: 'modal',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },

  handleSwitchToWeekly: function(datetime) {
    this.props.trackMetric('Clicked Switch To Two Week', {
      fromChart: this.state.chartType
    });
    datetime = datetime || this.state.datetimeLocation;
    // when switching from initial Basics
    // won't even have a datetimeLocation in the state yet
    if (!datetime) {
      this.setState({
        chartType: 'weekly'
      });
      return;
    }
    if (this.props.timePrefs.timezoneAware) {
      datetime = sundial.applyOffset(datetime, sundial.getOffsetFromZone(datetime, this.props.timePrefs.timezoneName));
      datetime = datetime.toISOString();
    }
    this.setState({
      chartType: 'weekly',
      initialDatetimeLocation: datetime
    });
  },

  handleSwitchToSettings: function(e) {
    this.props.trackMetric('Clicked Switch To Settings', {
      fromChart: this.state.chartType
    });
    if (e) {
      e.preventDefault();
    }
    this.setState({
      chartType: 'settings'
    });
  },

  handleClickRefresh: function(e) {
    this.handleRefresh(e);
    this.props.trackMetric('Clicked No Data Refresh');
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

  updateBasicsData: function(userid, data) {
    this.props.onUpdatePatientData(userid, data);
  },

  updateChartPrefs: function(newChartPrefs) {
    var currentPrefs = _.clone(this.state.chartPrefs);
    _.assign(currentPrefs, newChartPrefs);
    this.setState({
      chartPrefs: currentPrefs
    });
  },

  updateDatetimeLocation: function(datetime) {
    this.setState({
      datetimeLocation: datetime
    });
  },
  doFetching: function(nextProps) {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Care Team List');
    }

    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(function(fetcher) { 
      fetcher();
    });
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPatientData.bind(null, api, ownProps.routeParams.id, {})
  ];
};

let mapStateToProps = state => ({
  user: state.blip.loggedInUser,
  bgPrefs: state.blip.bgPrefs,
  timePrefs: state.blip.timePrefs,
  isUserPatient: personUtils.isSame(state.blip.loggedInUser, state.blip.currentPatientInView),
  patient: state.blip.currentPatientInView,
  patientData: state.blip.patientData,
  messageThread: state.blip.messageThread,
  fetchingPatient: state.blip.working.fetchingPatient.inProgress,
  fetchingPatientData: state.blip.working.fetchingPatientData.inProgress
});

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchPatient: actions.async.fetchPatient,
  fetchPatientData: actions.async.fetchPatientData,
  fetchMessageThread: actions.async.fetchMessageThread,
  updateLocalPatientData: actions.sync.updateLocalPatientData,
  closeMessageThread: actions.sync.closeMessageThread,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return _.merge({}, ownProps, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    uploadUrl: api.getUploadUrl(),
    onRefresh: dispatchProps.fetchPatientData.bind(null, api),
    onFetchMessageThread: dispatchProps.fetchMessageThread.bind(null, api),
    onUpdatePatientData: dispatchProps.updateLocalPatientData,
    onSaveComment: api.team.replyToMessageThread.bind(api),
    onCreateMessage: api.team.startMessageThread.bind(api),
    onEditMessage: api.team.editMessage.bind(api),
    trackMetric: ownProps.routes[0].trackMetric,
    queryParams: ownProps.location.query
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientData);
