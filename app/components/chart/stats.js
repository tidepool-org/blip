import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';

import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

const { Stat } = vizComponents;
const { commonStats, getStatDefinition } = vizUtils.stat;

class Stats extends PureComponent {
  static propTypes = {
    chartType: PropTypes.oneOf(['daily', 'weekly', 'trends']).isRequired,
    endpoints: PropTypes.arrayOf(PropTypes.string),
    dataUtil: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stats');
  }

  renderStats = (stats) => (_.map(stats, (stat, i) => <Stat key={i} {...stat} />));

  render = () => {
    const stats = this.getStatsByChartType();

    return (
      <div className="Stats">
        {this.renderStats(stats)}
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
          stats.push(getStatDefinition(dataUtil.getTotalInsulinData(), commonStats.totalInsulin));
          break;

          case 'weekly':
          stats.push(getStatDefinition(dataUtil.getTotalInsulinData(), commonStats.totalInsulin));
          break;
      }
    }

    return stats;
  }
};

export default Stats
