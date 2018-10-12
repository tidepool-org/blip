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
    chartType: PropTypes.oneOf(['daily', 'weekly', 'trends']).isRequired,
    endpoints: PropTypes.arrayOf(PropTypes.string),
    dataUtil: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stats');

    this.bgPrefs = {
      bgUnits: this.props.bgPrefs.bgUnits,
      bgBounds: reshapeBgClassesToBgBounds(this.props.bgPrefs),
    };

    this.dataFetchMethods = {
      readingsInRange:'getReadingsInRangeData',
      timeInAuto:'getTimeInAutoData',
      timeInRange:'getTimeInRangeData',
      totalInsulin:'getTotalInsulinData',
    }

    this.stats = this.getStatsByChartType();
  }

  componentWillReceiveProps = nextProps => {
    const {
      dataUtil,
      endpoints,
    } = nextProps;

    if (dataUtil && this.props.endpoints !== endpoints) {
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

    if (dataUtil) {
      // Update dataUtil endpoints
      dataUtil.endpoints = endpoints;

      switch (chartType) {
        case 'daily':
          stats.push(getStatDefinition(dataUtil.getTimeInRangeData(), commonStats.timeInRange));
          stats.push(getStatDefinition(dataUtil.getReadingsInRangeData(), commonStats.readingsInRange));
          stats.push(getStatDefinition(dataUtil.getTotalInsulinData(), commonStats.totalInsulin));
          stats.push(getStatDefinition(dataUtil.getTimeInAutoData(), commonStats.timeInAuto));
          break;

        case 'weekly':
          stats.push(getStatDefinition(dataUtil.getTimeInRangeData(), commonStats.timeInRange));
          stats.push(getStatDefinition(dataUtil.getReadingsInRangeData(), commonStats.readingsInRange));
          break;
      }
    }

    return stats;
  }
};

export default Stats
