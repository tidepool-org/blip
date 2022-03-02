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

import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import bows from "bows";
import moment from "moment-timezone";
import i18next from "i18next";
import clsx from "clsx";
import { Switch, Route } from "react-router-dom";

import { TidelineData, nurseShark, MS_IN_DAY, MGDL_UNITS } from "tideline";
import { utils as vizUtils, components as vizComponents, createPrintPDFPackage } from "tidepool-viz";

import config from "../config";
import personUtils from "../core/personutils";
import utils from "../core/utils";
import ApiUtils from "../core/api-utils";
import { Header, Basics, Daily, Trends, Settings } from "./chart";
import Messages from "./messages";
import { FETCH_PATIENT_DATA_SUCCESS } from "../redux";

const { waitTimeout } = utils;
const { DataUtil } = vizUtils.data;
const { Loader } = vizComponents;

/** @type {(s: string, p?: object) => string} */
const t = i18next.t.bind(i18next);

const LOADING_STATE_NONE = 0;
const LOADING_STATE_INITIAL_FETCH = LOADING_STATE_NONE + 1;
const LOADING_STATE_INITIAL_PROCESS = LOADING_STATE_INITIAL_FETCH + 1;
const LOADING_STATE_DONE = LOADING_STATE_INITIAL_PROCESS + 1;
const LOADING_STATE_EARLIER_FETCH = LOADING_STATE_DONE + 1;
const LOADING_STATE_EARLIER_PROCESS = LOADING_STATE_EARLIER_FETCH + 1;
const LOADING_STATE_ERROR = LOADING_STATE_EARLIER_PROCESS + 1;

/**
 * @typedef { import('history').History } History
 * @typedef { import('redux').Store } Store
 * @typedef { import("../index").BlipApi } API
 * @typedef { import("../index").IUser } User
 * @typedef { import("../index").PatientData } PatientData
 * @typedef { import("../index").MessageNote } MessageNote
 * @typedef { import("../index").DialogDatePicker } DialogDatePicker
 * @typedef { import("../index").DialogRangeDatePicker } DialogRangeDatePicker
 * @typedef { import("../index").ProfileDialog } ProfileDialog
 * @typedef { import("../core/lib/partial-data-load").DateRange } DateRange
 *
 * @typedef {{ api: API, patient: User, store: Store, prefixURL: string, history: History;dialogDatePicker: DialogDatePicker; dialogRangeDatePicker:DialogRangeDatePicker; profileDialog: ProfileDialog }} PatientDataProps
 * @typedef {{loadingState: number; tidelineData: TidelineData | null; epochLocation: number; epochRange: number; patient: User; canPrint: boolean; chartPrefs: object; createMessageDatetime: string | null; messageThread: MessageNote[] | null; errorMessage?: string | null; msRange: number}} PatientDataState
 */

/**
 * Main patient data rendering page
 * @augments {React.Component<PatientDataProps,PatientDataState>}
 */
