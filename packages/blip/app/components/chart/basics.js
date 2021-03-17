import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

import { BasicsChart } from 'tideline';
import { components as vizComponents, utils as vizUtils } from 'tidepool-viz';

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
import Footer from './footer';
import { BG_DATA_TYPES } from '../../core/constants';

const Loader = vizComponents.Loader;
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;

class Basics extends React.Component {
  constructor(props) {
    super(props);
    this.chartType = 'basics';
    this.log = bows('Basics View');

    this.state = {
      atMostRecent: true,
      inTransition: false,
      title: this.getTitle(),
      endpoints: [],
    };
  }

  componentDidMount() {
    this.log.debug('Mounting...');
    const { tidelineData } = this.props;
    const dateRange = _.get(tidelineData, 'basicsData.dateRange', false);

    if (dateRange) {
      const endpoints = [dateRange[0], getLocalizedCeiling(dateRange[1], this.props.timePrefs).toISOString()];
      this.setState({ endpoints });
    }
  }

  componentWillUnmount() {
    this.log.debug('Unmounting...');
  }

  render() {
    const { endpoints, title, inTransition } = this.state;
    return (
      <div id='tidelineMain' className='basics'>
        <Header
          profileDialog={this.props.profileDialog}
          chartType={this.chartType}
          patient={this.props.patient}
          atMostRecent={true}
          inTransition={inTransition}
          title={title}
          canPrint={this.props.canPrint}
          trackMetric={this.props.trackMetric}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          onClickBasics={this.handleClickBasics}
          onClickOneDay={this.handleClickDaily}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.props.onSwitchToSettings}
          onClickPrint={this.props.onClickPrint} />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              {this.isMissingBasics() ? this.renderMissingBasicsMessage() : this.renderChart()}
            </div>
          </div>
          <div className='container-box-inner patient-data-sidebar'>
            <div className='patient-data-sidebar-inner'>
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
      <div id='tidelineContainer' className='patient-data-chart-growing'>
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

  renderMissingBasicsMessage() {
    const handleClickUpload = () => {
      this.props.trackMetric('Clicked Partial Data Upload, No Pump Data for Basics');
    };

    return (
      <Trans i18nKey="html.basics-no-uploaded-data" t={i18next.t.bind(i18next)}>
        <div className="patient-data-message patient-data-message-loading">
          <p>The Basics view shows a summary of your recent device activity, but it looks like you haven't uploaded device data yet.</p>
          <p>To see the Basics, <a href={this.props.uploadUrl} target="_blank" onClick={handleClickUpload}>upload</a> some device data.</p>
          <p>If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.</p>
        </div>
      </Trans>
    );
  }

  getTitle() {
    const { timePrefs } = this.props;
    if (this.isMissingBasics()) {
      return '';
    }
    const timezone = timePrefs.timezoneName;
    const basicsData = this.props.tidelineData.basicsData;
    const dtMask = i18next.t('MMM D, YYYY');

    return (
      sundial.formatInTimezone(basicsData.dateRange[0], timezone, dtMask) +
      ' - ' +
      sundial.formatInTimezone(basicsData.dateRange[1], timezone, dtMask)
    );
  }

  isMissingBasics() {
    const { tidelineData } = this.props;
    const basicsDataLength = _.get(tidelineData, 'basicsData.nData', 0);
    return basicsDataLength < 1;
  }

  // handlers
  toggleBgDataSource = (e, bgSource) => {
    if (e) {
      e.preventDefault();
    }

    const bgSourceLabel = bgSource === 'cbg' ? 'CGM' : 'BGM';
    this.props.trackMetric(`Basics Click to ${bgSourceLabel}`);

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
  uploadUrl: PropTypes.string.isRequired,
  profileDialog: PropTypes.func.isRequired,
};

export default Basics;
