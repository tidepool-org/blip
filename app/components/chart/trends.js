const d3 = window.d3;

import _ from 'lodash';
import bows from 'bows';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import sundial from 'sundial';
import WindowSizeListener from 'react-window-size-listener';
import { withTranslation } from 'react-i18next';
import { Box, Flex } from 'theme-ui';

import Header from './header';
import SubNav from './trendssubnav';
import Stats from './stats';
import BgSourceToggle from './bgSourceToggle';
import DeviceSelection from './deviceSelection';
import Button from '../elements/Button';
import Checkbox from '../elements/Checkbox';
import { colors } from '../../themes/baseTheme';

import {
  components as vizComponents,
  containers as vizContainers,
  utils as vizUtils,
} from '@tidepool/viz';

const TrendsContainer = vizContainers.TrendsContainer;
const getTimezoneFromTimePrefs = vizUtils.datetime.getTimezoneFromTimePrefs;
const getLocalizedCeiling = vizUtils.datetime.getLocalizedCeiling;
const trendsText = vizUtils.text.trendsText;
const {
  ClipboardButton,
  Loader,
  CBGDateTraceLabel,
  FocusedRangeLabels,
  FocusedSMBGPointLabel,
} = vizComponents;

const Trends = withTranslation()(class Trends extends PureComponent {
  static propTypes = {
    chartPrefs: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    initialDatetimeLocation: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    mostRecentDatetimeLocation: PropTypes.string,
    onClickRefresh: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onUpdateChartDateRange: PropTypes.func.isRequired,
    patient: PropTypes.object,
    queryDataCount: PropTypes.number.isRequired,
    stats: PropTypes.array.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    removeGeneratedPDFS: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartType = 'trends';
    this.log = bows('Trends');

    this.state = {
      inTransition: false,
      title: '',
      visibleDays: 0,
    };

    this.formatDate = this.formatDate.bind(this);
    this.getNewDomain = this.getNewDomain.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleClickBack = this.handleClickBack.bind(this);
    this.handleClickPrint = this.handleClickPrint.bind(this);
    this.handleClickDaily = this.handleClickDaily.bind(this);
    this.handleClickForward = this.handleClickForward.bind(this);
    this.handleClickFourWeeks = this.handleClickFourWeeks.bind(this);
    this.handleClickMostRecent = this.handleClickMostRecent.bind(this);
    this.handleClickOneWeek = this.handleClickOneWeek.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickTrends = this.handleClickTrends.bind(this);
    this.handleClickTwoWeeks = this.handleClickTwoWeeks.bind(this);
    this.handleClickBgLog = this.handleClickBgLog.bind(this);
    this.handleDatetimeLocationChange = this.handleDatetimeLocationChange.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.handleFocusCbgDateTrace = this.handleFocusCbgDateTrace.bind(this);
    this.handleFocusCbgSlice = this.handleFocusCbgSlice.bind(this);
    this.handleFocusSmbg = this.handleFocusSmbg.bind(this);
    this.handleFocusSmbgRange = this.handleFocusSmbgRange.bind(this);
    this.markTrendsViewed = this.markTrendsViewed.bind(this);
    this.toggleBgDataSource = this.toggleBgDataSource.bind(this);
    this.toggleBoxOverlay = this.toggleBoxOverlay.bind(this);
    this.toggleDay = this.toggleDay.bind(this);
    this.toggleGrouping = this.toggleGrouping.bind(this);
    this.toggleLines = this.toggleLines.bind(this);
    this.toggleDisplayFlags = this.toggleDisplayFlags.bind(this);
    this.toggleWeekdays = this.toggleWeekdays.bind(this);
    this.toggleWeekends = this.toggleWeekends.bind(this);
  }

  componentWillUnmount = () => {
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.focusedCbgDateTrace = null;
    prefs.trends.focusedCbgSlice = null;
    prefs.trends.focusedCbgSliceKeys = null;
    prefs.trends.focusedSmbg = null;
    prefs.trends.focusedSmbgRangeAvg = null;
    this.props.updateChartPrefs(prefs, false);
  };

  formatDate(datetime) {
    const { t } = this.props;
    const timezone = getTimezoneFromTimePrefs(_.get(this.props, 'data.timePrefs', {}));

    return sundial.formatInTimezone(datetime, timezone, t('MMM D, YYYY'));
  }

  getNewDomain(current, extent) {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const timezone = getTimezoneFromTimePrefs(timePrefs);
    const end = getLocalizedCeiling(current.valueOf(), timePrefs);
    const start = moment(end.toISOString()).tz(timezone).subtract(extent, 'days');
    const dateDomain = [start.toISOString(), end.toISOString()];

    return dateDomain;
  }

  getTitle(datetimeLocationEndpoints) {
    const timePrefs = _.get(this.props, 'data.timePrefs', {});
    const timezone = getTimezoneFromTimePrefs(timePrefs);

    // endpoint is exclusive, so need to subtract a day
    const end = moment(datetimeLocationEndpoints[1]).tz(timezone).subtract(1, 'day');

    return this.formatDate(datetimeLocationEndpoints[0]) + ' - ' + this.formatDate(end);
  }

  handleWindowResize(windowSize) {
    this.refs.chart?.mountData();
  }

  handleClickBack(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.chart.goBack();
  }

  handleClickDaily(e) {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.refs.chart ? this.refs.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToDaily(datetime);
  }

  handleClickForward(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.isAtMostRecent()) {
      return;
    }
    this.refs.chart.goForward();
  }

  handleClickOneWeek(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '1 week' && prefs.trends.extentSize === 7) {
      return;
    }
    const current = new Date(this.refs.chart.getCurrentDay());
    prefs.trends.activeDomain = '1 week';
    prefs.trends.extentSize = 7;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 7);
    this.refs.chart.setExtent(newDomain);
  }

  handleClickTwoWeeks(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '2 weeks' && prefs.trends.extentSize === 14) {
      return;
    }
    const current = new Date(this.refs.chart.getCurrentDay());
    prefs.trends.activeDomain = '2 weeks';
    prefs.trends.extentSize = 14;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 14);
    this.refs.chart.setExtent(newDomain);
  }

  handleClickFourWeeks(e) {
    if (e) {
      e.preventDefault();
    }
    const prefs = _.cloneDeep(this.props.chartPrefs);
    // no change, return early
    if (prefs.trends.activeDomain === '4 weeks' && prefs.trends.extentSize === 28) {
      return;
    }
    const current = new Date(this.refs.chart.getCurrentDay());
    prefs.trends.activeDomain = '4 weeks';
    prefs.trends.extentSize = 28;
    this.props.updateChartPrefs(prefs);
    const newDomain = this.getNewDomain(current, 28);
    this.refs.chart.setExtent(newDomain);
  }

  handleClickMostRecent(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.isAtMostRecent()) {
      return;
    }
    this.refs.chart.goToMostRecent();
  }

  handleClickSettings(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToSettings();
  }

  handleClickTrends(e) {
    if (e) {
      e.preventDefault();
    }
    // when you're on Trends view, clicking Trends does nothing
    return;
  }

  handleClickBgLog(e) {
    if (e) {
      e.preventDefault();
    }
    const datetime = this.refs.chart ? this.refs.chart.getCurrentDay() : this.props.initialDatetimeLocation;
    this.props.onSwitchToBgLog(datetime);
  }

  handleClickPrint = e => {
    if (e) {
      e.preventDefault();
    }

    this.props.onClickPrint(this.props.pdf);
  };

  handleDatetimeLocationChange(datetimeLocationEndpoints) {
    this.setState({
      title: this.getTitle(datetimeLocationEndpoints),
    });

    // Update the chart date range in the data component.
    // We debounce this to avoid excessive updates while panning the view.
    if (this.state.debouncedDateRangeUpdate) {
      this.state.debouncedDateRangeUpdate.cancel();
    }

    const dateCeiling = getLocalizedCeiling(datetimeLocationEndpoints[1], _.get(this.props, 'data.timePrefs', {}));

    const datetimeLocation = moment.utc(dateCeiling.valueOf()).toISOString();

    const debouncedDateRangeUpdate = _.debounce(this.props.onUpdateChartDateRange, 250);
    debouncedDateRangeUpdate(datetimeLocation);

    this.setState({ debouncedDateRangeUpdate });
  }

  handleSelectDate(date) {
    this.props.onSwitchToDaily(date);
  }

  handleFocusCbgSlice(data, position, focusedKeys) {
    const prefs = _.cloneDeep(this.props.chartPrefs);

    if (data) {
      prefs.trends.focusedCbgSlice = { data, position };
      prefs.trends.focusedCbgSliceKeys = focusedKeys;
      prefs.trends.showingCbgDateTraces = true;
    } else {
      prefs.trends.focusedCbgSlice = null;
      prefs.trends.focusedCbgSliceKeys = null;
      prefs.trends.focusedCbgDateTrace = null;
      prefs.trends.showingCbgDateTraces = false;
    }

    this.props.updateChartPrefs(prefs, false);
  }

  handleFocusCbgDateTrace(data, position) {
    const prefs = _.cloneDeep(this.props.chartPrefs);

    if (data) {
      prefs.trends.focusedCbgDateTrace = { data, position };
    } else {
      prefs.trends.focusedCbgDateTrace = null;
    }

    this.props.updateChartPrefs(prefs, false);
  }

  handleFocusSmbg(datum, position, allSmbgsOnDate, allPositions, date) {
    const prefs = _.cloneDeep(this.props.chartPrefs);

    if (datum) {
      prefs.trends.focusedSmbg = { datum, position, allSmbgsOnDate, allPositions, date };
    } else {
      prefs.trends.focusedSmbg = null;
    }

    this.props.updateChartPrefs(prefs, false);
  }

  handleFocusSmbgRange(data, position) {
    const prefs = _.cloneDeep(this.props.chartPrefs);

    if (data) {
      prefs.trends.focusedSmbgRangeAvg = { data, position };
    } else {
      prefs.trends.focusedSmbgRangeAvg = null;
    }

    this.props.updateChartPrefs(prefs, false);
  }

  isAtMostRecent() {
    const mostRecentCeiling = getLocalizedCeiling(
      this.props.mostRecentDatetimeLocation,
      _.get(this.props, 'data.timePrefs', {})
    ).toISOString();
    return _.get(this.refs, 'chart.state.dateDomain.end') >= mostRecentCeiling;
  }

  markTrendsViewed() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.touched = true;
    this.props.updateChartPrefs(prefs, false);
  }

  toggleBgDataSource(e, bgSource) {
    if (e) {
      e.preventDefault();
    }

    const showingCbg = bgSource === 'cbg';
    const changedTo = showingCbg ? 'CGM' : 'BGM';
    this.props.trackMetric(`Trends Click to ${changedTo}`);

    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.showingCbg = showingCbg;
    prefs.trends.showingSmbg = !showingCbg;
    prefs.trends.bgSource = bgSource;
    this.props.updateChartPrefs(prefs, false, true);
  }

  toggleBoxOverlay() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgRangeOverlay = prefs.trends.smbgRangeOverlay ? false : true;
    this.props.updateChartPrefs(prefs, false);
    this.props.trackMetric(`clicked Trends range and average ${prefs.trends.smbgRangeOverlay ? 'on' : 'off'}`);
  }

  toggleDay(day) {
    const self = this;
    return function(e) {
      e.stopPropagation();
      const prefs = _.cloneDeep(self.props.chartPrefs);
      prefs.trends.activeDays[day] = prefs.trends.activeDays[day] ? false : true;
      self.props.updateChartPrefs(prefs);
    };
  }

  toggleGrouping() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgGrouped = prefs.trends.smbgGrouped ? false : true;
    this.props.updateChartPrefs(prefs, false);
    this.props.trackMetric(`clicked Trends group ${prefs.trends.smbgGrouped ? 'on' : 'off'}`);
  }

  toggleLines() {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.smbgLines = prefs.trends.smbgLines ? false : true;
    this.props.updateChartPrefs(prefs, false);
    this.props.trackMetric(`clicked Trends lines ${prefs.trends.smbgLines ? 'on' : 'off'}`);
  }

  toggleDisplayFlags(flag, value) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.cbgFlags[flag] = value;
    this.props.updateChartPrefs(prefs, false);

    const flagMetrics = {
      cbg100Enabled: encodeURIComponent('100% readings'),
      cbg80Enabled: encodeURIComponent('80% readings'),
      cbg50Enabled: encodeURIComponent('50% readings'),
      cbgMedianEnabled: 'median',
    }

    this.props.trackMetric(`clicked Trends ${flagMetrics[flag]} ${value ? 'on' : 'off'}`);
  }

  toggleWeekdays(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      'monday': !allActive,
      'tuesday': !allActive,
      'wednesday': !allActive,
      'thursday': !allActive,
      'friday': !allActive,
      'saturday': prefs.trends.activeDays.saturday,
      'sunday': prefs.trends.activeDays.sunday
    };
    this.props.updateChartPrefs(prefs);
  }

  toggleWeekends(allActive) {
    const prefs = _.cloneDeep(this.props.chartPrefs);
    prefs.trends.activeDays = {
      'monday': prefs.trends.activeDays.monday,
      'tuesday': prefs.trends.activeDays.tuesday,
      'wednesday': prefs.trends.activeDays.wednesday,
      'thursday': prefs.trends.activeDays.thursday,
      'friday': prefs.trends.activeDays.friday,
      'saturday': !allActive,
      'sunday': !allActive
    };
    this.props.updateChartPrefs(prefs);
  }

  render() {
    const { currentPatientInViewId, t } = this.props;
    const dataQueryComplete = _.get(this.props, 'data.query.chartType') === 'trends';
    const statsToRender = this.props.stats.filter((stat) => stat.id !== 'bgExtents');
    const cbgFlags = this.props.chartPrefs.trends.cbgFlags;

    const checkboxStyles = {
      themeProps: {
        mr: 3,
        mb: 0,
        sx: {
          color: 'stat.text',
          '&:last-child': { marginRight: 0 },
          backgroundColor: 'inherit',
          display: 'inline-flex !important',
          lineHeight: '1em',
        }
      },
      sx: {
        backgroundColor: 'white',
        boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
        color: colors.grays[2],
      },
    };

    return (
      <div id="tidelineMain" className="trends grid">
        <Box variant="containers.patientData">
          {this.renderHeader()}

          <Box variant="containers.patientDataInner">

            <Box className="patient-data-content" variant="containers.patientDataContent">
              {this.renderSubNav()}

              <Loader show={!!this.refs.chart && this.props.loading} overlay={true} />

              <div id="tidelineContainer" className="patient-data-chart-trends">
                {dataQueryComplete && this.renderChart()}
                {dataQueryComplete && this.renderFocusedCbgDateTraceLabel()}
                {dataQueryComplete && this.renderFocusedSMBGPointLabel()}
                {dataQueryComplete && this.renderFocusedRangeLabels()}
              </div>

              <Flex className="patient-data-footer-outer" mt="20px" mb={5} pl="40px" pr="10px" sx={{alignItems: 'center', justifyContent: 'space-between' }}>
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
                  {this.props.chartPrefs.trends.showingCbg && (
                    <>
                      <Checkbox
                        label={t('100% of Readings')}
                        name="hundred"
                        checked={cbgFlags.cbg100Enabled}
                        onChange={this.toggleDisplayFlags.bind(this, 'cbg100Enabled', !cbgFlags.cbg100Enabled)}
                        {...checkboxStyles}
                      />

                      <Checkbox
                        label={t('80% of Readings')}
                        name="eighty"
                        checked={cbgFlags.cbg80Enabled}
                        onChange={this.toggleDisplayFlags.bind(this, 'cbg80Enabled', !cbgFlags.cbg80Enabled)}
                        {...checkboxStyles}
                      />

                      <Checkbox
                        label={t('50% of Readings')}
                        name="fifty"
                        checked={cbgFlags.cbg50Enabled}
                        onChange={this.toggleDisplayFlags.bind(this, 'cbg50Enabled', !cbgFlags.cbg50Enabled)}
                        {...checkboxStyles}
                      />

                      <Checkbox
                        label={t('Median')}
                        name="median"
                        checked={cbgFlags.cbgMedianEnabled}
                        onChange={this.toggleDisplayFlags.bind(this, 'cbgMedianEnabled', !cbgFlags.cbgMedianEnabled)}
                        {...checkboxStyles}
                      />
                    </>
                  )}

                  {this.props.chartPrefs.trends.showingSmbg && (
                    <>
                      <Checkbox
                        label={t('Range & Average')}
                        name="overlayCheckbox"
                        checked={this.props.chartPrefs.trends.smbgRangeOverlay}
                        onChange={this.toggleBoxOverlay}
                        {...checkboxStyles}
                      />

                      <Checkbox
                        label={t('Group')}
                        name="groupCheckbox"
                        checked={this.props.chartPrefs.trends.smbgGrouped}
                        onChange={this.toggleGrouping}
                        {...checkboxStyles}
                      />

                      <Checkbox
                        label={t('Lines')}
                        name="linesCheckbox"
                        checked={this.props.chartPrefs.trends.smbgLines}
                        onChange={this.toggleLines}
                        {...checkboxStyles}
                      />
                    </>
                  )}
                </Flex>
              </Flex>
            </Box>

            <Box className="patient-data-sidebar" variant="containers.patientDataSidebar">
                <Flex mb={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <ClipboardButton
                    buttonTitle={t('For email or notes')}
                    onSuccess={this.handleCopyTrendsClicked}
                    getText={trendsText.bind(this, this.props.patient, this.props.data, this.props.stats, this.props.chartPrefs[this.chartType])}
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
            </Box>
          </Box>
          <WindowSizeListener onResize={this.handleWindowResize} />
        </Box>
      </div>
    );
  }

  renderHeader() {
    return (
      <Header
        chartType={this.chartType}
        chartPrefs={this.props.chartPrefs}
        patient={this.props.patient}
        inTransition={this.state.inTransition}
        atMostRecent={this.isAtMostRecent()}
        title={this.state.title}
        iconBack={'icon-back'}
        iconNext={'icon-next'}
        iconMostRecent={'icon-most-recent'}
        onClickBack={this.handleClickBack}
        onClickBasics={this.props.onSwitchToBasics}
        onClickTrends={this.handleClickTrends}
        onClickMostRecent={this.handleClickMostRecent}
        onClickNext={this.handleClickForward}
        onClickOneDay={this.handleClickDaily}
        onClickBgLog={this.handleClickBgLog}
        onClickSettings={this.handleClickSettings}
        onClickPrint={this.handleClickPrint}
        ref="header" />
    );
  }

  renderSubNav() {
    return (
      <SubNav
        activeDays={this.props.chartPrefs.trends.activeDays}
        activeDomain={this.props.chartPrefs.trends.activeDomain}
        extentSize={this.props.chartPrefs.trends.extentSize}
        domainClickHandlers={{
         '1 week': this.handleClickOneWeek,
         '2 weeks': this.handleClickTwoWeeks,
         '4 weeks': this.handleClickFourWeeks
        }}
        onClickDay={this.toggleDay}
        toggleWeekdays={this.toggleWeekdays}
        toggleWeekends={this.toggleWeekends}
        ref="subnav" />
    );
  }

  renderChart() {
    return (
      <TrendsContainer
        activeDays={this.props.chartPrefs.trends.activeDays}
        bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
        currentPatientInViewId={this.props.currentPatientInViewId}
        extentSize={this.props.chartPrefs.trends.extentSize}
        initialDatetimeLocation={this.props.initialDatetimeLocation}
        loading={this.props.loading}
        mostRecentDatetimeLocation={this.props.mostRecentDatetimeLocation}
        queryDataCount={this.props.queryDataCount}
        showingSmbg={this.props.chartPrefs.trends.showingSmbg}
        showingCbg={this.props.chartPrefs.trends.showingCbg}
        cbgFlags={this.props.chartPrefs.trends.cbgFlags}
        focusedCbgDateTrace={this.props.chartPrefs.trends.focusedCbgDateTrace}
        focusedCbgSlice={this.props.chartPrefs.trends.focusedCbgSlice}
        focusedCbgSliceKeys={this.props.chartPrefs.trends.focusedCbgSliceKeys}
        focusedSmbg={this.props.chartPrefs.trends.focusedSmbg}
        focusedSmbgRangeAvg={this.props.chartPrefs.trends.focusedSmbgRangeAvg}
        showingCbgDateTraces={this.props.chartPrefs.trends.showingCbgDateTraces}
        touched={this.props.chartPrefs.trends.touched}
        smbgRangeOverlay={this.props.chartPrefs.trends.smbgRangeOverlay}
        smbgGrouped={this.props.chartPrefs.trends.smbgGrouped}
        smbgLines={this.props.chartPrefs.trends.smbgLines}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        // data
        data={this.props.data}
        // handlers
        onDatetimeLocationChange={this.handleDatetimeLocationChange}
        onSelectDate={this.handleSelectDate}
        onSwitchBgDataSource={this.toggleBgDataSource}
        markTrendsViewed={this.markTrendsViewed}
        focusCbgDateTrace={this.handleFocusCbgDateTrace}
        unfocusCbgDateTrace={this.handleFocusCbgDateTrace.bind(this, null)}
        focusCbgSlice={this.handleFocusCbgSlice}
        unfocusCbgSlice={this.handleFocusCbgSlice.bind(this, null)}
        focusSmbg={this.handleFocusSmbg}
        unfocusSmbg={this.handleFocusSmbg.bind(this, null)}
        focusSmbgRange={this.handleFocusSmbgRange}
        unfocusSmbgRange={this.handleFocusSmbgRange.bind(this, null)}
        unfocusSmbgRangeAvg={_.noop}
        ref="chart"
      />
    );
  }

  renderFocusedCbgDateTraceLabel() {
    const focusedCbgDateTrace = _.get(this.props, 'chartPrefs.trends.focusedCbgDateTrace');
    if (focusedCbgDateTrace) {
      return (
        <CBGDateTraceLabel focusedDateTrace={focusedCbgDateTrace} />
      );
    }
    return null;
  }

  renderFocusedRangeLabels() {
    const { chartPrefs: { trends: {
      showingCbg,
      showingSmbg,
      focusedCbgSliceKeys,
      focusedCbgSlice,
      focusedSmbgRangeAvg,
    } } } = this.props;

    if (showingCbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
          dataType={'cbg'}
          focusedKeys={focusedCbgSliceKeys}
          focusedSlice={focusedCbgSlice}
          timePrefs={_.get(this.props, 'data.timePrefs', {})} />
      );
    } else if (showingSmbg) {
      return (
        <FocusedRangeLabels
          bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
          dataType={'smbg'}
          focusedRange={focusedSmbgRangeAvg}
          timePrefs={_.get(this.props, 'data.timePrefs', {})} />
      );
    }
    return null;
  }

  renderFocusedSMBGPointLabel() {
    if (!this.props.chartPrefs.trends.showingSmbg) {
      return null;
    }
    return (
      <FocusedSMBGPointLabel
        bgPrefs={_.get(this.props, 'data.bgPrefs', {})}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        grouped={this.props.chartPrefs.trends.smbgGrouped}
        lines={this.props.chartPrefs.trends.smbgLines}
        focusedPoint={_.get(this.props, 'chartPrefs.trends.focusedSmbg')} />
    );
  }

  handleCopyTrendsClicked = () => {
    this.props.trackMetric('Clicked Copy Settings', { source: 'Trends' });
  };
});

export default Trends;
