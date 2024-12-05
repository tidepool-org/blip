/* eslint-disable no-undef */
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
import { withTranslation, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';
import Plotly from 'plotly.js-basic-dist-min';

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
import baseTheme, { fontWeights, borders, radii } from '../../themes/baseTheme';
import { Body1, Title } from '../../components/elements/FontStyles';
import DexcomLogoIcon from '../../core/icons/DexcomLogo.svg';

import Messages from '../../components/messages';
import UploaderButton from '../../components/uploaderbutton';
import ChartDateRangeModal from '../../components/ChartDateRangeModal';
import ChartDateModal from '../../components/ChartDateModal';
import PrintDateRangeModal from '../../components/PrintDateRangeModal';
import Button from '../../components/elements/Button';

import ToastContext from '../../providers/ToastProvider';

import { Box, Flex } from 'theme-ui';
import Checkbox from '../../components/elements/Checkbox';
import PopoverLabel from '../../components/elements/PopoverLabel';
import { Paragraph2 } from '../../components/elements/FontStyles';
import { DIABETES_DATA_TYPES } from '../../core/constants';

const { Loader } = vizComponents;
const { getLocalizedCeiling, getTimezoneFromTimePrefs } = vizUtils.datetime;
const { commonStats, getStatDefinition } = vizUtils.stat;
const { isCustomBgRange } = vizUtils.bg;

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
    generateAGPImagesSuccess: PropTypes.func.isRequired,
    generateAGPImagesFailure: PropTypes.func.isRequired,
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
          stats: {
            excludeDaysWithoutBolus: false,
          },
        },
        bgLog: {
          bgSource: 'smbg',
          extentSize: 14,
        },
        agpBGM: {
          bgSource: 'smbg',
        },
        agpCGM: {
          bgSource: 'cbg',
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
        {this.state.datesDialogOpen && datesDialog}
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
    var handleClickDexcomConnect = function() {
      self.props.trackMetric('Clicked No Data Connect Dexcom');
      self.props.history.push(`/patients/${self.props.currentPatientInViewId}/profile?dexcomConnect=patient-empty-data`);
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
            <Box
              variant="containers.smallBordered"
              py={[3, 5, 6]}
              px={[2, 3]}
              sx={{
                borderTop: ['none', borders.default],
                borderBottom: ['none', borders.default],
              }}
            >
              <Title mb={3} fontSize={3} sx={{ fontWeight: fontWeights.medium }}>To upload your data, install Tidepool Uploader</Title>

              <UploaderButton
                onClick={handleClickUpload}
                buttonText={t('Get the Tidepool Uploader')}
              />

              <Body1 color="mediumGrey" fontWeight={fontWeights.medium} mt={3} mb={6}>
                If you already have Tidepool Uploader, launch it <a className="uploader-color-override" href='' onClick={handleClickLaunch} title="Upload data">here</a>
              </Body1>

              <Flex
                py={1}
                px={1}
                mb={4}
                sx={{
                  alignItems: 'center',
                  gap: 9,
                  display: 'inline-flex !important',
                  border: borders.input,
                  borderRadius: radii.large,
                }}
              >
                <Body1 ml={2} color="mediumGrey" fontWeight={fontWeights.medium}>
                  Sync CGM Data
                </Body1>

                <Button
                  id='dexcom-connect-link'
                  variant="textPrimary"
                  color="brand.dexcom"
                  iconSrc={DexcomLogoIcon}
                  label={t('Connect with Dexcom')}
                  pr={0}
                  sx={{
                    fontWeight: 'medium',
                    '&:hover': { color: 'brand.dexcom' },
                    '.icon': { top: '-2px', left: '-2px' },
                  }}
                  onClick={handleClickDexcomConnect}
                >
                  Connect With
                </Button>
              </Flex>
            </Box>

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
    const isDaily = this.state.chartType === 'daily';
    const DatePickerComponent = isDaily ? ChartDateModal : ChartDateRangeModal;

    const extraProps = isDaily ? {
      id: 'chart-date-dialog',
      defaultDate: _.get(this.state, 'chartEndpoints.current.0'),
    } : {
      id: 'chart-dates-dialog',
      defaultDates: _.get(this.state, 'chartEndpoints.current'),
    };

    return (
      <DatePickerComponent
        chartType={this.state.chartType}
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

          const updateActionMap = {
            basics: this.updateChart.bind(this, 'basics', endDate, dates, updateOpts),
            daily: this.handleSwitchToDaily.bind(this, endDate),
          }

          updateActionMap[this.state.chartType]?.();
        }}
        processing={this.state.datesDialogProcessing}
        timePrefs={this.state.timePrefs}
        trackMetric={this.props.trackMetric}
        {...extraProps}
      />
    );
  },

  renderPrintDialog: function() {
    return (
      <PrintDateRangeModal
        id="print-dialog"
        loggedInUserId={this.props.user?.userid}
        mostRecentDatumDates={{
          agpBGM: this.getMostRecentDatumTimeByChartType(this.props, 'agpBGM'),
          agpCGM: this.getMostRecentDatumTimeByChartType(this.props, 'agpCGM'),
          basics: this.getMostRecentDatumTimeByChartType(this.props, 'basics'),
          bgLog: this.getMostRecentDatumTimeByChartType(this.props, 'bgLog'),
          daily: this.getMostRecentDatumTimeByChartType(this.props, 'daily'),
        }}
        open={this.state.printDialogOpen}
        onClose={this.closePrintDialog}
        onClickPrint={opts => {
          this.setState({ printDialogProcessing: true })

          // Determine the earliest startDate needed to fetch data to.
          const enabledOpts = _.filter(opts, { disabled: false });
          const earliestPrintDate = _.min(_.at(enabledOpts, _.map(_.keys(enabledOpts), key => `${key}.endpoints.0`)));
          const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(this.state.timePrefs)).toISOString()
          const fetchedUntil = _.get(this.props, 'data.fetchedUntil');

          let setStateCallback = this.generatePDF;

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

            setStateCallback = _.noop;
          }

          this.setState({ printDialogPDFOpts: opts }, () => {
            setStateCallback();
          });
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
            onClickChartDates={this.handleClickChartDates}
            patient={this.props.patient}
            stats={stats}
            trackMetric={this.props.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            updatingDatum={this.props.updatingDatum}
            queryDataCount={this.getMetaData('queryDataCount')}
            key={this.state.chartKey}
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
            queryDataCount={this.getMetaData('queryDataCount')}
            key={this.state.chartKey}
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
            queryDataCount={this.getMetaData('queryDataCount')}
            key={this.state.chartKey}
            ref="tideline"
            removeGeneratedPDFS={this.props.removeGeneratedPDFS} />
          );
      case 'settings':
        return this.renderSettings();
    }
  },

  renderDefaultBgRangeCheckbox: function(props, state) {
    const { t } = props;

    return (
      <Box p={2} sx={{
        borderTop: '1px solid',
        borderColor: 'grays.1',
      }}>
        <PopoverLabel
          id="use-default-bg-range"
          label={(
            <Checkbox
              checked={!!this.state.bgPrefs?.useDefaultRange}
              label={t('Use default BG ranges')}
              onChange={this.toggleDefaultBgRange}
              themeProps={{
                mb: 0,
                sx: { color: 'stat.text' },
              }}
            />
          )}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                <strong>{t('This patient has set a custom BG target range.')}</strong>
              </Paragraph2>
              <Paragraph2>
                {t('If this option is checked, the target ranges for this view will be updated to the default ranges.')}
              </Paragraph2>
            </Box>
          )}
        />
      </Box>
    );
  },

  renderExcludeEmptyBolusDaysCheckbox: function(props, state) {
    const { t } = props;

    return (
      <Box p={2} sx={{
        borderTop: '1px solid',
        borderColor: 'grays.1',
      }}>
        <PopoverLabel
          id="exclude-bolus-info"
          label={(
            <Checkbox
              checked={_.get(state, ['chartPrefs', state.chartType, 'stats', 'excludeDaysWithoutBolus'])}
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
    prefs[this.state.chartType].stats.excludeDaysWithoutBolus = !prefs[this.state.chartType].stats.excludeDaysWithoutBolus;
    if (prefs[this.state.chartType].stats.excludeDaysWithoutBolus) this.props.trackMetric(`${_.capitalize(this.state.chartType)} exclude days without boluses`);
    this.updateChartPrefs(prefs, false, true, true);
  },

  toggleDefaultBgRange: function(e, value) {
    if (e) {
      e.preventDefault();
    }

    const patientSettings = _.get(this.props, 'patient.settings', {});
    let bgPrefs = this.state.bgPrefs || {};

    const bgUnitsOverride = {
      units: this.props.queryParams?.units || this.props.clinic?.preferredBgUnits,
      source: this.props.queryParams?.units ? 'query params' : 'preferred clinic units',
    };

    if (!bgPrefs.useDefaultRange) {
      bgPrefs = utils.getBGPrefsForDataProcessing({ ...patientSettings, bgTarget: undefined }, bgUnitsOverride);
      bgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(bgPrefs);
      bgPrefs.useDefaultRange = true;
    } else {
      bgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, bgUnitsOverride);
      bgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(bgPrefs);
      bgPrefs.useDefaultRange = false;
    }

    if (bgPrefs.useDefaultRange) this.props.trackMetric(`${_.capitalize(this.state.chartType)} - use default BG range`);

    this.setState({ bgPrefs }, () => {
      this.updateChartPrefs({}, false, true, true);
    });
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
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.tideline.closeMessageThread();
    this.props.trackMetric('Closed New Message Modal');
  },

  generateStats: function (props = this.props, state = this.state) {
    const {
      bgPrefs = {},
      chartType,
    } = state;

    const manufacturer = this.getMetaData('latestPumpUpload.manufacturer', '');
    const bgSource = this.getMetaData('bgSources.current');
    const endpoints = this.getCurrentData('endpoints');
    const { averageDailyDose, ...statsData } = this.getCurrentData('stats');
    const stats = [];

    _.forOwn(statsData, (data, statType) => {
      const stat = getStatDefinition(data, statType, {
        bgSource,
        collapsible: !_.includes(['averageGlucose', 'standardDev'], statType),
        days: _.isFinite(endpoints.activeDays) ? endpoints.activeDays : endpoints.days,
        bgPrefs,
        manufacturer,
      });

      if (this.state.isCustomBgRange && !props.isUserPatient && _.includes(['timeInRange', 'readingsInRange'], statType)) {
        stat.children = this.renderDefaultBgRangeCheckbox(props, state);
      }

      if (statType === 'totalInsulin' && _.includes(['basics', 'trends'], chartType)) {
        // We nest the averageDailyDose stat within the totalInsulin stat
        stat.title = props.t('Avg. Daily Insulin Ratio');
        stat.collapsedTitle = props.t('Avg. Daily Insulin');

        delete stat.dataFormat.title;
        delete stat.data.dataPaths.title;

        const activeDays = _.get(props, 'data.data.current.endpoints.activeDays');
        const daysWithBoluses = _.keys(_.get(props, 'data.data.aggregationsByDate.boluses.byDate', {})).length;

        const averageDailyDoseStat = getStatDefinition(averageDailyDose, 'averageDailyDose', {
          bgSource,
          days: _.isFinite(endpoints.activeDays) ? endpoints.activeDays : endpoints.days,
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
            <Stats
              bgPrefs={bgPrefs}
              chartPrefs={state.chartPrefs}
              persistState={false}
              stats={[ averageDailyDoseStat ]}
              trackMetric={this.props.trackMetric}
            />
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

  generateAGPImages: async function(props = this.props, reportTypes = []) {
    const promises = [];
    let errored = false

    await _.each(reportTypes, async reportType => {
      let images;

      try{
        images = await vizUtils.agp.generateAGPFigureDefinitions({ ...props.pdf.data?.[reportType] });
      } catch(e) {
        errored = true
        return props.generateAGPImagesFailure(e);
      }

      promises.push(..._.map(images, async (image, key) => {
        if (_.isArray(image)) {
          const processedArray = await Promise.all(
            _.map(image, async (img) => {
              return await Plotly.toImage(img, { format: 'svg' });
            })
          );
          return [reportType, [key, processedArray]];
        } else {
          const processedValue = await Plotly.toImage(image, { format: 'svg' });
          return [reportType, [key, processedValue]];
        }
      }));
    });

    const results = await Promise.all(promises);

    if (results.length) {
      const processedImages = _.reduce(results, (res, entry, i) => {
        const processedImage = _.fromPairs(entry.slice(1));
        res[entry[0]] = {...res[entry[0]], ...processedImage };
        return res;
      }, {});

      props.generateAGPImagesSuccess(processedImages);
    } else if (!errored) {
      props.generateAGPImagesSuccess(results);
    }
  },

  generatePDF: function(props = this.props, state = this.state) {
    const patientSettings = _.get(props, 'patient.settings', {});
    const printDialogPDFOpts = state.printDialogPDFOpts || {};
    const siteChangeSource = state.updatedSiteChangeSource || _.get(props, 'patient.settings.siteChangeSource');
    const pdfPatient = _.assign({}, props.patient, {
      settings: _.assign({}, patientSettings, { siteChangeSource }),
    });

    const commonQueries = {
      bgPrefs: state.bgPrefs,
      metaData: 'latestPumpUpload, bgSources',
      timePrefs: state.timePrefs,
      excludedDevices: state.chartPrefs?.excludedDevices,
    };

    const queries = {};

    if (!printDialogPDFOpts.basics?.disabled) {
      queries.basics = {
        endpoints: printDialogPDFOpts.basics?.endpoints,
        aggregationsByDate: 'basals, boluses, fingersticks, siteChanges',
        bgSource: _.get(state.chartPrefs, 'basics.bgSource'),
        stats: this.getStatsByChartType('basics'),
        excludeDaysWithoutBolus: _.get(state, 'chartPrefs.basics.stats.excludeDaysWithoutBolus'),
        ...commonQueries,
      };
    }

    if (!printDialogPDFOpts.bgLog?.disabled) {
      queries.bgLog = {
        endpoints: printDialogPDFOpts.bgLog?.endpoints,
        aggregationsByDate: 'dataByDate',
        stats: this.getStatsByChartType('bgLog'),
        types: { smbg: {} },
        bgSource: _.get(state.chartPrefs, 'bgLog.bgSource'),
        ...commonQueries,
      };
    }

    if (!printDialogPDFOpts.daily?.disabled) {
      queries.daily = {
        endpoints: printDialogPDFOpts.daily?.endpoints,
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
        bgSource: _.get(state.chartPrefs, 'daily.bgSource'),
        ...commonQueries,
      };
    }

    if (!printDialogPDFOpts.agpBGM?.disabled) {
      queries.agpBGM = {
        endpoints: printDialogPDFOpts.agpBGM?.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        bgSource: _.get(state.chartPrefs, 'agpBGM.bgSource'),
        stats: this.getStatsByChartType('agpBGM'),
        types: { smbg: {} },
        ...commonQueries,
      };
    }

    if (!printDialogPDFOpts.agpCGM?.disabled) {
      queries.agpCGM = {
        endpoints: printDialogPDFOpts.agpCGM?.endpoints,
        aggregationsByDate: 'dataByDate, statsByDate',
        bgSource: _.get(state.chartPrefs, 'agpCGM.bgSource'),
        stats: this.getStatsByChartType('agpCGM'),
        types: { cbg: {} },
        ...commonQueries,
      };
    }

    if (!printDialogPDFOpts.settings?.disabled) {
      queries.settings = {
        ...commonQueries,
      };
    }

    this.log('Generating PDF with', queries, printDialogPDFOpts);

    window.downloadPDFDataQueries = () => {
      console.save(queries, 'PDFDataQueries.json');
    };

    props.generatePDFRequest(
      'combined',
      queries,
      {
        ...printDialogPDFOpts,
        patient: pdfPatient,
      },
      this.props.currentPatientInViewId,
      props.pdf?.data,
    );
  },

  handleChartDateRangeUpdate: function(datetimeLocation, forceChartDataUpdate = false) {
    const isDaily = this.state.chartType === 'daily';
    const isTrends = this.state.chartType === 'trends';

    const newEndpoints = this.getChartEndpoints(datetimeLocation, {
      setEndToLocalCeiling: forceChartDataUpdate || !isDaily,
    });

    const endpointsChanged = newEndpoints && !_.isEqual(newEndpoints, this.state.endpoints);
    if (!endpointsChanged) return;

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

    const updateOpts = { updateChartEndpoints: true, forceRemountAfterQuery: true };
    if (datetime && mostRecentDatumTime) {
      updateOpts.mostRecentDatetimeLocation = getDatetimeLocation(getLocalizedCeiling(mostRecentDatumTime, this.state.timePrefs));
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

    this.fetchEarlierData({
      returnData: false,
      showLoading: true,
      noDates: true,
      type: 'pumpSettings,upload',
    });

    this.updateChart('settings');
  },

  handleClickPrint: function() {
    const metricProps = { fromChart: this.state.chartType };

    if (_.includes(['basics', 'daily', 'trends'], this.state.chartType)) {
      const bgSource = _.get(this.state.chartPrefs, [this.state.chartType, 'bgSource']);

      const bgSourceLabels = {
        cbg: 'cgm',
        smbg: 'bgm',
      };

      metricProps.dataToggle = bgSourceLabels[bgSource];
    }

    this.props.trackMetric('Clicked Print', metricProps);

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

    // Prior to refetching data, we need to remove current data from the data worker
    // Refetch will occur in UNSAFE_componentWillReceiveProps after data worker is emptied
    this.props.dataWorkerRemoveDataRequest(null, this.props.currentPatientInViewId);
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
          bgPrefs: _.get(this.state, 'bgPrefs'),
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

      case 'trends':
        aggregations = 'boluses';
        break;

      default:
        aggregations = undefined;
        break;
    }

    return aggregations;
  },

  getStatsByChartType: function(chartType = this.state.chartType, bgSource) {
    const currentBgSource = bgSource || _.get(this.state.chartPrefs, [chartType, 'bgSource']);
    const cbgSelected =  currentBgSource === 'cbg';
    const smbgSelected = currentBgSource === 'smbg';
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

      case 'agpBGM':
        stats.push(commonStats.averageGlucose,);
        stats.push(commonStats.bgExtents,);
        stats.push(commonStats.coefficientOfVariation,);
        stats.push(commonStats.glucoseManagementIndicator,);
        stats.push(commonStats.readingsInRange,);
        break;

      case 'agpCGM':
        stats.push(commonStats.averageGlucose);
        stats.push(commonStats.bgExtents);
        stats.push(commonStats.coefficientOfVariation);
        stats.push(commonStats.glucoseManagementIndicator);
        stats.push(commonStats.sensorUsage);
        stats.push(commonStats.timeInRange);
        break;

      case 'trends':
        cbgSelected && stats.push(commonStats.timeInRange);
        smbgSelected && stats.push(commonStats.readingsInRange);
        stats.push(commonStats.averageGlucose);
        cbgSelected && stats.push(commonStats.sensorUsage);
        stats.push(commonStats.totalInsulin);
        stats.push(commonStats.averageDailyDose);
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

      case 'agpBGM':
        latestDatums = getLatestDatums([
          'smbg',
        ]);
        break;

      case 'agpCGM':
        latestDatums = getLatestDatums([
          'cbg',
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
        'matchedDevices',
      ],
      types: '*',
      raw,
    };

    this.props.dataWorkerQueryDataRequest(query || defaultQuery, this.props.currentPatientInViewId, destination);
  },

  updateChart: function(chartType, datetimeLocation, endpoints, opts = {}) {
    _.defaults(opts, {
      forceRemountAfterQuery: false,
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

    const cb = (opts.forceRemountAfterQuery || chartTypeChanged || endpointsChanged || datetimeLocationChanged)
      ? this.queryData.bind(this, opts.query, {
        showLoading: opts.showLoading,
        updateChartEndpoints: opts.updateChartEndpoints,
        transitioningChartType: chartTypeChanged,
        forceRemountAfterQuery: opts.forceRemountAfterQuery,
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

    // Handle data refresh
    if (this.props.removingData.inProgress && nextProps.removingData.completed) {
      setTimeout(() => {
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
          this.props.onRefresh(this.props.currentPatientInViewId, this.state.refreshChartType);
          this.props.removeGeneratedPDFS();
        });
      });
    }

    // Hold processing until patient is fetched (ensuring settings are accessible) AND patient data exists
    if (patientSettings && patientData) {
      let stateUpdates = {};
      let stateUpdateCallback;

      // Set bgPrefs to state
      let bgPrefs = this.state.bgPrefs;

      if (!bgPrefs) {
        const bgUnitsOverride = {
          units: nextProps.queryParams?.units || nextProps.clinic?.preferredBgUnits,
          source: nextProps.queryParams?.units ? 'query params' : 'preferred clinic units',
        };

        bgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, bgUnitsOverride);
        bgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(bgPrefs);
        if (isCustomBgRange(bgPrefs)) stateUpdates.isCustomBgRange = true;
        stateUpdates.bgPrefs = bgPrefs;
      }

      // Set timePrefs to state
      let timePrefs = this.state.timePrefs;
      if (_.isEmpty(timePrefs)) {
        timePrefs = utils.getTimePrefsForDataProcessing(this.getMetaData('latestTimeZone', null, nextProps), this.props.queryParams);
        stateUpdates.timePrefs = timePrefs;
      }

      // Perform initial query of upload data to prepare for setting inital chart type
      if (this.getMetaData('queryDataCount', 0, nextProps) < 1) {
        this.queryData({
          types: {
            upload: {
              select: 'id,deviceId,deviceTags',
            },
          },
          metaData: 'latestDatumByType,latestPumpUpload,size,bgSources,devices,excludedDevices,queryDataCount',
          excludedDevices: undefined,
          timePrefs,
          bgPrefs,
          forceRemountAfterQuery: this.state.chartKey > 0
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

          const forceRemountAfterQuery = _.get(nextProps, 'data.query.forceRemountAfterQuery');
          if (forceRemountAfterQuery) {
            // Updating the key of a component forces a remount
            stateUpdates.chartKey = _.get(nextProps, 'data.metaData.queryDataCount');
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
        const nextBgSource = _.get(nextProps, 'data.metaData.bgSources.current');
        const queryOpts = {}

        if (nextBgSource && this.state.chartType && _.isEmpty(_.get(this.state.chartPrefs, [this.state.chartType, 'bgSource']))) {
          // If this is the first data fetch that contained bg data, we check for it and set the
          // bgSource state accordingly to allow generating all appropriate stats
          this.updateChartPrefs({
            [this.state.chartType]: { ...this.state.chartPrefs[this.state.chartType], bgSource: nextBgSource },
          }, false, false);

          queryOpts.bgSource = nextBgSource;
        }

        // New data has been added. Let's query it to update the chart.
        this.queryData(null, queryOpts);

        // If new data was fetched to support requested PDF dates, kick off pdf generation.
        if (this.state.printDialogPDFOpts) {
          this.generatePDF(nextProps);
        }

        // If new data was fetched to support new chart dates,
        // close the and reset the chart date dialog.
        if (this.state.datesDialogFetchingData) {
          this.closeDatesDialog();
        }
      }

      const needsAgpBGMImagesGenerated = this.props.pdf?.opts?.agpBGM?.disabled === undefined && nextProps.pdf?.opts?.agpBGM?.disabled === false && !_.isObject(nextProps.pdf.images);
      const needsAgpCGMImagesGenerated = this.props.pdf?.opts?.agpCGM?.disabled === undefined && nextProps.pdf?.opts?.agpCGM?.disabled === false && !_.isObject(nextProps.pdf.images);
      const agpImagesGenerated = !_.isObject(this.props.pdf.opts?.svgDataURLS) && _.isObject(nextProps.pdf.opts?.svgDataURLS);

      if (needsAgpBGMImagesGenerated || needsAgpCGMImagesGenerated ) {
        const reportTypes = [];
        needsAgpBGMImagesGenerated && reportTypes.push('agpBGM');
        needsAgpCGMImagesGenerated && reportTypes.push('agpCGM');
        this.generateAGPImages(nextProps, reportTypes);
      } else if (agpImagesGenerated) {
        this.generatePDF(nextProps, {
          ...this.state,
          printDialogPDFOpts: nextProps.pdf.opts,
        });
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
                  sx= {{ lineHeight: 1.5, fontSize: 1 }}
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
      metaData: 'bgSources,devices,matchedDevices,excludedDevices,queryDataCount',
      bgSource: _.get(this.state, ['chartPrefs', this.state.chartType, 'bgSource']),
    });

    if (this.state.queryingData) return;
    this.setState({ loading: options.showLoading, queryingData: true });

    let chartQuery = {
      bgSource: options.bgSource,
      chartType: this.state.chartType,
      excludedDevices: _.get(this.state, 'chartPrefs.excludedDevices', []),
      excludeDaysWithoutBolus: _.get(this.state, ['chartPrefs', this.state.chartType, 'stats', 'excludeDaysWithoutBolus']),
      endpoints: this.state.endpoints,
      metaData: options.metaData,
      forceRemountAfterQuery: options.forceRemountAfterQuery,
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

          chartQuery.aggregationsByDate = 'boluses';
          break;

        case 'settings':
          chartQuery.types = {
            pumpSettings: {},
            upload: {},
          };
          chartQuery.endpoints[0] = 0;
          break;
      }

      const { next: nextDays, prev: prevDays } = this.getDaysByType();

      chartQuery.stats = this.getStatsByChartType(this.state.chartType, options.bgSource);
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

/**
 * Fetches earlier data for the current patient.
 *
 * This function is responsible for fetching earlier data for the patient currently in view.
 * It checks if data is already being fetched and returns early if so. Otherwise, it constructs
 * the options for the data fetch, updates the component state to indicate loading, logs the
 * fetching action, and triggers the data fetch via the `onFetchEarlierData` prop.
 *
 * @param {Object} [options={}] - Optional configuration object for the data fetch.
 * @param {boolean} [options.showLoading=true] - Whether to show the loading indicator.
 * @param {string} [options.startDate] - The start date for the data fetch. Defaults to 16 weeks before the earliest requested data.
 * @param {string} [options.endDate] - The end date for the data fetch. Defaults to 1 millisecond before the earliest requested data.
 * @param {boolean} [options.carelink=this.props.carelink] - Whether to include Carelink data.
 * @param {boolean} [options.dexcom=this.props.dexcom] - Whether to include Dexcom data.
 * @param {boolean} [options.medtronic=this.props.medtronic] - Whether to include Medtronic data.
 * @param {boolean} [options.useCache=false] - Whether to use cached data.
 * @param {boolean} [options.initial=false] - Whether this is the initial data fetch.
 * @param {boolean} [options.noDates=false] - Whether to fetch data without start and end dates..
 *
 * @returns {void}
 */
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
      noDates: false,
    });

    if (fetchOpts.noDates) {
      fetchOpts.startDate = undefined;
      fetchOpts.endDate = undefined;
    }

    const count = this.state.fetchEarlierDataCount + 1;

    this.setState({
      loading: options.showLoading,
      fetchEarlierDataCount: count,
    });

    this.log('fetching');

    this.props.onFetchEarlierData(fetchOpts, this.props.currentPatientInViewId);

    const properties = { patientID: this.props.currentPatientInViewId, count };
    if (this.props.selectedClinicId) properties.clinicId = this.props.selectedClinicId;
    this.props.trackMetric('Fetched earlier patient data', properties);
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

      const properties = { patientID: nextProps.currentPatientInViewId };
      if (this.props.selectedClinicId) properties.clinicId = this.props.selectedClinicId;
      this.props.trackMetric('Fetched initial patient data', properties);
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
export const PatientData = withTranslation()(props => <PatientDataClass {...props}/>);

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

  if (stateProps.selectedClinicId && !stateProps.fetchingPatientFromClinic.inProgress && !stateProps.fetchingPatientFromClinic.completed) {
    fetchers.push(dispatchProps.fetchPatientFromClinic.bind(null, api, stateProps.selectedClinicId, ownProps.match.params.id));
  }

  // if is clinician user viewing a patient's data with no selected clinic
  // we need to check clinics for patient and then select the relevant clinic

  let clinicToSelect = null;
  _.forEach(stateProps.clinics, (clinic, clinicId) => {
    let patient = _.get(clinic.patients, ownProps.match.params.id, null);
    if (patient) {
      clinicToSelect = clinicId;
    }
  });

  if (
    personUtils.isClinicianAccount(stateProps.user) &&
    stateProps.user.userid !== ownProps.match.params.id &&
    (!stateProps.selectedClinicId || stateProps.selectedClinicId !== clinicToSelect) &&
    !stateProps.fetchingPatientFromClinic.inProgress
  ) {
    if (clinicToSelect) {
      dispatchProps.selectClinic(api, clinicToSelect);
    } else {
      _.forEach(stateProps.clinics, (clinic, clinicId) => {
        fetchers.push(
          dispatchProps.fetchPatientFromClinic.bind(
            null,
            api,
            clinicId,
            ownProps.match.params.id
          )
        );
      });
    }
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
      patient = _.cloneDeep(_.get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      ));

      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );

      if (patient && state.blip.selectedClinicId) {
        _.set(
          patient,
          'profile.patient.mrn',
          _.get(state.blip, [
            'clinics',
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'mrn'
          ])
        );
      }

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
    fetchingPatientFromClinic: state.blip.working.fetchingPatientFromClinic,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    fetchingPendingSentInvites: state.blip.working.fetchingPendingSentInvites,
    fetchingAssociatedAccounts: state.blip.working.fetchingAssociatedAccounts,
    addingData: state.blip.working.addingData,
    removingData: state.blip.working.removingData,
    updatingDatum: state.blip.working.updatingDatum,
    queryingData: state.blip.working.queryingData,
    generatingPDF: state.blip.working.generatingPDF,
    pdf: state.blip.pdf,
    data: state.blip.data,
    selectedClinicId: state.blip.selectedClinicId,
    clinic: state.blip.clinics?.[state.blip.selectedClinicId],
    clinics: state.blip.clinics,
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
  fetchPatientFromClinic: actions.async.fetchPatientFromClinic,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites,
  fetchMessageThread: actions.async.fetchMessageThread,
  generatePDFRequest: actions.worker.generatePDFRequest,
  removeGeneratedPDFS: actions.worker.removeGeneratedPDFS,
  generateAGPImagesSuccess: actions.sync.generateAGPImagesSuccess,
  generateAGPImagesFailure: actions.sync.generateAGPImagesFailure,
  selectClinic: actions.async.selectClinic,
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
    'generateAGPImagesSuccess',
    'generateAGPImagesFailure',
  ];

  return Object.assign({}, _.pick(dispatchProps, assignedDispatchProps), stateProps, {
    fetchers: getFetchers(dispatchProps, ownProps, stateProps, api, { carelink, dexcom, medtronic }),
    history: ownProps.history,
    uploadUrl: api.getUploadUrl(),
    onRefresh: (patientId, chartType) => {
      const fetchOptions = {
        carelink,
        dexcom,
        medtronic
      };
      if(chartType === 'settings') {
        _.extend(fetchOptions, {
          type: 'pumpSettings,upload',
          initial: false,
          startDate: undefined,
          endDate: undefined,
        });
      }
      return dispatchProps.fetchPatientData(api, fetchOptions, patientId);
    },
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
    selectClinic: dispatchProps.selectClinic.bind(null, api),
    carelink: carelink,
    dexcom: dexcom,
    medtronic: medtronic,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientData);
