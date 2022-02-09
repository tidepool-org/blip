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
import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import bows from "bows";
import moment from "moment-timezone";
import WindowSizeListener from "react-window-size-listener";
import i18next from "i18next";

import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";

import { chartDailyFactory, MS_IN_DAY, MS_IN_HOUR } from "tideline";
import { components as vizComponents } from "tidepool-viz";

import { BG_DATA_TYPES } from "../../core/constants";
import Stats from "./stats";
import BgSourceToggle from "./bgSourceToggle";
import Header from "./header";
import Footer from "./footer";

/**
 * @typedef { import("tideline").TidelineData } TidelineData
 * @typedef { import("../../index").DatePicker } DatePicker
 * @typedef { import("./index").DailyDatePickerProps } DailyDatePickerProps
*/

const Loader = vizComponents.Loader;
const BolusTooltip = vizComponents.BolusTooltip;
const SMBGTooltip = vizComponents.SMBGTooltip;
const CBGTooltip = vizComponents.CBGTooltip;
const FoodTooltip = vizComponents.FoodTooltip;
const ReservoirTooltip = vizComponents.ReservoirTooltip;
const PhysicalTooltip = vizComponents.PhysicalTooltip;
const ParameterTooltip = vizComponents.ParameterTooltip;
const ConfidentialTooltip = vizComponents.ConfidentialTooltip;
const WarmUpTooltip = vizComponents.WarmUpTooltip;

/**
 * @param {DailyDatePickerProps} props
 */
function DailyDatePicker(props) {
  const {
    dialogDatePicker: DialogDatePicker,
    date,
    displayedDate,
    inTransition,
    loading,
    startDate,
    endDate,
    onSelectedDateChange,
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  const handleResult = (date) => {
    setIsOpen(false);
    onSelectedDateChange(date);
  };

  return (
    <React.Fragment>
      <TextField
        id="daily-chart-title-date"
        onClick={() => setIsOpen(true)}
        onKeyPress={() => setIsOpen(true)}
        variant="standard"
        value={displayedDate}
        disabled={inTransition || loading || isOpen}
        InputProps={loading ? undefined : {
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <CalendarTodayIcon className="calendar-nav-icon" />
            </InputAdornment>
          ),
        }}
      />
      <DialogDatePicker
        date={date}
        minDate={startDate}
        maxDate={endDate}
        onResult={handleResult}
        showToolbar
        isOpen={isOpen}
      />
    </React.Fragment>
  );
}
DailyDatePicker.propTypes = {
  dialogDatePicker: PropTypes.func.isRequired,
  date: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]).isRequired,
  displayedDate: PropTypes.string.isRequired,
  startDate: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]).isRequired,
  endDate: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]).isRequired,
  inTransition: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onSelectedDateChange: PropTypes.func.isRequired,
};

