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
import React from 'react';
import _ from 'lodash';
import bows from 'bows';
import sundial from 'sundial';
import moment from 'moment-timezone';
import WindowSizeListener from 'react-window-size-listener';
import i18next from 'i18next';

import { pluginsBlip } from 'tideline';
import { components as vizComponents } from 'tidepool-viz';

import { BG_DATA_TYPES } from '../../core/constants';
import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import Header from './header';
import Footer from './footer';

const Loader = vizComponents.Loader;
const BolusTooltip = vizComponents.BolusTooltip;
const SMBGTooltip = vizComponents.SMBGTooltip;
const CBGTooltip = vizComponents.CBGTooltip;
const FoodTooltip = vizComponents.FoodTooltip;
const ReservoirTooltip = vizComponents.ReservoirTooltip;
const PhysicalTooltip = vizComponents.PhysicalTooltip;
const ParameterTooltip = vizComponents.ParameterTooltip;
const ConfidentialTooltip = vizComponents.ConfidentialTooltip;

const { chartDailyFactory } = pluginsBlip;

const t = i18next.t.bind(i18next);

class DailyChart extends React.Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patient: PropTypes.object,
    patientData: PropTypes.object.isRequired,
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
    onReservoirHover: PropTypes.func.isRequired,
    onReservoirOut: PropTypes.func.isRequired,
    onPhysicalHover: PropTypes.func.isRequired,
    onPhysicalOut: PropTypes.func.isRequired,
    onParameterHover: PropTypes.func.isRequired,
    onParameterOut: PropTypes.func.isRequired,
    onConfidentialHover: PropTypes.func.isRequired,
    onConfidentialOut: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartOpts = [
      'bgClasses',
      'bgUnits',
      'timePrefs',
      'onBolusHover',
      'onBolusOut',
      'onSMBGHover',
      'onSMBGOut',
      'onCBGHover',
      'onCBGOut',
      'onCarbHover',
      'onCarbOut',
      'onReservoirHover',
      'onReservoirOut',
      'onPhysicalHover',
      'onPhysicalOut',
      'onParameterHover',
      'onParameterOut',
      'onConfidentialHover',
      'onConfidentialOut',
    ];

    this.log = bows('Daily Chart');
    this.state = {
      datetimeLocation: null
    };
    this.chart = null;
    /** @type {React.RefObject} */
    this.refNode = React.createRef();
  }

  componentDidMount() {
    this.mountChart();
    this.initializeChart(this.props.initialDatetimeLocation);
  }

  componentWillUnmount() {
    this.unmountChart();
  }

  mountChart() {
    this.log.debug('Mounting...');
    this.chart = chartDailyFactory(this.refNode.current, _.pick(this.props, this.chartOpts))
      .setupPools();
    this.bindEvents();
  }

  unmountChart() {
    this.log('Unmounting...');
    this.chart.destroy();
    this.chart = null;
  }

  bindEvents() {
    this.chart.emitter.on('createMessage', this.props.onCreateMessage);
    this.chart.emitter.on('inTransition', this.props.onTransition);
    this.chart.emitter.on('messageThread', this.props.onShowMessageThread);
    this.chart.emitter.on('mostRecent', this.props.onMostRecent);
    this.chart.emitter.on('navigated', this.handleDatetimeLocationChange);
  }

  initializeChart(datetime) {
    this.log('Initializing...');
    if (_.isEmpty(this.props.patientData)) {
      throw new Error(t('Cannot create new chart with no data'));
    }

    this.chart.load(this.props.patientData);
    if (datetime) {
      this.chart.locate(datetime);
    } else if (this.state.datetimeLocation !== null) {
      this.chart.locate(this.state.datetimeLocation);
    } else {
      this.chart.locate();
    }
  }

  render() {
    return (
      <div id="tidelineContainer" className="patient-data-chart" ref={this.refNode} />
    );
  }

  // handlers
  handleDatetimeLocationChange = (datetimeLocationEndpoints) => {
    this.setState({
      datetimeLocation: datetimeLocationEndpoints[1],
    });
    this.props.onDatetimeLocationChange(datetimeLocationEndpoints);
  };

  rerenderChart() {
    this.log('Rerendering...');
    this.unmountChart();
    this.mountChart();
    this.initializeChart();
    this.chart.emitter.emit('inTransition', false);
  }

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

  createMessage = (message) => {
    return this.chart.createMessage(message);
  };

  editMessage = (message) => {
    return this.chart.editMessage(message);
  };
}

class Daily extends React.Component {
  static propTypes = {
    patient: PropTypes.object.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object.isRequired,
    dataUtil: PropTypes.object,
    timePrefs: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    patientData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    canPrint: PropTypes.bool.isRequired,
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
    onSwitchToTrends: PropTypes.func.isRequired,
    // PatientData state updaters
    onUpdateChartDateRange: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    updateDatetimeLocation: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    profileDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
    this.chartType = 'daily';
    this.log = bows('Daily View');
    this.state = {
      atMostRecent: false,
      endpoints: [],
      inTransition: false,
      title: '',
      debouncedDateRangeUpdate: null,
    };
    this.throttledMetric = _.throttle(this.props.trackMetric, 5000);
  }

