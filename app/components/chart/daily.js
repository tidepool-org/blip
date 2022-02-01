
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
import WindowSizeListener from 'react-window-size-listener';
import { translate } from 'react-i18next';

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import DeviceSelection from './deviceSelection';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const chartDailyFactory = tidelineBlip.oneday;

import { components as vizComponents } from '@tidepool/viz';
const Loader = vizComponents.Loader;
const BolusTooltip = vizComponents.BolusTooltip;
const SMBGTooltip = vizComponents.SMBGTooltip;
const CBGTooltip = vizComponents.CBGTooltip;
const FoodTooltip = vizComponents.FoodTooltip;
const PumpSettingsOverrideTooltip = vizComponents.PumpSettingsOverrideTooltip;

import Header from './header';
import Footer from './footer';

const DailyChart = translate()(class DailyChart extends Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    bolusRatio: PropTypes.number,
    data: PropTypes.object.isRequired,
    dynamicCarbs: PropTypes.bool,
    initialDatetimeLocation: PropTypes.string,
    patient: PropTypes.object,
    timePrefs: PropTypes.object.isRequired,
    // message handlers
    onCreateMessage: PropTypes.func.isRequired,
    onShowMessageThread: PropTypes.func.isRequired,
    // other handlers
    onDatetimeLocationChange: PropTypes.func.isRequired,
    onMostRecent: PropTypes.func.isRequired,
    onTransition: PropTypes.func.isRequired,
    onBolusHover: PropTypes.func.isRequired,
    onBolusOut: PropTypes.func.isRequired,
    onSMBGHover: PropTypes.func.isRequired,
    onSMBGOut: PropTypes.func.isRequired,
    onCBGHover: PropTypes.func.isRequired,
    onCBGOut: PropTypes.func.isRequired,
    onCarbHover: PropTypes.func.isRequired,
    onCarbOut: PropTypes.func.isRequired,
    onPumpSettingsOverrideHover: PropTypes.func.isRequired,
    onPumpSettingsOverrideOut: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = [
      'automatedBasal',
      'automatedBolus',
      'bgClasses',
      'bgUnits',
      'bolusRatio',
      'carbUnits',
      'dynamicCarbs',
      'timePrefs',
      'onBolusHover',
      'onBolusOut',
      'onSMBGHover',
      'onSMBGOut',
      'onCBGHover',
      'onCBGOut',
      'onCarbHover',
      'onCarbOut',
      'onPumpSettingsOverrideHover',
      'onPumpSettingsOverrideOut',
    ];

    this.log = bows('Daily Chart');
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      initialDatetimeLocation: this.props.initialDatetimeLocation,
      datetimeLocation: null
    };
  };

  componentDidMount = () => {
    this.mountChart();
    this.initializeChart(this.props, this.props.initialDatetimeLocation);
  };

  componentWillUnmount = () => {
    this.unmountChart();
  };

  mountChart = (props = this.props) => {
    this.log('Mounting...');
    this.chart = chartDailyFactory(ReactDOM.findDOMNode(this), _.pick(props, this.chartOpts))
      .setupPools();
    this.bindEvents();
  };

  unmountChart = () => {
    this.log('Unmounting...');
    this.chart.destroy();
  };

  bindEvents = () => {
    this.chart.emitter.on('createMessage', this.props.onCreateMessage);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('messageThread', this.props.onShowMessageThread);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
  };

  initializeChart = (props = this.props, datetime) => {
    const { t } = props;
    this.log('Initializing...');
    if (_.isEmpty(_.get(props.data, 'data.combined', []))) {
      throw new Error(t('Cannot create new chart with no data'));
    }

    this.chart.load(props.data);
    if (datetime) {
      this.chart.locate(datetime);
    }
    else if (this.state.datetimeLocation !== null) {
      this.chart.locate(this.state.datetimeLocation);
    }
    else {
      this.chart.locate();
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
  };

  rerenderChart = (updates = {}) => {
    const chartProps = { ...this.props, ...updates };
    this.log('Rerendering...');
    this.unmountChart();
    this.mountChart(chartProps);
    this.initializeChart(chartProps);
    this.chart.emitter.emit('inTransition', false);
  };

  getCurrentDay = () => {
    return this.chart.getCurrentDay().toISOString();
  };

  goToMostRecent = () => {
    this.chart.setAtDate(null, true);
  };

  panBack = () => {
    this.chart.panBack();
  };

  panForward = () => {
    this.chart.panForward();
  };

  // methods for messages
  closeMessage = () => {
    return this.chart.closeMessage();
  };

  createMessage = message => {
    return this.chart.createMessage(message);
  };

  editMessage = message => {
    return this.chart.editMessage(message);
  };
});

