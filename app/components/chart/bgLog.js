
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
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import bows from 'bows';
import ReactDOM from 'react-dom';
import sundial from 'sundial';
import moment from 'moment';
import WindowSizeListener from 'react-window-size-listener';
import { withTranslation, Trans } from 'react-i18next';
import { Box, Flex } from 'theme-ui';

import Stats from './stats';
import DeviceSelection from './deviceSelection';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const chartBgLogFactory = tidelineBlip.twoweek;
import Button from '../elements/Button';
import Checkbox from '../elements/Checkbox';
import { colors } from '../../themes/baseTheme';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { ClipboardButton, Loader } = vizComponents;
const { bgLogText } = vizUtils.text;
const { getLocalizedCeiling } = vizUtils.datetime;

import Header from './header';

class BgLogChart extends Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patient: PropTypes.object,
    showingValues: PropTypes.bool,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onMostRecent: PropTypes.func.isRequired,
    onClickValues: PropTypes.func.isRequired,
    onSelectSMBG: PropTypes.func.isRequired,
    onTransition: PropTypes.func.isRequired,
    isClinicianAccount: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = ['bgClasses', 'bgUnits', 'timePrefs'];
    this.log = bows('BgLog Chart');
  }

  componentDidMount = () => {
    this.mount();
  };

  mount = (props = this.props) => {
    this.mountChart(ReactDOM.findDOMNode(this), props);
    this.initializeChart(props.data, props.initialDatetimeLocation, props.showingValues);
  };

  componentWillUnmount = () => {
    this.unmountChart();
  };

  mountChart = (node, props = {}) => {
    this.log('Mounting...');
    this.chart = chartBgLogFactory(node, props);
    this.chart.node = node;
    this.bindEvents();
  };

  unmountChart = () => {
    this.log('Unmounting...');
    if (this.chart) this.chart.destroy();
  };

  remountChart = (updates = {}) => {
    const chartProps = { ...this.props, ...updates };
    this.log('Remounting...');
    this.unmountChart();
    this.mount(chartProps);
    this.chart.emitter.emit('inTransition', false);
  }

  rerenderChart = (updates = {}) => {
    const chartProps = { ...this.props, ...updates };
    this.log('Rerendering...');
    this.chart.clear();
    this.bindEvents();
    this.chart.load(chartProps.data, chartProps.initialDatetimeLocation);
    if (chartProps.showingValues) {
      this.showValues();
    } else {
      this.hideValues();
    }
  };

  bindEvents = () => {
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('selectSMBG', this.props.onSelectSMBG);
  };

  initializeChart = (data, datetimeLocation, showingValues) => {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    if (datetimeLocation) {
      this.chart.load(data, datetimeLocation);
    }
    else {
      this.chart.load(data);
    }

    if (this.props.isClinicianAccount || showingValues) {
      this.chart.showValues();
    }
  };

  render = () => {
    return (
      <div id="tidelineContainer" className="patient-data-chart"></div>
    );
  };

  // handlers
  handleDatetimeLocationChange = datetimeLocationEndpoints => {
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  }

  getCurrentDay = timePrefs => {
    return this.chart.getCurrentDay(timePrefs).toISOString();
  };

  goToMostRecent = () => {
    this.chart.clear();
    this.bindEvents();
    this.chart.load(this.props.data);
  };

  hideValues = () => {
    this.chart.hideValues();
  };

  panBack = () => {
    this.chart.panBack();
  };

  panForward = () => {
    this.chart.panForward();
  };

  showValues = () => {
    this.chart.showValues();
  };
}

class BgLog extends Component {
  static propTypes = {
    chartPrefs: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    isClinicianAccount: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    mostRecentDatetimeLocation: PropTypes.string,
    onClickNoDataRefresh: PropTypes.func.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onUpdateChartDateRange: PropTypes.func.isRequired,
    queryDataCount: PropTypes.number.isRequired,
    stats: PropTypes.array.isRequired,
    trackMetric: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    removeGeneratedPDFS: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartType = 'bgLog';
    this.log = bows('BgLog View');
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      atMostRecent: false,
      inTransition: false,
      showingValues: this.props.isClinicianAccount,
      title: '',
    };
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    const loadingJustCompleted = this.props.loading && !nextProps.loading;
    const newDataRecieved = this.props.queryDataCount !== nextProps.queryDataCount;
    const bgRangeUpdated = this.props.data?.bgPrefs?.useDefaultRange !== nextProps.data?.bgPrefs?.useDefaultRange;