class DailyChart extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    epochLocation: PropTypes.number.isRequired,
    msRange: PropTypes.number.isRequired,
    patient: PropTypes.object,
    tidelineData: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    // message handlers
    onCreateMessage: PropTypes.func.isRequired,
    onShowMessageThread: PropTypes.func.isRequired,
    // other handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onTransition: PropTypes.func.isRequired,
    onBolusHover: PropTypes.func.isRequired,
    onSMBGHover: PropTypes.func.isRequired,
    onCBGHover: PropTypes.func.isRequired,
    onCarbHover: PropTypes.func.isRequired,
    onReservoirHover: PropTypes.func.isRequired,
    onPhysicalHover: PropTypes.func.isRequired,
    onParameterHover: PropTypes.func.isRequired,
    onWarmUpHover: PropTypes.func.isRequired,
    onConfidentialHover: PropTypes.func.isRequired,
    onTooltipOut: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = [
      "bgClasses",
      "bgUnits",
      "timePrefs",
      "onBolusHover",
      "onSMBGHover",
      "onCBGHover",
      "onCarbHover",
      "onReservoirHover",
      "onPhysicalHover",
      "onParameterHover",
      "onConfidentialHover",
      "onWarmUpHover",
      "onTooltipOut",
      "trackMetric",
    ];

    this.log = bows("DailyChart");
    this.state = {
      /** @type {function | null} */
      chart: null,
      windowHeight: 0,
      windowWidth: 0,
      /** Avoid recreate the chart on loading: This leads to a crash */
      needRecreate: false,
    };
    /** @type {React.RefObject} */
    this.refNode = React.createRef();
  }

  componentDidUpdate() {
    // Prevent the scroll drag while loading
    const { loading } = this.props;
    const { chart, needRecreate } = this.state;
    if (chart !== null) {
      chart.loadingInProgress = loading;
      if (needRecreate && !loading && !chart.isInTransition()) {
        this.setState({ needRecreate: false }, () => {
          this.reCreateChart();
        });
      }
    }
  }

  componentWillUnmount() {
    this.unmountChart();
  }

  mountChart(cb = _.noop) {
    if (this.state.chart === null) {
      const { tidelineData, epochLocation } = this.props;
      this.log.debug("Mounting...");
      const chart = chartDailyFactory(this.refNode.current, tidelineData, _.pick(this.props, this.chartOpts));
      this.setState({ chart }, () => {
        chart.setAtDate(epochLocation);
        this.bindEvents();
        cb();
      });
    } else {
      cb();
    }
  }

  unmountChart(cb = _.noop) {
    const { chart } = this.state;
    if (chart !== null) {
      this.log("Unmounting...");
      this.unbindEvents();
      chart.destroy();
      this.setState({ chart: null }, cb);
    } else {
      cb();
    }
  }

  bindEvents() {
    const { chart } = this.state;
    chart.emitter.on("createMessage", this.props.onCreateMessage);
    chart.emitter.on("inTransition", this.props.onTransition);
    chart.emitter.on("messageThread", this.props.onShowMessageThread);
    chart.emitter.on("navigated", this.props.onDatetimeLocationChange);
  }

  unbindEvents() {
    const { chart } = this.state;
    chart.emitter.off("createMessage", this.props.onCreateMessage);
    chart.emitter.off("inTransition", this.props.onTransition);
    chart.emitter.off("messageThread", this.props.onShowMessageThread);
    chart.emitter.off("navigated", this.props.onDatetimeLocationChange);
  }

  render() {
    return (
      <React.Fragment>
        <div id="tidelineContainer" className="patient-data-chart" ref={this.refNode} />
        <WindowSizeListener onResize={this.handleWindowResize} />
      </React.Fragment>
    );
  }

  handleWindowResize = ({ windowHeight: height, windowWidth: width }) => {
    const { loading } = this.props;
    const { windowHeight, windowWidth, chart } = this.state;
    this.log.debug("handleWindowResize", { windowHeight, windowWidth }, "=>", { height, width });
    if (windowHeight !== height || width !== windowWidth) {
      const needRecreate = loading || chart?.isInTransition() === true;
      this.setState({ windowHeight: height, windowWidth: width, needRecreate }, () => {
        if (!needRecreate) {
          this.reCreateChart();
        } else {
          this.log.info("Delaying chart re-creation: loading or transition in progress");
        }
      });
    }
  };

  reCreateChart() {
    const { chart } = this.state;
    this.log.info(chart === null ? "Creating chart..." : "Recreating chart...");
    this.unmountChart(this.mountChart.bind(this));
  }

  rerenderChartData() {
    const { chart } = this.state;
    if (chart !== null) {
      this.log.info("Rerendering chart data...");
      chart.renderPoolsData(true);
    }
  }

  goToDate(/** @type {Date} */ date) {
    this.state.chart.panToDate(date);
  }

  goToMostRecent() {
    this.state.chart.setAtDate(null, true);
  }

  panBack() {
    this.state.chart.panBack();
  }

  panForward() {
    this.state.chart.panForward();
  }

  createMessage(message) {
    return this.state.chart.createMessage(message);
  }

  editMessage(message) {
    return this.state.chart.editMessage(message);
  }
}

/**
 * @typedef {{tidelineData: TidelineData; epochLocation: number; bgPrefs: any; msRange: number; loading: boolean; trackMetric: ()=>void; datePicker?: DatePicker}} DailyProps
 */

/** @augments React.Component<DailyProps> */
class Daily extends React.Component {
  static propTypes = {
    patient: PropTypes.object.isRequired,
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object.isRequired,
    dataUtil: PropTypes.object,
    timePrefs: PropTypes.object.isRequired,
    epochLocation: PropTypes.number.isRequired,
    msRange: PropTypes.number.isRequired,
    tidelineData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    canPrint: PropTypes.bool.isRequired,
    // refresh handler
    onClickRefresh: PropTypes.func.isRequired,
    // message handlers
    onCreateMessage: PropTypes.func.isRequired,
    onShowMessageThread: PropTypes.func.isRequired,
    // navigation handlers
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onDatetimeLocationChange: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    profileDialog: PropTypes.func,
    dialogDatePicker: PropTypes.func.isRequired,
    prefixURL: PropTypes.string,
  };
  static defaultProps = {
    profileDialog: null,
  };

  constructor(props) {
    super(props);

    /** @type {React.RefObject<DailyChart>} */
    this.chartRef = React.createRef();
    this.chartType = "daily";
    this.log = bows("DailyView");
    this.state = {
      atMostRecent: this.isAtMostRecent(),
      inTransition: false,
      title: this.getTitle(props.epochLocation),
      tooltip: null,
    };

    /** @type {{tidelineData: TidelineData}} */
    const { tidelineData } = props;
    const { startDate, endDate } = tidelineData.getLocaleTimeEndpoints();
    /** @type {Date} */
    this.startDate = startDate;
    /** @type {Date} */
    this.endDate = endDate;
  }

