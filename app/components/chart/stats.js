import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import set from 'lodash/set';
import map from 'lodash/map';
import find from 'lodash/find';
import keys from 'lodash/keys';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { bankersRound, reconcileTIRPercentages } = vizUtils.stat;
import { useLocalStorage } from '../../core/hooks';
import utils from '../../core/utils';

const { Stat } = vizComponents;

const reconcileTIRDatumValues = (timeInRanges) => {
  const props = cloneDeep(timeInRanges);
  const chartData = cloneDeep(props.data.data);

  const ranges = {};
  const total = props.data?.total?.value;

  forEach(chartData, datum => {
    if (['veryLow', 'low', 'target', 'high', 'veryHigh'].includes(datum.id)) {
      ranges[datum.id] = datum.value / total;
    }
  });

  const reconciledTimeInRanges = reconcileTIRPercentages(ranges);

  const rangeKeys = keys(reconciledTimeInRanges);
  forEach(rangeKeys, key => {
    const datum = find(props.data.data, datum => datum.id === key);
    datum.value = reconciledTimeInRanges[key] * 100;
  });

  set(props, ['data', 'total', 'value'], 100);

  return props;
};

const Stats = (props) => {
  const {
    bgPrefs,
    chartPrefs,
    chartType,
    persistState,
    stats,
    trackMetric,
  } = props;

  const [statsCollapsedState, setStatsCollapsedState] = useLocalStorage('statsCollapsedState', {});

  function handleCollapse (id, collapsed) {
    if (persistState) {
      setStatsCollapsedState({
        ...statsCollapsedState,
        [chartType]: {
          ...statsCollapsedState[chartType],
          [id]: collapsed,
        }
      });

      trackMetric(`Click ${collapsed ? 'collapsed' : 'expanded'} - ${utils.readableChartName(chartType)} - ${utils.readableStatName(id)}`);
    }
  }

  return (
    <div className="Stats">
      {map(stats, statProps => {
        const isTIRStat = ['timeInRange', 'readingsInRange'].includes(statProps.id);
        const stat = isTIRStat ? reconcileTIRDatumValues(statProps) : statProps;

        return (
          <div id={`Stat--${stat.id}`} key={stat.id}>
            <Stat
              animate={chartPrefs.animateStats}
              bgPrefs={bgPrefs}
              onCollapse={handleCollapse.bind(null, stat.id)}
              isOpened={stat.collapsible ? !statsCollapsedState[chartType]?.[stat.id] : true}
              {...stat}
              title={stat.collapsible && statsCollapsedState[chartType]?.[stat.id]
                ? get(stat, 'collapsedTitle', stat.title)
                : stat.title
              }
            />
          </div>
        );
      })}
    </div>
  );
}

Stats.propTypes = {
  bgPrefs: PropTypes.object.isRequired,
  chartPrefs: PropTypes.object.isRequired,
  chartType: PropTypes.string,
  persistState: PropTypes.bool,
  stats: PropTypes.array.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

Stats.defaultProps = {
  persistState: true,
};

export default Stats;
