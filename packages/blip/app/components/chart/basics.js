import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
import { components as vizComponents, utils as vizUtils } from 'tidepool-viz';

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
import Footer from './footer';
import { BG_DATA_TYPES } from '../../core/constants';

const BasicsChart = tidelineBlip.basics;
const Loader = vizComponents.Loader;
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;
const t = i18next.t.bind(i18next);

class Basics extends React.Component {
  constructor(props) {
    super(props);
    this.chartType = 'basics';
    this.log = bows('Basics View');

    this.state = {
      atMostRecent: true,
      inTransition: false,
      title: this.getTitle(),
    };
  }

  componentDidMount() {
    const dateRange = _.get(this.props, 'patientData.basicsData.dateRange');

    if (dateRange) {
      const endpoints = [dateRange[0], getLocalizedCeiling(dateRange[1], this.props.timePrefs).toISOString()];

      this.props.onUpdateChartDateRange(endpoints);
    }
  }

  render() {
    return (
      <div id='tidelineMain' className='basics'>
        <Header
          profileDialog={this.props.profileDialog}
          chartType={this.chartType}
          patient={this.props.patient}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          canPrint={this.props.canPrint}
          trackMetric={this.props.trackMetric}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          onClickBasics={this.handleClickBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.props.onSwitchToSettings}
          onClickBgLog={this.handleClickBgLog}
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
                  endpoints={this.props.endpoints}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer chartType={this.chartType} onClickRefresh={this.props.onClickRefresh} />
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
          patientData={this.props.patientData}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          timePrefs={this.props.timePrefs}
          updateBasicsData={this.props.updateBasicsData}
          updateBasicsSettings={this.props.updateBasicsSettings}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  }

  renderMissingBasicsMessage() {
    const handleClickUpload = () => {
      this.props.trackMetric('Clicked Partial Data Upload, No Pump Data for Basics');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.basics-no-uploaded-data" t={t}>
        <p>The Basics view shows a summary of your recent device activity, but it looks like you haven't uploaded device data yet.</p>
        <p>To see the Basics, <a href={this.props.uploadUrl} target="_blank" onClick={handleClickUpload}>upload</a> some device data.</p>
        <p>If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );
  }

  getTitle() {
    const { timePrefs } = this.props;
    if (this.isMissingBasics()) {
      return '';
    }
    const timezone = timePrefs.timezoneName;
    const basicsData = this.props.patientData.basicsData;
    const dtMask = t('MMM D, YYYY');

    return (
      sundial.formatInTimezone(basicsData.dateRange[0], timezone, dtMask) +
      ' - ' +
      sundial.formatInTimezone(basicsData.dateRange[1], timezone, dtMask)
    );
  };

  isMissingBasics() {
    const basicsDataLength = _.get(this.props, 'patientData.basicsData.nData', 0);
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
    const dateRange = _.get(this.props, 'patientData.basicsData.dateRange');
    this.props.onSwitchToTrends(dateRange[1]);
  };

  handleClickOneDay = (e) => {
    if (e) {
      e.preventDefault();
    }
    const dateRange = _.get(this.props, 'patientData.basicsData.dateRange');
    this.props.onSwitchToDaily(dateRange[1]);
  };

  handleClickBgLog = (e) => {
    if (e) {
      e.preventDefault();
    }
    const dateRange = _.get(this.props, 'patientData.basicsData.dateRange');
    this.props.onSwitchToBgLog(dateRange[1]);
  };

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
  endpoints: PropTypes.arrayOf(PropTypes.string),
  timePrefs: PropTypes.object.isRequired,
  patient: PropTypes.object,
  patientData: PropTypes.object.isRequired,
  permsOfLoggedInUser: PropTypes.object.isRequired,
  canPrint: PropTypes.bool.isRequired,
  onClickRefresh: PropTypes.func.isRequired,
  onClickNoDataRefresh: PropTypes.func.isRequired,
  onSwitchToBasics: PropTypes.func.isRequired,
  onSwitchToDaily: PropTypes.func.isRequired,
  onSwitchToTrends: PropTypes.func.isRequired,
  onClickPrint: PropTypes.func.isRequired,
  onSwitchToSettings: PropTypes.func.isRequired,
  onSwitchToBgLog: PropTypes.func,
  onUpdateChartDateRange: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  updateBasicsData: PropTypes.func.isRequired,
  updateBasicsSettings: PropTypes.func.isRequired,
  updateChartPrefs: PropTypes.func.isRequired,
  uploadUrl: PropTypes.string.isRequired,
  profileDialog: PropTypes.func.isRequired,
};

export default Basics;
