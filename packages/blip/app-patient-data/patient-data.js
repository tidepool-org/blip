/**
 * Copyright (c) 2014, Tidepool Project
 * Copyright (c) 2020, Diabeloop
 * Display patient data in an iframe
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
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';
import moment from 'moment-timezone';

import sundial from '../../sundial/sundial';

import i18n from '../app/core/language';
import config from '../app/config';

import { TidelineData } from 'tideline';

import { utils as vizUtils, createPrintPDFPackage } from '../../viz/src/index';
import Loader from '../../viz/src/components/common/loader/Loader';
import DataUtils from '../../viz/src/utils/data';

import personUtils from '../app/core/personutils';
import utils from '../app/core/utils';
import { Header, Basics, Daily, Trends, Settings } from '../app/components/chart';

import nurseShark from '../../tideline/plugins/nurseshark';

import Messages from '../app/components/messages';
import { FETCH_PATIENT_DATA_SUCCESS } from '../app/redux/constants/actionTypes';

import { MGDL_UNITS, DIABETES_DATA_TYPES } from '../app/core/constants';

const { waitTimeout } = utils;
const { addDuration, getLocalizedCeiling, getTimezoneFromTimePrefs } = vizUtils.datetime;
const { isAutomatedBasalDevice: isAutomatedBasalDeviceCheck } = vizUtils.device;
const { commonStats, getStatDefinition, statFetchMethods } = vizUtils.stat;

const DiabetesDataTypesForDatum = _.filter(DIABETES_DATA_TYPES, (t) => t !== 'food');

/** @type {(s: string, p?: object) => string} */
const t = i18n.t.bind(i18n);

const LOADING_STATE_NONE = 0;
const LOADING_STATE_INITIAL_FETCH = LOADING_STATE_NONE + 1;
const LOADING_STATE_INITIAL_PROCESS = LOADING_STATE_INITIAL_FETCH + 1;
const LOADING_STATE_DONE = LOADING_STATE_INITIAL_PROCESS + 1;
const LOADING_STATE_EARLIER_FETCH = LOADING_STATE_DONE + 1;
const LOADING_STATE_EARLIER_PROCESS = LOADING_STATE_EARLIER_FETCH + 1;
const LOADING_STATE_ERROR = LOADING_STATE_EARLIER_PROCESS + 1;

/**
 * @typedef { import('redux').Store } Store
 * @typedef { import("./index").BlipApi } API
 * @typedef { import("../../yourloops/lib/api").PatientDataLoadedEvent } PatientDataLoadedEvent
 * @typedef { import("../../yourloops/lib/api").PatientNotesLoadedEvent } PatientNotesLoadedEvent
 * @typedef { import("../../yourloops/models/shoreline").User } User
 * @typedef { import("../../yourloops/models/device-data").PatientData } PatientData
 * @typedef { import("../../yourloops/models/message").MessageNote } MessageNote
 *
 * @typedef {{ api: API, patient: User, store: Store }} PatientDataProps
 * @typedef {{loadingState: number, processedPatientData: TidelineData, chartType: string, endpoints: string[], patient: User, canPrint: boolean, pdf: object, chartPrefs: object, createMessageDatetime: moment.Moment | null, messageThread: MessageNote[] | null}} PatientDataState
 *
 * @augments {React.Component<PatientDataProps, PatientDataState>}
 */
