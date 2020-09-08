
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
import { translate, Trans } from 'react-i18next';

import Stats from './stats';
import DeviceSelection from './deviceSelection';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const chartBgLogFactory = tidelineBlip.twoweek;

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const Loader = vizComponents.Loader;
const { getLocalizedCeiling } = vizUtils.datetime;

import Header from './header';
import Footer from './footer';

class BgLogChart extends Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patient: PropTypes.object,
    // handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onMostRecent: PropTypes.func.isRequired,
    onClickValues: PropTypes.func.isRequired,
    onSelectSMBG: PropTypes.func.isRequired,
    onTransition: PropTypes.func.isRequired,
    isClinicAccount: PropTypes.bool.isRequired,
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
    this.mountChart(ReactDOM.findDOMNode(this));
    this.initializeChart(props.data, props.initialDatetimeLocation, props.showingValues);
  };

  componentWillUnmount = () => {
    this.unmountChart();
  };

  mountChart = (node, chartOpts) => {
    this.log('Mounting...');
    chartOpts = chartOpts || {};
    this.chart = chartBgLogFactory(node, _.assign(chartOpts, _.pick(this.props, this.chartOpts)));
    this.chart.node = node;
    this.bindEvents();
  };

  unmountChart = () => {
    this.log('Unmounting...');
    if (this.chart) this.chart.destroy();
  };

  remountChart = (props = this.props) => {
    this.log('Remounting...');
    this.unmountChart();
    this.mount(props);
    this.chart.emitter.emit('inTransition', false);
  }

  rerenderChart = (props = this.props) => {
    this.log('Rerendering...');
    this.chart.clear();
    this.bindEvents();
    this.chart.load(props.data, props.initialDatetimeLocation);
    if (props.showingValues) {
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

    if (this.props.isClinicAccount || showingValues) {
      this.chart.showValues();
    }
  };

  render = () => {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="patient-data-chart"></div>
    );
    /* jshint ignore:end */
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
    isClinicAccount: PropTypes.bool.isRequired,
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
    pdf: PropTypes.object.isRequired,
    queryDataCount: PropTypes.number.isRequired,
    stats: PropTypes.array.isRequired,
    trackMetric: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
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
      availableDevices: this.getRenderedDevices(this.props),
      inTransition: false,
      showingValues: this.props.isClinicAccount,
      title: '',
    };
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    const loadingJustCompleted = this.props.loading && !nextProps.loading;
    const newDataRecieved = this.props.queryDataCount !== nextProps.queryDataCount;
    if (this.refs.chart && (loadingJustCompleted || newDataRecieved)) {
      this.refs.chart.rerenderChart(_.assign(
        {},
        nextProps,
        { showingValues: this.state.showingValues },
      ));
    }
    if (newDataRecieved) this.setState({
      availableDevices: _.union(
        this.getRenderedDevices(nextProps),
        this.state.availableDevices,
      ),
    });
  };

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  getRenderedDevices = (props) => _.uniq(_.map(_.get(props, 'data.data.combined', []), d => d.deviceId));

  render = () => {
    const dataQueryComplete = _.get(this.props, 'data.query.chartType') === 'bgLog';
    let renderedContent;

    if (dataQueryComplete) {
      renderedContent = this.isMissingSMBG() ? this.renderMissingSMBGMessage() : this.renderChart();
    }

    return (
      <div id="tidelineMain" className="bgLog">
        {this.isMissingSMBG() ? this.renderMissingSMBGHeader() : this.renderHeader()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />
              {renderedContent}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <Stats
                bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
                chartPrefs={this.props.chartPrefs}
                stats={this.props.stats}
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
        <Footer
          chartType={this.isMissingSMBG() ? 'no-data' : this.chartType}
          onClickValues={this.toggleValues}
          onClickRefresh={this.props.onClickRefresh}
          showingValues={this.state.showingValues}
          ref="footer"
        />
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  };

  renderChart = () => {
    return (
      <BgLogChart
        bgClasses={_.get(this.props, 'data.bgPrefs', {}).bgClasses}
        bgUnits={_.get(this.props, 'data.bgPrefs', {}).bgUnits}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        data={this.props.data}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onMostRecent={this.handleMostRecent}
        onClickValues={this.toggleValues}
        onSelectSMBG={this.handleSelectSMBG}
        onTransition={this.handleInTransition}
        ref="chart"
        isClinicAccount={this.props.isClinicAccount} />
    );
  };

  renderHeader = () => {
    return (
      <Header
        chartType={this.chartType}
        patient={this.props.patient}
        printReady={!!this.props.pdf.url}
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
        printReady={!!this.props.pdf.url}
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
    this.refs.chart && this.refs.chart.remountChart(_.assign(
      {},
      this.props,
      { showingValues: this.state.showingValues },
    ));
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
}

export default translate()(BgLog);
