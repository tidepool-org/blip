import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';
import { translate, Trans } from 'react-i18next';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const BasicsChart = tidelineBlip.basics;

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { ClipboardButton, Loader } = vizComponents;
const { basicsText } = vizUtils.text;

import { isMissingBasicsData } from '../../core/data';

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
import Footer from './footer';
import DeviceSelection from './deviceSelection';

class Basics extends Component {
  static propTypes = {
    aggregations: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onClickNoDataRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onUpdateChartDateRange: PropTypes.func.isRequired,
    patient: PropTypes.object.isRequired,
    pdf: PropTypes.object.isRequired,
    stats: PropTypes.array.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateBasicsSettings: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
  };

  static displayName = 'Basics';

  constructor(props) {
    super(props);
    this.chartType = 'basics';
    this.log = bows('Basics View');

    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    atMostRecent: true,
    availableDevices: this.getRenderedDevices(this.props),
    inTransition: false,
    title: this.getTitle(),
  });

  getRenderedDevices = (props) => _.uniq(_.map(_.get(props, 'data.data.combined', []), d => d.deviceId));

  render = () => {
    const { t } = this.props;
    const dataQueryComplete = _.get(this.props, 'data.query.chartType') === 'basics';
    const statsToRender = this.props.stats.filter((stat) => stat.id !== 'bgExtents');
    let renderedContent;
    if (dataQueryComplete) {
      renderedContent = this.isMissingBasics() ? this.renderMissingBasicsMessage() : this.renderChart();
    }

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
              <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />
              {renderedContent}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <div>
                <ClipboardButton
                  buttonTitle={t('For email or notes')}
                  onSuccess={this.handleCopyBasicsClicked}
                  getText={basicsText.bind(this, this.props.patient, this.props.data, this.props.stats, this.props.aggregations)}
                />
                <BgSourceToggle
                  bgSources={_.get(this.props, 'data.metaData.bgSources', {})}
                  chartPrefs={this.props.chartPrefs}
                  chartType={this.chartType}
                  onClickBgSourceToggle={this.toggleBgDataSource}
                />
                <Stats
                  bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
                  chartPrefs={this.props.chartPrefs}
                  stats={statsToRender}
                />
                <DeviceSelection
                  chartPrefs={this.props.chartPrefs}
                  chartType={this.chartType}
                  updateChartPrefs={this.props.updateChartPrefs}
                  devices={_.filter(
                    _.get(this.props, 'data.metaData.devices', []),
                    device => _.includes(this.state.availableDevices, device.id)
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer
          chartType={this.chartType}
          onClickRefresh={this.props.onClickRefresh}
          ref="footer"
        />
      </div>
      );
  };

  renderChart = () => {
    return (
      <div id="tidelineContainer" className="patient-data-chart-growing">
        <BasicsChart
          aggregations={this.props.aggregations}
          bgClasses={_.get(this.props, 'data.bgPrefs', {}).bgClasses}
          bgUnits={_.get(this.props, 'data.bgPrefs', {}).bgUnits}
          data={this.props.data}
          onSelectDay={this.handleSelectDay}
          patient={this.props.patient}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          timePrefs={_.get(this.props, 'data.timePrefs', {})}
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

    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    let timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }

    const dtMask = t('MMM D, YYYY');
    return sundial.formatInTimezone(_.get(this.props, 'data.data.current.endpoints.range', [])[0], timezone, dtMask) +
      ' - ' + sundial.formatInTimezone(_.get(this.props, 'data.data.current.endpoints.range', [])[1] - 1, timezone, dtMask);
  }

  isMissingBasics = () => {
    const aggregationsByDate = _.get(this.props, 'data.data.aggregationsByDate', {});
    return isMissingBasicsData(aggregationsByDate);
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
    this.props.updateChartPrefs(prefs, false, true);
  };

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
    this.props.onSwitchToTrends(_.get(this.props, 'data.data.current.endpoints.range', [])[1]);
  };

  handleClickOneDay = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily(_.get(this.props, 'data.data.current.endpoints.range', [])[1]);
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
    this.props.onSwitchToBgLog(_.get(this.props, 'data.data.current.endpoints.range', [])[1]);
  };

  handleSelectDay = (date, title) => {
    this.props.onSwitchToDaily(date, title);
  };

  handleCopyBasicsClicked = () => {
    this.props.trackMetric('Clicked Copy Settings', { source: 'Basics' });
  };
}

export default translate()(Basics);
