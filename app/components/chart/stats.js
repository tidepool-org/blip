import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';
import { utils as vizUtils, components as vizComponents } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { Stat } = vizComponents;

const {
  commonStats,
  getStatAnnotations,
  getStatData,
  getStatDefinition,
  getStatTitle,
  statFetchMethods,
} = vizUtils.stat;

const { reshapeBgClassesToBgBounds } = vizUtils.bg;
const { isAutomatedBasalDevice: isAutomatedBasalDeviceCheck } = vizUtils.device;

class Stats extends Component {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object,
    chartType: PropTypes.oneOf(['basics', 'daily', 'bgLog', 'trends']).isRequired,
    dataUtil: PropTypes.object.isRequired,
    endpoints: PropTypes.arrayOf(PropTypes.string),
    onAverageDailyDoseInputChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stats');

    this.bgPrefs = {
      bgUnits: this.props.bgPrefs.bgUnits,
      bgBounds: reshapeBgClassesToBgBounds(this.props.bgPrefs),
    };

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

  renderStats = (stats, animate) => (_.map(stats, stat => (
    <div id={`Stat--${stat.id}`} key={stat.id}>
      <Stat animate={animate} bgPrefs={this.bgPrefs} {...stat} />
    </div>
  )));

  render = () => {
    const { chartPrefs: { animateStats } } = this.props;

    return (
      <div className="Stats">
        {this.renderStats(this.state.stats, animateStats)}
      </div>
    );
  };

  getStatsByChartType = (props = this.props) => {
    const {
      chartType,
      dataUtil,
      bgSource,
    } = props;

    const { bgBounds, bgUnits, days, latestPump } = dataUtil;
    const { manufacturer, deviceModel } = latestPump;
    const isAutomatedBasalDevice = isAutomatedBasalDeviceCheck(manufacturer, deviceModel);

    const stats = [];

    const addStat = statType => {
      const chartStatOpts = _.get(props, ['chartPrefs', chartType, statType]);

      const stat = getStatDefinition(dataUtil[statFetchMethods[statType]](), statType, {
        bgSource,
        days,
        bgPrefs: {
          bgBounds,
          bgUnits,
        },
        manufacturer,
        ...chartStatOpts,
      });

      if (statType === 'averageDailyDose' && _.isFunction(props.onAverageDailyDoseInputChange)) {
        stat.onInputChange = props.onAverageDailyDoseInputChange;
      }

      stats.push(stat);
    };

    const cbgSelected = bgSource === 'cbg';
    const smbgSelected = bgSource === 'smbg';

    switch (chartType) {
      case 'basics':
        cbgSelected && addStat(commonStats.timeInRange);
        smbgSelected && addStat(commonStats.readingsInRange);
        addStat(commonStats.averageGlucose);
        cbgSelected && addStat(commonStats.sensorUsage);
        addStat(commonStats.totalInsulin);
        isAutomatedBasalDevice && addStat(commonStats.timeInAuto);
        addStat(commonStats.carbs);
        addStat(commonStats.averageDailyDose);
        cbgSelected && addStat(commonStats.glucoseManagementIndicator);
        break;

      case 'daily':
        cbgSelected && addStat(commonStats.timeInRange);
        smbgSelected && addStat(commonStats.readingsInRange);
        addStat(commonStats.averageGlucose);
        addStat(commonStats.totalInsulin);
        isAutomatedBasalDevice && addStat(commonStats.timeInAuto);
        addStat(commonStats.carbs);
        cbgSelected && addStat(commonStats.standardDev);
        cbgSelected && addStat(commonStats.coefficientOfVariation);
        break;

      case 'bgLog':
        addStat(commonStats.readingsInRange);
        addStat(commonStats.averageGlucose);
        addStat(commonStats.standardDev);
        addStat(commonStats.coefficientOfVariation);
        break;

      case 'trends':
        cbgSelected && addStat(commonStats.timeInRange);
        smbgSelected && addStat(commonStats.readingsInRange);
        addStat(commonStats.averageGlucose);
        cbgSelected && addStat(commonStats.sensorUsage);
        cbgSelected && addStat(commonStats.glucoseManagementIndicator);
        addStat(commonStats.standardDev);
        addStat(commonStats.coefficientOfVariation);
        break;
    }

    this.log('stats', stats);

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
    const { bgSource, dataUtil } = props;
    const stats = this.state.stats;

    const { bgBounds, bgUnits, days, latestPump } = dataUtil;
    const { manufacturer } = latestPump;

    _.each(stats, (stat, i) => {
      const data = dataUtil[statFetchMethods[stat.id]]();
      const opts = {
        bgSource: bgSource,
        bgPrefs: {
          bgBounds,
          bgUnits,
        },
        days,
        manufacturer,
      };

      stats[i].data = getStatData(data, stat.id, opts);
      stats[i].annotations = getStatAnnotations(data, stat.id, opts);
      stats[i].title = getStatTitle(stat.id, opts);
    });


    this.log('stats', stats);

    this.setState({ stats });
  };
};

export default Stats