  componentDidUpdate(prevProps) {
    const { epochLocation, loading } = this.props;
    const { epochLocation: prevEpochLocation } = prevProps;
    const { title } = this.state;

    if (loading && !prevProps.loading) {
      this.setState({ title: i18next.t("Loading...") });
    } else if (epochLocation !== prevEpochLocation || (!loading && prevProps.loading)) {
      const nowTitle = this.getTitle(epochLocation);
      if (title !== nowTitle) {
        this.setState({ title: nowTitle, atMostRecent: this.isAtMostRecent() });
      }
    }
  }

  render() {
    const { tidelineData, epochLocation, msRange, trackMetric, loading, dialogDatePicker } = this.props;
    const { inTransition, atMostRecent, tooltip, title } = this.state;
    const { timePrefs } = tidelineData.opts;
    const endpoints = this.getEndpoints();

    const onSelectedDateChange = loading || inTransition ? _.noop : (/** @type {string|undefined} */ date) => {
      if (typeof date === "string" && this.chartRef.current !== null) {
        const timezone = tidelineData.getTimezoneAt(date);
        const mDate = moment.tz(date, timezone).add(MS_IN_DAY / 2, "milliseconds");
        this.log.debug("DatePicker", date, timezone, mDate.toISOString());
        this.chartRef.current.goToDate(mDate.toDate());
      }
    };

    return (
      <div id="tidelineMain" className="daily">
        <Header
          profileDialog={this.props.profileDialog}
          chartType={this.chartType}
          patient={this.props.patient}
          inTransition={inTransition}
          atMostRecent={atMostRecent}
          loading={loading}
          prefixURL={this.props.prefixURL}
          iconBack
          iconNext
          iconMostRecent
          canPrint={this.props.canPrint}
          trackMetric={trackMetric}
          onClickBack={this.handlePanBack}
          onClickBasics={this.props.onSwitchToBasics}
          onClickTrends={this.props.onSwitchToTrends}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickSettings={this.props.onSwitchToSettings}
          onClickPrint={this.props.onClickPrint}
        >
          <DailyDatePicker
            dialogDatePicker={dialogDatePicker}
            displayedDate={title}
            date={epochLocation}
            startDate={this.startDate}
            endDate={this.endDate}
            inTransition={inTransition}
            loading={loading}
            onSelectedDateChange={onSelectedDateChange}
          />
        </Header>
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={loading} overlay={true} />
              <DailyChart
                loading={loading}
                bgClasses={this.props.bgPrefs.bgClasses}
                bgUnits={this.props.bgPrefs.bgUnits}
                epochLocation={epochLocation}
                msRange={msRange}
                tidelineData={tidelineData}
                timePrefs={timePrefs}
                // message handlers
                onCreateMessage={this.props.onCreateMessage}
                onShowMessageThread={this.props.onShowMessageThread}
                // other handlers
                onDatetimeLocationChange={this.handleDatetimeLocationChange}
                onTransition={this.handleInTransition}
                onBolusHover={this.handleBolusHover}
                onSMBGHover={this.handleSMBGHover}
                onCBGHover={this.handleCBGHover}
                onCarbHover={this.handleCarbHover}
                onReservoirHover={this.handleReservoirHover}
                onPhysicalHover={this.handlePhysicalHover}
                onParameterHover={this.handleParameterHover}
                onWarmUpHover={this.handleWarmUpHover}
                onConfidentialHover={this.handleConfidentialHover}
                onTooltipOut={this.handleTooltipOut}
                trackMetric={trackMetric}
                ref={this.chartRef}
              />
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <BgSourceToggle
                bgSource={this.props.dataUtil.bgSource}
                bgSources={this.props.dataUtil.bgSources}
                chartPrefs={this.props.chartPrefs}
                chartType={this.chartType}
                onClickBgSourceToggle={this.toggleBgDataSource}
              />
              <Stats
                bgPrefs={this.props.bgPrefs}
                bgSource={this.props.dataUtil.bgSource}
                chartPrefs={this.props.chartPrefs}
                chartType={this.chartType}
                dataUtil={this.props.dataUtil}
                endpoints={endpoints}
                loading={loading}
              />
            </div>
          </div>
        </div>
        <Footer
          chartType={this.chartType}
          onClickRefresh={this.props.onClickRefresh} />
        {tooltip}
      </div>
    );
  }

  /**
   * @param {number} epoch ms since epoch
   * @returns true if we are at the most recent date
   * @private
   */
  isAtMostRecent(epoch = -1) {
    const { tidelineData, epochLocation, msRange } = this.props;
    if (epoch < 0) {
      epoch = epochLocation;
    }
    // Takes the last endpoint, substract half a day, because "epoch" is the center
    // of the day, substract 1ms to be sure ">" work.
    const endDate = moment.utc(tidelineData.endpoints[1]).valueOf() - 1 - msRange / 2;
    return epoch > endDate;
  }