class PatientDataPage extends React.Component {
  constructor(/** @type {PatientDataProps} */ props) {
    super(props);
    const { api, patient } = this.props;

    this.log = bows("PatientData");
    this.trackMetric = api.metrics.send;
    this.chartRef = React.createRef();
    /** @type {DataUtil | null} */
    this.dataUtil = null;
    this.apiUtils = new ApiUtils(api, patient);

    const currentUser = api.whoami;
    const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.showProfileDialog = currentUser.userid !== patient.userid;

    this.state = {
      loadingState: LOADING_STATE_NONE,
      errorMessage: null,
      /** Current display date (date at center) */
      epochLocation: 0,
      /** Current display data range in ms around epochLocation */
      msRange: 0,
      timePrefs: {
        timezoneAware: true,
        timezoneName: browserTimezone,
      },
      bgPrefs: {
        bgUnits: currentUser.settings?.units?.bg ?? MGDL_UNITS,
        bgClasses: {},
      },
      permsOfLoggedInUser: {
        view: {},
        notes: {},
      },
      canPrint: false,
      showPDFPrintOptions: false,

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
        },
        bgLog: {
          bgSource: "smbg",
        },
      },
      chartStates: {
        trends: {
        },
      },
      /** @type {TidelineData | null} */
      tidelineData: null,
    };

    this.handleSwitchToBasics = this.handleSwitchToBasics.bind(this);
    this.handleSwitchToDaily = this.handleSwitchToDaily.bind(this);
    this.handleSwitchToTrends = this.handleSwitchToTrends.bind(this);
    this.handleSwitchToSettings = this.handleSwitchToSettings.bind(this);
    this.handleShowMessageCreation = this.handleShowMessageCreation.bind(this);
    this.handleClickRefresh = this.handleClickRefresh.bind(this);
    this.handleClickNoDataRefresh = this.handleClickNoDataRefresh.bind(this);

    this.handleDatetimeLocationChange = this.handleDatetimeLocationChange.bind(this);
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
    this.unsubscribeStore = store.subscribe(this.reduxListener.bind(this));
    this.handleRefresh().then(() => {
      const locationChart = this.getChartType();
      switch (locationChart) {
      case "overview":
        this.handleSwitchToBasics();
        break;
      case "daily":
        this.handleSwitchToDaily();
        break;
      case "settings":
        this.handleSwitchToSettings();
        break;
      case "trends":
        this.handleSwitchToTrends();
        break;
      default:
        this.handleSwitchToDaily();
        break;
      }
    });
  }

  componentWillUnmount() {
    if (typeof this.unsubscribeStore === "function") {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.chartRef = null;
    this.apiUtils = null;
  }

  render() {
    const { dialogPDFOptions: DialogPDFOptions } = this.props;
    const { loadingState, errorMessage, tidelineData, canPrint, showPDFPrintOptions } = this.state;
    const chartType = this.getChartType();
    let loader = null;
    let messages = null;
    let patientData = null;
    let errorDisplay = null;

    switch (loadingState) {
    case LOADING_STATE_EARLIER_FETCH:
    case LOADING_STATE_EARLIER_PROCESS:
    case LOADING_STATE_DONE:
      if (chartType === "daily") {
        messages = this.renderMessagesContainer();
      }
      patientData = this.renderPatientData();
      break;
    case LOADING_STATE_NONE:
      messages = <p>Please select a patient</p>;
      break;
    case LOADING_STATE_INITIAL_FETCH:
    case LOADING_STATE_INITIAL_PROCESS:
      loader = <Loader />;
      break;
    default:
      if (errorMessage === "no-data") {
        errorDisplay = this.renderNoData();
      } else {
        errorDisplay = <p id="loading-error-message">{errorMessage ?? t("An unknown error occurred")}</p>;
      }
      break;
    }

    let start = "1970-01-01";
    let end = "1970-01-02";
    if (canPrint && showPDFPrintOptions) {
      const { startDate, endDate } = tidelineData.getLocaleTimeEndpoints();
      start = startDate.format("YYYY-MM-DD");
      end = endDate.format("YYYY-MM-DD");
    }

    const classes = clsx(
      "patient-data",
      "patient-data-yourloops",
      { ["patient-data-with-dialog"]: showPDFPrintOptions }
    );

    return (
      <div className={classes}>
        {messages}
        {patientData}
        {loader}
        {errorDisplay}
        {canPrint &&
          <DialogPDFOptions
            open={showPDFPrintOptions}
            minDate={start}
            maxDate={end}
            onResult={this.handlePrint}
          />
        }
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
    return <Header
      chartType="no-data"
      title={t("Data")}
      canPrint={false}
      trackMetric={this.trackMetric} />;
  }

  renderInitialLoading() {
    const header = this.renderEmptyHeader();
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
  }

  renderNoData() {
    const header = this.renderEmptyHeader();
    const patientName = personUtils.fullName(this.props.patient);
    const noDataText = t("{{patientName}} does not have any data yet.", { patientName });
    const reloadBtnText = t("Click to reload.");

    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <div className="patient-data-message-no-data">
                <p>{noDataText}</p>
                <button type="button" className="btn btn-primary" onClick={this.handleClickNoDataRefresh}>
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
    const diabetesData = _.get(this.state, "tidelineData.diabetesData", []);
    if (_.isEmpty(diabetesData)) {
      this.log.warn("Sorry, no data to display");
      return true;
    }
    return false;
  }

  renderChart() {
    const { patient, profileDialog, prefixURL, dialogDatePicker, dialogRangeDatePicker } = this.props;
    const {
      canPrint,
      permsOfLoggedInUser,
      loadingState,
      chartPrefs,
      chartStates,
      epochLocation,
      msRange,
      tidelineData,
    } = this.state;

    return (
      <Switch>
        <Route path={`${prefixURL}/overview`}>
          <Basics
            profileDialog={this.showProfileDialog ? profileDialog : null}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            dataUtil={this.dataUtil}
            timePrefs={this.state.timePrefs}
            patient={patient}
            tidelineData={tidelineData}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            prefixURL={prefixURL}
            permsOfLoggedInUser={permsOfLoggedInUser}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            ref={this.chartRef}
          />
        </Route>
        <Route path={`${prefixURL}/daily`}>
          <Daily
            profileDialog={this.showProfileDialog ? profileDialog : null}
            dialogDatePicker={dialogDatePicker}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            dataUtil={this.dataUtil}
            timePrefs={this.state.timePrefs}
            patient={patient}
            tidelineData={tidelineData}
            epochLocation={epochLocation}
            msRange={msRange}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            prefixURL={prefixURL}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread.bind(this)}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onClickPrint={this.handleClickPrint}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            ref={this.chartRef}
          />
        </Route>
        <Route path={`${prefixURL}/trends`}>
          <Trends
            profileDialog={this.showProfileDialog ? profileDialog : null}
            dialogRangeDatePicker={dialogRangeDatePicker}
            bgPrefs={this.state.bgPrefs}
            chartPrefs={chartPrefs}
            dataUtil={this.dataUtil}
            timePrefs={this.state.timePrefs}
            epochLocation={epochLocation}
            msRange={msRange}
            patient={patient}
            tidelineData={tidelineData}
            loading={loadingState !== LOADING_STATE_DONE}
            canPrint={canPrint}
            prefixURL={prefixURL}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onDatetimeLocationChange={this.handleDatetimeLocationChange}
            trackMetric={this.trackMetric}
            updateChartPrefs={this.updateChartPrefs}
            trendsState={chartStates.trends}
          />
        </Route>
        <Route path={`${prefixURL}/settings`}>
          <Settings
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            currentPatientInViewId={patient.userid}
            timePrefs={this.state.timePrefs}
            patient={patient}
            patientData={tidelineData}
            canPrint={canPrint}
            prefixURL={prefixURL}
            onClickRefresh={this.handleClickRefresh}
            onClickNoDataRefresh={this.handleClickNoDataRefresh}
            onSwitchToBasics={this.handleSwitchToBasics}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToTrends={this.handleSwitchToTrends}
            onSwitchToSettings={this.handleSwitchToSettings}
            onClickPrint={this.handleClickPrint}
            trackMetric={this.trackMetric}
          />
        </Route>
      </Switch>
    );
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
    return null;
  }

  getChartType() {
    const { history, prefixURL } = this.props;

    switch (history.location.pathname) {
    case `${prefixURL}/overview`:
      return "overview";
    case `${prefixURL}/daily`:
      return "daily";
    case `${prefixURL}/trends`:
      return "trends";
    case `${prefixURL}/settings`:
      return "settings";
    }
    return null;
  }

  /**
   *
   * @param {{ start: string; end: string; preset?: string; }} printOptions
   * @returns {Promise<void>}
   */
  async generatePDF(printOptions) {
    const { patient } = this.props;
    const { tidelineData, bgPrefs } = this.state;

    if (tidelineData === null) {
      return Promise.reject("Tidelinedata is null");
    }

    const start = moment.tz(printOptions.start, tidelineData.getTimezoneAt(printOptions.start)).startOf("day");
    const timezone = tidelineData.getTimezoneAt(printOptions.end);
    const end = moment.tz(printOptions.end, timezone).endOf("day");
    const numDays = end.diff(start, "days") + 1;
    const epochLocation = start.valueOf() + (end.valueOf() - start.valueOf()) / 2;
    const endPDFDate = end.toISOString();

    // Load a 2 days more than needed, around the wanted location, to be sure
    // we have data with duration too within this range
    await this.handleDatetimeLocationChange(epochLocation, (2 + numDays) * MS_IN_DAY, "pdf");

    const timePrefs = {
      timezoneAware: true,
      timezoneName: timezone,
    };
    const opts = {
      bgPrefs,
      patient,
      timePrefs,
      endPDFDate,
    };

    const lastPumpSettings = _.last(tidelineData.grouped.pumpSettings);
    const pdfData = {
      basics: tidelineData.generateBasicsData(start, end),
      daily: vizUtils.data.selectDailyViewData(tidelineData, start, end),
      settings: !printOptions.preset
        ? vizUtils.data.generatePumpSettings(_.last(tidelineData.grouped.pumpSettings), end)
        : lastPumpSettings,
    };

    vizUtils.data.generatePDFStats(pdfData, this.dataUtil);
    return createPrintPDFPackage(pdfData, opts);
  }

  async handleMessageCreation(message) {
    await this.chartRef.current.createMessage(nurseShark.reshapeMessage(message));
    this.trackMetric("note", "create_note");
  }

  async handleReplyToMessage(comment) {
    const { api } = this.props;
    const id = await api.replyMessageThread(comment);
    this.trackMetric("note", "reply_note");
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
    const { api } = this.props;

    await api.editMessage(message);
    this.trackMetric("note", "edit_note");

    if (_.isEmpty(message.parentmessage)) {
      // Daily timeline view only cares for top-level note
      const reshapedMessage = nurseShark.reshapeMessage(message);
      this.chartRef.current.editMessage(reshapedMessage);
    }
  }

  async handleShowMessageThread(messageThread) {
    const { api } = this.props;

    const messages = await api.getMessageThread(messageThread);
    this.setState({ messageThread: messages });
  }

  handleShowMessageCreation(/** @type {moment.Moment | Date | null} */ datetime) {
    const { epochLocation, tidelineData } = this.state;
    let mDate = datetime;
    if (datetime === null) {
      const timezone = tidelineData.getTimezoneAt(epochLocation);
      mDate = moment.utc(epochLocation).tz(timezone);
    }
    this.setState({ createMessageDatetime : mDate.toISOString() });
  }

  closeMessageThread() {
    this.setState({ createMessageDatetime: null, messageThread: null });
  }

  closeMessageCreation() {
    this.setState({ createMessageDatetime: null, messageThread: null });
  }

  handleSwitchToBasics(e) {
    const { prefixURL, history } = this.props;
    const fromChart = this.getChartType();
    const toChart = "overview";
    if (e) {
      e.preventDefault();
    }

    this.dataUtil.chartPrefs = this.state.chartPrefs[toChart];
    if (fromChart !== toChart) {
      history.push(`${prefixURL}/${toChart}`);
      this.trackMetric("data_visualization", "click_view", toChart);
    }
  }

  /**
   *
   * @param {moment.Moment | Date | number | null} datetime The day to display
   */
  handleSwitchToDaily(datetime = null) {
    const { prefixURL, history } = this.props;
    const fromChart = this.getChartType();
    const toChart = "daily";

    let { epochLocation } = this.state;

    if (typeof datetime === "number") {
      epochLocation = datetime;
    } else if (moment.isMoment(datetime) || datetime instanceof Date) {
      epochLocation = datetime.valueOf();
    }

    this.dataUtil.chartPrefs = this.state.chartPrefs[toChart];
    this.setState({
      epochLocation,
      msRange: MS_IN_DAY,
    }, () => {
      if (fromChart !== toChart) {
        history.push(`${prefixURL}/${toChart}`);
        this.trackMetric("data_visualization", "click_view", toChart);
      }
    });
  }

  handleSwitchToTrends(e) {
    const { prefixURL, history } = this.props;
    const fromChart = this.getChartType();
    const toChart = "trends";
    if (e) {
      e.preventDefault();
    }

    this.dataUtil.chartPrefs = this.state.chartPrefs[toChart];
    if (fromChart !== toChart) {
      history.push(`${prefixURL}/${toChart}`);
      this.trackMetric("data_visualization", "click_view", toChart);
    }
  }

  handleSwitchToSettings(e) {
    const { prefixURL, history } = this.props;
    const fromChart = this.getChartType();
    const toChart = "settings";
    if (e) {
      e.preventDefault();
    }
    if (fromChart !== toChart) {
      history.push(`${prefixURL}/${toChart}`);
      this.trackMetric("data_visualization", "click_view", toChart);
    }
  }

  handleClickPrint = () => {
    if (this.state.canPrint) {
      this.setState({ showPDFPrintOptions: true });
    }
  }

  /**
   * @param {{ start: string; end: string; preset?: string; }|undefined} printOptions
   * @returns {Promise<void>}
   */
  handlePrint = (printOptions) => {
    const openPDFWindow = (pdf) => {
      const printWindow = window.open(pdf.url);
      if (printWindow !== null) {
        printWindow.focus();
        if (!utils.isFirefox()) {
          printWindow.print();
        }
      }
    };

    this.setState({ showPDFPrintOptions: false });

    if (!printOptions) {
      return Promise.resolve();
    }

    // Return a promise for the tests
    return new Promise((resolve, reject) => {
      this.setState({ canPrint: false, loadingState: LOADING_STATE_EARLIER_FETCH });
      this.generatePDF(printOptions)
        .then((pdf) => {
          this.trackMetric("export_data", "save_report", printOptions.preset ?? "custom");
          openPDFWindow(pdf);
          resolve();
        })
        .catch((err) => {
          this.log.error("generatePDF:", err);
          this.trackMetric("export_data", "save_report", "error");
          if (_.isFunction(window.onerror)) {
            window.onerror("print", "patient-data", 0, 0, err);
          }
          reject(err);
        }).finally(() => {
          this.setState({ canPrint: true, loadingState: LOADING_STATE_DONE });
        });
    });
  }

  handleClickRefresh(/* e */) {
    this.handleRefresh().catch(reason => this.log.error(reason));
  }

  handleClickNoDataRefresh(/* e */) {
    this.handleRefresh().catch(reason => this.log.error(reason));
  }

  onLoadingFailure(err) {
    // TODO A cleaner message
    const errorMessage = _.isError(err) ? err.message : (new String(err)).toString();
    this.log.error(errorMessage, err);
    this.setState({ loadingState: LOADING_STATE_ERROR, errorMessage });
  }

  updateChartPrefs(updates, cb = _.noop) {
    const newPrefs = {
      ...this.state.chartPrefs,
      ...updates,
    };

    const fromChart = this.getChartType();
    if (fromChart) {
      this.dataUtil.chartPrefs = newPrefs[fromChart];
      this.setState({ chartPrefs: newPrefs, }, cb);
    }
  }

  /**
   * Chart display date / range change
   * @param {number} epochLocation datetime epoch value in ms
   * @param {number} msRange ms around epochLocation
   * @param {"pdf" | null} target
   * @returns {Promise<boolean>} true if new data are loaded
   */
  async handleDatetimeLocationChange(epochLocation, msRange, target = null) {
    const { loadingState } = this.state;
    const chartType = target ?? this.getChartType();
    let dataLoaded = false;

    if (!Number.isFinite(epochLocation) || !Number.isFinite(msRange)) {
      throw new Error("handleDatetimeLocationChange: invalid parameters");
    }

    const updateLocation = target === "pdf" ? _.noop : () => {
      this.setState({ epochLocation, msRange });
    };

    // Don't do anything if we are currently loading
    if (loadingState === LOADING_STATE_DONE) {
      // For daily check for +/- 1 day (and not 0.5 day), for others only the displayed range

      let msRangeDataNeeded;
      switch (chartType) {
      case "daily":
        msRangeDataNeeded = MS_IN_DAY;
        break;
      case "pdf":
        msRangeDataNeeded = msRange;
        break;
      default:
        msRangeDataNeeded = msRange / 2;
        break;
      }

      /** @type {DateRange} */
      let rangeDisplay = {
        start: moment.utc(epochLocation - msRangeDataNeeded).startOf("day").valueOf(),
        end: moment.utc(epochLocation + msRangeDataNeeded).endOf("day").valueOf() + 1,
      };
      const rangeToLoad = this.apiUtils.partialDataLoad.getRangeToLoad(rangeDisplay);
      if (rangeToLoad) {
        // We need more data!

        if (chartType === "daily") {
          // For daily we will load 3 days to avoid too many loading
          msRangeDataNeeded = MS_IN_DAY * 3;
          rangeDisplay = {
            start: moment.utc(epochLocation - msRangeDataNeeded).startOf("day").valueOf(),
            end: moment.utc(epochLocation + msRangeDataNeeded).endOf("day").valueOf() + 1,
          };
        }

        updateLocation();
        this.setState({ loadingState: LOADING_STATE_EARLIER_FETCH });
        const data = await this.apiUtils.fetchDataRange(rangeDisplay);

        this.setState({ loadingState: LOADING_STATE_EARLIER_PROCESS });
        await this.processData(data);

        if (target !== "pdf") {
          // The loading state will be changed after the PDF is generated,
          // for other cases, we have finished
          this.setState({ loadingState: LOADING_STATE_DONE });
        }

        dataLoaded = true;
      } else {
        updateLocation();
      }
    }

    return dataLoaded;
  }

  async handleRefresh() {
    this.setState({
      loadingState: LOADING_STATE_INITIAL_FETCH,
      dataRange: null,
      epochLocation: 0,
      msRange: 0,
      tidelineData: null,
      canPrint: false,
    });

    try {
      const data = await this.apiUtils.refresh();
      this.setState({ loadingState: LOADING_STATE_INITIAL_PROCESS });
      await waitTimeout(1);

      // Process the data to be usable by us
      await this.processData(data);

      this.setState({ loadingState: LOADING_STATE_DONE });

    } catch (reason) {
      this.onLoadingFailure(reason);
    }
  }

  /**
   *
   * @param {PatientData} data
   */
  async processData(data) {
    const { store, patient } = this.props;
    const { timePrefs, bgPrefs, epochLocation, msRange } = this.state;
    let { tidelineData } = this.state;

    const firstLoadOrRefresh = tidelineData === null;

    this.props.api.metrics.startTimer("process_data");

    const res = nurseShark.processData(data, bgPrefs.bgUnits);
    await waitTimeout(1);
    if (firstLoadOrRefresh) {
      const opts = {
        timePrefs,
        ...bgPrefs,
        // Used by tideline oneDay to set-up the scroll range
        // Send this information by tidelineData options
        dataRange: this.apiUtils.dataRange,
        YLP820_BASAL_TIME: config.YLP820_BASAL_TIME,
      };
      tidelineData = new TidelineData(opts);
    }
    await tidelineData.addData(res.processedData);

    if (_.isEmpty(tidelineData.data)) {
      this.props.api.metrics.endTimer("process_data");
      throw new Error("no-data");
    }

    const bgPrefsUpdated = {
      bgUnits: tidelineData.opts.bgUnits,
      bgClasses: tidelineData.opts.bgClasses,
    };
    this.dataUtil = new DataUtil(tidelineData.data, { bgPrefs: bgPrefsUpdated, timePrefs, endpoints: tidelineData.endpoints });

    let newLocation = epochLocation;
    if (epochLocation === 0) {
      // First loading, display the last day in the daily chart
      newLocation = moment.utc(tidelineData.endpoints[1]).valueOf() - MS_IN_DAY/2;
    }
    let newRange = msRange;
    if (msRange === 0) {
      newRange = MS_IN_DAY;
    }

    const hasDiabetesData = _.get(tidelineData, "diabetesData.length", 0) > 0;

    this.setState({
      bgPrefs: bgPrefsUpdated,
      timePrefs: tidelineData.opts.timePrefs,
      tidelineData,
      epochLocation: newLocation,
      msRange: newRange,
      canPrint: hasDiabetesData,
    });

    if (firstLoadOrRefresh) {
      store.dispatch({
        type: FETCH_PATIENT_DATA_SUCCESS,
        payload: {
          patientId: patient.userid,
        },
      });
    }

    this.props.api.metrics.endTimer("process_data");
  }
}

PatientDataPage.propTypes = {
  api: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  profileDialog: PropTypes.func.isRequired,
  dialogDatePicker: PropTypes.func.isRequired,
  dialogRangeDatePicker: PropTypes.func.isRequired,
  dialogPDFOptions: PropTypes.func.isRequired,
  prefixURL: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default PatientDataPage;
