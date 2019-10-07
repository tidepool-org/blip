
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
import React, { Component } from 'react';
import _ from 'lodash';
import bows from 'bows';
import ReactDOM from 'react-dom';
import sundial from 'sundial';
import moment from 'moment';
import WindowSizeListener from 'react-window-size-listener';
import { translate, Trans } from 'react-i18next';

import Stats from './stats';
import { BG_DATA_TYPES } from '../../core/constants';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const chartBgLogFactory = tidelineBlip.twoweek;

import { components as vizComponents } from '@tidepool/viz';
const Loader = vizComponents.Loader;

import Header from './header';
import Footer from './footer';

class BgLogChart extends Component {
  static propTypes = {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onClickValues: React.PropTypes.func.isRequired,
    onSelectSMBG: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    isClinicAccount: React.PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = ['bgClasses', 'bgUnits', 'timePrefs'];
    this.log = bows('BgLog Chart');
  }

  mount = () => {
    this.mountChart(ReactDOM.findDOMNode(this));
    this.initializeChart(this.props.patientData, this.props.initialDatetimeLocation);
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
    this.chart.destroy();
  };

  rerenderChart = () => {
    this.log('Rerendering...');
    this.unmountChart();
    this.mount();
    this.chart.emitter.emit('inTransition', false);
  };

  bindEvents = () => {
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('selectSMBG', this.props.onSelectSMBG);
  };

  initializeChart = (data, datetimeLocation) => {
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
    if (this.props.isClinicAccount){
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
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1]
    });
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  }

  getCurrentDay = timePrefs => {
    return this.chart.getCurrentDay(timePrefs).toISOString();
  };

  goToMostRecent = () => {
    this.chart.clear();
    this.bindEvents();
    this.chart.load(this.props.patientData);
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
    bgPrefs: React.PropTypes.object.isRequired,
    bgSource: React.PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: React.PropTypes.object.isRequired,
    dataUtil: React.PropTypes.object,
    initialDatetimeLocation: React.PropTypes.string,
    isClinicAccount: React.PropTypes.bool.isRequired,
    onClickNoDataRefresh: React.PropTypes.func.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onClickPrint: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToBgLog: React.PropTypes.func.isRequired,
    onUpdateChartDateRange: React.PropTypes.func.isRequired,
    patientData: React.PropTypes.object.isRequired,
    pdf: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
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
      endpoints: [],
      inTransition: false,
      showingValues: this.props.isClinicAccount,
      title: ''
    };
  };

  componentDidMount = () => {
    if (this.refs.chart) {
      this.refs.chart.mount();
    }
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.loading && !nextProps.loading) {
      this.refs.chart.rerenderChart();
    }
  };

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  render = () => {
    return (
      <div id="tidelineMain" className="bgLog">
        {this.isMissingSMBG() ? this.renderMissingSMBGHeader() : this.renderHeader()}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              {this.isMissingSMBG() ? this.renderMissingSMBGMessage() : this.renderChart()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <Stats
                bgPrefs={this.props.bgPrefs}
                bgSource={this.props.dataUtil.bgSource}
                chartPrefs={this.props.chartPrefs}
                chartType={this.chartType}
                dataUtil={this.props.dataUtil}
                endpoints={this.state.endpoints}
              />
            </div>
          </div>
        </div>
        <Footer
         chartType={this.isMissingSMBG() ? 'no-data' : this.chartType}
         onClickValues={this.toggleValues}
         onClickRefresh={this.props.onClickRefresh}
         showingValues={this.state.showingValues}
        ref="footer" />
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  };

  renderChart = () => {
    return (
      <BgLogChart
        bgClasses={this.props.bgPrefs.bgClasses}
        bgUnits={this.props.bgPrefs.bgUnits}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        patientData={this.props.patientData}
        timePrefs={this.props.timePrefs}
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
    this.refs.chart && this.refs.chart.rerenderChart();
  };

  isMissingSMBG = () => {
    const data = this.props.patientData;
    if (_.isEmpty(data.grouped.smbg)) {
      return true;
    }
    return false;
  };

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
    this.setState({showingValues: false});
    this.refs.chart.goToMostRecent();
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

  handleDatetimeLocationChange = (datetimeLocationEndpoints, chart = this.refs.chart) => {
    const { timezoneAware, timezoneName } = this.props.timePrefs;

    const startMoment = moment
      .utc(datetimeLocationEndpoints[0])
      .startOf('day');

    const endMoment = moment
      .utc(datetimeLocationEndpoints[1])
      .add(1, 'day')
      .startOf('day');

    let startTimezoneOffset = 0;
    let endTimezoneOffset = 0;

    if (timezoneAware) {
      startTimezoneOffset = sundial.getOffsetFromZone(startMoment.toISOString(), timezoneName);
      endTimezoneOffset = sundial.getOffsetFromZone(endMoment.toISOString(), timezoneName);
    }

    const endpoints = [
      startMoment.subtract(startTimezoneOffset, 'minutes').toISOString(),
      endMoment.subtract(endTimezoneOffset, 'minutes').toISOString(),
    ];

    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints),
      endpoints,
    });

    this.props.updateDatetimeLocation(chart.getCurrentDay());

    // Update the chart date range in the patientData component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(endpoints, this.refs.chart);

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
