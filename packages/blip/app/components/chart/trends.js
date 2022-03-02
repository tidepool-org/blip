/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import _ from "lodash";
import bows from "bows";
import moment from "moment-timezone";
import i18next from "i18next";
import React from "react";
import PropTypes from "prop-types";
import WindowSizeListener from "react-window-size-listener";

import DateRangeIcon from "@material-ui/icons/DateRange";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";

import {
  components as vizComponents,
  containers as vizContainers,
  utils as vizUtils
} from "tidepool-viz";
import { MS_IN_DAY } from "tideline";

import Header from "./header";
import SubNav, { weekDays } from "./trendssubnav";
import Stats from "./stats";
import Footer from "./footer";

/**
 * @typedef { import("tideline").TidelineData } TidelineData
 * @typedef { import("tideline/js/tidelinedata").Datum } Datum
 * @typedef { import("../../index").DialogRangeDatePicker } DialogRangeDatePicker
 *
 * @typedef { import("./index").TrendsDatePickerProps } TrendsDatePickerProps
 * @typedef { import("./index").TrendsProps } TrendsProps
 * @typedef { import("./index").TrendsState } TrendsState
*/

const t = i18next.t.bind(i18next);
const CBGDateTraceLabel = vizComponents.CBGDateTraceLabel;
const FocusedRangeLabels = vizComponents.FocusedRangeLabels;
const Loader = vizComponents.Loader;

const TrendsContainer = vizContainers.TrendsContainer;
const reshapeBgClassesToBgBounds = vizUtils.bg.reshapeBgClassesToBgBounds;

// Do not translate this date, it's the ISO format!
const ISO_DAY_FORMAT = "YYYY-MM-DD";

/*
 Date management is hard:
 Some hint, which should be kept in mind:
 - Date range selection: start >= value < end
   * End date is exclusive, but we display the inclusive one, so we often substract 1ms to display
     the previous day
 - Try to work with days when possible (YYYY-MM-DD)
 */

/**
 * Return the start of day for an UTC date.
 * according to the timezone of the data
 *
 * startOf("day") of moment do not do what's is expected
 * @param {string|number|Date|moment.Moment} date
 * @param {TidelineData} tidelineData
 */
function getDayAt(date, tidelineData) {
  const timezone = tidelineData.getTimezoneAt(date);
  const mDate = moment.tz(date, timezone);
  return mDate.format(ISO_DAY_FORMAT);
}

/**
 * Same as getDayAt() but return a moment object
 *
 * Return the start day, for the timezone at that moment for the specified date
 * @param {string|number|Date|moment.Moment} date
 * @param {TidelineData} tidelineData
 */
function getMomentDayAt(date, tidelineData) {
  const timezone = tidelineData.getTimezoneAt(date);
  const mDate = moment.tz(date, timezone);
  return moment.tz(mDate.format(ISO_DAY_FORMAT), timezone);
}

/**
 *
 * @param {TrendsDatePickerProps} props
 * @returns {JSX.Element}
 */
function TrendsDatePicker(props) {
  const {
    dialogRangeDatePicker: DialogRangeDatePicker,
    displayedDate,
    start,
    end,
    minDate,
    maxDate,
    disabled,
    onResult
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  const handleResult = (start, end) => {
    setIsOpen(false);
    onResult(start, end);
  };

  return (
    <React.Fragment>
      <TextField
        id="trends-chart-title-dates"
        onClick={() => setIsOpen(true)}
        onKeyPress={() => setIsOpen(true)}
        variant="standard"
        value={displayedDate}
        disabled={disabled || isOpen}
        InputProps={disabled ? undefined : {
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <DateRangeIcon className="calendar-nav-icon" />
            </InputAdornment>
          ),
        }}
      />
      <DialogRangeDatePicker
        start={start}
        end={end}
        minDate={minDate}
        maxDate={maxDate}
        maxSelectableDays={90}
        onResult={handleResult}
        isOpen={isOpen}
        showToolbar
      />
    </React.Fragment>
  );
}

TrendsDatePicker.propTypes = {
  dialogRangeDatePicker: PropTypes.func.isRequired,
  displayedDate: PropTypes.string.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  minDate: PropTypes.string.isRequired,
  maxDate: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onResult: PropTypes.func.isRequired,
};

