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

/* global __DEV__ */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import bows from 'bows';
import moment from 'moment-timezone';
import launchCustomProtocol from 'custom-protocol-detection';

import * as actions from '../../redux/actions';
import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';
import { header as Header } from '../../components/chart';
import { basics as Basics } from '../../components/chart';
import { daily as Daily } from '../../components/chart';
import Trends from '../../components/chart/trends';
import Stats from '../../components/chart/stats';
import { bgLog as BgLog } from '../../components/chart';
import { settings as Settings } from '../../components/chart';
import UploadLaunchOverlay from '../../components/uploadlaunchoverlay';
import baseTheme from '../../themes/baseTheme';

import Messages from '../../components/messages';
import UploaderButton from '../../components/uploaderbutton';
import ChartDateRangeModal from '../../components/ChartDateRangeModal';
import PrintDateRangeModal from '../../components/PrintDateRangeModal';
import Button from '../../components/elements/Button';

import ToastContext from '../../providers/ToastProvider';

import { Box } from 'rebass/styled-components';
import Checkbox from '../../components/elements/Checkbox';
import PopoverLabel from '../../components/elements/PopoverLabel';
import { Paragraph2 } from '../../components/elements/FontStyles';

import {
  URL_TIDEPOOL_MOBILE_APP_STORE,
} from '../../core/constants';

const { Loader } = vizComponents;
const { getLocalizedCeiling, getTimezoneFromTimePrefs } = vizUtils.datetime;
const { commonStats, getStatDefinition } = vizUtils.stat;

