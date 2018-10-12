import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';

import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

const { Stat } = vizComponents;
const { commonStats, getStatData, getStatDefinition } = vizUtils.stat;
const { reshapeBgClassesToBgBounds } = vizUtils.bg;

class Stats extends PureComponent {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
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
      [commonStats.averageBg]:'getAverageBgData',
      [commonStats.averageDailyCarbs]:'getAverageDailyCarbsData',
      [commonStats.readingsInRange]:'getReadingsInRangeData',
      [commonStats.timeInAuto]:'getTimeInAutoData',
      [commonStats.timeInRange]:'getTimeInRangeData',
      [commonStats.totalInsulin]:'getTotalInsulinData',
    }

    this.stats = this.getStatsByChartType();
  }

  componentWillReceiveProps = nextProps => {
    const {
      dataUtil,
      endpoints,
    } = nextProps;

    const endpointsChanged = endpoints && (
      _.get(this.props, 'endpoints.0') !== endpoints[0] || _.get(this.props, 'endpoints.1') !== endpoints[1]
    );

    if (endpointsChanged) {
      dataUtil.endpoints = endpoints;

      _.each(this.stats, (stat, i) => {
        this.stats[i].data = getStatData(dataUtil[this.dataFetchMethods[stat.id]](), stat.id);
      });
    }
  };

  renderStats = (stats) => (_.map(stats, (stat, i) => (stat.data.data && <Stat key={i} bgPrefs={this.bgPrefs} {...stat} />)));

  render = () => {
    console.log('this.stats', this.stats);
    return (
      <div className="Stats">
        {this.renderStats(this.stats)}
      </div>
    );
  };

  getStatsByChartType = () => {
    const {
      chartType,
      dataUtil,
      endpoints,
    } = this.props;

    const stats = [];

    // Set dataUtil endpoints
    dataUtil.endpoints = endpoints;

    switch (chartType) {
      case 'basics':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.totalInsulin]](), commonStats.totalInsulin));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInAuto]](), commonStats.timeInAuto));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageDailyCarbs]](), commonStats.averageDailyCarbs));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        break;

      case 'daily':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.totalInsulin]](), commonStats.totalInsulin));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInAuto]](), commonStats.timeInAuto));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        break;

      case 'weekly':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        break;

      case 'trends':
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.timeInRange]](), commonStats.timeInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.readingsInRange]](), commonStats.readingsInRange));
        stats.push(getStatDefinition(dataUtil[this.dataFetchMethods[commonStats.averageBg]](), commonStats.averageBg));
        break;
    }

    return stats;
  }
};

export default Stats