class PatientDataPage extends React.Component {
  constructor(/** @type{PatientDataProps} */ props) {
    super(props);
    const { api } = this.props;
    this.log = bows('PatientData');

    /** @type {(eventName: string, properties?: unknown) => void} */
    this.trackMetric = api.sendMetrics.bind(api);

    this.chartRef = React.createRef();

    const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.state = {
      // New states info
      chartType: 'daily',
      loadingState: LOADING_STATE_NONE,
      errorMessage: null,
      initialDatetimeLocation: new Date().toISOString(),
      endpoints: [],
      timePrefs: {
        timezoneAware: true,
        timezoneName: browserTimezone,
      },
      bgPrefs: {
        bgUnits: MGDL_UNITS,
        bgClasses: {},
      },
      permsOfLoggedInUser: {
        view: {},
        notes: {},
      },
      canPrint: false,
      pdf: null,

      // Messages
      messageThread: null,
      createMessageDatetime: null,

      // Original states info
      chartPrefs: {
        basics: {},
        daily: {},
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
          /** To keep the wanted extentSize (num days between endpoints) between charts switch. */
          extentSize: 14,
          // we track both showingCbg & showingSmbg as separate Booleans for now
          // in case we decide to layer BGM & CGM data, as has been discussed/prototyped
          showingCbg: true,
          showingSmbg: false,
          smbgGrouped: false,
          smbgLines: false,
          smbgRangeOverlay: true,
        },
        bgLog: {
          bgSource: 'smbg',
        },
      },
      chartStates: {
        trends: {
        },
      },
      printOpts: {
        numDays: {
          daily: 6,
          bgLog: 30,
        },
      },
      createMessage: null,
      datetimeLocation: null,
      fetchEarlierDataCount: 0,
      lastDatumProcessedIndex: -1,
      lastDiabetesDatumProcessedIndex: -1,
      processingData: false,
      processEarlierDataCount: 0,
      processedPatientData: null,
      showUploadOverlay: false,
    };

    this.handleChartDateRangeUpdate = this.handleChartDateRangeUpdate.bind(this);
    this.handleSwitchToBasics = this.handleSwitchToBasics.bind(this);
    this.handleSwitchToDaily = this.handleSwitchToDaily.bind(this);
    this.handleSwitchToTrends = this.handleSwitchToTrends.bind(this);
    this.handleSwitchToSettings = this.handleSwitchToSettings.bind(this);
    this.handleShowMessageCreation = this.handleShowMessageCreation.bind(this);
    this.handleClickRefresh = this.handleClickRefresh.bind(this);

    this.updateBasicsData = this.updateBasicsData.bind(this);
    this.updateDatetimeLocation = this.updateDatetimeLocation.bind(this);
    this.updateChartPrefs = this.updateChartPrefs.bind(this);