export const PatientDataClass = createReactClass({
  displayName: 'PatientData',

  propTypes: {
    addingData: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    data: PropTypes.object,
    dataWorkerRemoveDataRequest: PropTypes.func.isRequired,
    dataWorkerRemoveDataSuccess: PropTypes.func.isRequired,
    dataWorkerQueryDataRequest: PropTypes.func.isRequired,
    fetchers: PropTypes.array.isRequired,
    fetchingPatient: PropTypes.bool.isRequired,
    fetchingPatientData: PropTypes.bool.isRequired,
    fetchingUser: PropTypes.bool.isRequired,
    generatePDFRequest: PropTypes.func.isRequired,
    generatingPDF: PropTypes.object.isRequired,
    isUserPatient: PropTypes.bool.isRequired,
    messageThread: PropTypes.array,
    onCloseMessageThread: PropTypes.func.isRequired,
    onCreateMessage: PropTypes.func.isRequired,
    onEditMessage: PropTypes.func.isRequired,
    onFetchMessageThread: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onSaveComment: PropTypes.func.isRequired,
    patient: PropTypes.object,
    pdf: PropTypes.object,
    queryingData: PropTypes.object.isRequired,
    queryParams: PropTypes.object.isRequired,
    removeGeneratedPDFS: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateBasicsSettings: PropTypes.func.isRequired,
    updatingDatum: PropTypes.object.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    user: PropTypes.object,
  },

  getInitialState: function() {
    var state = {
      chartPrefs: {
        basics: {
          stats: {
            excludeDaysWithoutBolus: false,
          },
          sections: {},
          extentSize: 14,
        },
        daily: {
          extentSize: 1,
        },
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

          // Formerly in viz.trends redux store
          cbgFlags: {
            cbg100Enabled: true,
            cbg80Enabled: true,
            cbg50Enabled: true,
            cbgMedianEnabled: true,
          },
          focusedCbgDateTrace: null,
          focusedCbgSlice: null,
          focusedCbgSliceKeys: null,
          focusedSmbg: null,
          focusedSmbgRangeAvg: null,
          showingCbgDateTraces: false,
          touched: false,
        },
        bgLog: {
          bgSource: 'smbg',
          extentSize: 14,
        },
        settings: {
          touched: false,
        },
        excludedDevices: [],
      },
      datesDialogOpen: false,
      datesDialogProcessing: false,
      datesDialogFetchingData: false,
      printDialogOpen: false,
      printDialogProcessing: false,
      printDialogPDFOpts: null,
      createMessage: null,
      createMessageDatetime: null,
      datetimeLocation: null,
      queryDataCount: 0,
      fetchEarlierDataCount: 0,
      loading: true,
      transitioningChartType: false,
      timePrefs: {},
      showUploadOverlay: false,
    };

    return state;
  },

  log: bows('PatientData'),

  isInitialProcessing: function() {
    const isSettings = this.state.chartType === 'settings';
    const dataFetched = _.get(this.props.data, 'metaData.size');
    const isEmptyDataSet = dataFetched === 0;
    const rangeDataLoaded = isSettings || _.get(this.state, 'chartEndpoints.current.0', 0) !== 0;

    return isEmptyDataSet
      ? false
      : !dataFetched || !rangeDataLoaded;
  },

  render: function() {
    const patientData = this.renderPatientData();
    const messages = this.renderMessagesContainer();
    const datesDialog = this.renderDatesDialog();
    const printDialog = this.renderPrintDialog();
    const showLoader = this.isInitialProcessing() || this.state.transitioningChartType;

    return (
      <div className="patient-data js-patient-data-page">
        {messages}
        {patientData}
        {datesDialog}
        {printDialog}
        <Loader show={showLoader} />
      </div>
    );
  },

  renderPatientData: function() {
    if (this.isInitialProcessing() || this.state.transitioningChartType) {
      return this.renderInitialLoading();
    }

    if (this.isEmptyPatientData() || this.isInsufficientPatientData()) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  renderEmptyHeader: function(title) {
    const { t } = this.props;
    const headerTitle = title || t('Preparing Chart Data');
    return (
      <Header
        chartType={'no-data'}
        inTransition={false}
        atMostRecent={false}
        title={headerTitle}
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
    const { t } = this.props;
    var content = t('{{patientName}} does not have any data yet.', {patientName: personUtils.patientFullName(this.props.patient)});
    var header = this.renderEmptyHeader('No Data Available');
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
        <Trans className="patient-data-uploader-message" i18nKey="html.patientdata-uploaded-message">
          <h1>To see your data, you’ll need the Tidepool Uploader</h1>
          <UploaderButton
            onClick={handleClickUpload}
            buttonText='Get the Tidepool Uploader' />
          <p>Already have the Tidepool Uploader? Launch it <a className="uploader-color-override" href='' onClick={handleClickLaunch} title="Upload data">here</a></p>
          <p>To upload Dexcom with iPhone, get <a href={URL_TIDEPOOL_MOBILE_APP_STORE} className="uploader-color-override" target="_blank" rel="noreferrer noopener" onClick={handleClickBlipNotes}>Tidepool Mobile</a></p>
          <p className="patient-no-data-help">
            Already uploaded? <a href="" className="uploader-color-override" onClick={this.handleClickNoDataRefresh}>Click to reload.</a><br />
            <b>Need help?</b> Email us at <a className="uploader-color-override" href="mailto:support@tidepool.org">support@tidepool.org</a> or visit our <a className="uploader-color-override" href="http://support.tidepool.org/">help page</a>.
          </p>
        </Trans>
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
    return <UploadLaunchOverlay modalDismissHandler={()=>{this.setState({showUploadOverlay: false})}}/>
  },

  renderDatesDialog: function() {
    return (
      <ChartDateRangeModal
        chartType={this.state.chartType}
        defaultDates={_.get(this.state, 'chartEndpoints.current')}
        id="chart-dates-dialog"
        mostRecentDatumDate={this.getMostRecentDatumTimeByChartType()}
        open={this.state.datesDialogOpen}
        onClose={this.closeDatesDialog}
        onSubmit={dates => {
          this.setState({ datesDialogProcessing: true });

          // Determine the earliest startDate needed to fetch data to.
          const startDate = moment.utc(dates[0]).tz(getTimezoneFromTimePrefs(this.state.timePrefs)).toISOString();
          const endDate = moment.utc(dates[1]).tz(getTimezoneFromTimePrefs(this.state.timePrefs)).toISOString();
          const fetchedUntil = _.get(this.props, 'data.fetchedUntil');

          const updateOpts = {
            showLoading: true,
            updateChartEndpoints: true,
          };

          if (startDate < fetchedUntil) {
            this.setState({ datesDialogFetchingData: true });

            this.fetchEarlierData({
              returnData: false,
              showLoading: true,
              startDate,
            });
          } else {
            this.closeDatesDialog();
          }
          this.updateChart(this.state.chartType, endDate, dates, updateOpts);
        }}
        processing={this.state.datesDialogProcessing}
        timePrefs={this.state.timePrefs}
        trackMetric={this.props.trackMetric}
      />
    );
  },

  renderPrintDialog: function() {
    return (
      <PrintDateRangeModal
        id="print-dialog"
        mostRecentDatumDates={{
          basics: this.getMostRecentDatumTimeByChartType(this.props, 'basics'),
          bgLog: this.getMostRecentDatumTimeByChartType(this.props, 'bgLog'),
          daily: this.getMostRecentDatumTimeByChartType(this.props, 'daily'),
        }}
        open={this.state.printDialogOpen}
        onClose={this.closePrintDialog}
        onClickPrint={opts => {
          this.setState({ printDialogProcessing: true })

          // Determine the earliest startDate needed to fetch data to.
          const earliestPrintDate = _.min(_.at(opts, _.map(_.keys(opts), key => `${key}.endpoints.0`)));
          const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(this.state.timePrefs)).toISOString()
          const fetchedUntil = _.get(this.props, 'data.fetchedUntil');

          if (startDate < fetchedUntil) {
            this.fetchEarlierData({
              returnData: false,
              showLoading: false,
              startDate,
            });

            // In cases where we need to fetch data via an async backend call, we need to pre-open
            // the PDF tab ahead of time. Otherwise, it will be treated as a popup, and likely blocked.
            if (!this.printWindowRef || this.printWindowRef.closed) {
              const waitMessage = this.props.t('Please wait while Tidepool generates your PDF report.');
              this.printWindowRef = window.open();
              this.printWindowRef.document.write(`<p align="center" style="margin-top:20px;font-size:16px;font-family:sans-serif">${waitMessage}</p>`);
            }

            this.setState({ printDialogPDFOpts: opts });
          } else {
            this.generatePDF(this.props, this.state, opts);
          }
        }}
        processing={this.state.printDialogProcessing}
        timePrefs={this.state.timePrefs}
        trackMetric={this.props.trackMetric}
      />
    );
  },

  isEmptyPatientData: function() {
    return (!_.get(this.props, 'patient.userid', false) || _.get(this.props.data, 'metaData.size', 0) <= 0);
  },

  isInsufficientPatientData: function() {
    var latestDataByType = _.values(_.get(this.props.data, 'metaData.latestDatumByType', {}));

    if (_.reject(latestDataByType, function(d) { return d.type === 'message'; }).length === 0) {
      this.log('Sorry, Tidepool Web is kind of pointless with only messages.');
      return true;
    }
    return false;
  },

  renderSettings: function(){
    return (
      <div>
        <div className="app-no-print">
          <Settings
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            data={this.props.data}
            patient={this.props.patient}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToBgLog={this.handleSwitchToBgLog}
            onClickPrint={this.handleClickPrint}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            uploadUrl={this.props.uploadUrl}
            ref="tideline" />
        </div>
      </div>
    );
  },

  renderChart: function() {
    const isBasics = this.state.chartType === 'basics';
    const stats = this.generateStats();
    let aggregations;

    if (isBasics) aggregations = this.getBasicsAggregations();

    window.downloadChartData = () => {
      console.save({
        chartPrefs: this.state.chartPrefs[this.state.chartType],
        data: this.props.data,
        aggregations,
        stats: _.map(stats, stat => _.omit(stat, 'children')),
      }, `data-${this.state.chartType}.json`);
    };

    switch (this.state.chartType) {
      case 'basics':
        return (
          <Basics
            chartPrefs={this.state.chartPrefs}
            data={this.props.data}
            initialDatetimeLocation={this.state.datetimeLocation}
            loading={this.state.loading}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToBgLog={this.handleSwitchToBgLog}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            onClickChartDates={this.handleClickChartDates}
            patient={this.props.patient}
            permsOfLoggedInUser={this.props.permsOfLoggedInUser}
            aggregations={aggregations}
            stats={stats}
            updateBasicsSettings={this.updateBasicsSettings}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            uploadUrl={this.props.uploadUrl}
            ref="tideline"
            removeGeneratedPDFS={this.props.removeGeneratedPDFS} />
          );
      case 'daily':
        return (
          <Daily
            addingData={this.props.addingData}
            chartPrefs={this.state.chartPrefs}
            data={this.props.data}
            initialDatetimeLocation={this.state.datetimeLocation}
            loading={this.state.loading}
            mostRecentDatetimeLocation={this.state.mostRecentDatetimeLocation}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToBgLog={this.handleSwitchToBgLog}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            patient={this.props.patient}
            stats={stats}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            updatingDatum={this.props.updatingDatum}
            queryDataCount={this.state.queryDataCount}
            ref="tideline"
            removeGeneratedPDFS={this.props.removeGeneratedPDFS} />
          );
      case 'trends':
        return (
          <Trends
            addingData={this.props.addingData}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={this.props.currentPatientInViewId}
            data={this.props.data}
            initialDatetimeLocation={this.state.datetimeLocation}
            loading={this.state.loading}
            mostRecentDatetimeLocation={this.state.mostRecentDatetimeLocation}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToBgLog={this.handleSwitchToBgLog}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            patient={this.props.patient}
            stats={stats}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            uploadUrl={this.props.uploadUrl}
            queryDataCount={this.state.queryDataCount}
            ref="tideline"
            removeGeneratedPDFS={this.props.removeGeneratedPDFS} />
          );
      case 'bgLog':
        return (
          <BgLog
            addingData={this.props.addingData}
            chartPrefs={this.state.chartPrefs}
            data={this.props.data}
            initialDatetimeLocation={this.state.datetimeLocation}
            isClinicianAccount={personUtils.isClinicianAccount(this.props.user)}
            loading={this.state.loading}
            mostRecentDatetimeLocation={this.state.mostRecentDatetimeLocation}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onClickPrint={this.handleClickPrint}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToBgLog={this.handleSwitchToBgLog}
            onUpdateChartDateRange={this.handleChartDateRangeUpdate}
            patient={this.props.patient}
            stats={stats}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            uploadUrl={this.props.uploadUrl}
            queryDataCount={this.state.queryDataCount}
            ref="tideline"
            removeGeneratedPDFS={this.props.removeGeneratedPDFS} />
          );
      case 'settings':
        return this.renderSettings();
    }
  },

  renderExcludeEmptyBolusDaysCheckbox: function(props, state) {
    const { t } = props;

    return (
      <Box p={2} sx={{
        borderTop: '1px solid',
        borderColor: 'grays.1',
      }}>
        <PopoverLabel
          id='exclude-bolus-info'
          label={(
            <Checkbox
              checked={_.get(state, 'chartPrefs.basics.stats.excludeDaysWithoutBolus')}
              label={t('Exclude days with no boluses')}
              onChange={this.toggleDaysWithoutBoluses}
              themeProps={{
                color: 'stat.text',
              }}
            />
          )}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                <strong>{t('Only some of the days within the current range contain bolus data.')}</strong>
              </Paragraph2>
              <Paragraph2>
                {t('If this option is checked, days without boluses will be excluded when calculating this stat and the "Avg per day" count in the "Bolusing" calendar summary.')}
              </Paragraph2>
            </Box>
          )}
        />
      </Box>
    );
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
          messages={_.cloneDeep(this.props.messageThread)}
          user={this.props.user}
          patient={this.props.patient}
          onClose={this.closeMessageThread}
          onSave={this.handleReplyToMessage}
          onEdit={this.handleEditMessage}
          timePrefs={this.state.timePrefs} />
      );
    }
  },

  toggleDaysWithoutBoluses: function(e) {
    if (e) {
      e.preventDefault();
    }

    const prefs = _.cloneDeep(this.state.chartPrefs);
    prefs.basics.stats.excludeDaysWithoutBolus = !prefs.basics.stats.excludeDaysWithoutBolus;
    if (prefs.basics.stats.excludeDaysWithoutBolus) this.props.trackMetric('Basics exclude days without boluses');
    this.updateChartPrefs(prefs, false, true, true);
  },

  closeDatesDialog: function() {
    this.setState({
      datesDialogOpen: false,
      datesDialogProcessing: false,
      datesDialogFetchingData: false,
    });
  },

  closePrintDialog: function() {
    this.setState({
      printDialogOpen: false,
      printDialogPDFOpts: null,
    });
  },

  closeMessageThread: function(){
    this.props.onCloseMessageThread();
    this.refs.tideline.getWrappedInstance().closeMessageThread();
    this.props.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.tideline.getWrappedInstance().closeMessageThread();
    this.props.trackMetric('Closed New Message Modal');
  },

  generateStats: function (props = this.props, state = this.state) {
    const {
      bgPrefs = {},
      chartType,
    } = state;

    const manufacturer = this.getMetaData('latestPumpUpload.manufacturer');
    const bgSource = this.getMetaData('bgSources.current');
    const endpoints = this.getCurrentData('endpoints');
    const { averageDailyDose, ...statsData } = this.getCurrentData('stats');

    const stats = [];

    _.forOwn(statsData, (data, statType) => {
      const stat = getStatDefinition(data, statType, {
        bgSource,
        days: endpoints.activeDays || endpoints.days,
        bgPrefs,
        manufacturer,
      });

      if (statType === 'totalInsulin' && chartType === 'basics') {
        // We nest the averageDailyDose stat within the totalInsulin stat
        stat.title = props.t('Avg. Daily Insulin Ratio');
        delete stat.dataFormat.title;
        delete stat.data.dataPaths.title;

        const activeDays = _.get(props, 'data.data.current.endpoints.activeDays');
        const daysWithBoluses = _.keys(_.get(props, 'data.data.aggregationsByDate.boluses.byDate', {})).length;

        const averageDailyDoseStat = getStatDefinition(averageDailyDose, 'averageDailyDose', {
          bgSource,
          days: endpoints.activeDays || endpoints.days,
          bgPrefs,
          manufacturer,
        });

        const averageDailyDoseComponent = (
          <Box
            mt={1}
            theme={baseTheme}
            sx={{
              '#Stat--averageDailyDose': {
                marginBottom: 0,

                '> div > div:first-child, > div > div:first-child > div': {
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: 0,
                  borderColor: 'grays.1',
                },
              }
            }}
          >
            <Stats stats={[ averageDailyDoseStat ]} chartPrefs={state.chartPrefs} bgPrefs={bgPrefs} />
          </Box>
        );

        if (daysWithBoluses > 0 && daysWithBoluses < activeDays) {
          // If any of the calendar dates within the range are missing boluses,
          // present a checkbox to disable them from insulin stat calculations
          stat.children = (
            <React.Fragment>
              {averageDailyDoseComponent}
              {this.renderExcludeEmptyBolusDaysCheckbox(props, state)}
            </React.Fragment>
          )
        } else {
          stat.children = averageDailyDoseComponent;
        }
      }

      stats.push(stat);
    });

    this.log('stats', stats);
    return stats;
  },

  generatePDF: function(props = this.props, state = this.state, pdfOpts = {}) {
    const patientSettings = _.get(props, 'patient.settings', {});
    const siteChangeSource = state.updatedSiteChangeSource || _.get(props, 'patient.settings.siteChangeSource');
    const pdfPatient = _.assign({}, props.patient, {
      settings: _.assign({}, patientSettings, { siteChangeSource }),
    });

    const opts = {
      patient: pdfPatient,
      ..._.mapValues(pdfOpts, chartType => ({ disabled: chartType.disabled })),
    };

    const commonQueries = {
      bgPrefs: state.bgPrefs,
      metaData: 'latestPumpUpload, bgSources',
      timePrefs: state.timePrefs,
      excludedDevices: state.chartPrefs.excludedDevices,
    };

    const queries = {};

    if (!opts.basics.disabled) {
      queries.basics = {
        endpoints: pdfOpts.basics.endpoints,
        aggregationsByDate: 'basals, boluses, fingersticks, siteChanges',
        bgSource: _.get(this.state.chartPrefs, 'basics.bgSource'),
        stats: this.getStatsByChartType('basics'),
        excludeDaysWithoutBolus: _.get(this.state, ['chartPrefs', this.state.chartType, 'stats', 'excludeDaysWithoutBolus']),
        ...commonQueries,
      };
    }

    if (!opts.bgLog.disabled) {
      queries.bgLog = {
        endpoints: pdfOpts.bgLog.endpoints,
        aggregationsByDate: 'dataByDate',
        stats: this.getStatsByChartType('bgLog'),
        types: { smbg: {} },
        bgSource: _.get(this.state.chartPrefs, 'bgLog.bgSource'),
        ...commonQueries,
      };
    }

    if (!opts.daily.disabled) {
      queries.daily = {
        endpoints: pdfOpts.daily.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        stats: this.getStatsByChartType('daily'),
        types: {
          basal: {},
          bolus: {},
          cbg: {},
          deviceEvent: {},
          food: {},
          message: {},
          smbg: {},
          wizard: {},
        },
        bgSource: _.get(this.state.chartPrefs, 'daily.bgSource'),
        ...commonQueries,
      };
    }

    if (!opts.settings.disabled) {
      queries.settings = {
        ...commonQueries,
      };
    }

    this.log('Generating PDF with', queries, opts);

    window.downloadPDFDataQueries = () => {
      console.save(queries, 'PDFDataQueries.json');
    };

    props.generatePDFRequest(
      'combined',
      queries,
      opts,
      this.props.currentPatientInViewId,
    );
  },

  handleChartDateRangeUpdate: function(datetimeLocation, forceChartDataUpdate = false) {
    const isDaily = this.state.chartType === 'daily';
    const isTrends = this.state.chartType === 'trends';

    const newEndpoints = this.getChartEndpoints(datetimeLocation, {
      setEndToLocalCeiling: forceChartDataUpdate || !isDaily,
    });

    const newDatetimeLocation = isDaily
      ? moment.utc(datetimeLocation).subtract(12, 'hours').toISOString()
      : datetimeLocation;

    const { next: nextDays, prev: prevDays } = this.getDaysByType();

    // Only query for additional data if we're not on the initial data
    // and we've scrolled to the end the current available data
    const isOnMostRecentDay = newDatetimeLocation === this.state.mostRecentDatetimeLocation;
    const prevEndpoints = _.get(this.state, 'chartEndpoints.prev', []);
    const nextEndpoints = _.get(this.state, 'chartEndpoints.next', []);
    const prevLimitReached = newEndpoints[0] <= prevEndpoints[0];
    const nextLimitReached = newEndpoints[1] >= nextEndpoints[1];
    const updateChartData = forceChartDataUpdate || (!isOnMostRecentDay && (prevLimitReached || nextLimitReached));
    const fetchedUntil = _.get(this.props, 'data.fetchedUntil');
    const newChartRangeNeedsDataFetch = moment.utc(newEndpoints[0]).subtract(nextDays, 'days').startOf('day').toISOString() <= fetchedUntil;

    const updateOpts = {
      showLoading: newChartRangeNeedsDataFetch || updateChartData,
      updateChartEndpoints: isTrends || updateChartData,
      query: isTrends || updateChartData ? undefined : {
        endpoints: newEndpoints,
        nextDays,
        prevDays,
        stats: this.getStatsByChartType(),
      },
    };

    if (!this.props.fetchingPatientData && newChartRangeNeedsDataFetch) {
      const options = {
        showLoading: true,
        returnData: false,
      };

      this.fetchEarlierData(options);
    }

    this.updateChart(this.state.chartType, datetimeLocation, newEndpoints, updateOpts);
  },

  handleMessageCreation: function(message) {
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
    this.props.onEditMessage(message, cb);
    this.props.trackMetric('Edit To Message');
  },

  handleShowMessageThread: function(messageThread) {
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

    const chartType = 'basics';

    const getDatetimeLocation = d => moment.utc(d.valueOf())
      .toISOString();

    const mostRecentDatumTime = this.getMostRecentDatumTimeByChartType(this.props, chartType);
    const dateCeiling = getLocalizedCeiling(mostRecentDatumTime, this.state.timePrefs);
    const datetimeLocation = getDatetimeLocation(dateCeiling);

    const updateOpts = { updateChartEndpoints: true };

    this.updateChart(chartType, datetimeLocation, this.getChartEndpoints(datetimeLocation, { chartType }), updateOpts);
  },

  handleSwitchToDaily: function(datetime, title) {
    if (title) this.props.trackMetric(`Clicked Basics ${title} calendar`, {
      fromChart: this.state.chartType
    });

    const chartType = 'daily';

    const getDatetimeLocation = d => moment.utc(d.valueOf())
      .tz(getTimezoneFromTimePrefs(this.state.timePrefs))
      .subtract(12, 'hours')
      .toISOString();

    const datetimeInteger = _.isInteger(datetime) ? datetime : Date.parse(datetime);
    const mostRecentDatumTime = this.getMostRecentDatumTimeByChartType(this.props, chartType);
    const dateCeiling = getLocalizedCeiling(_.min([datetimeInteger, mostRecentDatumTime]), this.state.timePrefs);
    const datetimeLocation = getDatetimeLocation(dateCeiling);

    const updateOpts = { updateChartEndpoints: true };
    if (datetime && mostRecentDatumTime) {
      updateOpts.mostRecentDatetimeLocation = getDatetimeLocation(mostRecentDatumTime)
    }

    this.updateChart(chartType, datetimeLocation, this.getChartEndpoints(datetimeLocation, { chartType }), updateOpts);
  },

  handleSwitchToTrends: function(datetime) {
    this.props.trackMetric('Clicked Switch To Modal', {
      fromChart: this.state.chartType
    });

    const chartType = 'trends';

    const getDatetimeLocation = d => moment.utc(d.valueOf())
      .toISOString();

    const mostRecentDatumTime = this.getMostRecentDatumTimeByChartType(this.props, chartType);
    const dateCeiling = getLocalizedCeiling(_.min([Date.parse(datetime), mostRecentDatumTime]), this.state.timePrefs);
    const datetimeLocation = getDatetimeLocation(dateCeiling);

    const updateOpts = { updateChartEndpoints: true };
    if (datetime && mostRecentDatumTime) {
      updateOpts.mostRecentDatetimeLocation = getDatetimeLocation(mostRecentDatumTime)
    }

    this.updateChart(chartType, datetimeLocation, this.getChartEndpoints(datetimeLocation, { chartType }), updateOpts);
  },

  handleSwitchToBgLog: function(datetime) {
    this.props.trackMetric('Clicked Switch To Two Week', {
      fromChart: this.state.chartType
    });

    const chartType = 'bgLog';

    const getDatetimeLocation = d => moment.utc(d.valueOf())
      .subtract(12, 'hours')
      .toISOString();

    const mostRecentDatumTime = this.getMostRecentDatumTimeByChartType(this.props, chartType);
    const dateCeiling = getLocalizedCeiling(_.min([Date.parse(datetime), mostRecentDatumTime]), this.state.timePrefs);
    const datetimeLocation = getDatetimeLocation(dateCeiling);

    const updateOpts = { updateChartEndpoints: true };
    if (datetime && mostRecentDatumTime) {
      updateOpts.mostRecentDatetimeLocation = getDatetimeLocation(getLocalizedCeiling(mostRecentDatumTime, this.state.timePrefs))
    }

    this.updateChart(chartType, datetimeLocation, this.getChartEndpoints(datetimeLocation, { chartType }), updateOpts);
  },

  handleSwitchToSettings: function(e) {
    this.props.trackMetric('Clicked Switch To Settings', {
      fromChart: this.state.chartType
    });
    if (e) {
      e.preventDefault();
    }

    this.updateChart('settings');
  },

  handleClickPrint: function() {
    this.props.trackMetric('Clicked Print', {
      fromChart: this.state.chartType
    });

    this.props.removeGeneratedPDFS();
    this.setState({ printDialogOpen: true });
  },

  handleClickChartDates: function() {
    this.props.trackMetric('Clicked Chart Dates', {
      fromChart: this.state.chartType
    });

    this.setState({
      datesDialogOpen: true,
      datesDialogProcessing: false,
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
      this.props.dataWorkerRemoveDataRequest(null, this.props.currentPatientInViewId);

      this.setState({
        ...this.getInitialState(),
        bgPrefs: undefined,
        chartType: undefined,
        chartEndpoints: undefined,
        datetimeLocation: undefined,
        mostRecentDatetimeLocation: undefined,
        endpoints: undefined,
        refreshChartType: this.state.chartType,
      }, () => {
        refresh(this.props.currentPatientInViewId);
        this.props.removeGeneratedPDFS();
      });
    }
  },

  updateBasicsSettings: function(patientId, settings, canUpdateSettings) {
    if (canUpdateSettings) {
      this.props.updateBasicsSettings(patientId, settings);
    }

    // If the user makes a change to the site change source settings,
    // we should remove the currently generated PDF, which will trigger a rebuild of
    // the PDF with the updated settings.
    const settingsSiteChangeSource = _.get(this.props, 'patient.settings.siteChangeSource');
    if (settings.siteChangeSource && settings.siteChangeSource !== settingsSiteChangeSource) {
      this.setState({ updatedSiteChangeSource: settings.siteChangeSource }, this.props.removeGeneratedPDFS);
    }
  },

  updateChartPrefs: function(updates, queryData = true, queryStats = false, queryAggregations = false) {
    const newPrefs = {
      ...this.state.chartPrefs,
      ...updates,
    };

    this.setState({
      chartPrefs: newPrefs,
    }, () => {
      const queryOpts = { showLoading: false };

      if (queryData) {
        this.queryData(undefined, queryOpts);
      } else if (queryStats || queryAggregations) {
        const query = {
          endpoints: _.get(this.state, 'chartEndpoints.current'),
          stats: queryStats ? this.getStatsByChartType() : undefined,
          aggregationsByDate: queryAggregations ? this.getAggregationsByChartType() : undefined,
        };

        this.queryData(query, queryOpts);
      }
    });
  },

  getChartEndpoints: function(datetimeLocation = this.state.datetimeLocation, opts = {}) {
    const {
      applyTimeZoneToStart = (_.get(opts, 'chartType', this.state.chartType) !== 'daily'),
      chartType = this.state.chartType,
      setEndToLocalCeiling = true,
    } = opts;

    const extentSize = opts.extentSize || _.get(this.state.chartPrefs, [chartType, 'extentSize']);

    const timezoneName = applyTimeZoneToStart ? getTimezoneFromTimePrefs(this.state.timePrefs) : 'UTC';

    const end = setEndToLocalCeiling
      ? getLocalizedCeiling(datetimeLocation, this.state.timePrefs).valueOf()
      : Date.parse(datetimeLocation);

    const start = moment.utc(end).tz(timezoneName).subtract(extentSize, 'days').valueOf();
    return (start && end ? [start, end] : []);
  },

  getCurrentData: function(path, emptyValue = {}) {
    return _.get(this.props, `data.data.current.${path}`, emptyValue);
  },

  getMetaData: function(path, emptyValue = {}, props = this.props) {
    return _.get(props, `data.metaData.${path}`, emptyValue);
  },

  getBasicsAggregations: function() {
    const {
      data: { aggregationsByDate } = {},
      bgPrefs,
      metaData: { latestPumpUpload } = {},
    } = this.props.data;

    const manufacturer = _.get(latestPumpUpload, 'manufacturer');

    return _.isEmpty(aggregationsByDate) ? {} : vizUtils.aggregation.processBasicsAggregations(
      vizUtils.aggregation.defineBasicsAggregations(
        bgPrefs,
        manufacturer,
        latestPumpUpload,
      ),
      aggregationsByDate,
      this.props.patient,
      manufacturer
    );
  },

  getAggregationsByChartType: function(chartType = this.state.chartType) {
    let aggregations;

    switch (chartType) {
      case 'basics':
        aggregations = 'basals, boluses, fingersticks, siteChanges';
        break;

      default:
        aggregations = undefined;
        break;
    }

    return aggregations;
  },

  getStatsByChartType: function(chartType = this.state.chartType) {
    const cbgSelected = _.get(this.state.chartPrefs, [chartType, 'bgSource']) === 'cbg';
    const smbgSelected = _.get(this.state.chartPrefs, [chartType, 'bgSource']) === 'smbg';
    const isAutomatedBasalDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isAutomatedBasalDevice');
    const isSettingsOverrideDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isSettingsOverrideDevice');

    let stats = [];

    switch (chartType) {
      case 'basics':
        cbgSelected && stats.push(commonStats.timeInRange);
        smbgSelected && stats.push(commonStats.readingsInRange);
        stats.push(commonStats.averageGlucose);
        cbgSelected && stats.push(commonStats.sensorUsage);
        stats.push(commonStats.totalInsulin);
        isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
        isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
        stats.push(commonStats.carbs);
        stats.push(commonStats.averageDailyDose);
        cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
        stats.push(commonStats.standardDev);
        stats.push(commonStats.coefficientOfVariation);
        stats.push(commonStats.bgExtents);
        break;

      case 'daily':
        cbgSelected && stats.push(commonStats.timeInRange);
        smbgSelected && stats.push(commonStats.readingsInRange);
        stats.push(commonStats.averageGlucose);
        stats.push(commonStats.totalInsulin);
        isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
        isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
        stats.push(commonStats.carbs);
        cbgSelected && stats.push(commonStats.standardDev);
        cbgSelected && stats.push(commonStats.coefficientOfVariation);
        break;

      case 'bgLog':
        stats.push(commonStats.readingsInRange);
        stats.push(commonStats.averageGlucose);
        stats.push(commonStats.standardDev);
        stats.push(commonStats.coefficientOfVariation);
        break;

      case 'trends':
        cbgSelected && stats.push(commonStats.timeInRange);
        smbgSelected && stats.push(commonStats.readingsInRange);
        stats.push(commonStats.averageGlucose);
        cbgSelected && stats.push(commonStats.sensorUsage);
        isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
        isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
        cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
        stats.push(commonStats.standardDev);
        stats.push(commonStats.coefficientOfVariation);
        stats.push(commonStats.bgExtents);
        break;
    }

    return stats;
  },

  getDaysByType: function() {
    const days = {};

    switch (this.state.chartType) {
      case 'daily':
        // TODO: set larger for non-automated basal delivery uploads? Need way to identify Loop.
        days.next = 6;
        days.prev = 6;
        break;

      case 'bgLog':
        days.next = 14;
        days.prev = 14;
        break;

      default:
        days.next = 0;
        days.prev = 0;
        break;
    }

    return days;
  },

  getMostRecentDatumTimeByChartType: function(props = this.props, chartType = this.state.chartType) {
    let latestDatums;
    const getLatestDatums = types => _.pick(_.get(props.data, 'metaData.latestDatumByType'), types);

    switch (chartType) {
      case 'basics':
        latestDatums = getLatestDatums([
          'basal',
          'bolus',
          'cbg',
          'deviceEvent',
          'smbg',
          'wizard',
        ]);
        break

      case 'daily':
        latestDatums = getLatestDatums([
          'basal',
          'bolus',
          'cbg',
          'deviceEvent',
          'food',
          'message',
          'smbg',
          'wizard',
        ]);
        break;

      case 'bgLog':
        latestDatums = getLatestDatums([
          'smbg',
        ]);
        break;

      case 'trends':
        latestDatums = getLatestDatums([
          'cbg',
          'smbg',
        ]);
        break;

      default:
        latestDatums = [];
        break;
    }

    return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
  },

  // Called via `window.loadPatientData` to populate global `patientData` object
  // Called via `window.downloadPatientData` to download data query result as `patientData.json`
  saveDataToDestination: function(destination, { query, raw = false } = {}) {
    const defaultQuery = {
      metaData: [
        'bgSources',
        'excludedDevices',
        'latestDatumByType',
        'latestPumpUpload',
        'patientId',
        'size',
        'devices',
      ],
      types: '*',
      raw,
    };

    this.props.dataWorkerQueryDataRequest(query || defaultQuery, this.props.currentPatientInViewId, destination);
  },

  updateChart: function(chartType, datetimeLocation, endpoints, opts = {}) {
    _.defaults(opts, {
      showLoading: true,
      mostRecentDatetimeLocation: datetimeLocation,
    });

    const chartTypeChanged = chartType && !_.isEqual(chartType, this.state.chartType);
    const endpointsChanged = endpoints && !_.isEqual(endpoints, this.state.endpoints);
    const datetimeLocationChanged = datetimeLocation && !_.isEqual(datetimeLocation, this.state.datetimeLocation);

    const state = {};

    if (endpointsChanged) state.endpoints = endpoints;
    if (datetimeLocationChanged) state.datetimeLocation = datetimeLocation;

    if (chartTypeChanged) {
      state.chartType = chartType;
      state.mostRecentDatetimeLocation = opts.mostRecentDatetimeLocation;
      state.transitioningChartType = this.state.chartType ? true : false;
    }

    if (!this.state.mostRecentDatetimeLocation) state.mostRecentDatetimeLocation = opts.mostRecentDatetimeLocation;

    const cb = (chartTypeChanged || endpointsChanged || datetimeLocationChanged)
      ? this.queryData.bind(this, opts.query, {
        showLoading: opts.showLoading,
        updateChartEndpoints: opts.updateChartEndpoints,
        transitioningChartType: chartTypeChanged,
      }) : undefined;

    this.setState(state, cb);
  },

  UNSAFE_componentWillMount: function() {
    this.doFetching(this.props);
    var params = this.props.queryParams;

    if (!_.isEmpty(params)) {
      var prefs = _.cloneDeep(this.state.chartPrefs);
      prefs.bolusRatio = params.dynamicCarbs ? 0.5 : 0.35;
      prefs.dynamicCarbs = params.dynamicCarbs;
      prefs.animateStats = params.animateStats ? JSON.parse(params.animateStats) : true;
      this.setState({
        chartPrefs: prefs,
      });
    }
  },

  componentWillUnmount: function() {
    this.props.removeGeneratedPDFS();

    // We only force removal of the data from the redux store at this point, and not the data worker
    // so that we don't need to refetch if the user is going to their profile page and coming back
    this.props.dataWorkerRemoveDataSuccess(undefined, true);
  },

  UNSAFE_componentWillReceiveProps: function(nextProps) {
    const userId = this.props.currentPatientInViewId;
    const patientData = _.get(nextProps, 'data.metaData.patientId') === userId;
    const patientSettings = _.get(nextProps, ['patient', 'settings'], null);

    // Hold processing until patient is fetched (ensuring settings are accessible) AND patient data exists
    if (patientSettings && patientData) {
      let stateUpdates = {};
      let stateUpdateCallback;

      // Set bgPrefs to state
      let bgPrefs = this.state.bgPrefs;
      if (!bgPrefs) {
        bgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, this.props.queryParams);
        bgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(bgPrefs);
        stateUpdates.bgPrefs = bgPrefs;
      }

      // Set timePrefs to state
      let timePrefs = this.state.timePrefs;
      if (_.isEmpty(timePrefs)) {
        const latestUpload = _.get(nextProps, 'data.metaData.latestDatumByType.upload');
        timePrefs = utils.getTimePrefsForDataProcessing(latestUpload, this.props.queryParams);
        stateUpdates.timePrefs = timePrefs;
      }

      // Perform initial query of upload data to prepare for setting inital chart type
      if (this.state.queryDataCount < 1) {
        this.queryData({
          types: {
            upload: {
              select: 'id,deviceId,deviceTags',
            },
          },
          metaData: 'latestDatumByType,latestPumpUpload,size,bgSources,devices,excludedDevices',
          excludedDevices: undefined,
          timePrefs,
          bgPrefs,
        });
      }

      if (nextProps.queryingData.completed) {
        stateUpdates.queryingData = false;
        let hideLoadingTimeout;

        // With initial query for upload data completed, set the initial chart type
        if (!this.state.chartType) {
          this.setInitialChartView(nextProps);
          window.patientData = 'No patient data has been loaded yet. Run `window.loadPatientData()` to popuplate this.'
          window.loadPatientData = this.saveDataToDestination.bind(this, 'window');
          window.downloadPatientData = this.saveDataToDestination.bind(this, 'download');
        }

        if (_.get(nextProps, 'data.query.types')) {
          stateUpdates.queryDataCount = this.state.queryDataCount + 1;
        }

        // Only update the chartEndpoints and transitioningChartType state immediately after querying
        if (this.props.queryingData.inProgress) {
          if (_.get(nextProps, 'data.query.updateChartEndpoints')) {
            stateUpdates.chartEndpoints = {
              current: _.get(nextProps, 'data.data.current.endpoints.range', []),
              next: _.get(nextProps, 'data.data.next.endpoints.range', []),
              prev: _.get(nextProps, 'data.data.prev.endpoints.range', []),
            };
          }

          const isTransitioning = _.get(nextProps, 'data.query.transitioningChartType');
          const wasTransitioning = _.get(this.props, 'data.query.transitioningChartType');

          if (isTransitioning || wasTransitioning) {
            stateUpdates.transitioningChartType = false;
            hideLoadingTimeout = 250;
          }
        }

        stateUpdateCallback = () => {
          if (!nextProps.addingData.inProgress && !this.props.addingData.inProgress && !nextProps.fetchingPatientData && !this.props.fetchingPatientData) {
            this.hideLoading(hideLoadingTimeout);
          }
        };
      }

      if (!_.isEmpty(stateUpdates)) {
        this.setState(stateUpdates, stateUpdateCallback);
      }

      const newDataAdded = this.props.addingData.inProgress && nextProps.addingData.completed;
      if (newDataAdded) {
        // New data has been added. Let's query it to update the chart.
        this.queryData();

        // If new data was fetched to support requested PDF dates, kick off pdf generation.
        if (this.state.printDialogPDFOpts) {
          this.generatePDF(nextProps, this.state, this.state.printDialogPDFOpts);
        }

        // If new data was fetched to support new chart dates,
        // close the and reset the chart date dialog.
        if (this.state.datesDialogFetchingData) {
          this.closeDatesDialog();
        }
      }
    }
  },

  UNSAFE_componentWillUpdate: function (nextProps, nextState) {
    const pdfGenerated = _.isObject(nextProps.pdf.combined);
    const pdfGenerationFailed = _.get(nextProps, 'generatingPDF.notification.type') === 'error';

    if (nextState.printDialogProcessing && pdfGenerated) {
      this.setState({ printDialogProcessing: false });

      if (nextState.printDialogOpen && !pdfGenerationFailed) {
        this.closePrintDialog();
      }

      if (nextProps.pdf.combined.url) {
        if (this.printWindowRef && !this.printWindowRef.closed) {
          // If we already have a ref to a PDF window, (re)use it
          this.printWindowRef.location.href = nextProps.pdf.combined.url;
        } else {
          // Otherwise, we create and open a new PDF window ref.
          this.printWindowRef = window.open(nextProps.pdf.combined.url);
        }

        setTimeout(() => {
          if (this.printWindowRef) {
            this.printWindowRef.focus();
            this.printWindowRef.print();
          } else {
            const { set: setToast } = this.context;

            setToast({
              message: this.props.t('A popup blocker is preventing your report from opening.'),
              variant: 'warning',
              autoHideDuration: null,
              action: (
                <Button
                  p={0}
                  lineHeight={1.5}
                  fontSize={1}
                  variant="textPrimary"
                  onClick={() => {
                    this.printWindowRef = window.open(nextProps.pdf.combined.url);
                    this.printWindowRef.focus();
                    this.printWindowRef.print();
                    setToast(null);
                  }}
                >
                  {this.props.t('Open it anyway')}
                </Button>
              ),
            });
          }
        });
      }
    }
  },

  queryData: function (query, options = {}) {
    _.defaults(options, {
      showLoading: true,
      updateChartEndpoints: options.updateChartEndpoints || !this.state.chartEndpoints,
      transitioningChartType: false,
      metaData: 'bgSources,devices,excludedDevices',
    });

    if (this.state.queryingData) return;
    this.setState({ loading: options.showLoading, queryingData: true });

    let chartQuery = {
      bgSource: _.get(this.state, ['chartPrefs', this.state.chartType, 'bgSource']),
      chartType: this.state.chartType,
      excludedDevices: _.get(this.state, 'chartPrefs.excludedDevices', []),
      excludeDaysWithoutBolus: _.get(this.state, ['chartPrefs', this.state.chartType, 'stats', 'excludeDaysWithoutBolus']),
      endpoints: this.state.endpoints,
      metaData: options.metaData,
    };

    const activeDays = _.get(this.state, ['chartPrefs', this.state.chartType, 'activeDays']);

    if (activeDays) {
      const activeDaysMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      chartQuery.activeDays = _.map(_.keys(_.pickBy(activeDays, value => !!value)), day => activeDaysMap[day]);
    }

    if (query) {
      this.props.dataWorkerQueryDataRequest({ ...chartQuery, ...query }, this.props.currentPatientInViewId);
    } else if (this.state.chartType) {
      switch (this.state.chartType) {
        case 'basics':
          chartQuery.aggregationsByDate = 'basals,boluses,fingersticks,siteChanges';
          break;

        case 'daily':
          chartQuery.types = {
            basal: {},
            bolus: {},
            cbg: {},
            deviceEvent: {},
            food: {},
            message: {},
            smbg: {},
            wizard: {},
          };

          chartQuery.fillData = { adjustForDSTChanges: true };
          break;

        case 'bgLog':
          chartQuery.types = {
            smbg: {},
          };

          chartQuery.fillData = { adjustForDSTChanges: false };
          break;

        case 'trends':
          chartQuery.types = {
            cbg: {},
            smbg: {},
          };
          break;
      }

      const { next: nextDays, prev: prevDays } = this.getDaysByType();

      chartQuery.stats = this.getStatsByChartType();
      chartQuery.nextDays = nextDays;
      chartQuery.prevDays = prevDays;

      chartQuery.updateChartEndpoints = options.updateChartEndpoints;
      chartQuery.transitioningChartType = options.transitioningChartType;

      this.props.dataWorkerQueryDataRequest(chartQuery, this.props.currentPatientInViewId);
    }
  },

  deriveChartTypeFromLatestData: function(latestData, uploads) {
    let chartType = 'basics'; // Default to 'basics'

    if (latestData && uploads) {
      // Ideally, we determine the default view based on the device type
      // so that, for instance, if the latest data type is cgm, but comes from
      // an insulin-pump, we still direct them to the basics view
      const deviceMap = _.keyBy(uploads, 'deviceId');
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
            chartType = 'bgLog';
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
            chartType = 'bgLog';
            break;
        }
      }
    }

    return chartType;
  },

  setInitialChartView: function(props = this.props) {
    // Determine default chart type and date from latest data
    const uploads = _.get(props.data, 'data.current.data.upload', []);
    const latestDatum = _.last(_.sortBy(_.values(_.get(props.data, 'metaData.latestDatumByType')), ['normalTime']));
    const bgSource = this.getMetaData('bgSources.current');
    const excludedDevices = this.getMetaData('excludedDevices', undefined, props);

    if (uploads && latestDatum) {
      // Allow overriding the default chart type via a query param (helps for development);
      const chartType = this.state.refreshChartType || _.get(
        props, 'queryParams.chart',
        this.deriveChartTypeFromLatestData(latestDatum, uploads)
      );

      const isDaily = chartType === 'daily';
      const isBgLog = chartType === 'bgLog';

      const mostRecentDatumTime = this.getMostRecentDatumTimeByChartType(props, chartType);
      const latestDatumDateCeiling = getLocalizedCeiling(mostRecentDatumTime, this.state.timePrefs);

      const datetimeLocation = _.get(props, 'queryParams.datetime', (isDaily || isBgLog)
        ? moment.utc(latestDatumDateCeiling.valueOf())
          .tz(isDaily ? getTimezoneFromTimePrefs(this.state.timePrefs) : 'UTC')
          .subtract(12, 'hours')
          .toISOString()
        : moment.utc(latestDatumDateCeiling.valueOf())
          .toISOString());

      const endpoints = this.getChartEndpoints(datetimeLocation, { chartType });

      // Set the default bgSource for basics, daily, and trends charts
      this.updateChartPrefs({
        basics: { ...this.state.chartPrefs.basics, bgSource },
        daily: { ...this.state.chartPrefs.daily, bgSource },
        trends: { ...this.state.chartPrefs.trends, bgSource },
        excludedDevices,
      }, false);

      this.updateChart(chartType, datetimeLocation, endpoints);
      props.trackMetric(`web - default to ${chartType === 'bgLog' ? 'weekly' : chartType}`);
    }
  },

  fetchEarlierData: function(options = {}) {
    // Return if we are currently fetching data
    if (this.props.fetchingPatientData) {
      return;
    };

    const earliestRequestedData = _.get(this.props, 'data.fetchedUntil');

    const fetchOpts = _.defaults(options, {
      showLoading: true,
      startDate: moment.utc(earliestRequestedData).tz(getTimezoneFromTimePrefs(this.state.timePrefs)).subtract(16, 'weeks').toISOString(),
      endDate: moment.utc(earliestRequestedData).subtract(1, 'milliseconds').toISOString(),
      carelink: this.props.carelink,
      dexcom: this.props.dexcom,
      medtronic: this.props.medtronic,
      useCache: false,
      initial: false,
    });

    const count = this.state.fetchEarlierDataCount + 1;

    this.setState({
      loading: options.showLoading,
      fetchEarlierDataCount: count,
    });

    this.log('fetching');

    this.props.onFetchEarlierData(fetchOpts, this.props.currentPatientInViewId);

    const patientID = this.props.currentPatientInViewId;
    this.props.trackMetric('Fetched earlier patient data', { patientID, count });
  },

  hideLoading: function(timeout = 0) {
    // Needs to be in a setTimeout to force unsetting the loading state in a new render cycle
    // so that child components can be aware of the change in processing states. It also serves
    // to ensure the loading indicator shows long enough for the user to make sense of it.
    setTimeout(() => {
      this.setState({ loading: false });
    }, timeout);
  },

  doFetching: function(nextProps) {
    if (this.props.trackMetric) {
      const carelink = nextProps.carelink;
      if (!_.isEmpty(carelink)) {
        this.props.trackMetric('Web - CareLink Import URL Param', { carelink });
      }

      const dexcom = nextProps.dexcom;
      if (!_.isEmpty(dexcom)) {
        this.props.trackMetric('Web - Dexcom Import URL Param', { dexcom });
      }

      const medtronic = nextProps.medtronic;
      if (!_.isEmpty(medtronic)) {
        this.props.trackMetric('Web - Medtronic Import URL Param', { medtronic });
      }

      const patientID = nextProps.currentPatientInViewId;
      this.props.trackMetric('Fetched initial patient data', { patientID });
      this.props.trackMetric('Viewed Data');
    }

    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(function(fetcher) {
      fetcher();
    });
  },
});