/**
 * @augments {React.Component<TrendsProps,TrendsState>}
 */
class Trends extends React.Component {
  static propTypes = {
    canPrint: PropTypes.bool.isRequired,
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    dataUtil: PropTypes.object,
    timePrefs: PropTypes.object.isRequired,
    epochLocation: PropTypes.number.isRequired,
    msRange: PropTypes.number.isRequired,
    patient: PropTypes.object,
    tidelineData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    trendsState: PropTypes.object.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onDatetimeLocationChange: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    prefixURL: PropTypes.string,
    profileDialog: PropTypes.func,
    dialogRangeDatePicker: PropTypes.func.isRequired,
  };
  static defaultProps = {
    profileDialog: null,
  };

  constructor(props) {
    super(props);

    this.bgBounds = reshapeBgClassesToBgBounds(props.bgPrefs);
    this.chartType = "trends";

    this.log = bows("Trends");

    this.state = {
      /**
       * Used to prevent componentDidUpdate() trigger some changed, while we are updating
       * epochLocation, msRange & extentSize
       */
      updatingDates: false,
      atMostRecent: true,
      /**
       * Days to display, used in conjunction with datum.localDate
       * to choose the good data
       */
      localDates: [],
      currentCbgData: [],
    };

    this.chartRef = React.createRef();

    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleClickBack = this.handleClickBack.bind(this);
    this.handleClickDaily = this.handleClickDaily.bind(this);
    this.handleClickForward = this.handleClickForward.bind(this);
    this.handleClickMostRecent = this.handleClickMostRecent.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickTrends = this.handleClickTrends.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.toggleDay = this.toggleDay.bind(this);
    this.toggleWeekdays = this.toggleWeekdays.bind(this);
    this.toggleWeekends = this.toggleWeekends.bind(this);

    /** @type {{tidelineData: TidelineData}} */
    const { tidelineData } = props;
    // Min / max date for the date picker
    /** @type {Date} */
    this.startDate = new Date(tidelineData.endpoints[0]);
    /** @type {Date} */
    this.endDate = new Date(tidelineData.endpoints[1]);
    /** Max range in ms */
    this.maxRange = this.endDate.valueOf() - this.startDate.valueOf();
    this.log.debug({ startDate: this.startDate, endDate: this.endDate, maxRange: this.maxRange });
  }

  componentDidMount() {
    this.log.debug("Mounting...");

    this.setState({ updatingDates: true }, () => {
      this.clampEndpoints().catch((reason) => {
        this.log.error(reason);
      }).finally(() => {
        this.setState({ updatingDates: false }, () => {
          this.log.debug("Mounting finished");
        });
      });
    });
  }

  componentWillUnmount() {
    this.log("Unmounting...");
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.updatingDates) {
      return;
    }
    const extentSize = this.props.chartPrefs.trends.extentSize;
    const epochLocation = this.props.epochLocation;

    const locationChanged = epochLocation !== prevProps.epochLocation
      || extentSize !== prevProps.chartPrefs.trends.extentSize;

    const filtersChanged = !(
      _.isEqual(this.state.localDates, prevState.localDates)
      && _.isEqual(this.props.chartPrefs.trends.activeDays, prevProps.chartPrefs.trends.activeDays)
    );

    const loadingDone = !this.props.loading && prevProps.loading;
    const dateUpdated = !this.state.updatingDates && prevState.updatingDates;

    this.log.debug("componentDidUpdate", {
      locationChanged,
      filtersChanged,
      loadingDone,
      dateUpdated,
    });
    if (locationChanged || dateUpdated) {
      this.updateAtMostRecent();
      const localDates = this.getDisplayedlocalDates();
      if (!_.isEqual(localDates, this.state.localDates)) {
        this.log.debug("componentDidUpdate", { localDates });
        this.setState({ localDates });
      }
    }

