import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';

import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { Stat } = vizComponents;
const { commonStats, getStatData, getStatDefinition } = vizUtils.stat;
const { reshapeBgClassesToBgBounds } = vizUtils.bg;

class Stats extends Component {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object,
    chartType: PropTypes.oneOf(['basics', 'daily', 'weekly', 'trends']).isRequired,
    endpoints: PropTypes.arrayOf(PropTypes.string),
    dataUtil: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stats');

    this.bgPrefs = {
      bgUnits: this.props.bgPrefs.bgUnits,
      bgBounds: reshapeBgClassesToBgBounds(this.props.bgPrefs),
    };

    this.dataFetchMethods = {
      [commonStats.averageBg]: 'getAverageBgData',
      [commonStats.averageDailyCarbs]: 'getAverageDailyCarbsData',
      [commonStats.coefficientOfVariation]: 'getCoefficientOfVariationData',
      [commonStats.glucoseManagementIndex]: 'getGlucoseManagementIndexData',
      [commonStats.readingsInRange]: 'getReadingsInRangeData',
      [commonStats.standardDev]: 'getStandardDevData',
      [commonStats.timeInAuto]: 'getTimeInAutoData',
      [commonStats.timeInRange]: 'getTimeInRangeData',
      [commonStats.totalInsulin]: 'getTotalInsulinData',
    }

    this.state = {
      stats: this.getStatsByChartType(),
    };
  }

  componentWillReceiveProps = nextProps => {
    const {
      chartPrefs,
      chartType,
      dataUtil,
      endpoints,
    } = nextProps;

    if (this.updateRequired(nextProps)) {
      dataUtil.endpoints = endpoints;
      dataUtil.chartPrefs = chartPrefs[chartType];

      const stats = this.state.stats;

      _.each(stats, (stat, i) => {
        stats[i].data = getStatData(dataUtil[this.dataFetchMethods[stat.id]](), stat.id);
      });

      this.setState(stats);
    }
  };

  shouldComponentUpdate = nextProps => {
    return this.updateRequired(nextProps);
  };

  updateRequired = nextProps => {
    const {
      chartPrefs,
      endpoints,
    } = nextProps;

    const endpointsChanged = endpoints && !_.isEqual(endpoints, this.props.endpoints);
    const chartPrefsChanged = chartPrefs && !_.isEqual(chartPrefs, this.props.chartPrefs);

    return endpointsChanged || chartPrefsChanged;
  };

  renderStats = (stats) => (_.map(stats, (stat, i) => (<Stat key={i} bgPrefs={this.bgPrefs} {...stat} />)));

  render = () => {
    console.log('this.state.stats', this.state.stats);
    return (
      <div className="Stats">
        {this.renderStats(this.state.stats)}
      </div>
    );
  };

  getStatsByChartType = () => {
    const {
      chartPrefs,
      chartType,
      dataUtil,
      endpoints,
    } = this.props;

    const stats = [];

    // Set dataUtil endpoints and chartPrefs
    dataUtil.endpoints = endpoints;
    dataUtil.chartPrefs = chartPrefs[chartType];

    switch (chartType) {
      case 'basics':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInAuto]](), commonStats.timeInAuto));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.totalInsulin]](), commonStats.totalInsulin));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.standardDev]](), commonStats.standardDev));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.coefficientOfVariation]](), commonStats.coefficientOfVariation));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.glucoseManagementIndex]](), commonStats.glucoseManagementIndex));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageDailyCarbs]](), commonStats.averageDailyCarbs));
        break;

      case 'daily':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInAuto]](), commonStats.timeInAuto));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.totalInsulin]](), commonStats.totalInsulin));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.standardDev]](), commonStats.standardDev));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.coefficientOfVariation]](), commonStats.coefficientOfVariation));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.glucoseManagementIndex]](), commonStats.glucoseManagementIndex));
        break;

    case 'weekly':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.standardDev]](), commonStats.standardDev));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.coefficientOfVariation]](), commonStats.coefficientOfVariation));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.glucoseManagementIndex]](), commonStats.glucoseManagementIndex));
        break;

    case 'trends':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.standardDev]](), commonStats.standardDev));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.coefficientOfVariation]](), commonStats.coefficientOfVariation));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.glucoseManagementIndex]](), commonStats.glucoseManagementIndex));
        break;
    }

    return stats;
  }
};

export default Stats