class Daily extends Component {
  static propTypes = {
    addingData: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    mostRecentDatetimeLocation: PropTypes.string,
    queryDataCount: PropTypes.number.isRequired,
    stats: PropTypes.array.isRequired,
    updatingDatum: PropTypes.object.isRequired,
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
    onSwitchToBgLog: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    // data state updaters
    onUpdateChartDateRange: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    removeGeneratedPDFS: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartType = 'daily';
    this.log = bows('Daily View');
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    this.throttledMetric = _.throttle(this.props.trackMetric, 5000);
    return {
      atMostRecent: false,
      endpoints: [],
      initialDatetimeLocation: this.props.initialDatetimeLocation,
      inTransition: false,
      title: '',
    };
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    const loadingJustCompleted = this.props.loading && !nextProps.loading;
    const newDataAdded = this.props.addingData.inProgress && nextProps.addingData.completed;
    const dataUpdated = this.props.updatingDatum.inProgress && nextProps.updatingDatum.completed;
    const newDataRecieved = this.props.queryDataCount !== nextProps.queryDataCount;
    const wrappedInstance = _.get(this.refs, 'chart.wrappedInstance');
    const bgRangeUpdated = this.props.data?.bgPrefs?.useDefaultRange !== nextProps.data?.bgPrefs?.useDefaultRange;

    if (wrappedInstance) {
      const updates = {};
      if (loadingJustCompleted || newDataAdded || dataUpdated || newDataRecieved) updates.data = nextProps.data;
      if (nextProps.data?.bgPrefs?.bgClasses && bgRangeUpdated) updates.bgClasses = nextProps.data.bgPrefs.bgClasses;
      if (!_.isEmpty(updates)) wrappedInstance.rerenderChart(updates);
    }
  };

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  render = () => {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const bgPrefs = _.get(this.props, 'data.bgPrefs', {});
    const dataQueryComplete = _.get(this.props, 'data.query.chartType') === 'daily';

    return (
      <div id="tidelineMain" className="daily">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          inTransition={this.state.inTransition}
          atMostRecent={this.state.atMostRecent}
          title={this.state.title}
          iconBack={'icon-back'}
          iconNext={'icon-next'}
          iconMostRecent={'icon-most-recent'}
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
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />
              {dataQueryComplete && this.renderChart()}
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
              <BgSourceToggle
                bgSources={_.get(this.props, 'data.metaData.bgSources', {})}
                chartPrefs={this.props.chartPrefs}
                chartType={this.chartType}
                onClickBgSourceToggle={this.toggleBgDataSource}
              />
              <Stats
                bgPrefs={bgPrefs}
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
            </div>
          </div>
        </div>
        <Footer
          chartType={this.chartType}
          onClickRefresh={this.props.onClickRefresh}
          ref="footer"
        />
        {this.state.hoveredBolus && <BolusTooltip
          position={{
            top: this.state.hoveredBolus.top,
            left: this.state.hoveredBolus.left
          }}
          side={this.state.hoveredBolus.side}
          bolus={this.state.hoveredBolus.data}
          bgPrefs={bgPrefs}
          timePrefs={timePrefs}
        />}
        {this.state.hoveredSMBG && <SMBGTooltip
          position={{
            top: this.state.hoveredSMBG.top,
            left: this.state.hoveredSMBG.left
          }}
          side={this.state.hoveredSMBG.side}
          smbg={this.state.hoveredSMBG.data}
          timePrefs={timePrefs}
          bgPrefs={bgPrefs}
        />}
        {this.state.hoveredCBG && <CBGTooltip
          position={{
            top: this.state.hoveredCBG.top,
            left: this.state.hoveredCBG.left
          }}
          side={this.state.hoveredCBG.side}
          cbg={this.state.hoveredCBG.data}
          timePrefs={timePrefs}
          bgPrefs={bgPrefs}
        />}
        {this.state.hoveredCarb && <FoodTooltip
          position={{
            top: this.state.hoveredCarb.top,
            left: this.state.hoveredCarb.left
          }}
          side={this.state.hoveredCarb.side}
          food={this.state.hoveredCarb.data}
          bgPrefs={bgPrefs}
          timePrefs={timePrefs}
        />}
        {this.state.hoveredPumpSettingsOverride && <PumpSettingsOverrideTooltip
          position={{
            top: this.state.hoveredPumpSettingsOverride.top,
            left: this.state.hoveredPumpSettingsOverride.left
          }}
          side={this.state.hoveredPumpSettingsOverride.side}
          override={this.state.hoveredPumpSettingsOverride.data}
          timePrefs={timePrefs}
        />}
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
      );
  };

