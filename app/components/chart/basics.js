import React, { Component } from 'react';
import _ from 'lodash';
import bows from 'bows';
import moment from 'moment';
import sundial from 'sundial';
import { translate, Trans } from 'react-i18next';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const BasicsChart = tidelineBlip.basics;

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { ClipboardButton, Loader } = vizComponents;
const { findBasicsStart, getTimezoneFromTimePrefs, getLocalizedCeiling } = vizUtils.datetime;
const { basicsText } = vizUtils.text;

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
import Footer from './footer';
import { BG_DATA_TYPES } from '../../core/constants';

class Basics extends Component {
  static propTypes = {
    bgPrefs: React.PropTypes.object.isRequired,
    bgSources: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    endpoints: React.PropTypes.array.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    pdf: React.PropTypes.object.isRequired,
    permsOfLoggedInUser: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onClickNoDataRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onClickPrint: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToBgLog: React.PropTypes.func.isRequired,
    onUpdateChartDateRange: React.PropTypes.func.isRequired,
    stats: React.PropTypes.array.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateBasicsData: React.PropTypes.func.isRequired,
    updateBasicsSettings: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
  };

  static displayName = 'Basics';

  constructor(props) {
    super(props);
    this.chartType = 'basics';
    this.log = bows('Basics View');

    this.log('constructor running')

    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    atMostRecent: true,
    inTransition: false,
    title: this.getTitle(),
  });

  render = () => {
    const { t, bgSources } = this.props;

    return (
      <div id="tidelineMain" className="basics">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          printReady={!!this.props.pdf.url}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickBasics={this.handleClickBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.props.onSwitchToSettings}
          onClickBgLog={this.handleClickBgLog}
          onClickPrint={this.handleClickPrint}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              {this.isMissingBasics() ? this.renderMissingBasicsMessage() : this.renderChart()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <div>
                <ClipboardButton // TODO: replace this.props.patientData.basicsData appropriately
                  buttonTitle={t('For email or notes')}
                  onSuccess={this.handleCopyBasicsClicked}
                  getText={basicsText.bind(this, this.props.patient, this.props.stats, this.props.endpoints, this.props.bgPrefs, this.props.timePrefs, this.props.patientData.basicsData)}
                />
                <BgSourceToggle
                  bgSources={bgSources}
                  chartPrefs={this.props.chartPrefs}
                  chartType={this.chartType}
                  onClickBgSourceToggle={this.toggleBgDataSource}
                />
                <Stats
                  bgPrefs={this.props.bgPrefs}
                  chartPrefs={this.props.chartPrefs}
                  stats={this.props.stats}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
        ref="footer" />
      </div>
      );
  };

  renderChart = () => {
    return (
      <div id="tidelineContainer" className="patient-data-chart-growing">
        <BasicsChart
          bgClasses={this.props.bgPrefs.bgClasses}
          bgUnits={this.props.bgPrefs.bgUnits}
          onSelectDay={this.handleSelectDay}
          patient={this.props.patient}
          patientData={this.props.data}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          timePrefs={this.props.timePrefs}
          updateBasicsData={this.props.updateBasicsData}
          updateBasicsSettings={this.props.updateBasicsSettings}
          ref="chart"
          trackMetric={this.props.trackMetric} />
      </div>
    );
  };

  renderMissingBasicsMessage = () => {
    const self = this;
    const { t } = this.props;
    const handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Pump Data for Basics');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.basics-no-uploaded-data">
        <p>The Basics view shows a summary of your recent device activity, but it looks like you haven't uploaded device data yet.</p>
        <p>To see the Basics, <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a> some device data.</p>
        <p>If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );
  };

  getTitle = () => {
    const { t } = this.props;
    if (this.isMissingBasics()) {
      return '';
    }

    const timePrefs = this.props.timePrefs
    let timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }

    const dtMask = t('MMM D, YYYY');
    return sundial.formatInTimezone(this.props.endpoints[0], timezone, dtMask) +
      ' - ' + sundial.formatInTimezone(this.props.endpoints[1], timezone, dtMask);
  }

  isMissingBasics = () => {
    const {
      basals = {},
      boluses = {},
      fingersticks = {},
      siteChanges = {},
    } = this.props.aggregations;

    const {
      calibration = {},
      smbg = {},
    } = fingersticks;

    const basicsData = [basals, boluses, siteChanges, calibration, smbg];
    return !_.some(basicsData, d => _.keys(d.byDate).length > 0);
  };

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

  // handleAverageDailyDoseInputChange = (inputValue, suffixValue) => {
  //   const prefs = _.cloneDeep(this.props.chartPrefs);
  //   prefs.basics.averageDailyDose = {
  //     inputValue,
  //     suffixValue,
  //   };
  //   this.props.updateChartPrefs(prefs);
  // };

  // handleStatsChange = stats => { // TODO: Likely find another way of exporting stats data
  //   window.downloadStatData = () => {
  //     console.save({
  //       bgPrefs: this.props.bgPrefs,
  //       data: this.props.patientData.basicsData,
  //       endpoints: this.props.endpoints,
  //       stats: stats,
  //       timePrefs: this.props.timePrefs,
  //     }, 'stats-basics.json');
  //   };
  // };

  handleClickBasics = e => {
    if (e) {
      e.preventDefault();
    }
    return;
  };

  handleClickTrends = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToTrends(this.props.endpoints[1]);
  };

  handleClickOneDay = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily(this.props.endpoints[1]);
  };

  handleClickPrint = e => {
    if (e) {
      e.preventDefault();
    }

    this.props.onClickPrint(this.props.pdf);
  };

  handleClickBgLog = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToBgLog(this.props.endpoints[1]);
  };

  handleSelectDay = (date, title) => {
    this.props.onSwitchToDaily(date, title);
  };

  handleCopyBasicsClicked = () => {
    this.props.trackMetric('Clicked Copy Settings', { source: 'Basics' });
  };
};

export default translate()(Basics);