    if (filtersChanged || loadingDone) {
      this.filterData();
    }
  }

  updateAtMostRecent() {
    const extentSize = this.props.chartPrefs.trends.extentSize;
    const epochLocation = this.props.epochLocation;
    const atMostRecent = epochLocation + Math.floor(extentSize * MS_IN_DAY / 2) + 1 > this.endDate.valueOf();
    if (this.state.atMostRecent !== atMostRecent) {
      this.setState({ atMostRecent });
    }
  }

  filterData() {
    const { tidelineData, chartPrefs } = this.props;
    const { localDates } = this.state;

    const activeDays = chartPrefs.trends.activeDays;
    const activeDaysArray = [];
    for (const weekDay of weekDays) {
      if (activeDays[weekDay]) {
        activeDaysArray.push(weekDay);
      }
    }

    const currentCbgData = tidelineData.grouped.cbg.filter((v) => (
      activeDaysArray.includes(v.isoWeekday) && localDates.includes(v.localDate)
    ));
    currentCbgData.sort((a, b) => a.epoch - b.epoch);
    this.log.debug("filterData", currentCbgData);
    this.setState({ currentCbgData });
  }

  /**
   * @returns An array of displayes dates (ex: `["2021-12-01", "2021-12-02"]`)
   */
  getDisplayedlocalDates() {
    const endPoints = this.getMomentEndpoints();
    const dates = [endPoints[0].format(ISO_DAY_FORMAT)];
    const endDate = endPoints[1].format(ISO_DAY_FORMAT);
    while (endPoints[0].add(1, "day").format(ISO_DAY_FORMAT) < endDate) {
      dates.push(endPoints[0].format(ISO_DAY_FORMAT));
    }
    return dates;
  }

  getChart() {
    if (this.chartRef.current) {
      return this.chartRef.current.getWrappedInstance();
    }
    return null;
  }

  getMaxExtendsSize() {
    return Math.ceil(this.maxRange / MS_IN_DAY);
  }

  updateExtendsSize(/** @type {number} */ newExtend, /** @type {(()=>void)|undefined} */ cb) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.extentSize = Math.min(newExtend, this.getMaxExtendsSize());
    this.log.info("updateExtendsSize", prefs.trends.extentSize);
    this.props.updateChartPrefs(prefs, cb);
  }

  /**
   * Verify if our initial endpoint are good
   * @returns {Promise<boolean>}
   */
  clampEndpoints() {
    const extentSize = this.props.chartPrefs.trends.extentSize;
    const epochLocation = this.props.epochLocation;

    // If we have less available days than the current extendSize
    const availDays = this.getMaxExtendsSize();
    if (availDays < extentSize) {
      const center = this.startDate.valueOf() + this.maxRange / 2;
      this.log.debug("Too few days available, update date and range to", { center, maxRange: this.maxRange });
      return this.props.onDatetimeLocationChange(center, this.maxRange).then(() => {
        return new Promise((resolve) => {
          this.updateExtendsSize(availDays, () => resolve(true));
        });
      });
    }

    const msRange = Math.max(extentSize, 1) * MS_IN_DAY;
    const msRangeDiv2 = Math.floor(msRange / 2);
    const end = epochLocation + msRangeDiv2;

    // If (currentLocation + range/2) is after the end date
    if (end > this.endDate.valueOf()) {
      const center = this.endDate.valueOf() - msRangeDiv2;
      this.log.debug("Current location too closed to the end", { center, maxRange: this.maxRange });
      return this.props.onDatetimeLocationChange(center, msRange).then(() => Promise.resolve(true));
    }

    // If (currentLocation - range/2) is before the start date
    const start = epochLocation - msRangeDiv2;
    if (start < this.startDate.valueOf()) {
      const center = this.startDate.valueOf() + msRangeDiv2;
      this.log.debug("Current location too closed to the start", { center, maxRange: this.maxRange });
      return this.props.onDatetimeLocationChange(center, msRange).then(() => Promise.resolve(true));
    }

    if (msRange !== this.props.msRange) {
      this.log.debug("Loading missing data");
      return this.props.onDatetimeLocationChange(epochLocation, msRange).then(() => Promise.resolve(true));
    }

    return Promise.resolve(false);
  }

  /**
   * @private
   * @returns {[moment.Moment, moment.Moment]}
   */
  getMomentEndpoints() {
    const { epochLocation, tidelineData } = this.props;
    /** @type {number} */
    const extentSize = this.props.chartPrefs.trends.extentSize;
    const msRange = Math.max(extentSize, 1) * MS_IN_DAY;
    const msRangeDiv2 = Math.floor(msRange / 2);
    const start = epochLocation - msRangeDiv2;
    const end = epochLocation + msRangeDiv2;
    const startDate = getMomentDayAt(start, tidelineData);
    const endDate = getMomentDayAt(end, tidelineData);
    return [startDate, endDate];
  }

  /**
   * @private
   * @returns {[string, string]} ISO string UTC date range
   */
  getEndpoints() {
    const [startDate, endDate] = this.getMomentEndpoints();
    return [startDate.toISOString(), endDate.toISOString()];
  }

  /**
   *
   * @param {moment.Moment} start
   * @param {moment.Moment} end
   */
  setEndPoints(start, end) {
    const newRange = end.valueOf() - start.valueOf();
    const newHalfRange = Math.floor(newRange / 2);
    const newEpochLocation = end.valueOf() - newHalfRange;
    return this.props.onDatetimeLocationChange(newEpochLocation, newRange);
  }

  getTitle() {
    const { loading, tidelineData, dialogRangeDatePicker } = this.props;

    const [startDate, endDate] = this.getMomentEndpoints();
    const mFormat = t("MMM D, YYYY");

    const onResult = (/** @type {string|undefined} */ start, /** @type {string|undefined} */ end) => {
      if (start && end) {
        const startTimezone = tidelineData.getTimezoneAt(start);
        const mStartDate = moment.tz(start, startTimezone);
        const endTimezone = tidelineData.getTimezoneAt(end);
        const mEndDate = moment.tz(end, endTimezone).add(1, "day");
        const extendSize = (mEndDate.valueOf() - mStartDate.valueOf()) / MS_IN_DAY;

        this.setState({ updatingDates: true }, () => {
          this.updateExtendsSize(extendSize, () => {
            this.setEndPoints(mStartDate, mEndDate);
            this.setState({ updatingDates: false });
          });
          this.props.trackMetric("data_visualization", "select_period", "date_picker", extendSize);
        });
      }
    };

    const startMinDate = moment.utc(this.startDate);
    const endMaxDate = moment.utc(this.endDate).subtract(1, "day");

    // End date is exclusive, substract 1s to display the last day, inclusive
    // it's what the user expect
    const displayEndDate = endDate.clone().subtract(1, "day");
    return (
      <TrendsDatePicker
        dialogRangeDatePicker={dialogRangeDatePicker}
        displayedDate={loading ? t("Loading...") : `${startDate.format(mFormat)} - ${displayEndDate.format(mFormat)}`}
        start={startDate.format(ISO_DAY_FORMAT)}
        end={displayEndDate.format(ISO_DAY_FORMAT)}
        minDate={getDayAt(startMinDate, tidelineData)}
        maxDate={getDayAt(endMaxDate, tidelineData)}
        disabled={loading}
        onResult={onResult}
      />
    );
  }

  handleWindowResize(/* windowSize */) {
    this.getChart()?.mountData();
  }

  handleClickBack(e) {
    if (e) {
      e.preventDefault();
    }

    const { epochLocation, tidelineData } = this.props;
    const extentSize = Math.round(this.props.chartPrefs.trends.extentSize);
    // Multiply by 1.5 => 1 = the extends + 0.5 since the current location is the
    // middle of the range.
    // Ex: if extentSize == 14, we need to shift 14+7 days back
    const epochShift = Math.max(Math.floor(extentSize * 1.5), 1) * MS_IN_DAY;

    // Use the start range date to do the shift
    if (epochLocation - epochShift < this.startDate.valueOf()) {
      const msRange = extentSize * MS_IN_DAY;
      this.props.onDatetimeLocationChange(this.startDate.valueOf() + msRange / 2, msRange);
    } else {
      const startEpoch = Math.max(epochLocation - epochShift, this.startDate.valueOf());

      const newStartDate = getMomentDayAt(startEpoch, tidelineData);
      const newEndDate = getMomentDayAt(newStartDate.clone().add(extentSize, "days"), tidelineData);

      this.setEndPoints(newStartDate, newEndDate);
    }
    this.props.trackMetric("data_visualization", "select_period", "backward");
  }

  handleClickForward(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    // For the comments see handleClickBack()
    const { epochLocation, tidelineData } = this.props;
    const extentSize = Math.round(this.props.chartPrefs.trends.extentSize);
    const epochShift = Math.max(Math.floor(extentSize * 1.5), 1) * MS_IN_DAY;
    if (epochLocation + epochShift > this.endDate.valueOf()) {
      this.handleClickMostRecent(null);
    } else {
      const endEpoch = epochLocation + epochShift;
      const newEndDate = getMomentDayAt(endEpoch, tidelineData).add(1, "day");
      const newStartDate = getMomentDayAt(newEndDate.clone().subtract(extentSize, "days"), tidelineData);
      this.setEndPoints(newStartDate, newEndDate);
    }
    this.props.trackMetric("data_visualization", "select_period", "forward");
  }

  handleClickMostRecent(event) {
    if (event) {
      event.preventDefault();
    }
    if (this.state.atMostRecent) {
      return;
    }
    const extentSize = Math.round(this.props.chartPrefs.trends.extentSize);
    const msRange = extentSize * MS_IN_DAY;
    this.props.onDatetimeLocationChange(this.endDate.valueOf() - Math.floor(msRange/2), msRange);
    if (event) {
      // If event is set, it's a click, so we can track this change
      this.props.trackMetric("data_visualization", "select_period", "most_recent");
    }
  }

  /**
   *
   * @param {Event} e
   * @param {number} extentSize In days
   */
  handleClickPresetWeeks(e, extentSize) {
    if (e) {
      e.preventDefault();
    }
    const { tidelineData, epochLocation, msRange } = this.props;
    let newExtentSize = extentSize;
    let newMsRange = newExtentSize * MS_IN_DAY;
    let endEpoch = epochLocation + Math.floor(msRange / 2);
    let startEpoch = endEpoch - newMsRange;
    if (startEpoch < this.startDate.valueOf()) {
      startEpoch = this.startDate.valueOf();
    }
    newMsRange = endEpoch - startEpoch;
    this.setState({ updatingDates: true }, () => {
      let epoch = endEpoch - Math.floor(newMsRange / 2);
      this.props.onDatetimeLocationChange(epoch, newMsRange).then(() => {
        // First load the data, we may have some changes in the timezone detection
        startEpoch = getMomentDayAt(startEpoch, tidelineData).valueOf();
        newMsRange = endEpoch - startEpoch;
        epoch = endEpoch - Math.floor(newMsRange / 2);
        this.props.onDatetimeLocationChange(epoch, newMsRange).then(() => {
          // Set the real value we want
          this.updateExtendsSize(newExtentSize, () => {
            this.setState({ updatingDates: false });
            this.props.trackMetric("data_visualization", "select_period", "preset", extentSize);
          });
        });
      });
    });
  }

  handleClickDaily(e) {
    const { epochLocation } = this.props;
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily(epochLocation);
  }

  handleClickSettings(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToSettings();
  }

  handleClickTrends(e) {
    if (e) {
      e.preventDefault();
    }
    // when you're on Trends view, clicking Trends does nothing
    return;
  }

  handleSelectDate(date) {
    this.props.onSwitchToDaily(date);
  }

  toggleDay(day) {
    return (e) => {
      e.stopPropagation();
      const prefs = _.cloneDeep(this.props.chartPrefs);
      prefs.trends.activeDays[day] = !prefs.trends.activeDays[day];
      this.props.updateChartPrefs(prefs);
    };
  }

  toggleWeekdays(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      monday: !allActive,
      tuesday: !allActive,
      wednesday: !allActive,
      thursday: !allActive,
      friday: !allActive,
      saturday: prefs.trends.activeDays.saturday,
      sunday: prefs.trends.activeDays.sunday,
    };
    this.props.updateChartPrefs(prefs);
  }

  toggleWeekends(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      monday: prefs.trends.activeDays.monday,
      tuesday: prefs.trends.activeDays.tuesday,
      wednesday: prefs.trends.activeDays.wednesday,
      thursday: prefs.trends.activeDays.thursday,
      friday: prefs.trends.activeDays.friday,
      saturday: !allActive,
      sunday: !allActive,
    };
    this.props.updateChartPrefs(prefs);
  }

  render() {
    const {
      chartPrefs,
      trendsState,
      loading,
      patient,
    } = this.props;

    const currentPatientInViewId = patient.userid;

    if (_.isEmpty(_.get(trendsState, currentPatientInViewId))) {
      return <Loader />;
    }

    const endpoints = this.getEndpoints();

    let rightFooter = null;
    // Get the component here, for the tests: Avoid having redux set
    const { RangeSelect } = vizComponents;
    rightFooter = (
      <RangeSelect displayFlags={trendsState[currentPatientInViewId].cbgFlags} currentPatientInViewId={currentPatientInViewId} />
    );

    return (
      <div id="tidelineMain" className="trends grid">
        {this.renderHeader()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            {this.renderSubNav()}
            <div className="patient-data-content">
              {loading && <Loader show overlay={true} /> }
              <div id="tidelineContainer" className="patient-data-chart-trends">
                {this.renderChart()}
              </div>
              {this.renderFocusedCbgDateTraceLabel()}
              {this.renderFocusedRangeLabels()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <div id="toggle-bg-replacement" style={{height: 36 }} />
              <Stats
                bgPrefs={this.props.bgPrefs}
                bgSource={this.props.dataUtil.bgSource}
                chartPrefs={chartPrefs}
                chartType={this.chartType}
                dataUtil={this.props.dataUtil}
                endpoints={endpoints}
                loading={loading}
              />
            </div>
          </div>
        </div>
        <Footer onClickRefresh={this.props.onClickRefresh}>
          {rightFooter}
        </Footer>
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }

  renderHeader() {
    const title = this.getTitle();
    return (
      <Header
        profileDialog={this.props.profileDialog}
        chartType={this.chartType}
        patient={this.props.patient}
        atMostRecent={this.state.atMostRecent}
        prefixURL={this.props.prefixURL}
        canPrint={this.props.canPrint}
        trackMetric={this.props.trackMetric}
        loading={this.props.loading}
        iconBack
        iconNext
        iconMostRecent
        onClickBack={this.handleClickBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handleClickForward}
        onClickOneDay={this.handleClickDaily}
        onClickSettings={this.handleClickSettings}
      >
        {title}
      </Header>
    );
  }

  renderSubNav() {
    const { msRange } = this.props;
    return (
      <SubNav
        trackMetric={this.props.trackMetric}
        activeDays={this.props.chartPrefs.trends.activeDays}
        extentSize={msRange / MS_IN_DAY}
        domainClickHandlers={{
          "1 week": (e) => this.handleClickPresetWeeks(e, 7),
          "2 weeks": (e) => this.handleClickPresetWeeks(e, 14),
          "4 weeks": (e) => this.handleClickPresetWeeks(e, 28),
          "3 months": (e) => this.handleClickPresetWeeks(e, 90),
        }}
        onClickDay={this.toggleDay}
        toggleWeekdays={this.toggleWeekdays}
        toggleWeekends={this.toggleWeekends} />
    );
  }

  renderChart() {
    const { localDates, currentCbgData } = this.state;
    return (
      <TrendsContainer
        currentCbgData={currentCbgData}
        days={localDates}
        activeDays={this.props.chartPrefs.trends.activeDays}
        bgPrefs={{
          bgBounds: this.bgBounds,
          bgUnits: this.props.bgPrefs.bgUnits,
        }}
        currentPatientInViewId={this.props.patient.userid}
        extentSize={this.props.chartPrefs.trends.extentSize}
        loading={this.props.loading}
        // data
        tidelineData={this.props.tidelineData}
        // handlers
        onSelectDate={this.handleSelectDate}
        ref={this.chartRef}
      />
    );
  }

  renderFocusedCbgDateTraceLabel() {
    const { patient, trendsState } = this.props;
    const focusedCbgDateTrace = _.get(trendsState, `${patient.userid}.focusedCbgDateTrace`);
    if (focusedCbgDateTrace) {
      return <CBGDateTraceLabel focusedDateTrace={focusedCbgDateTrace} />;
    }
    return null;
  }

  renderFocusedRangeLabels() {
    const { patient, trendsState } = this.props;
    const userTrendsState = _.get(trendsState, patient.userid);

    if (_.isEmpty(userTrendsState)) {
      return null;
    }
    return (
      <FocusedRangeLabels
        bgPrefs={this.props.bgPrefs}
        dataType={"cbg"}
        focusedKeys={userTrendsState.focusedCbgSliceKeys}
        focusedSlice={userTrendsState.focusedCbgSlice}
        timePrefs={this.props.timePrefs}
      />
    );
  }
}

export default Trends;