    this.unsubscribeStore = null;
  }

  reduxListener() {
    const { store } = this.props;
    const { chartStates } = this.state;
    const reduxState = store.getState();
    if (!_.isEqual(reduxState.viz.trends, this.state.chartStates.trends)) {
      this.setState({ chartStates: { ...chartStates, trends: _.cloneDeep(reduxState.viz.trends) } });
    }
  }

  componentDidMount() {
    const { store } = this.props;
    this.log.debug('Mounting...');
    this.unsubscribeStore = store.subscribe(this.reduxListener.bind(this));
    this.handleRefresh();
  }

  componentWillUnmount() {
    this.log.debug('Unmounting...');
    if (typeof this.unsubscribeStore === 'function') {
      this.log('componentWillUnmount => unsubscribeStore()');
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }

  render() {
    const { loadingState, chartType, errorMessage } = this.state;

    let loader = null;
    let messages = null;
    let patientData = null;
    let errorDisplay = null;

    switch (loadingState) {
      case LOADING_STATE_DONE:
        if (chartType === 'daily') {
          messages = this.renderMessagesContainer();
        }
        patientData = this.renderPatientData();
        break;
      case LOADING_STATE_NONE:
        messages = <p>Please select a patient</p>;
        break;
      case LOADING_STATE_EARLIER_FETCH:
      case LOADING_STATE_EARLIER_PROCESS:
      case LOADING_STATE_INITIAL_FETCH:
      case LOADING_STATE_INITIAL_PROCESS:
        loader = <Loader />;
        break;
      default:
        errorDisplay = <p>{errorMessage ?? t('Failed somewhere')}</p>;
        break;
    }

    return (
      <div className='patient-data patient-data-yourloops'>
        {messages}
        {patientData}
        {loader}
        {errorDisplay}
      </div>
    );
  }

  renderPatientData() {
    if (this.isInsufficientPatientData()) {
      return this.renderNoData();
    }
    return this.renderChart();
  }

  renderEmptyHeader() {
    return <Header chartType={'no-data'} inTransition={false} atMostRecent={false} title={t('Data')} canPrint={false} />;
  }

  renderInitialLoading() {
    const header = this.renderEmptyHeader();
    return (
      <div>
        {header}
        <div className='container-box-outer patient-data-content-outer'>
          <div className='container-box-inner patient-data-content-inner'>
            <div className='patient-data-content'></div>
          </div>
        </div>
      </div>
    );
  }

  renderNoData() {
    const header = this.renderEmptyHeader();
    const noDataText = t('{{patientName}} does not have any data yet.', {
      patientName: personUtils.patientFullName(this.props.patient)
    });
    const reloadBtnText = t('Click to reload.');

    return (
      <div>
        {header}
        <div className='container-box-outer patient-data-content-outer'>
          <div className='container-box-inner patient-data-content-inner'>
            <div className='patient-data-content'>
              <div className='patient-data-message-no-data'>
                <p>{noDataText}</p>
                <button type='button' className='btn btn-primary' onClick={this.handleClickNoDataRefresh}>
                  {reloadBtnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  isInsufficientPatientData() {
    /** @type {PatientData} */
    const diabetesData = _.get(this.state, 'processedPatientData.diabetesData', []);
    if (_.isEmpty(diabetesData)) {
      this.log.error('Sorry, tideline is kind of pointless with only messages.');
      return true;
    }
    return false;
  }

  renderSettings() {
    const { patient } = this.props;
    const { canPrint } = this.state;
    return (
      <div>
        <div className='app-no-print'>
          <Settings
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={patient.userid}
            timePrefs={this.state.timePrefs}
            patient={patient}
            patientData={this.state.processedPatientData}
            canPrint={canPrint}
            permsOfLoggedInUser={this.state.permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onClickPrint={this.handleClickPrint}
            trackMetric={this.trackMetric}
            uploadUrl={config.UPLOAD_API}
          />
        </div>
      </div>
    );
  }

  renderChart() {
    const { patient, profileDialog } = this.props;
    const { canPrint, permsOfLoggedInUser, loadingState, chartPrefs, chartStates } = this.state;

    switch (this.state.chartType) {
      case 'basics':
        return (
          <Basics
            profileDialog={profileDialog}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            dataUtil={this.dataUtil}
            endpoints={this.state.endpoints}
            timePrefs={this.state.timePrefs}
            patient={patient}
            patientData={this.state.processedPatientData}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            permsOfLoggedInUser={permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            updateBasicsData={this.updateBasicsData}
            updateBasicsSettings={this.updateBasicsSettings}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            uploadUrl={config.UPLOAD_API}
            ref={this.chartRef} />
          );
      case 'daily':
        return (
          <Daily
            profileDialog={profileDialog}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            dataUtil={this.dataUtil}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.datetimeLocation}
            patient={patient}
            patientData={this.state.processedPatientData}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            permsOfLoggedInUser={permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread.bind(this)}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation}
            ref={this.chartRef} />
          );
      case 'trends':
        return (
          <Trends
            profileDialog={profileDialog}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            currentPatientInViewId={patient.userid}
            dataUtil={this.dataUtil}
            timePrefs={this.state.timePrefs}
            initialDatetimeLocation={this.state.datetimeLocation}
            patient={patient}
            patientData={this.state.processedPatientData}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            permsOfLoggedInUser={permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation}
            uploadUrl={config.UPLOAD_API}
            trendsState={chartStates.trends}
            endpoints={this.state.endpoints}
          />
        );
      case 'settings':
        return this.renderSettings();
    }
  }

  renderMessagesContainer() {
    const { patient, api } = this.props;
    const { createMessageDatetime, messageThread, timePrefs } = this.state;
    if (createMessageDatetime) {
      const user = api.whoami;
      return (
        <Messages
          createDatetime={createMessageDatetime}
          user={user}
          patient={patient}
          onClose={this.closeMessageCreation.bind(this)}
          onSave={this.handleCreateNote.bind(this)}
          onNewMessage={this.handleMessageCreation.bind(this)}
          onEdit={this.handleEditMessage.bind(this)}
          timePrefs={timePrefs}
          trackMetric={this.trackMetric} />
      );
    } else if (Array.isArray(messageThread)) {
      const user = api.whoami;
      return (
        <Messages
          messages={messageThread}
          user={user}
          patient={patient}
          onClose={this.closeMessageThread.bind(this)}
          onSave={this.handleReplyToMessage.bind(this)}
          onEdit={this.handleEditMessage.bind(this)}
          timePrefs={timePrefs}
          trackMetric={this.trackMetric} />
      );
    }
  }

  generatePDFStats(data, state) {
    const {
      bgBounds,
      bgUnits,
      latestPump: { manufacturer, deviceModel },
    } = this.dataUtil;
    const isAutomatedBasalDevice = isAutomatedBasalDeviceCheck(manufacturer, deviceModel);

    const getStat = (statType) => {
      const { bgSource, days } = this.dataUtil;

      return getStatDefinition(this.dataUtil[statFetchMethods[statType]](), statType, {
        bgSource,
        days,
        bgPrefs: {
          bgBounds,
          bgUnits,
        },
        manufacturer,
      });
    };

    const basicsDateRange = _.get(data, 'basics.dateRange');
    if (basicsDateRange) {
      data.basics.endpoints = [basicsDateRange[0], getLocalizedCeiling(basicsDateRange[1], state.timePrefs).toISOString()];

      this.dataUtil.endpoints = data.basics.endpoints;

      data.basics.stats = {
        [commonStats.timeInRange]: getStat(commonStats.timeInRange),
        [commonStats.readingsInRange]: getStat(commonStats.readingsInRange),
        [commonStats.totalInsulin]: getStat(commonStats.totalInsulin),
        [commonStats.timeInAuto]: isAutomatedBasalDevice ? getStat(commonStats.timeInAuto) : undefined,
        [commonStats.carbs]: getStat(commonStats.carbs),
        [commonStats.averageDailyDose]: getStat(commonStats.averageDailyDose),
      };
    }

    const dailyDateRanges = _.get(data, 'daily.dataByDate');
    if (dailyDateRanges) {
      _.forIn(
        dailyDateRanges,
        _.bind(function (value, key) {
          data.daily.dataByDate[key].endpoints = [
            getLocalizedCeiling(dailyDateRanges[key].bounds[0], state.timePrefs).toISOString(),
            getLocalizedCeiling(dailyDateRanges[key].bounds[1], state.timePrefs).toISOString(),
          ];

          this.dataUtil.endpoints = data.daily.dataByDate[key].endpoints;

          data.daily.dataByDate[key].stats = {
            [commonStats.timeInRange]: getStat(commonStats.timeInRange),
            [commonStats.averageGlucose]: getStat(commonStats.averageGlucose),
            [commonStats.totalInsulin]: getStat(commonStats.totalInsulin),
            [commonStats.timeInAuto]: isAutomatedBasalDevice ? getStat(commonStats.timeInAuto) : undefined,
            [commonStats.carbs]: getStat(commonStats.carbs),
          };
        }, this)
      );
    }

    const bgLogDateRange = _.get(data, 'bgLog.dateRange');
    if (bgLogDateRange) {
      data.bgLog.endpoints = [
        getLocalizedCeiling(bgLogDateRange[0], state.timePrefs).toISOString(),
        addDuration(getLocalizedCeiling(bgLogDateRange[1], state.timePrefs).toISOString(), 864e5),
      ];

      this.dataUtil.endpoints = data.bgLog.endpoints;

      data.bgLog.stats = {
        [commonStats.averageGlucose]: getStat(commonStats.averageGlucose),
      };
    }

    return data;
  }

  generatePDF(props, state) {
    const data = state.processedPatientData;
    const diabetesData = data.diabetesData;

    const patientSettings = _.get(props, 'patient.settings', {});
    const siteChangeSource = state.updatedSiteChangeSource || _.get(props, 'patient.settings.siteChangeSource');
    const pdfPatient = _.assign({}, props.patient, {
      settings: _.assign({}, patientSettings, { siteChangeSource }),
    });

    const mostRecent = diabetesData[diabetesData.length - 1].normalTime;
    const opts = {
      bgPrefs: state.bgPrefs,
      numDays: state.printOpts.numDays,
      patient: pdfPatient,
      timePrefs: state.timePrefs,
      mostRecent,
    };

    const dailyData = vizUtils.data.selectDailyViewData(
      mostRecent,
      _.pick(data.grouped, ['basal', 'bolus', 'cbg', 'food', 'message', 'smbg', 'upload', 'physicalActivity']),
      state.printOpts.numDays.daily,
      state.timePrefs
    );

    const bgLogData = vizUtils.data.selectBgLogViewData(
      mostRecent,
      _.pick(data.grouped, ['smbg']),
      state.printOpts.numDays.bgLog,
      state.timePrefs
    );

    const pdfData = {
      basics: data.basicsData,
      daily: dailyData,
      settings: _.last(data.grouped.pumpSettings),
      bgLog: bgLogData,
    };

    this.generatePDFStats(pdfData, state);

    this.log('Generating PDF with', pdfData, opts);

    return createPrintPDFPackage(pdfData, opts);
  }

  subtractTimezoneOffset(datetime, timezoneSettings = this.state.timePrefs) {
    const dateMoment = moment.utc(datetime);

    if (dateMoment.isValid()) {
      let timezoneOffset = 0;

      if (_.get(timezoneSettings, 'timezoneAware')) {
        timezoneOffset = sundial.getOffsetFromZone(dateMoment.toISOString(), timezoneSettings.timezoneName);
      }
      return dateMoment.subtract(timezoneOffset, 'minutes').toISOString();
    }

    return datetime;
  }

  /**
   *
   * @param {string[]} newEndpoints
   * @param {() => void} cb callback
   */
  handleChartDateRangeUpdate(newEndpoints, cb = _.noop) {
    const { endpoints } = this.state;
    if (!_.isEqual(endpoints, newEndpoints)) {
      this.setState({ endpoints: newEndpoints }, cb);
    } else if (_.isFunction(cb)) {
      cb();
    }
  }

  async handleMessageCreation(message) {
    this.log.debug('handleMessageCreation', message);
    const shapedMessage = nurseShark.reshapeMessage(message);

    this.log.debug({ message, shapedMessage });
    await this.chartRef.current.createMessage(nurseShark.reshapeMessage(message));
    this.trackMetric('message', { action: 'Created New Message' });
  }

  async handleReplyToMessage(comment) {
    const { api } = this.props;
    const id = await api.replyMessageThread(comment);
    this.trackMetric('Replied To Message');
    return id;
  }

  /**
   * Create a new note
   * @param {MessageNote} message the message
   * @returns {Promise<string>}
   */
  handleCreateNote(message) {
    const { api } = this.props;
    return api.startMessageThread(message);
  }

  /**
   * Callback after a message is edited.
   * @param {MessageNote} message the edited message
   * @returns {Promise<void>}
   */
  async handleEditMessage(message) {
    this.log.debug("handleEditMessage", { message });
    const { api } = this.props;

    await api.editMessage(message);
    this.trackMetric('message', { action: 'edited' });

    if (_.isEmpty(message.parentmessage)) {
      // Daily timeline view only cares for top-level note
      const reshapedMessage = nurseShark.reshapeMessage(message);
      this.chartRef.current.editMessage(reshapedMessage);
    }
  }

  async handleShowMessageThread(messageThread) {
    this.log.debug("handleShowMessageThread", messageThread);
    const { api } = this.props;

    const messages = await api.getMessageThread(messageThread);
    this.setState({ messageThread: messages });
    this.trackMetric('message', { action: 'Clicked Message Icon' });
  }

  handleShowMessageCreation(/** @type {moment.Moment | Date} */ datetime) {
    const { endpoints, timePrefs } = this.state;
    this.log.debug('handleShowMessageCreation', { datetime, endpoints });
    let mDate = datetime;
    let action = 'Create a message from background';
    if (datetime === null) {
      action = 'Clicked create a message';
      const begin = moment.utc(endpoints[0]).valueOf();
      const end = moment.utc(endpoints[1]).valueOf();
      const timestamp = begin + (end - begin) / 2;
      mDate = moment.utc(timestamp).tz(timePrefs.timezoneName);
    }
    this.setState({ createMessageDatetime : mDate.toISOString() });

    this.trackMetric('message', { action, date: mDate });
  }

  closeMessageThread() {
    this.setState({ createMessageDatetime: null, messageThread: null });
    this.trackMetric('message', { action: 'Closed Message Thread Modal' });
  }

  closeMessageCreation() {
    this.setState({ createMessageDatetime: null, messageThread: null });
  }

  handleSwitchToBasics(e) {
    this.trackMetric('Clicked Switch To Basics', {
      fromChart: this.state.chartType,
    });
    if (e) {
      e.preventDefault();
    }

    this.dataUtil.chartPrefs = this.state.chartPrefs['basics'];
    this.setState({
      chartType: 'basics',
    });
  }

  handleSwitchToDaily(datetime, title) {
    this.trackMetric('Clicked Basics ' + title + ' calendar', {
      fromChart: this.state.chartType,
    });

    // We set the dateTimeLocation to noon so that the view 'centers' properly, showing the entire day
    const dateCeiling = getLocalizedCeiling(datetime || this.state.endpoints[1], this.state.timePrefs);
    const timezone = getTimezoneFromTimePrefs(this.state.timePrefs);

    const datetimeLocation = moment.utc(dateCeiling.valueOf()).tz(timezone).subtract(1, 'day').hours(12).toISOString();

    this.dataUtil.chartPrefs = this.state.chartPrefs['daily'];
    this.setState({
      chartType: 'daily',
      datetimeLocation,
    });
  }

  handleSwitchToTrends(datetime) {
    this.trackMetric('Clicked Switch To Modal', {
      fromChart: this.state.chartType,
    });

    // We set the dateTimeLocation to noon so that the view 'centers' properly, showing the entire day
    const dateCeiling = getLocalizedCeiling(datetime || this.state.endpoints[1], this.state.timePrefs);
    const timezone = getTimezoneFromTimePrefs(this.state.timePrefs);

    const datetimeLocation = moment.utc(dateCeiling.valueOf()).tz(timezone).toISOString();

    this.dataUtil.chartPrefs = this.state.chartPrefs['trends'];
    this.setState({
      chartType: 'trends',
      datetimeLocation,
    });
  }

  handleSwitchToSettings(e) {
    this.trackMetric('Clicked Switch To Settings', {
      fromChart: this.state.chartType,
    });
    if (e) {
      e.preventDefault();
    }
    this.setState({
      chartType: 'settings',
    });
  }

  handleClickPrint = () => {
    function openPDFWindow(pdf) {
      const printWindow = window.open(pdf.url);
      if (printWindow !== null) {
        printWindow.focus();
        if (!utils.isFirefox()) {
          printWindow.print();
        }
      }
    }

    this.trackMetric('Clicked Print', {
      fromChart: this.state.chartType,
    });

    // Return a promise for the tests
    return new Promise((resolve, reject) => {
      if (this.state.pdf !== null) {
        openPDFWindow(this.state.pdf);
        resolve();
      } else {
        const { processingData, processedPatientData, loadingState } = this.state;
        let hasDiabetesData = false;
        if (processedPatientData !== null) {
          hasDiabetesData = _.get(processedPatientData, 'diabetesData.length', 0) > 0;
        }

        if (loadingState === LOADING_STATE_DONE && !processingData && hasDiabetesData) {
          this.generatePDF(this.props, this.state)
            .then((pdf) => {
              openPDFWindow(pdf);
              this.setState({ pdf });
              resolve();
            })
            .catch((err) => {
              this.log('generatePDF:', err);
              if (_.isFunction(window.onerror)) {
                window.onerror('print', 'patient-data', 0, 0, err);
              }
              reject(err);
            });
        } else {
          resolve();
        }
      }
    });
  }

  handleClickRefresh(/* e */) {
    this.trackMetric('Clicked Refresh');
    this.handleRefresh();
  }

  handleClickNoDataRefresh(/* e */) {
    this.trackMetric('Clicked No Data Refresh');
    this.handleRefresh();
  }

  onLoadingFailure(err) {
    // TODO A cleaner message
    const errorMessage = _.isError(err) ? err.message : (new String(err)).toString();
    this.log.error(errorMessage, err);
    this.setState({ loadingState: LOADING_STATE_ERROR, errorMessage });
  }

  updateBasicsData(basicsData) {
    const { processedPatientData } = this.state;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // only attempt to update data if there's already data present to update
    if (processedPatientData) {
      const patientData = _.assign(_.cloneDeep(processedPatientData), { basicsData });
      this.setState({
        processedPatientData: patientData,
      });
    }
  }

  updateBasicsSettings(patientId, settings, canUpdateSettings) {
    this.log.warn('TODO', patientId, settings, canUpdateSettings);
    // if (canUpdateSettings) {
    //   this.props.updateBasicsSettings(patientId, settings);
    // }

    // // If the user makes a change to the site change source settings,
    // // we should remove the currently generated PDF, which will trigger a rebuild of
    // // the PDF with the updated settings.
    // const settingsSiteChangeSource = _.get(this.props, 'patient.settings.siteChangeSource');
    // if (settings.siteChangeSource && settings.siteChangeSource !== settingsSiteChangeSource) {
    //   this.setState({ updatedSiteChangeSource: settings.siteChangeSource, pdf: null });
    // }
  }

  updateChartPrefs(updates, cb) {
    this.log.debug('updateChartPrefs', { updates, cb });
    const newPrefs = {
      ...this.state.chartPrefs,
      ...updates,
    };

    this.dataUtil.chartPrefs = newPrefs[this.state.chartType];
    this.setState(
      {
        chartPrefs: newPrefs,
      },
      cb
    );
  }

  updateDatetimeLocation(datetime, cb) {
    this.setState(
      {
        datetimeLocation: datetime,
      },
      cb
    );
  }

  updateChartEndpoints(endpoints, cb) {
    this.setState(
      {
        endpoints,
      },
      cb
    );
  }

  deriveChartTypeFromLatestData(latestData, uploads) {
    let chartType = 'basics'; // Default to 'basics'

    if (latestData && uploads) {
      // Ideally, we determine the default view based on the device type
      // so that, for instance, if the latest data type is cgm, but comes from
      // an insulin-pump, we still direct them to the basics view
      const deviceMap = _.keyBy(uploads, 'deviceId');
      const latestDataDevice = deviceMap[latestData.deviceId];

      if (latestDataDevice) {
        const tags = deviceMap[latestData.deviceId].deviceTags;

        switch (true) {
          case _.includes(tags, 'insulin-pump'):
            chartType = 'basics';
            break;

          case _.includes(tags, 'cgm'):
            chartType = 'trends';
            break;

          case _.includes(tags, 'bgm'):
            chartType = config.BRANDING === 'diabeloop' ? 'daily' : 'bgLog';
            break;
        }
      } else {
        // If we were unable, for some reason, to get the device tags for the
        // latest upload, we can fall back to setting the default view by the data type
        const type = latestData.type;

        switch (type) {
          case 'bolus':
          case 'basal':
          case 'wizard':
            chartType = 'basics';
            break;

          case 'cbg':
            chartType = 'trends';
            break;

          case 'smbg':
            chartType = config.BRANDING === 'diabeloop' ? 'daily' : 'bgLog';
            break;
        }
      }
    }

    return chartType;
  }

  fetchEarlierData(options = {}, cb) {
    const { patient } = this.props;
    const patientID = patient.userid;
    // Return if we've already fetched all data, or are currently fetching
    if (_.get(this.props, 'fetchedPatientDataRange.fetchedUntil') === 'start') {
      if (cb) {
        cb();
      }
      return;
    }

    this.log('fetching');

    const earliestRequestedData = _.get(this.props, 'fetchedPatientDataRange.fetchedUntil');

    const requestedPatientDataRange = {
      start: moment.utc(earliestRequestedData).subtract(16, 'weeks').toISOString(),
      end: moment.utc(earliestRequestedData).subtract(1, 'milliseconds').toISOString(),
    };

    const count = this.state.fetchEarlierDataCount + 1;

    this.setState(
      {
        // requestedPatientDataRange,
        // fetchEarlierDataCount: count,
        canPrint: false,
      },
      () => {
        const fetchOpts = _.defaults(options, {
          startDate: requestedPatientDataRange.start,
          endDate: requestedPatientDataRange.end,
          // carelink: this.props.carelink,
          // dexcom: this.props.dexcom,
          // medtronic: this.props.medtronic,
          useCache: false,
          initial: false,
        });

        this.props.onFetchEarlierData(fetchOpts, patientID);

        this.trackMetric('Fetched earlier patient data', { patientID, count });
        if (cb) {
          cb();
        }
      }
    );
  }

  getLastDatumToProcessIndex(unprocessedData, targetDatetime) {
    let diabetesDataCount = 0;

    // First, we get the index of the first diabetes datum that falls outside of our processing window.
    let targetIndex = _.findIndex(unprocessedData, (datum) => {
      const isDiabetesDatum = _.includes(DiabetesDataTypesForDatum, datum.type);

      if (isDiabetesDatum) {
        diabetesDataCount++;
      }

      return targetDatetime > datum.time && isDiabetesDatum;
    });

    if (targetIndex === -1) {
      // If we didn't find a cutoff point (i.e. no diabetes datums beyond the cutoff time),
      // we process all the remaining fetched, unprocessed data.
      targetIndex = unprocessedData.length;
      this.log('No diabetes data found beyond current processing slice.  Processing all remaining unprocessed data');
    } else if (diabetesDataCount === 1) {
      // If the first diabetes datum found was outside of our processing window, we need to include it.
      targetIndex++;
      this.log('First diabetes datum found was outside current processing slice.  Adding it to slice');
    }

    // Because targetIndex was set to the first one outside of our processing window, and we're
    // looking for the last datum to process, we decrement by one and return
    return --targetIndex;
  }

  handleRefresh() {
    const { api, patient } = this.props;

    // TODO bgUnits from api.whoami
    this.setState({
      loadingState: LOADING_STATE_INITIAL_FETCH,
      endpoints: [],
      initialDatetimeLocation: new Date().toISOString(),
      fetchEarlierDataCount: 0,
      lastDatumProcessedIndex: -1,
      lastProcessedDateTarget: null,
      processEarlierDataCount: 0,
      processedPatientData: null,
      pdf: null,
      canPrint: false,
    }, () => {
      Promise.all([
        api.loadPatientData(patient),
        api.getMessages(patient.userid),
      ]).then(([ patientData, messagesNotes ]) => {
        const combinedData = patientData.concat(messagesNotes);
        this.setState({ loadingState: LOADING_STATE_INITIAL_PROCESS });
        return this.processData(combinedData);
      }).catch((reason) => {
        this.onLoadingFailure(reason);
      });
    });
  }

  /**
   *
   * @param {PatientData} data
   */
  async processData(data) {
    const { store, patient } = this.props;
    const { timePrefs, bgPrefs } = this.state;

    const opts = {
      timePrefs,
      ...bgPrefs,
    };

    console.time('process data');
    const res = nurseShark.processData(data, opts.bgUnits);
    await waitTimeout(1);
    const tidelineData = new TidelineData(opts);
    await tidelineData.addData(res.processedData);
    console.timeEnd('process data');

    if (_.isEmpty(tidelineData.data)) {
      throw new Error(t('No data to display!'));
    }

    this.log.info('Initial endpoints:', tidelineData.endpoints);
    this.log.info('Time prefs', tidelineData.opts.timePrefs);

    this.dataUtil = new DataUtils(
      tidelineData.data.concat(_.get(tidelineData, 'grouped.upload', [])),
      { bgPrefs, timePrefs }
    );

    this.setState({
      bgPrefs: {
        bgUnits: tidelineData.opts.bgUnits,
        bgClasses: tidelineData.opts.bgClasses,
      },
      timePrefs: tidelineData.opts.timePrefs,
      processedPatientData: tidelineData,
      loadingState: LOADING_STATE_DONE,
      endpoints: tidelineData.endpoints,
      canPrint: true,
    }, () => {
      store.dispatch({
        type: FETCH_PATIENT_DATA_SUCCESS,
        payload: {
          patientId: patient.userid,
        },
      });
    });
  }
}

PatientDataPage.propTypes = {
  api: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  profileDialog: PropTypes.func.isRequired,
};

export default PatientDataPage;
