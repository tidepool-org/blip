import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';
import { translate, Trans } from 'react-i18next';
import { Flex } from 'rebass/styled-components';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const BasicsChart = tidelineBlip.basics;

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { ClipboardButton, Loader } = vizComponents;
const { basicsText } = vizUtils.text;

import { isMissingBasicsData } from '../../core/data';

import Stats from './stats';
import Button from '../elements/Button';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
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
    stats: PropTypes.array.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateBasicsSettings: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    removeGeneratedPDFS: PropTypes.func.isRequired,
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
    inTransition: false,
    title: this.getTitle(),
  });

  UNSAFE_componentWillReceiveProps = nextProps => {
    const newEndpointsRecieved = _.get(this.props, 'data.data.current.endpoints.range') !== _.get(nextProps, 'data.data.current.endpoints.range');
    if (newEndpointsRecieved) {
      this.setState({ title: this.getTitle(nextProps, false) });
    }
  };

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
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickBasics={this.handleClickBasics}
          onClickChartDates={this.props.onClickChartDates}
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

              {!this.isMissingBasics() && (
                <Flex mt={4} mb={5} pl="10px">
                  <Button className="btn-refresh" variant="secondary" onClick={this.props.onClickRefresh}>
                    {this.props.t('Refresh')}
                  </Button>
                </Flex>
              )}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <div>
                <Flex mb={2} justifyContent="space-between" alignItems="center">
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
                </Flex>
                <Stats
                  bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
                  chartPrefs={this.props.chartPrefs}
                  chartType={this.chartType}
                  stats={statsToRender}
                  trackMetric={this.props.trackMetric}
                />
                <DeviceSelection
                  chartPrefs={this.props.chartPrefs}
                  chartType={this.chartType}
                  devices={_.get(this.props, 'data.metaData.devices', [])}
                  removeGeneratedPDFS={this.props.removeGeneratedPDFS}
                  trackMetric={this.props.trackMetric}
                  updateChartPrefs={this.props.updateChartPrefs}
                />
              </div>
            </div>
          </div>
        </div>
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
          excludeDaysWithoutBolus={_.get(this.props, 'chartPrefs.basics.stats.excludeDaysWithoutBolus')}
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
            rel="noreferrer noopener"
            onClick={handleClickUpload}>upload</a> some device data.</p>
        <p>If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );
  };

  getTitle = (props = this.props, checkMissing = true) => {
    const { t } = props;
    if (checkMissing && this.isMissingBasics(props)) {
      return '';
    }

    const timePrefs = _.get(props, 'data.timePrefs', {});
    let timezone;
    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }

    const dtMask = t('MMM D, YYYY');
    return sundial.formatInTimezone(_.get(props, 'data.data.current.endpoints.range', [])[0], timezone, dtMask) +
      ' - ' + sundial.formatInTimezone(_.get(props, 'data.data.current.endpoints.range', [])[1] - 1, timezone, dtMask);
  }

  isMissingBasics = (props = this.props) => {
    const aggregationsByDate = _.get(props, 'data.data.aggregationsByDate', {});
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
    this.props.updateChartPrefs(prefs, false, true, true);
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
