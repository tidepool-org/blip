
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
import { translate } from 'react-i18next';

import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import { BG_DATA_TYPES } from '../../core/constants';

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
const chartDailyFactory = tidelineBlip.oneday;

import { components as vizComponents } from '@tidepool/viz';
const Loader = vizComponents.Loader;
const BolusTooltip = vizComponents.BolusTooltip;
const SMBGTooltip = vizComponents.SMBGTooltip;
const CBGTooltip = vizComponents.CBGTooltip;
const FoodTooltip = vizComponents.FoodTooltip;

import Header from './header';
import Footer from './footer';

const DailyChart = translate()(class DailyChart extends Component {
  static propTypes = {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    bolusRatio: React.PropTypes.number,
    dynamicCarbs: React.PropTypes.bool,
    initialDatetimeLocation: React.PropTypes.string,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // other handlers
    onDatetimeLocationChange: React.PropTypes.func.isRequired,
    onMostRecent: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    onBolusHover: React.PropTypes.func.isRequired,
    onBolusOut: React.PropTypes.func.isRequired,
    onSMBGHover: React.PropTypes.func.isRequired,
    onSMBGOut: React.PropTypes.func.isRequired,
    onCBGHover: React.PropTypes.func.isRequired,
    onCBGOut: React.PropTypes.func.isRequired,
    onCarbHover: React.PropTypes.func.isRequired,
    onCarbOut: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = [
      'bgClasses',
      'bgUnits',
      'bolusRatio',
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
    ];

    this.log = bows('Daily Chart');
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      datetimeLocation: null
    };
  };

  componentDidMount = () => {
    this.mountChart();
    this.initializeChart(this.props.initialDatetimeLocation);
  };

  componentWillUnmount = () => {
    this.unmountChart();
  };

  mountChart = () => {
    this.log('Mounting...');
    this.chart = chartDailyFactory(ReactDOM.findDOMNode(this), _.pick(this.props, this.chartOpts))
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

  initializeChart = datetime => {
    const { t } = this.props;
    this.log('Initializing...');
    if (_.isEmpty(this.props.patientData)) {
      throw new Error(t('Cannot create new chart with no data'));
    }

    this.chart.load(this.props.patientData);
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

  rerenderChart = () => {
    this.log('Rerendering...');
    this.unmountChart();
    this.mountChart();
    this.initializeChart();
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
    bgPrefs: React.PropTypes.object.isRequired,
    bgSource: React.PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: React.PropTypes.object.isRequired,
    dataUtil: React.PropTypes.object,
    timePrefs: React.PropTypes.object.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
    pdf: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    // refresh handler
    onClickRefresh: React.PropTypes.func.isRequired,
    // message handlers
    onCreateMessage: React.PropTypes.func.isRequired,
    onShowMessageThread: React.PropTypes.func.isRequired,
    // navigation handlers
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onClickPrint: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToBgLog: React.PropTypes.func.isRequired,
    onSwitchToTrends: React.PropTypes.func.isRequired,
    // PatientData state updaters
    onUpdateChartDateRange: React.PropTypes.func.isRequired,
    updateChartPrefs: React.PropTypes.func.isRequired,
    updateDatetimeLocation: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
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
      inTransition: false,
      title: '',
    };
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.loading && !nextProps.loading) {
      this.refs.chart.getWrappedInstance().rerenderChart();
    }
  };

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  };

  render = () => {
    return (
      <div id="tidelineMain" className="daily">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          printReady={!!this.props.pdf.url}
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
              <Loader show={this.props.loading} overlay={true} />
              <DailyChart
                bgClasses={this.props.bgPrefs.bgClasses}
                bgUnits={this.props.bgPrefs.bgUnits}
                bolusRatio={this.props.chartPrefs.bolusRatio}
                dynamicCarbs={this.props.chartPrefs.dynamicCarbs}
                initialDatetimeLocation={this.props.initialDatetimeLocation}
                patientData={this.props.patientData}
                timePrefs={this.props.timePrefs}
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
                ref="chart" />
            </div>
          </div>
          <div className="container-box-inner patient-data-sidebar">
            <div className="patient-data-sidebar-inner">
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
                endpoints={this.state.endpoints}
              />
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
        ref="footer" />
        {this.state.hoveredBolus && <BolusTooltip
            position={{
              top: this.state.hoveredBolus.top,
              left: this.state.hoveredBolus.left
            }}
            side={this.state.hoveredBolus.side}
            bolus={this.state.hoveredBolus.data}
            bgPrefs={this.props.bgPrefs}
            timePrefs={this.props.timePrefs}
          />}
        {this.state.hoveredSMBG && <SMBGTooltip
            position={{
              top: this.state.hoveredSMBG.top,
              left: this.state.hoveredSMBG.left
            }}
            side={this.state.hoveredSMBG.side}
            smbg={this.state.hoveredSMBG.data}
            timePrefs={this.props.timePrefs}
            bgPrefs={this.props.bgPrefs}
          />}
        {this.state.hoveredCBG && <CBGTooltip
          position={{
            top: this.state.hoveredCBG.top,
            left: this.state.hoveredCBG.left
          }}
          side={this.state.hoveredCBG.side}
          cbg={this.state.hoveredCBG.data}
          timePrefs={this.props.timePrefs}
          bgPrefs={this.props.bgPrefs}
        />}
        {this.state.hoveredCarb && <FoodTooltip
          position={{
            top: this.state.hoveredCarb.top,
            left: this.state.hoveredCarb.left
          }}
          side={this.state.hoveredCarb.side}
          food={this.state.hoveredCarb.data}
          bgPrefs={this.props.bgPrefs}
          timePrefs={this.props.timePrefs}
        />}
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
      );
  };

  getTitle = datetime => {
    const { timePrefs, t } = this.props;
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
    this.props.updateChartPrefs(prefs);
  };

  handleWindowResize = () => {
    this.refs.chart && this.refs.chart.getWrappedInstance().rerenderChart();
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
    this.refs.chart.getWrappedInstance().goToMostRecent();
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
    const endpoints = [
      moment.utc(datetimeLocationEndpoints[0].start).toISOString(),
      moment.utc(datetimeLocationEndpoints[0].end).toISOString(),
    ];

    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
      title: this.getTitle(datetimeLocationEndpoints[1]),
      endpoints,
    });

    this.props.updateDatetimeLocation(datetimeLocationEndpoints[1]);

    // Update the chart date range in the patientData component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(endpoints);

    this.setState({ debouncedDateRangeUpdate });
  };

  handleInTransition = inTransition => {
    this.setState({
      inTransition: inTransition
    });
  };

  handleBolusHover = bolus => {
    const rect = bolus.rect;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(bolus.data.normalTime, this.state.datetimeLocation, 'h');
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
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(smbg.data.normalTime, this.state.datetimeLocation, 'h');
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
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(cbg.data.normalTime, this.state.datetimeLocation, 'h');
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