  renderChart = () => {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const bgPrefs = _.get(this.props, 'data.bgPrefs', {});
    const carbUnits = ['grams'];

    const {
      isAutomatedBasalDevice,
      isAutomatedBolusDevice,
    } = _.get(this.props, 'data.metaData.latestPumpUpload', {});

    const hasCarbExchanges = _.some(
      _.get(this.props, 'data.data.combined'),
      { type: 'wizard', carbUnits: 'exchanges' }
    );

    if (hasCarbExchanges) carbUnits.push('exchanges');

    return (
      <DailyChart
        automatedBasal={isAutomatedBasalDevice}
        automatedBolus={isAutomatedBolusDevice}
        bgClasses={bgPrefs.bgClasses}
        bgUnits={bgPrefs.bgUnits}
        bolusRatio={this.props.chartPrefs.bolusRatio}
        carbUnits={carbUnits}
        data={this.props.data}
        dynamicCarbs={this.props.chartPrefs.dynamicCarbs}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        timePrefs={timePrefs}
        // message handlers
        onCreateMessage={this.props.onCreateMessage}
        onShowMessageThread={this.props.onShowMessageThread}
        // other handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onHideBasalSettings={this.handleHideBasalSettings}
        onMostRecent={this.handleMostRecent}
        onShowBasalSettings={this.handleShowBasalSettings}
        onTransition={this.handleInTransition}
        onBolusHover={this.handleBolusHover}
        onBolusOut={this.handleBolusOut}
        onSMBGHover={this.handleSMBGHover}
        onSMBGOut={this.handleSMBGOut}
        onCBGHover={this.handleCBGHover}
        onCBGOut={this.handleCBGOut}
        onCarbHover={this.handleCarbHover}
        onCarbOut={this.handleCarbOut}
        onPumpSettingsOverrideHover={this.handlePumpSettingsOverrideHover}
        onPumpSettingsOverrideOut={this.handlePumpSettingsOverrideOut}
        ref="chart" />
    );
  }

  getTitle = datetime => {
    const { t } = this.props;
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    let timezone;

    if (!timePrefs.timezoneAware) {
      timezone = 'UTC';
    }
    else {
      timezone = timePrefs.timezoneName || 'UTC';
    }
    return sundial.formatInTimezone(datetime, timezone, t('ddd, MMM D, YYYY'));
  };

  // handlers
  toggleBgDataSource = (e, bgSource) => {
    if (e) {
      e.preventDefault();
    }

    const changedTo = bgSource === 'cbg' ? 'CGM' : 'BGM';
    this.props.trackMetric(`Daily Click to ${changedTo}`);

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.daily.bgSource = bgSource;
    this.props.updateChartPrefs(prefs, false, true);
  };

  handleWindowResize = () => {
    _.get(this.refs, 'chart.wrappedInstance') && this.refs.chart.getWrappedInstance().rerenderChart()
  };

  handleClickTrends = e => {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.refs.chart.getWrappedInstance().getCurrentDay();
    this.props.onSwitchToTrends(datetime);
  };

  handleClickMostRecent = e => {
    if (e) {
      e.preventDefault();
    }

    const latestFillDatum = _.findLast(this.refs.chart.wrappedInstance.chart.renderedData(), { type: 'fill' });

    if (latestFillDatum.fillDate >= this.props.mostRecentDatetimeLocation.slice(0,10)) {
      this.refs.chart.getWrappedInstance().goToMostRecent();
    } else {
      this.props.onUpdateChartDateRange(this.props.mostRecentDatetimeLocation, true)
    }
  };