  componentDidUpdate(prevProps) {
    const { loading } = this.props;
    if (prevProps.loading && !loading) {
      this.chartRef.current.rerenderChart();
    }
  }

  componentWillUnmount() {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }
  }

  render() {
    const { timePrefs } = this.props.patientData.opts;

    return (
      <div id="tidelineMain" className="daily">
        <Header
          profileDialog={this.props.profileDialog}
          chartType={this.chartType}
          patient={this.props.patient}
          inTransition={this.state.inTransition}
          atMostRecent={this.state.atMostRecent}
          title={this.state.title}
          iconBack={'icon-back'}
          iconNext={'icon-next'}
          iconMostRecent={'icon-most-recent'}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          canPrint={this.props.canPrint}
          trackMetric={this.props.trackMetric}
          onClickBack={this.handlePanBack}
          onClickBasics={this.props.onSwitchToBasics}
          onClickTrends={this.handleClickTrends}
          onClickMostRecent={this.handleClickMostRecent}
          onClickNext={this.handlePanForward}
          onClickOneDay={this.handleClickOneDay}
          onClickSettings={this.props.onSwitchToSettings}
          onClickPrint={this.props.onClickPrint} />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <Loader show={this.props.loading} overlay={true} />
              <DailyChart
                bgClasses={this.props.bgPrefs.bgClasses}
                bgUnits={this.props.bgPrefs.bgUnits}
                initialDatetimeLocation={this.props.initialDatetimeLocation}
                patientData={this.props.patientData}
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
                onReservoirHover={this.handleReservoirHover}
                onReservoirOut={this.handleReservoirOut}
                onPhysicalHover={this.handlePhysicalHover}
                onPhysicalOut={this.handlePhysicalOut}
                onParameterHover={this.handleParameterHover}
                onParameterOut={this.handleParameterOut}
                onConfidentialHover={this.handleConfidentialHover}
                onConfidentialOut={this.handleConfidentialOut}
                ref={this.chartRef}
              />
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
          onClickRefresh={this.props.onClickRefresh} />
        {this.state.hoveredBolus && <BolusTooltip
          position={{
            top: this.state.hoveredBolus.top,
            left: this.state.hoveredBolus.left
          }}
          side={this.state.hoveredBolus.side}
          bolus={this.state.hoveredBolus.data}
          bgPrefs={this.props.bgPrefs}
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
          bgPrefs={this.props.bgPrefs}
        />}
        {this.state.hoveredCBG && <CBGTooltip
          position={{
            top: this.state.hoveredCBG.top,
            left: this.state.hoveredCBG.left
          }}
          side={this.state.hoveredCBG.side}
          cbg={this.state.hoveredCBG.data}
          timePrefs={timePrefs}
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
          timePrefs={timePrefs}
        />}
        {this.state.hoveredReservoir && <ReservoirTooltip
          position={{
            top: this.state.hoveredReservoir.top,
            left: this.state.hoveredReservoir.left
          }}
          side={this.state.hoveredReservoir.side}
          reservoir={this.state.hoveredReservoir.data}
          bgPrefs={this.props.bgPrefs}
          timePrefs={timePrefs}
        />}
        {this.state.hoveredPhysical && <PhysicalTooltip
          position={{
            top: this.state.hoveredPhysical.top,
            left: this.state.hoveredPhysical.left
          }}
          side={this.state.hoveredPhysical.side}
          physicalActivity={this.state.hoveredPhysical.data}
          bgPrefs={this.props.bgPrefs}
          timePrefs={timePrefs}
        />}
        {this.state.hoveredParameter && <ParameterTooltip
          position={{
            top: this.state.hoveredParameter.top,
            left: this.state.hoveredParameter.left
          }}
          side={this.state.hoveredParameter.side}
          parameter={this.state.hoveredParameter.data}
          bgPrefs={this.props.bgPrefs}
          timePrefs={timePrefs}
        />}
        {this.state.hoveredConfidential && <ConfidentialTooltip
          position={{
            top: this.state.hoveredConfidential.top,
            left: this.state.hoveredConfidential.left
          }}
          side={this.state.hoveredConfidential.side}
          confidential={this.state.hoveredConfidential.data}
          timePrefs={timePrefs}
        />}

        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }

  getTitle(datetime) {
    const { timePrefs } = this.props;
    const timezone = timePrefs.timezoneName;
    return moment.tz(datetime, timezone).format(t('ddd, MMM D, YYYY'));
  }

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
    this.chartRef.current && this.chartRef.current.rerenderChart();
  };

  handleClickTrends = (e) => {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.chartRef.current.getCurrentDay();
    this.props.onSwitchToTrends(datetime);
  };

  handleClickMostRecent = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.chartRef.current.goToMostRecent();
  };

  handleClickOneDay = (e) => {
    if (e) {
      e.preventDefault();
    }
    return;
  };

  handleDatetimeLocationChange = (datetimeLocationEndpoints) => {
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
    this.setState({ debouncedDateRangeUpdate });
    debouncedDateRangeUpdate(endpoints, () => {
      this.setState({ debouncedDateRangeUpdate: null });
    });
  };

  handleInTransition = inTransition => {
    this.setState({ inTransition });
  };

  handleBolusHover = (bolus) => {
    const rect = bolus.rect;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(bolus.data.normalTime, this.state.datetimeLocation, 'h');
    bolus.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      bolus.side = 'left';
      bolus.left = rect.left;
    } else {
      bolus.side = 'right';
      bolus.left = rect.left + rect.width;
    }
    this.setState({
      hoveredBolus: bolus,
    });
  };

  handleBolusOut = () => {
    this.setState({
      hoveredBolus: false,
    });
  };

  handleSMBGHover = (smbg) => {
    const rect = smbg.rect;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(smbg.data.normalTime, this.state.datetimeLocation, 'h');
    smbg.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      smbg.side = 'left';
      smbg.left = rect.left;
    } else {
      smbg.side = 'right';
      smbg.left = rect.left + rect.width;
    }
    this.setState({
      hoveredSMBG: smbg,
    });
  };

  handleSMBGOut = () => {
    this.setState({
      hoveredSMBG: false,
    });
  };

  handleCBGHover = (cbg) => {
    this.throttledMetric('hovered over daily cgm tooltip');
    var rect = cbg.rect;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(cbg.data.normalTime, this.state.datetimeLocation, 'h');
    cbg.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      cbg.side = 'left';
      cbg.left = rect.left;
    } else {
      cbg.side = 'right';
      cbg.left = rect.left + rect.width;
    }
    this.setState({
      hoveredCBG: cbg,
    });
  };

  handleCBGOut = () => {
    this.setState({
      hoveredCBG: false,
    });
  };

  handleCarbHover = (carb) => {
    var rect = carb.rect;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(carb.data.normalTime, this.state.datetimeLocation, 'h');
    carb.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      carb.side = 'left';
      carb.left = rect.left;
    } else {
      carb.side = 'right';
      carb.left = rect.left + rect.width;
    }
    this.setState({
      hoveredCarb: carb,
    });
  };

  handleCarbOut = () => {
    this.setState({
      hoveredCarb: false,
    });
  };

  handleReservoirHover = (reservoir) => {
    var rect = reservoir.rect;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(reservoir.data.normalTime, this.state.datetimeLocation, 'h');
    reservoir.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      reservoir.side = 'left';
      reservoir.left = rect.left;
    } else {
      reservoir.side = 'right';
      reservoir.left = rect.left + rect.width;
    }
    this.setState({
      hoveredReservoir: reservoir,
    });
  };

  handleReservoirOut = () => {
    this.setState({
      hoveredReservoir: false,
    });
  };

  handlePhysicalHover = (physical) => {
    var rect = physical.rect;
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(physical.data.normalTime, this.state.datetimeLocation, 'h');
    physical.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      physical.side = 'left';
      physical.left = rect.left;
    } else {
      physical.side = 'right';
      physical.left = rect.left + rect.width;
    }
    this.setState({
      hoveredPhysical: physical,
    });
  };

  handlePhysicalOut = () => {
    this.setState({
      hoveredPhysical: false,
    });
  };

  handleParameterHover = (parameter) => {
    const { rect } = parameter;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(parameter.data.normalTime, this.state.datetimeLocation, 'h');
    parameter.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      parameter.side = 'left';
      parameter.left = rect.left;
    } else {
      parameter.side = 'right';
      parameter.left = rect.left + rect.width;
    }
    this.setState({
      hoveredParameter: parameter,
    });
  };

  handleParameterOut = () => {
    this.setState({
      hoveredParameter: false,
    });
  };

  handleConfidentialHover = (confidential) => {
    const { rect } = confidential;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(confidential.data.normalTime, this.state.datetimeLocation, 'h');
    confidential.top = rect.top + rect.height / 2;
    if (hoursOffset > 5) {
      confidential.side = 'left';
      confidential.left = rect.left;
    } else {
      confidential.side = 'right';
      confidential.left = rect.left + rect.width;
    }
    this.setState({
      hoveredConfidential: confidential,
    });
  };

  handleConfidentialOut = () => {
    this.setState({
      hoveredConfidential: false,
    });
  };

  handleMostRecent = (atMostRecent) => {
    this.setState({
      atMostRecent: atMostRecent,
    });
  };

  handlePanBack = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.chartRef.current.panBack();
  };

  handlePanForward = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.chartRef.current.panForward();
  };

  // Messages:

  /**
   * Update the daily view by adding the new message
   * @param {object} message A nurseshark processed message
   * @return {Promise<boolean>} true if the message was added
   */
  createMessage = (message) => {
    return this.chartRef.current.createMessage(message);
  };

  /**
   * Update the daily view message
   * @param {object} message A nurseshark processed message
   * @return {boolean} true if the message was correctly updated
   */
  editMessage = (message) => {
    return this.chartRef.current.editMessage(message);
  };
}

export { DailyChart };
export default Daily;
