import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';
import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { Stat } = vizComponents;
const { commonStats, getStatAnnotations, getStatData, getStatDefinition } = vizUtils.stat;
const { reshapeBgClassesToBgBounds } = vizUtils.bg;
const { isAutomatedBasalDevice: isAutomatedBasalDeviceCheck } = vizUtils.device;

class Stats extends Component {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object,
    chartType: PropTypes.oneOf(['basics', 'daily', 'weekly', 'trends']).isRequired,
    dataUtil: PropTypes.object.isRequired,
    endpoints: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
    this.log = bows('Stats');

    this.bgPrefs = {
      bgUnits: this.props.bgPrefs.bgUnits,
      bgBounds: reshapeBgClassesToBgBounds(this.props.bgPrefs),
    };

    this.dataFetchMethods = {
      [commonStats.averageGlucose]: 'getAverageGlucoseData',
      [commonStats.averageDailyCarbs]: 'getAverageDailyCarbsData',
      [commonStats.coefficientOfVariation]: 'getCoefficientOfVariationData',
      [commonStats.glucoseManagementIndicator]: 'getGlucoseManagementIndicatorData',
      [commonStats.readingsInRange]: 'getReadingsInRangeData',
      [commonStats.sensorUsage]: 'getSensorUsage',
      [commonStats.standardDev]: 'getStandardDevData',
      [commonStats.timeInAuto]: 'getTimeInAutoData',
      [commonStats.timeInRange]: 'getTimeInRangeData',
      [commonStats.totalInsulin]: 'getTotalInsulinData',
    }

    this.updateDataUtilEndpoints(this.props);

    this.state = {
      stats: this.getStatsByChartType(this.props),
    };
  }

  componentWillReceiveProps = nextProps => {
    const update = this.updatesRequired(nextProps);
    if (update) {
      if (update.stats) {
        this.setState({
          stats: this.getStatsByChartType(nextProps)
        });
      } else if (update.endpoints) {
        this.updateDataUtilEndpoints(nextProps);
        this.updateStatData(nextProps);
      } else if (update.activeDays) {
        this.updateStatData(nextProps);
      }
    }
  };

  shouldComponentUpdate = nextProps => {
    return this.updatesRequired(nextProps);
  };

  updatesRequired = nextProps => {
    const {
      bgSource,
      chartPrefs,
      chartType,
      endpoints,
    } = nextProps;

    const { activeDays } = chartPrefs[chartType];

    const activeDaysChanged = activeDays && !_.isEqual(activeDays, this.props.chartPrefs[chartType].activeDays);
    const bgSourceChanged = bgSource && !_.isEqual(bgSource, this.props.bgSource);
    const endpointsChanged = endpoints && !_.isEqual(endpoints, this.props.endpoints);

    return activeDaysChanged || bgSourceChanged || endpointsChanged
      ? {
        activeDays: activeDaysChanged,
        endpoints: endpointsChanged,
        stats: bgSourceChanged,
      }
      : false;
  };

  renderStats = (stats) => (_.map(stats, (stat) => (<Stat key={stat.id} bgPrefs={this.bgPrefs} {...stat} />)));

  render = () => {
    console.log('stats', this.state.stats);
    return (
      <div className="Stats">
        {this.renderStats(this.state.stats)}
      </div>
    );
  };

  getStatsByChartType = (props = this.props) => {
    const {
      chartType,
      dataUtil,
      bgSource,
    } = props;

    const { manufacturer, deviceModel } = dataUtil.latestPump;
    const isAutomatedBasalDevice = isAutomatedBasalDeviceCheck(manufacturer, deviceModel);

    const stats = [];

    const addStat = statType => {
      stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[statType]](), statType, {
        manufacturer,
      }));
    };

    const cbgSelected = bgSource === 'cbg';
    const smbgSelected = bgSource === 'smbg';
    const hasBgData = dataUtil.bgSources[bgSource];

    switch (chartType) {
      case 'basics':
        cbgSelected && addStat(commonStats.sensorUsage);
        cbgSelected && addStat(commonStats.glucoseManagementIndicator);
        addStat(commonStats.averageGlucose);
        cbgSelected && hasBgData && addStat(commonStats.timeInRange);
        smbgSelected && hasBgData && addStat(commonStats.readingsInRange);
        addStat(commonStats.standardDev);
        addStat(commonStats.coefficientOfVariation);
        addStat(commonStats.averageDailyCarbs);
        isAutomatedBasalDevice && addStat(commonStats.timeInAuto);
        addStat(commonStats.totalInsulin);
        break;

      case 'daily':
        cbgSelected && addStat(commonStats.sensorUsage);
        addStat(commonStats.averageGlucose);
        cbgSelected && hasBgData && addStat(commonStats.timeInRange);
        smbgSelected && hasBgData && addStat(commonStats.readingsInRange);
        cbgSelected && addStat(commonStats.standardDev);
        cbgSelected && addStat(commonStats.coefficientOfVariation);
        isAutomatedBasalDevice && addStat(commonStats.timeInAuto);
        addStat(commonStats.totalInsulin);
        break;

      case 'weekly':
        addStat(commonStats.averageGlucose);
        addStat(commonStats.readingsInRange);
        addStat(commonStats.standardDev);
        addStat(commonStats.coefficientOfVariation);
        break;

      case 'trends':
        cbgSelected && addStat(commonStats.sensorUsage);
        cbgSelected && addStat(commonStats.glucoseManagementIndicator);
        addStat(commonStats.averageGlucose);
        cbgSelected && hasBgData && addStat(commonStats.timeInRange);
        smbgSelected && hasBgData && addStat(commonStats.readingsInRange);
        addStat(commonStats.standardDev);
        addStat(commonStats.coefficientOfVariation);
        break;
    }

    return stats;
  };

  updateDataUtilEndpoints = props => {
    const {
      dataUtil,
      endpoints,
    } = props;

    dataUtil.endpoints = endpoints;
  };

  updateStatData = props => {
    const { dataUtil } = props;
    const stats = this.state.stats;

    _.each(stats, (stat, i) => {
      const data = dataUtil[this.dataFetchMethods[stat.id]]();
      console.log('data', data);
      stats[i].data = getStatData(data, stat.id, {
        manufacturer: dataUtil.latestPump.manufacturer,
      });
      stats[i].annotations = getStatAnnotations(data, stat.id);
    });

    this.setState(stats);
  };
};

export default Stats