PatientDataClass.contextType = ToastContext;

// We need to apply the contextType prop to use the Toast provider with create-react-class.
// This produces an issue with the current enzyme mounting and breaks unit tests.
// Solution is to wrap the create-react-class component with a small HOC that gets the i18n context.
export const PatientData = translate()(props => <PatientDataClass {...props}/>);

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, ownProps, stateProps, api, options) {
  const fetchers = [
    dispatchProps.fetchPatient.bind(null, api, ownProps.match.params.id),
    dispatchProps.fetchPatientData.bind(null, api, options, ownProps.match.params.id),
  ];

  if (!stateProps.fetchingPendingSentInvites.inProgress && !stateProps.fetchingPendingSentInvites.completed) {
    fetchers.push(dispatchProps.fetchPendingSentInvites.bind(null, api));
  }

  // Need fetchAssociatedAccounts here because the result includes of data donation accounts sharing info
  if (!stateProps.fetchingAssociatedAccounts.inProgress && !stateProps.fetchingAssociatedAccounts.completed) {
    fetchers.push(dispatchProps.fetchAssociatedAccounts.bind(null, api));
  }

  return fetchers;
}

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
        permsOfLoggedInUser = state.blip.selectedClinicId
        ? _.get(
          state.blip.clinics,
          [
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : _.get(
          state.blip.membershipPermissionsInOtherCareTeams,
          state.blip.currentPatientInViewId,
          {}
        );
      }
    }
  }

  return {
    user: user,
    isUserPatient: personUtils.isSame(user, patient),
    patient: { permissions, ...patient },
    permsOfLoggedInUser: permsOfLoggedInUser,
    messageThread: state.blip.messageThread,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    fetchingPatientData: state.blip.working.fetchingPatientData.inProgress,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    fetchingPendingSentInvites: state.blip.working.fetchingPendingSentInvites,
    fetchingAssociatedAccounts: state.blip.working.fetchingAssociatedAccounts,
    addingData: state.blip.working.addingData,
    updatingDatum: state.blip.working.updatingDatum,
    queryingData: state.blip.working.queryingData,
    generatingPDF: state.blip.working.generatingPDF,
    pdf: state.blip.pdf,
    data: state.blip.data,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  dataWorkerRemoveDataRequest: actions.worker.dataWorkerRemoveDataRequest,
  dataWorkerRemoveDataSuccess: actions.worker.dataWorkerRemoveDataSuccess,
  dataWorkerQueryDataRequest: actions.worker.dataWorkerQueryDataRequest,
  closeMessageThread: actions.sync.closeMessageThread,
  createMessageThread: actions.async.createMessageThread,
  editMessageThread: actions.async.editMessageThread,
  fetchAssociatedAccounts: actions.async.fetchAssociatedAccounts,
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
  const medtronic = utils.getMedtronic(ownProps.location);
  const api = ownProps.api;
  const assignedDispatchProps = [
    'dataWorkerRemoveDataRequest',
    'dataWorkerRemoveDataSuccess',
    'dataWorkerQueryDataRequest',
    'generatePDFRequest',
    'processPatientDataRequest',
    'removeGeneratedPDFS',
  ];

  return Object.assign({}, _.pick(dispatchProps, assignedDispatchProps), stateProps, {
    fetchers: getFetchers(dispatchProps, ownProps, stateProps, api, { carelink, dexcom, medtronic }),
    uploadUrl: api.getUploadUrl(),
    onRefresh: dispatchProps.fetchPatientData.bind(null, api, { carelink, dexcom, medtronic }),
    onFetchMessageThread: dispatchProps.fetchMessageThread.bind(null, api),
    onCloseMessageThread: dispatchProps.closeMessageThread,
    onSaveComment: api.team.replyToMessageThread.bind(api),
    onCreateMessage: dispatchProps.createMessageThread.bind(null, api),
    onEditMessage: dispatchProps.editMessageThread.bind(null, api),
    trackMetric: ownProps.trackMetric,
    queryParams: ownProps.location.query,
    currentPatientInViewId: ownProps.match.params.id,
    updateBasicsSettings: dispatchProps.updateSettings.bind(null, api),
    onFetchEarlierData: dispatchProps.fetchPatientData.bind(null, api),
    carelink: carelink,
    dexcom: dexcom,
    medtronic: medtronic,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientData);