    if (this.refs.chart) {
      if (loadingJustCompleted || newDataRecieved) this.refs.chart.rerenderChart({ data: nextProps.data });

      if (nextProps.data?.bgPrefs?.bgClasses && bgRangeUpdated) {
        this.refs.chart.remountChart({ bgClasses: nextProps.data.bgPrefs.bgClasses });
      }
    }
  };

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  render = () => {
    const { t } = this.props;
    const dataQueryComplete = _.get(this.props, 'data.query.chartType') === 'bgLog';
    let renderedContent;

    const checkboxStyles = {
      themeProps: {
        mb: 0,
        sx: { color: 'stat.text' },
        backgroundColor: 'inherit',
      },
      sx: {
        backgroundColor: 'white',
        boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
        color: colors.grays[2],
      },
    };

    if (dataQueryComplete) {
      renderedContent = this.isMissingSMBG() ? this.renderMissingSMBGMessage() : this.renderChart();
    }

    return (
      <Box variant="containers.patientData" className="bgLog">
        {this.isMissingSMBG() ? this.renderMissingSMBGHeader() : this.renderHeader()}

        <Box variant="containers.patientDataInner">
          <Box className="patient-data-content" variant="containers.patientDataContent">
            <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />
            {renderedContent}

            <Flex
              mt={4}
              pl="50px"
              pr="30px"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                className="btn-refresh"
                variant="secondaryCondensed"
                onClick={this.props.onClickRefresh}
              >
                {t('Refresh')}
              </Button>

              <Flex
                variant="inputs.checkboxGroup.horizontal"
                sx={{ alignItems: 'center' }}
                bg="lightestGrey"
                px={3}
                py={2}
              >
                <Checkbox
                  label={t('Values')}
                  name="valuesCheckbox"
                  checked={this.state.showingValues}
                  onChange={this.toggleValues}
                  {...checkboxStyles}
                />
              </Flex>
            </Flex>
          </Box>

          <Box className="patient-data-sidebar" variant="containers.patientDataSidebar">
            <Box mb={2}>
              <ClipboardButton
                buttonTitle={t('For email or notes')}
                onSuccess={this.handleCopyBgLogClicked}
                getText={bgLogText.bind(this, this.props.patient, this.props.data, this.props.stats)}
              />
            </Box>
            <Stats
              bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
              chartPrefs={this.props.chartPrefs}
              chartType={this.chartType}
              stats={this.props.stats}
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
          </Box>
        </Box>
        <WindowSizeListener onResize={this.handleWindowResize} />
      </Box>
    );
  };

  renderChart = () => {
    return (
      <BgLogChart
        bgClasses={_.get(this.props, 'data.bgPrefs', {}).bgClasses}
        bgUnits={_.get(this.props, 'data.bgPrefs', {}).bgUnits}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        data={this.props.data}
        showingValues={this.state.showingValues}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onMostRecent={this.handleMostRecent}
        onClickValues={this.toggleValues}
        onSelectSMBG={this.handleSelectSMBG}
        onTransition={this.handleInTransition}
        ref="chart"
        isClinicianAccount={this.props.isClinicianAccount} />
    );
  };

  renderHeader = () => {
    return (
      <Header
        chartType={this.chartType}
        patient={this.props.patient}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={this.state.title}
        iconBack={'icon-back-down'}
        iconNext={'icon-next-up'}
        iconMostRecent={'icon-most-recent-up'}
        onClickBack={this.handlePanBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handlePanForward}
        onClickOneDay={this.handleClickOneDay}
        onClickSettings={this.props.onSwitchToSettings}
        onClickBgLog={this.handleClickBgLog}
        onClickPrint={this.handleClickPrint}
      ref="header" />
    );
  };

  renderMissingSMBGHeader = () => {
    return (
      <Header
        chartType={this.chartType}
        atMostRecent={this.state.atMostRecent}
        inTransition={this.state.inTransition}
        title={''}
        onClickOneDay={this.handleClickOneDay}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickSettings={this.props.onSwitchToSettings}
        onClickBgLog={this.handleClickBgLog}
        onClickPrint={this.handleClickPrint}
      ref="header" />
    );
  };

  renderMissingSMBGMessage = () => {
    const self = this;
    const handleClickUpload = () => {
      self.props.trackMetric('Clicked Partial Data Upload, No SMBG');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.bg-log-no-uploaded-data">
        <p>The BG Log view shows a history of your finger stick BG data, but it looks like you haven't uploaded finger stick data yet.</p>
        <p>To see your data in the BG Log view, <a
            href={this.props.uploadUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleClickUpload}>upload</a> your pump or BG meter.</p>
        <p>
          If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );
  };

  formatDate = datetime => {
    const { t } = this.props;
    // even when timezoneAware, labels should be generated as if UTC; just trust me (JEB)
    return sundial.formatInTimezone(datetime, 'UTC', t('MMM D, YYYY'));
  };

  getTitle = datetimeLocationEndpoints => {
    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(datetimeLocationEndpoints[1]);
  };

  handleWindowResize = () => {
    this.refs.chart && this.refs.chart.remountChart();
  };

  isMissingSMBG = () => _.isEmpty(_.get(this.props, 'data.metaData.latestDatumByType.smbg'));

  // handlers
  handleClickTrends = e => {
    if(e) {
      e.preventDefault();
    }
    let datetime;
    if (this.refs.chart) {
      datetime = this.refs.chart.getCurrentDay(this.props.timePrefs);
    }
    this.props.onSwitchToTrends(datetime);
  };

  handleClickMostRecent = e => {
    if (e) {
      e.preventDefault();
    }

    const chartDays = _.get(this.refs, 'chart.chart.days', []);

    if (_.includes(chartDays, this.props.mostRecentDatetimeLocation.slice(0,10))) {
      this.refs.chart.goToMostRecent();
    } else {
      this.props.onUpdateChartDateRange(this.props.mostRecentDatetimeLocation, true)
    }
  };

  handleClickOneDay = e => {
    if (e) {
      e.preventDefault();
    }
    let datetime;
    if (this.refs.chart) {
      datetime = this.refs.chart.getCurrentDay(this.props.timePrefs);
    }
    this.props.onSwitchToDaily(datetime);
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
    return;
  };

  handleDatetimeLocationChange = (datetimeLocationEndpoints) => {
    this.setState({
      title: this.getTitle(datetimeLocationEndpoints),
    });

    // Update the chart date range in the data component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const dateCeiling = getLocalizedCeiling(datetimeLocationEndpoints[1], _.get(this.props, 'data.timePrefs', {}));

    const datetimeLocation = moment.utc(dateCeiling.valueOf())
      .subtract(12, 'hours')
      .toISOString();

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocation);

    this.setState({ debouncedDateRangeUpdate });
  };

  handleInTransition = inTransition => {
    this.setState({
      inTransition: inTransition
    });
  };

  handleMostRecent = atMostRecent => {
    this.setState({
      atMostRecent: atMostRecent
    });
  };

  handlePanBack = e => {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panBack();
  };

  handlePanForward = e => {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.panForward();
  };

  handleSelectSMBG = datetime => {
    this.props.onSwitchToDaily(datetime);
  };

  toggleValues = e => {
    if (this.state.showingValues) {
      this.props.trackMetric('Clicked Show Values Off');
      this.refs.chart.hideValues();
    }
    else {
      this.props.trackMetric('Clicked Show Values On');
      this.refs.chart.showValues();
    }
    this.setState({showingValues: !this.state.showingValues});
  };

  handleCopyBgLogClicked = () => {
    this.props.trackMetric('Clicked Copy Settings', { source: 'BG Log' });
  };
}

export default withTranslation()(BgLog);
