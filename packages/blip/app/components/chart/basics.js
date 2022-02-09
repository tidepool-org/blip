import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import bows from "bows";
import sundial from "sundial";
import i18next from "i18next";
import cx from "classnames";

import { BasicsChart } from "tideline";
import { components as vizComponents, utils as vizUtils } from "tidepool-viz";

import Stats from "./stats";
import BgSourceToggle from "./bgSourceToggle";
import Header from "./header";
import Footer from "./footer";
import { BG_DATA_TYPES } from "../../core/constants";

const Loader = vizComponents.Loader;
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;

class Basics extends React.Component {
  constructor(props) {
    super(props);
    this.chartType = "basics";
    this.log = bows("Basics View");

    this.state = {
      atMostRecent: true,
      title: this.getTitle(),
      endpoints: [],
    };
  }

  componentDidMount() {
    this.log.debug("Mounting...");
    const { tidelineData } = this.props;
    const dateRange = _.get(tidelineData, "basicsData.dateRange", false);

    if (dateRange) {
      const endpoints = [dateRange[0], getLocalizedCeiling(dateRange[1], this.props.timePrefs).toISOString()];
      this.setState({ endpoints });
    }
  }

  componentWillUnmount() {
    this.log.debug("Unmounting...");
  }

  render() {
    const { loading } = this.props;
    const { endpoints, title } = this.state;
    return (
      <div id="tidelineMain" className="basics">
        <Header
          profileDialog={this.props.profileDialog}
          chartType={this.chartType}
          patient={this.props.patient}
          atMostRecent={true}
          prefixURL={this.props.prefixURL}
          canPrint={this.props.canPrint}
          trackMetric={this.props.trackMetric}
          onClickBasics={this.handleClickBasics}
          onClickOneDay={this.handleClickDaily}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.props.onSwitchToSettings}
          onClickPrint={this.props.onClickPrint}
        >
          {title}
        </Header>
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={loading} overlay={true} />
              {this.renderChart()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <div>
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
        </div>
        <Footer onClickRefresh={this.props.onClickRefresh} />
      </div>
    );
  }

  renderChart() {
    return (
      <div id="tidelineContainer" className="patient-data-chart-growing">
        <BasicsChart
          bgClasses={this.props.bgPrefs.bgClasses}
          bgUnits={this.props.bgPrefs.bgUnits}
          onSelectDay={this.handleSelectDay}
          patient={this.props.patient}
          tidelineData={this.props.tidelineData}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          timePrefs={this.props.timePrefs}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  }

  getTitle() {
    const { timePrefs, loading } = this.props;
    if (this.isMissingBasics()) {
      return "";
    }
    const timezone = timePrefs.timezoneName;
    const basicsData = this.props.tidelineData.basicsData;
    const dtMask = i18next.t("MMM D, YYYY");

    const fromDate = sundial.formatInTimezone(basicsData.dateRange[0], timezone, dtMask);
    const toDate = sundial.formatInTimezone(basicsData.dateRange[1], timezone, dtMask);
    return (
      <span
        id="basics-chart-title-date"
        className={cx("patient-data-subnav-text", "patient-data-subnav-dates-basics", { "patient-data-subnav-disabled": loading })}
      >
        {`${fromDate} - ${toDate}`}
      </span>
    );
  }

  isMissingBasics() {
    const { tidelineData } = this.props;
    const basicsDataLength = _.get(tidelineData, "basicsData.nData", 0);
    return basicsDataLength < 1;
  }

  // handlers
  toggleBgDataSource = (e, bgSource) => {
    if (e) {
      e.preventDefault();
    }

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.basics.bgSource = bgSource;
    this.props.updateChartPrefs(prefs);
  };

  handleClickBasics = (e) => {
    if (e) {
      e.preventDefault();
    }
    return;
  };

  handleClickTrends = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToTrends();
  };

  handleClickDaily = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  };

  /**
   *
   * @param {moment.Moment} date The date clicked in the calendar
   * @param {string} title The calendar title (basals, boluses, siteChanges)
   */
  handleSelectDay = (date, title) => {
    this.props.onSwitchToDaily(date, title);
  };
}

Basics.propTypes = {
  loading: PropTypes.bool.isRequired,
  bgPrefs: PropTypes.object.isRequired,
  bgSource: PropTypes.oneOf(BG_DATA_TYPES),
  chartPrefs: PropTypes.object.isRequired,
  dataUtil: PropTypes.object,
  timePrefs: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  tidelineData: PropTypes.object.isRequired,
  permsOfLoggedInUser: PropTypes.object.isRequired,
  canPrint: PropTypes.bool.isRequired,
  onClickRefresh: PropTypes.func.isRequired,
  onClickNoDataRefresh: PropTypes.func.isRequired,
  onSwitchToBasics: PropTypes.func.isRequired,
  onSwitchToDaily: PropTypes.func.isRequired,
  onSwitchToTrends: PropTypes.func.isRequired,
  onClickPrint: PropTypes.func.isRequired,
  onSwitchToSettings: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  updateChartPrefs: PropTypes.func.isRequired,
  prefixURL: PropTypes.string,
  profileDialog: PropTypes.func,
};
Basics.defaultProps = {
  profileDialog: null,
};

export default Basics;
