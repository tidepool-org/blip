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
import { createSelector } from 'reselect';

import _ from 'lodash';
import bows from 'bows';
import moment from 'moment';
import sundial from 'sundial';
import launchCustomProtocol from 'custom-protocol-detection';

import config from '../../config';

import * as actions from '../../redux/actions';
import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';
import { getfetchedPatientDataRange } from '../../redux/selectors';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';
import { URL_UPLOADER_DOWNLOAD_PAGE, URL_TIDEPOOL_MOBILE_APP_STORE } from '../../core/constants';
import { header as Header } from '../../components/chart';
import { basics as Basics } from '../../components/chart';
import { daily as Daily } from '../../components/chart';
import Trends from '../../components/chart/trends';
import { weekly as Weekly } from '../../components/chart';
import { settings as Settings } from '../../components/chart';
import UploadLaunchOverlay from '../../components/uploadlaunchoverlay';

import nurseShark from 'tideline/plugins/nurseshark/';

import Messages from '../../components/messages';
import UploaderButton from '../../components/uploaderbutton';

import { DEFAULT_BG_SETTINGS } from '../patient/patientsettings';

import { MGDL_UNITS, MMOLL_UNITS, MGDL_PER_MMOLL } from '../../core/constants';

const Loader = vizComponents.Loader;

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
      lastDatumProcessedIndex: -1,
      loading: true,
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
    const patientData = this.renderPatientData();
    const messages = this.renderMessagesContainer();
    const initialProcessing = this.state.lastDatumProcessedIndex < 0;
    const fetching = this.props.fetchingUser || this.props.fetchingPatient || this.props.fetchingPatientData;
    const showLoader = initialProcessing && (fetching || this.state.processingData);

    return (
      <div className="patient-data js-patient-data-page">
        {messages}
        {patientData}
        <Loader show={showLoader} />
      </div>
    );
  },

  renderPatientData: function() {
    const initialProcessing = this.state.lastDatumProcessedIndex < 0;

    if (initialProcessing && this.state.loading) {
      return this.renderInitialLoading();
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

  renderInitialLoading: function() {
    var header = this.renderEmptyHeader();
    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content"></div>
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
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onClickPrint={this.handleClickPrint}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            pdf={this.props.pdf.combined || {}}
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
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            updateBasicsData={this.updateBasicsData}
            updateBasicsSettings={this.props.updateBasicsSettings}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            pdf={this.props.pdf.combined || {}}
            ref="tideline" />
          );
      case 'daily':
        return (
          <Daily
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.datetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            loading={this.state.loading}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            updateDatetimeLocation={this.updateDatetimeLocation}
            pdf={this.props.pdf.combined || {}}
            ref="tideline" />
          );
      case 'trends':
        return (
          <Trends
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.datetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            loading={this.state.loading}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
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
            initialDatetimeLocation={this.state.datetimeLocation}
            patient={this.props.patient}
            patientData={this.state.processedPatientData}
            loading={this.state.loading}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
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

  generatePDF: function (props, state) {
    const data = state.processedPatientData;
    const diabetesData = data.diabetesData;

    if (diabetesData) {
      const opts = {
        bgPrefs: state.bgPrefs,
        numDays: {
          daily: 6
        },
        patient: props.patient,
        timePrefs: state.timePrefs,
        mostRecent: diabetesData[diabetesData.length - 1].normalTime,
      };

      const pdfData = {
        daily: _.pick(data.grouped, ['basal', 'bolus', 'cbg', 'message', 'smbg']),
        basics: data.basicsData,
        settings: _.last(data.grouped.pumpSettings),
      }

      props.generatePDFRequest(
        'combined',
        pdfData,
        opts,
      );
    }
  },

  applyTimezoneOffset: function(datetime, timezoneName = this.state.timePrefs.timezoneName) {
    if (datetime && this.state.timePrefs.timezoneAware) {
      datetime = sundial.applyOffset(datetime, sundial.getOffsetFromZone(datetime, timezoneName));
      datetime = _.isDate(datetime) ? datetime.toISOString() : datetime;
    }
    return datetime;
  },

  handleChartDateRangeUpdate: function(dateRange, chart) {
    this.updateChartDateRange(dateRange);

    const userId = this.props.currentPatientInViewId;
    const patientData = _.get(this.props, ['patientDataMap', userId], []);
    const dateRangeStart = moment.utc(this.applyTimezoneOffset(dateRange[0])).startOf('day');
    let lastProcessedDateTarget = this.state.lastProcessedDateTarget;
    let lastBGProcessedTime = this.applyTimezoneOffset(_.get(patientData, `${this.state.lastBGProcessedIndex}.time`));
    let lastDatumProcessedTime = this.applyTimezoneOffset(_.get(patientData, `${this.state.lastDatumProcessedIndex}.time`));

    if (!this.props.fetchingPatientData && !this.state.processingData) {
      const chartLimitReached = dateRangeStart.isSame(moment.utc(lastBGProcessedTime), 'day');

      if (dateRangeStart.isSameOrBefore(this.props.fetchedPatientDataRange.start)) {
        this.fetchEarlierData();
      }
      else if (
        (lastProcessedDateTarget && dateRangeStart.isSameOrBefore(lastProcessedDateTarget))
        || (this.state.chartType === 'weekly' && chartLimitReached)
        || (this.state.chartType === 'daily' && chartLimitReached)) {
        this.processData(this.props, dateRangeStart);
      }
    }
  },

  handleMessageCreation: function(message) {
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

    datetime = moment(datetime || this.state.datetimeLocation).hour(12).minute(0).second(0).toISOString();

    this.setState({
      chartType: 'daily',
      datetimeLocation: datetime,
    });
  },

  handleSwitchToTrends: function(datetime) {
    this.props.trackMetric('Clicked Switch To Modal', {
      fromChart: this.state.chartType
    });

    datetime = moment(datetime || this.state.datetimeLocation).endOf('day').toISOString();

    this.setState({
      chartType: 'trends',
      datetimeLocation: datetime,
    });
  },

  handleSwitchToWeekly: function(datetime) {
    this.props.trackMetric('Clicked Switch To Two Week', {
      fromChart: this.state.chartType
    });

    datetime = moment.utc(datetime || this.state.datetimeLocation).endOf('day').toISOString();

    this.setState({
      chartType: 'weekly',
      datetimeLocation: datetime,
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

  handleClickPrint: function(pdf = {}) {
    this.props.trackMetric('Clicked Print', {
      fromChart: this.state.chartType
    });

    if (pdf.url) {
      const printWindow = window.open(pdf.url);
      printWindow.focus();
      printWindow.print();
    }
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
        datetimeLocation: this.state.initialDatetimeLocation,
        lastDatumProcessedIndex: -1,
        loading: true,
        processingData: true,
        processedPatientData: null,
        title: this.DEFAULT_TITLE,
      });

      refresh(this.props.currentPatientInViewId);
    }
  },

  updateBasicsData: function(data) {
    // only attempt to update data if there's already data present to update
    if(this.state.processedPatientData){
      this.setState({
        processedPatientData: _.assign(this.state.processedPatientData, data),
      });
    }
  },

  updateChartPrefs: function(newChartPrefs) {
    var currentPrefs = _.clone(this.state.chartPrefs);
    _.assign(currentPrefs, newChartPrefs);
    this.setState({
      chartPrefs: currentPrefs,
    });
  },

  updateDatetimeLocation: function(datetime) {
    this.setState({
      datetimeLocation: datetime,
    });
  },

  updateChartDateRange: function(dateRange) {
    this.setState({
      chartDateRange: dateRange,
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
    this.props.removeGeneratedPDFS();
  },

  componentWillReceiveProps: function(nextProps, nextState) {
    const userId = this.props.currentPatientInViewId;
    const nextPatientData = _.get(nextProps, ['patientDataMap', userId], null);
    const currentPatientData = _.get(this.props, ['patientDataMap', userId], null);
    const patientSettings = _.get(nextProps, ['patient', 'settings'], null);

    const nextFetchedDataRangeStart = _.get(nextProps, 'fetchedPatientDataRange.fetchedUntil');
    const currentFetchedDataRangeStart = _.get(this.props, 'fetchedPatientDataRange.fetchedUntil');
    const newDataFetched = nextFetchedDataRangeStart !== currentFetchedDataRangeStart;

    // Hold processing until patient is fetched (ensuring settings are accessible), AND
    // processing hasn't already taken place (this should be cleared already when switching patients), AND
    // nextProps patient data exists
    if (patientSettings && nextPatientData) {
      const currentPatientDataCount = _.get(currentPatientData, 'length', 0);
      if (nextPatientData.length > currentPatientDataCount || this.state.lastDatumProcessedIndex < 1) {
        const dateRangeStart = moment.utc(_.get(this.state, 'chartDateRange.0', null));
        if (dateRangeStart.isValid()) {
          this.processData(nextProps, dateRangeStart.startOf('day'));
        }
        else {
          this.processData(nextProps);
        }
      }
      if (newDataFetched && nextPatientData.length === currentPatientDataCount && nextFetchedDataRangeStart !== 'start') {
        // Our latest data fetch yeilded no new data. We now request the remainder of the available
        // data to make sure that we don't miss any.
        this.setState({ processingData: true });
        this.fetchEarlierData({ startDate: null });
      }
    }

    // If the patient makes a change to their site change source settings,
    // we should remove the currently generated PDF, which will trigger a rebuild of
    // the PDF with the updated settings.
    const siteChangeSource = _.get(nextProps, 'patient.settings.siteChangeSource');
    if (siteChangeSource && siteChangeSource !== _.get(this.props, 'patient.settings.siteChangeSource')) {
      this.props.removeGeneratedPDFS();
    }
  },

  componentWillUpdate: function (nextProps, nextState) {
    const pdfEnabled =  _.indexOf(['daily', 'basics', 'settings'], nextState.chartType) >= 0;
    const pdfGenerating = nextProps.generatingPDF;
    const pdfGenerated = _.get(nextProps, 'pdf.combined', false);
    const patientDataProcessed = (!nextState.processingData && !!nextState.processedPatientData);

    // Ahead-Of-Time pdf generation for non-blocked print popup.
    // Whenever patientData is processed or the chartType changes, such as after a refresh
    // we check to see if we need to generate a new pdf to avoid stale data
    if (patientDataProcessed && pdfEnabled && !pdfGenerating && !pdfGenerated) {
      this.generatePDF(nextProps, nextState);
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

  setInitialChartType: function(processedData) {
    // Determine default chart type and date from latest data
    const uploads = processedData.grouped.upload;
    const latestData = _.last(processedData.diabetesData);

    if (uploads && latestData) {
      // Allow overriding the default chart type via a query param (helps for development);
      const chartType = _.get(
        this.props, 'queryParams.chart',
        this.deriveChartTypeFromLatestData(latestData, uploads)
      );

      const datetime = chartType === 'daily'
        ? moment(latestData.time).hour(12).minute(0).second(0).toISOString()
        : moment(latestData.time).endOf('day').toISOString();

      let state = {
        chartType,
        datetimeLocation: datetime,
        initialDatetimeLocation: datetime,
      };

      this.setState(state);
      this.props.trackMetric(`web - default to ${chartType}`);
    }
  },

  fetchEarlierData: function(options = {}) {
    // Return if we've already fetched all data
    if (_.get(this.props, 'fetchedPatientDataRange.fetchedUntil') === 'start') {
      return;
    };

    const earliestRequestedData = _.get(this.props, 'fetchedPatientDataRange.fetchedUntil');

    const requestedPatientDataRange = {
      start: moment.utc(earliestRequestedData).subtract(16, 'weeks').toISOString(),
      end: moment.utc(earliestRequestedData).subtract(1, 'milliseconds').toISOString(),
    };

    this.setState({
      loading: true,
      requestedPatientDataRange,
     });

    const fetchOpts = _.defaults(options, {
      startDate: requestedPatientDataRange.start,
      endDate: requestedPatientDataRange.end,
      carelink: this.props.carelink,
      dexcom: this.props.dexcom,
      useCache: false,
      initial: false,
    });

    this.props.onFetchEarlierData(fetchOpts, this.props.currentPatientInViewId);
  },

  processData: function(props = this.props, dateRangeStart) {
    const userId = props.currentPatientInViewId;
    const patientData = _.get(props, ['patientDataMap', userId], []);
    const patientNotes = _.get(props, ['patientNotesMap', userId], []);
    let patientSettings = _.cloneDeep(_.get(props, ['patient', 'settings'], null));
    _.defaultsDeep(patientSettings, DEFAULT_BG_SETTINGS);

    // Return if we've already fetched and processed all data
    if (_.get(props, 'fetchedPatientDataRange.fetchedUntil') === 'start' && this.state.lastDatumProcessedIndex === patientData.length - 1) {
      return;
    };

    this.setState({
      loading: true,
      processingData: true,
     });

    if (patientData.length) {
      const fetchedUntil = _.get(this.props, 'fetchedPatientDataRange.fetchedUntil', 0);
      const isInitialProcessing = this.state.lastDatumProcessedIndex < 0;
      const processDataMaxWeeks = isInitialProcessing ? 4 : 8;
      const lastDatumProcessedIndex = isInitialProcessing ? 0 : this.state.lastDatumProcessedIndex;
      const lastProcessedDatetime = moment.utc(this.state.lastProcessedDateTarget || _.get(patientData, `${lastDatumProcessedIndex}.time`));
      const lastFetchedDatetime = fetchedUntil === 'start' ? moment.utc(0) : moment.utc(fetchedUntil);

      const targets = [
        lastProcessedDatetime,
      ];

      if (dateRangeStart && dateRangeStart.isValid()) {
        targets.push(dateRangeStart);
      }

      if (!isInitialProcessing && lastFetchedDatetime.isValid()) {
        targets.push(lastFetchedDatetime);
      }

      const targetDatetime = moment.max(targets).subtract(processDataMaxWeeks, 'weeks').startOf('day');

      const unprocessedPatientData = patientData.slice(this.state.lastDatumProcessedIndex + 1);
      const bgUnits = _.get(this.state, 'processedPatientData.bgUnits');

      const targetIndex = _.findIndex(unprocessedPatientData, datum => {
        return targetDatetime.isAfter(datum.time);
      });

      const targetData = targetIndex ? unprocessedPatientData.slice(0, targetIndex) : unprocessedPatientData;

      const bgTypes = [
        'cbg',
        'smbg',
      ];

      const lastBGProcessedIndex = _.findLastIndex(patientData.slice(0, this.state.lastDatumProcessedIndex + targetIndex + 1), datum => {
        return _.includes(bgTypes, datum.type);
      });

      // Process data fetched after the initial processing
      if (isInitialProcessing) {
        // Kick off the processing of the initial data fetch
        const combinedData = targetData.concat(patientNotes);

        window.downloadInputData = () => {
          console.save(combinedData, 'blip-input.json');
        };

        const processedData = utils.processPatientData(
          combinedData,
          this.props.queryParams,
          patientSettings,
        );

        const lastDatumProcessedIndex = targetData.length - 1;

        this.setState({
          bgPrefs: {
            bgClasses: processedData.bgClasses,
            bgUnits: processedData.bgUnits
          },
          lastBGProcessedIndex,
          lastDatumProcessedIndex,
          lastProcessedDateTarget: targetDatetime.toISOString(),
          loading: false,
          processedPatientData: processedData,
          processingData: false,
          timePrefs: processedData.timePrefs,
        });

        this.handleInitialProcessedData(props, processedData, patientSettings);
      }
      else {
        // We don't need full processing for subsequend data. We just add and reprocess the new datums.
        const startingDataLength = _.get(this.state, 'processedPatientData.data.length');
        const newData = utils.filterPatientData(targetData, bgUnits).processedData;
        const addData = this.state.processedPatientData.addData.bind(this.state.processedPatientData);
        const processedPatientData = addData(newData);
        const processingComplete = _.get(processedPatientData, 'data.length') !== startingDataLength;

        this.setState({
          lastBGProcessedIndex,
          lastDatumProcessedIndex: this.state.lastDatumProcessedIndex + targetData.length,
          lastProcessedDateTarget: targetDatetime.toISOString(),
          processedPatientData,
          processingData: false,
        });

        this.completeLoading();
      }
    }
  },

  completeLoading: function() {
    // Needs to be in a setTimeout to force unsetting the loading state in a new render cycle
    // so that child components can be aware of the change in processing states. It also serves
    // to ensure the loading indicator shows long enough for the user to make sense of it.
    setTimeout(() => {
      this.setState({
        loading: this.state.processingData,
      });
    }, 250);
  },

  handleInitialProcessedData: function(props, processedData, patientSettings) {
    const userId = props.currentPatientInViewId;
    const patientData = _.get(props, ['patientDataMap', userId], []);
    const patientNotes = _.get(props, ['patientNotesMap', userId], []);

    if (!this.state.chartType) {
      this.setInitialChartType(processedData);
    }

    let combinedData = patientData.concat(patientNotes);

    window.downloadPrintViewData = () => {
      const prepareProcessedData = (bgUnits) => {
        const multiplier = bgUnits === MGDL_UNITS ? MGDL_PER_MMOLL : (1 / MGDL_PER_MMOLL);

        return (bgUnits === processedData.bgUnits) ? processedData : utils.processPatientData(
          combinedData,
          props.queryParams,
          _.assign({}, patientSettings, {
            bgTarget: {
              low: patientSettings.bgTarget.low * multiplier,
              high: patientSettings.bgTarget.high * multiplier,
            },
            units: { bg: bgUnits }
          }),
        );
      };

      const data = {
        [MGDL_UNITS]: prepareProcessedData(MGDL_UNITS),
        [MMOLL_UNITS]: prepareProcessedData(MMOLL_UNITS),
      };

      const dData = {
        [MGDL_UNITS]: data[MGDL_UNITS].diabetesData,
        [MMOLL_UNITS]: data[MMOLL_UNITS].diabetesData,
      };

      const preparePrintData = (bgUnits) => {
        return {
          daily: vizUtils.selectDailyViewData(
            dData[bgUnits][dData[bgUnits].length - 1].normalTime,
            _.pick(
              data[bgUnits].grouped,
              ['basal', 'bolus', 'cbg', 'message', 'smbg']
            ),
            6,
            this.state.timePrefs,
          ),
          basics: data[bgUnits].basicsData,
          settings: _.last(data[bgUnits].grouped.pumpSettings),
        };
      };

      console.save({
        [MGDL_UNITS]: preparePrintData(MGDL_UNITS),
        [MMOLL_UNITS]: preparePrintData(MMOLL_UNITS),
      }, 'print-view.json');
    };
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

export function mapStateToProps(state, props) {
  let user = null;
  let patient = null;
  let permissions = {};
  let permsOfLoggedInUser = {};

  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId) {
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
    fetchedPatientDataRange: getfetchedPatientDataRange(state, props),
    patientNotesMap: state.blip.patientNotesMap,
    permsOfLoggedInUser: permsOfLoggedInUser,
    messageThread: state.blip.messageThread,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    fetchingPatientData: state.blip.working.fetchingPatientData.inProgress,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    generatingPDF: state.blip.working.generatingPDF.inProgress,
    pdf: state.blip.pdf,
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
  fetchMessageThread: actions.async.fetchMessageThread,
  generatePDFRequest: actions.worker.generatePDFRequest,
  removeGeneratedPDFS: actions.worker.removeGeneratedPDFS,
  updateSettings: actions.async.updateSettings,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  const carelink = utils.getCarelink(ownProps.location);
  const dexcom = utils.getDexcom(ownProps.location);
  const api = ownProps.routes[0].api;
  const assignedDispatchProps = [
    'clearPatientData',
    'generatePDFRequest',
    'processPatientDataRequest',
    'removeGeneratedPDFS',
  ];

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
    onFetchEarlierData: dispatchProps.fetchPatientData.bind(null, api),
    carelink: carelink,
    dexcom: dexcom,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientData);