  getEndpoints() {
    const { epochLocation, msRange } = this.props;
    const start = moment.utc(epochLocation - msRange / 2).toISOString();
    const end = moment.utc(epochLocation + msRange / 2).toISOString();
    return [start, end];
  }

  /**
   * @param {number} datetime A date to display
   * @returns {string}
   */
  getTitle(datetime) {
    /** @type {{tidelineData: TidelineData}} */
    const { tidelineData } = this.props;
    return moment.tz(datetime, tidelineData.getTimezoneAt(datetime)).format(i18next.t("ddd, MMM D, YYYY"));
  }

  // handlers
  toggleBgDataSource = (e, bgSource) => {
    if (e) {
      e.preventDefault();
    }

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.daily.bgSource = bgSource;
    this.props.updateChartPrefs(prefs);
  };

  handleClickOneDay = (e) => {
    if (e) {
      e.preventDefault();
    }
    return false;
  };

  handlePanBack = (e) => {
    const { loading } = this.props;
    if (e) {
      e.preventDefault();
    }
    if (!loading && this.chartRef.current !== null) {
      this.chartRef.current.panBack();
    }
  };

  handlePanForward = (e) => {
    const { loading } = this.props;
    if (e) {
      e.preventDefault();
    }
    if (!loading && this.chartRef.current !== null) {
      this.chartRef.current.panForward();
    }
  };

  handleClickMostRecent = (e) => {
    const { loading } = this.props;
    if (e) {
      e.preventDefault();
    }
    if (!loading && this.chartRef.current !== null) {
      this.chartRef.current.goToMostRecent();
    }
  };

  /**
   * @param {number} epoch Date displayed -> center of the daily view. In ms since epoch.
   */
  handleDatetimeLocationChange = (epoch) => {
    const { loading } = this.props;
    if (!loading) {
      this.setState({ title: this.getTitle(epoch), atMostRecent: this.isAtMostRecent(epoch) });
      this.props.onDatetimeLocationChange(epoch, MS_IN_DAY).then((dataLoaded) => {
        if (dataLoaded && this.chartRef.current !== null) {
          // New data available, re-render the chart so they can be displayed
          // to the user
          this.chartRef.current.rerenderChartData();
        }
      }).catch((reason) => {
        this.log.error("handleDatetimeLocationChange", reason);
      });
    }
  };

  handleInTransition = inTransition => {
    this.setState({ inTransition });
  };

  updateDatumHoverForTooltip(datum) {
    /** @type {{ epochLocation: number, bgPrefs: {}, tidelineData: TidelineData }} */
    const { epochLocation, bgPrefs } = this.props;
    const rect = datum.rect;
    // range here is -12 to 12
    const hoursOffset = (datum.data.epoch - epochLocation) / MS_IN_HOUR;
    datum.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      datum.side = "left";
      datum.left = rect.left;
    } else {
      datum.side = "right";
      datum.left = rect.left + rect.width;
    }
    datum.bgPrefs = bgPrefs;
    datum.timePrefs = { timezoneAware: true, timezoneName: datum.timezone };
    return datum;
  }

  handleTooltipOut = () => this.setState({ tooltip: null }); // Tips for debug use: _.noop;

  handleBolusHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <BolusTooltip
        bolus={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleSMBGHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <SMBGTooltip
        smbg={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleCBGHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <CBGTooltip
        cbg={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleCarbHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <FoodTooltip
        food={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleReservoirHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <ReservoirTooltip
        reservoir={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handlePhysicalHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <PhysicalTooltip
        physicalActivity={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleParameterHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <ParameterTooltip
        parameter={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleWarmUpHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <WarmUpTooltip
        datum={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  handleConfidentialHover = (datum) => {
    this.updateDatumHoverForTooltip(datum);
    const tooltip = (
      <ConfidentialTooltip
        confidential={datum.data}
        position={{
          top: datum.top,
          left: datum.left
        }}
        side={datum.side}
        bgPrefs={datum.bgPrefs}
        timePrefs={datum.timePrefs}
      />);
    this.setState({ tooltip });
  };

  // Messages:

  /**
   * Update the daily view by adding the new message
   * @param {object} message A nurseshark processed message
   * @return {Promise<boolean>} true if the message was added
   */
  createMessage = (message) => {
    return this.chartRef.current.createMessage(message);
  };

  /**
   * Update the daily view message
   * @param {object} message A nurseshark processed message
   * @return {boolean} true if the message was correctly updated
   */
  editMessage = (message) => {
    return this.chartRef.current.editMessage(message);
  };
}

export { DailyChart };
export default Daily;