  handleClickOneDay = e => {
    if (e) {
      e.preventDefault();
    }
    return;
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
    const datetime = this.refs.chart.getWrappedInstance().getCurrentDay();
    this.props.onSwitchToBgLog(datetime);
  };

  handleDatetimeLocationChange = datetimeLocationEndpoints => {
    this.setState({
      title: this.getTitle(datetimeLocationEndpoints[1]),
    });

    // Update the chart date range in the data component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocationEndpoints[0].end.toISOString());

    this.setState({ debouncedDateRangeUpdate });
  };

  handleInTransition = inTransition => {
    this.setState({
      inTransition: inTransition
    });
  };

  handleBolusHover = bolus => {
    const rect = bolus.rect;
    const datetimeLocation = this.refs.chart.getWrappedInstance().state.datetimeLocation;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(bolus.data.normalTime, datetimeLocation, 'h');
    bolus.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      bolus.side = 'left';
      bolus.left = rect.left;
    } else {
      bolus.side = 'right';
      bolus.left = rect.left + rect.width;
    }
    this.setState({
      hoveredBolus: bolus
    });
  };

  handleBolusOut = () => {
    this.setState({
      hoveredBolus: false
    });
  };

  handleSMBGHover = smbg => {
    const rect = smbg.rect;
    const datetimeLocation = this.refs.chart.getWrappedInstance().state.datetimeLocation;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(smbg.data.normalTime, datetimeLocation, 'h');
    smbg.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      smbg.side = 'left';
      smbg.left = rect.left;
    } else {
      smbg.side = 'right';
      smbg.left = rect.left + rect.width;
    }
    this.setState({
      hoveredSMBG: smbg
    });
  };

  handleSMBGOut = () => {
    this.setState({
      hoveredSMBG: false
    });
  };

  handleCBGHover = cbg => {
    this.throttledMetric('hovered over daily cgm tooltip');
    var rect = cbg.rect;
    const datetimeLocation = this.refs.chart.getWrappedInstance().state.datetimeLocation;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(cbg.data.normalTime, datetimeLocation, 'h');
    cbg.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      cbg.side = 'left';
      cbg.left = rect.left;
    } else {
      cbg.side = 'right';
      cbg.left = rect.left + rect.width;
    }
    this.setState({
      hoveredCBG: cbg
    });
  };

  handleCBGOut = () => {
    this.setState({
      hoveredCBG: false
    });
  };

  handlePumpSettingsOverrideHover = override => {
    this.throttledMetric('hovered over daily settings override tooltip');
    const rect = override.rect;
    const markerLeftOffset = 7;
    override.top = rect.top;
    override.left = rect.left + markerLeftOffset;

    // Prevent the tooltip from spilling over chart edges
    const leftOffset = override.left - override.chartExtents.left;
    const rightOffset = override.left - override.chartExtents.right;

    if (leftOffset < 70) {
      override.left = override.chartExtents.left + 70;
    }

    if (rightOffset > -70) {
      override.left = override.chartExtents.right - 70;
    }

    this.setState({
      hoveredPumpSettingsOverride: override
    });
  };

  handlePumpSettingsOverrideOut = () => {
    this.setState({
      hoveredPumpSettingsOverride: false
    });
  };

  handleCarbHover = carb => {
    var rect = carb.rect;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(carb.data.normalTime, this.state.datetimeLocation, 'h');
    carb.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      carb.side = 'left';
      carb.left = rect.left;
    } else {
      carb.side = 'right';
      carb.left = rect.left + rect.width;
    }
    this.setState({
      hoveredCarb: carb
    });
  };

  handleCarbOut = () => {
    this.setState({
      hoveredCarb: false
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
    this.refs.chart.getWrappedInstance().panBack();
  };

  handlePanForward = e => {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.getWrappedInstance().panForward();
  };

  // methods for messages
  closeMessageThread = () => {
    return this.refs.chart.getWrappedInstance().closeMessage();
  };

  createMessageThread = message => {
    return this.refs.chart.getWrappedInstance().createMessage(message);
  };

  editMessageThread = message => {
    return this.refs.chart.getWrappedInstance().editMessage(message);
  };
}

export default translate()(Daily);
