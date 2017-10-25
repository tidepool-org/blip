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
import launchCustomProtocol from 'custom-protocol-detection';

import config from '../../config';
import loadingGif from './loading.gif';

import * as actions from '../../redux/actions';
import { actions as workerActions} from '@tidepool/viz';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';
import { URL_UPLOADER_DOWNLOAD_PAGE, URL_TIDEPOOL_MOBILE_APP_STORE } from '../../core/constants';
import { header as Header } from '../../components/chart';
import { basics as Basics } from '../../components/chart';
import { daily as Daily } from '../../components/chart';
import Trends from '../../components/chart/trends';
import { weekly as Weekly } from '../../components/chart';
import { settings as Settings } from '../../components/chart';
import SettingsPrintView from '../../components/printview';
import UploadLaunchOverlay from '../../components/uploadlaunchoverlay';

import nurseShark from 'tideline/plugins/nurseshark/';

import Messages from '../../components/messages';
import UploaderButton from '../../components/uploaderbutton';

import { DEFAULT_BG_SETTINGS } from '../patient/patientsettings';

export let PatientData = React.createClass({
  propTypes: {
    clearPatientData: React.PropTypes.func.isRequired,
    currentPatientInViewId: React.PropTypes.string.isRequired,
    fetchers: React.PropTypes.array.isRequired,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingPatientData: React.PropTypes.bool.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    generatePDFRequest: React.PropTypes.func.isRequired,
    generatingPDF: React.PropTypes.bool.isRequired,
    isUserPatient: React.PropTypes.bool.isRequired,
    messageThread: React.PropTypes.array,
    onCloseMessageThread: React.PropTypes.func.isRequired,
    onCreateMessage: React.PropTypes.func.isRequired,
    onEditMessage: React.PropTypes.func.isRequired,
    onFetchMessageThread: React.PropTypes.func.isRequired,
    onRefresh: React.PropTypes.func.isRequired,
    onSaveComment: React.PropTypes.func.isRequired,
    patient: React.PropTypes.object,
    patientDataMap: React.PropTypes.object.isRequired,
    patientNotesMap: React.PropTypes.object.isRequired,
    queryParams: React.PropTypes.object.isRequired,
    removeGeneratedPDFS: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
    user: React.PropTypes.object,
    viz: React.PropTypes.object.isRequired,
  },

  getInitialState: function() {
    var state = {
      chartPrefs: {
        trends: {
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
          // we track both showingCbg & showingSmbg as separate Booleans for now
          // in case we decide to layer BGM & CGM data, as has been discussed/prototyped
          showingCbg: true,
          showingSmbg: false,
          smbgGrouped: false,
          smbgLines: false,
          smbgRangeOverlay: true,
        }
      },
      createMessage: null,
      createMessageDatetime: null,
      datetimeLocation: null,
      initialDatetimeLocation: null,
      processingData: true,
      processedPatientData: null,
      timePrefs: {
        timezoneAware: false,
        timezoneName: null
      },
      showUploadOverlay: false,
    };

    return state;
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
    if (this.props.fetchingUser || this.props.fetchingPatient || this.props.fetchingPatientData || this.state.processingData) {
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
    var uploadLaunchOverlay = this.state.showUploadOverlay ? this.renderUploadOverlay() : null;

    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked No Data Upload');
    };
    var handleClickBlipNotes = function() {
      self.props.trackMetric('Clicked No Data Get Blip Notes');
    };
    var handleClickLaunch = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      self.setState({showUploadOverlay: true});
      launchCustomProtocol('tidepoolupload://open');
    }

    if (this.props.isUserPatient) {
      content = (
        <div className="patient-data-uploader-message">
          <h1>To see your data, you’ll need the Tidepool Uploader</h1>
          <UploaderButton
            onClick={handleClickUpload}
            buttonText='Get the Tidepool Uploader' />
          <p>Already have the Tidepool Uploader? Launch it <a className="uploader-color-override" href='' onClick={handleClickLaunch} title="Upload data">here</a></p>
          <p>To upload Dexcom with iPhone, get <a href={URL_TIDEPOOL_MOBILE_APP_STORE} className="uploader-color-override" target="_blank" onClick={handleClickBlipNotes}>Tidepool Mobile</a></p>
          <p className="patient-no-data-help">
            Already uploaded? <a href="" className="uploader-color-override" onClick={this.handleClickNoDataRefresh}>Click to reload.</a><br />
            <b>Need help?</b> Email us at <a className="uploader-color-override" href="mailto:support@tidepool.org">support@tidepool.org</a> or visit our <a className="uploader-color-override" href="http://support.tidepool.org/">help page</a>.
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
              <div className="patient-data-message-no-data">
                {content}
              </div>
            </div>
          </div>
        </div>
        {uploadLaunchOverlay}
      </div>
    );
  },

  renderUploadOverlay: function() {
    return <UploadLaunchOverlay overlayClickHandler={()=>{this.setState({showUploadOverlay: false})}}/>
  },

  isEmptyPatientData: function() {
    return (!_.get(this.props, 'patient.userid', false) || !this.state.processedPatientData);
  },

  isInsufficientPatientData: function() {
    var data = _.get(this.state.processedPatientData, 'data', {});
    // add additional checks against data and return false iff:
    // only messages data
    if (_.reject(data, function(d) { return d.type === 'message'; }).length === 0) {
      this.log('Sorry, tideline is kind of pointless with only messages.');
      return true;
    }
    return false;
  },

  renderSettings: function(){
    return (
      <div>
        <div id="app-no-print">
          <Settings
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            timePrefs={this.state.timePrefs}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onSwitchToPrint={this.handleSwitchToSettingsPrintView}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
        </div>
        <div id="app-print">
          <SettingsPrintView
            bgPrefs={this.state.bgPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            timePrefs={this.state.timePrefs}
            patientData={this.state.processedPatientData}
            patient={this.props.patient}
            trackMetric={this.props.trackMetric}
            ref="tideline" />
        </div>
      </div>
    );
  },

  renderChart: function() {
    switch (this.state.chartType) {
      case 'basics':
        return (
          <Basics
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.state.timePrefs}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            permsOfLoggedInUser={this.props.permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateBasicsData={this.updateBasicsData}
            updateBasicsSettings={this.props.updateBasicsSettings}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
          );
      case 'daily':
        return (
          <Daily
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToPrint={this.handleSwitchToDailyPrintView}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateDatetimeLocation={this.updateDatetimeLocation}
            pdf={this.props.viz.pdf.daily || {}}
            ref="tideline" />
          );
      case 'trends':
        return (
          <Trends
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
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
            trendsState={this.props.viz.trends}
            ref="tideline" />
          );
      case 'weekly':
        return (
          <Weekly
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToModal={this.handleSwitchToModal}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            trackMetric={this.props.trackMetric}
            updateDatetimeLocation={this.updateDatetimeLocation}
            uploadUrl={this.props.uploadUrl}
            ref="tideline"
            isClinicAccount={personUtils.isClinic(this.props.user)} />
          );
      case 'settings':
        return this.renderSettings();
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
          timePrefs={this.state.timePrefs} />
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
          timePrefs={this.state.timePrefs} />
      );
    }

  },

  closeMessageThread: function(){
    this.props.onCloseMessageThread();
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed New Message Modal');
  },

  generatePDF: function (data) {
    const dData = data.diabetesData;

    this.props.generatePDFRequest(
      this.state.chartType,
      dData[dData.length - 1].normalTime,
      _.pick(
        this.state.processedPatientData.grouped,
        // TODO: add back deviceEvent later (not in first prod release)
        ['basal', 'bolus', 'cbg', 'message', 'smbg']
      ),
      { bgPrefs: this.state.bgPrefs, numDays: 6, patient: this.props.patient, timePrefs: this.state.timePrefs }
    );
  },

  handleMessageCreation: function(message){
    var data = this.refs.tideline.createMessageThread(nurseShark.reshapeMessage(message));
    this.updateBasicsData(data);
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
    this.updateBasicsData(data);
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

  handleSwitchToDaily: function(datetime, title) {
    this.props.trackMetric('Clicked Basics '+title+' calendar', {
      fromChart: this.state.chartType
    });
    this.setState({
      chartType: 'daily',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
  },

  handleSwitchToDailyPrintView: function() {
    this.props.trackMetric('Clicked Print', {
      fromChart: this.state.chartType
    });
  },

  handleSwitchToModal: function(datetime) {
    this.props.trackMetric('Clicked Switch To Modal', {
      fromChart: this.state.chartType
    });
    this.setState({
      chartType: 'trends',
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
    if (this.state.timePrefs.timezoneAware) {
      datetime = sundial.applyOffset(datetime, sundial.getOffsetFromZone(datetime, this.state.timePrefs.timezoneName));
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

  handleSwitchToSettingsPrintView: function(e) {
    this.props.trackMetric('Clicked Print', {
      fromChart: this.state.chartType
    });
    if (e) {
      e.preventDefault();
    }
    window.print();
    this.setState({
      chartType: 'settings'
    });
  },

  handleClickRefresh: function(e) {
    this.handleRefresh(e);
    this.props.trackMetric('Clicked Refresh');
  },

  handleClickNoDataRefresh: function(e) {
    this.handleRefresh(e);
    this.props.trackMetric('Clicked No Data Refresh');
  },

  handleRefresh: function(e) {
    if (e) {
      e.preventDefault();
    }

    var refresh = this.props.onRefresh;
    if (refresh) {
      this.props.clearPatientData(this.props.currentPatientInViewId);
      this.props.removeGeneratedPDFS();

      this.setState({
        title: this.DEFAULT_TITLE,
        processingData: true,
        processedPatientData: null
      });

      refresh(this.props.currentPatientInViewId);
    }
  },

  updateBasicsData: function(data) {
    // only attempt to update data if there's already data present to update
    if(this.state.processedPatientData){
      this.setState({
        processedPatientData: data
      });
    }
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

  componentWillUnmount: function() {
    this.props.clearPatientData(this.props.currentPatientInViewId);
    this.props.removeGeneratedPDFS();
  },

  componentWillReceiveProps: function(nextProps) {
    var userId = this.props.currentPatientInViewId;
    var nextPatientData = _.get(nextProps, ['patientDataMap', userId], null);

    // Hold processing until patient is fetched (ensuring settings are accessible), AND
    // processing hasn't already taken place (this should be cleared already when switching patients), AND
    // nextProps patient data exists
    if (!nextProps.fetchingPatient && !this.state.processedPatientData && nextPatientData) {
      this.doProcessing(nextProps);
    }
  },

  componentWillUpdate: function (nextProps, nextState) {
    const pdfEnabled = _.indexOf(['daily'], this.state.chartType) >= 0;
    const pdfGenerating = nextProps.generatingPDF;
    const pdfGenerated = _.get(nextProps, `viz.pdf[${this.state.chartType}]`, false);
    const patientDataProcessed = (!this.state.processingData && !!this.state.processedPatientData && !!nextState.processedPatientData);

    // Ahead-Of-Time pdf generation for non-blocked print popup.
    // Whenever patientData is processed or the chartType changes, such as after a refresh
    // we check to see if we need to generate a new pdf to avoid stale data
    if (pdfEnabled && !pdfGenerating && !pdfGenerated && patientDataProcessed) {
      this.generatePDF(this.state.processedPatientData);
    }
  },

  deriveChartTypeFromLatestData: function(latestData, uploads) {
    let chartType = 'basics'; // Default to 'basics'

    if (latestData && uploads) {
      // Ideally, we determine the default view based on the device type
      // so that, for instance, if the latest data type is cgm, but comes from
      // an insulin-pump, we still direct them to the basics view
      const deviceMap = _.indexBy(uploads, 'deviceId');
      const latestDataDevice = deviceMap[latestData.deviceId];

      if (latestDataDevice) {
        const tags = deviceMap[latestData.deviceId].deviceTags;

        switch(true) {
          case (_.includes(tags, 'insulin-pump')):
            chartType = 'basics';
            break;

          case (_.includes(tags, 'cgm')):
            chartType = 'trends';
            break;

          case (_.includes(tags, 'bgm')):
            chartType = 'weekly';
            break;
        }
      }
      else {
        // If we were unable, for some reason, to get the device tags for the
        // latest upload, we can fall back to setting the default view by the data type
        const type = latestData.type;

        switch(type) {
          case 'bolus':
          case 'basal':
          case 'wizard':
            chartType = 'basics';
            break;

          case 'cbg':
            chartType = 'trends';
            break;

          case 'smbg':
            chartType = 'weekly';
            break;
        }
      }
    }

    return chartType;
  },

  setDefaultChartType: function(processedData) {
    // Determine default chart type and date from latest data
    const uploads = processedData.grouped.upload;
    const latestData = _.last(processedData.diabetesData);

    if (uploads && latestData) {
      // Allow overriding the default chart type via a query param (helps for development);
      const chartType = _.get(
        this.props, 'queryParams.chart',
        this.deriveChartTypeFromLatestData(latestData, uploads)
      );

      let state = {
        chartType,
        initialDatetimeLocation: chartType === 'trends' ? latestData.time : null,
      };

      this.setState(state);

      this.props.trackMetric(`web - default to ${chartType}`);
    }
  },

  doProcessing: function(nextProps) {
    var userId = this.props.currentPatientInViewId;
    var patientData = _.get(nextProps, ['patientDataMap', userId], null);
    var patientSettings = _.cloneDeep(_.get(nextProps, ['patient', 'settings'], null));
    _.defaultsDeep(patientSettings, DEFAULT_BG_SETTINGS);

    if (patientData) {
      let combinedData = patientData.concat(nextProps.patientNotesMap[userId]);
      window.downloadInputData = () => {
        console.save(combinedData, 'blip-input.json');
      };
      let processedData = utils.processPatientData(
        this,
        combinedData,
        this.props.queryParams,
        patientSettings,
      );

      this.setState({
        processedPatientData: processedData,
        bgPrefs: {
          bgClasses: processedData.bgClasses,
          bgUnits: processedData.bgUnits
        },
        processingData: false,
      });

      this.setDefaultChartType(processedData);
    }
  },

  doFetching: function(nextProps) {
    if (this.props.trackMetric) {
      let carelink = nextProps.carelink;
      if (!_.isEmpty(carelink)) {
        this.props.trackMetric('Web - CareLink Import URL Param', { carelink });
      }

      let dexcom = nextProps.dexcom;
      if (!_.isEmpty(dexcom)) {
        this.props.trackMetric('Web - Dexcom Import URL Param', { dexcom });
      }

      this.props.trackMetric('Viewed Data');
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

let getFetchers = (dispatchProps, ownProps, api, options) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPatientData.bind(null, api, options, ownProps.routeParams.id),
    dispatchProps.fetchDataDonationAccounts.bind(null, api),
    dispatchProps.fetchPendingSentInvites.bind(null, api),
  ];
};

export function mapStateToProps(state) {
  let user = null;
  let patient = null;
  let permissions = {};
  let permsOfLoggedInUser = {};

  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId){
      patient = _.get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      );
      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );
      // if the logged-in user is viewing own data, we pass through their own permissions as permsOfLoggedInUser
      if (state.blip.currentPatientInViewId === state.blip.loggedInUserId) {
        permsOfLoggedInUser = permissions;
      }
      // otherwise, we need to pull the perms of the loggedInUser wrt the patient in view from membershipPermissionsInOtherCareTeams
      else {
        if (!_.isEmpty(state.blip.membershipPermissionsInOtherCareTeams)) {
          permsOfLoggedInUser = state.blip.membershipPermissionsInOtherCareTeams[state.blip.currentPatientInViewId];
        }
      }
    }
  }

  return {
    user: user,
    isUserPatient: personUtils.isSame(user, patient),
    patient: { permissions, ...patient },
    patientDataMap: state.blip.patientDataMap,
    patientNotesMap: state.blip.patientNotesMap,
    permsOfLoggedInUser: permsOfLoggedInUser,
    messageThread: state.blip.messageThread,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    fetchingPatientData: state.blip.working.fetchingPatientData.inProgress,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    generatingPDF: state.blip.working.generatingPDF.inProgress,
    viz: state.viz,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  clearPatientData: actions.sync.clearPatientData,
  closeMessageThread: actions.sync.closeMessageThread,
  fetchDataDonationAccounts: actions.async.fetchDataDonationAccounts,
  fetchPatient: actions.async.fetchPatient,
  fetchPatientData: actions.async.fetchPatientData,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites,
  generatePDFRequest: workerActions.generatePDFRequest,
  fetchMessageThread: actions.async.fetchMessageThread,
  removeGeneratedPDFS: workerActions.removeGeneratedPDFS,
  updateSettings: actions.async.updateSettings,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  let carelink = utils.getCarelink(ownProps.location);
  let dexcom = utils.getDexcom(ownProps.location);
  const api = ownProps.routes[0].api;
  const assignedDispatchProps = ['clearPatientData', 'generatePDFRequest', 'removeGeneratedPDFS'];

  return Object.assign({}, _.pick(dispatchProps, assignedDispatchProps), stateProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api, { carelink, dexcom }),
    uploadUrl: api.getUploadUrl(),
    onRefresh: dispatchProps.fetchPatientData.bind(null, api, { carelink, dexcom }),
    onFetchMessageThread: dispatchProps.fetchMessageThread.bind(null, api),
    onCloseMessageThread: dispatchProps.closeMessageThread,
    onSaveComment: api.team.replyToMessageThread.bind(api),
    onCreateMessage: api.team.startMessageThread.bind(api),
    onEditMessage: api.team.editMessage.bind(api),
    trackMetric: ownProps.routes[0].trackMetric,
    queryParams: ownProps.location.query,
    currentPatientInViewId: ownProps.routeParams.id,
    updateBasicsSettings: dispatchProps.updateSettings.bind(null, api),
    carelink: carelink,
    dexcom: dexcom,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientData);
