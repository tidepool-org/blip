import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import set from 'lodash/set';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { formatDatum } = vizUtils.stat;
import { useLocalStorage } from '../../core/hooks';
import utils from '../../core/utils';

const { Stat } = vizComponents;

const transformTIRStats = (statProps) => {
  const props = cloneDeep(statProps);
  const chartData = cloneDeep(props.data.data);

  const veryLowIndex = chartData.findIndex(d => d.id === 'veryLow');
  const lowIndex = chartData.findIndex(d => d.id === 'low');
  const targetIndex = chartData.findIndex(d => d.id === 'target');
  const highIndex = chartData.findIndex(d => d.id === 'high');
  const veryHighIndex = chartData.findIndex(d => d.id === 'veryHigh');

  let { value: veryLowStr = '0' } = formatDatum(get(chartData, veryLowIndex, {}), props.dataFormat.label, props);
  let { value: lowStr = '0' } = formatDatum(get(chartData, lowIndex, {}), props.dataFormat.label, props);
  let { value: targetStr = '0' } = formatDatum(get(chartData, targetIndex, {}), props.dataFormat.label, props);
  let { value: highStr = '0' } = formatDatum(get(chartData, highIndex, {}), props.dataFormat.label, props);
  let { value: veryHighStr = '0' } = formatDatum(get(chartData, veryHighIndex, {}), props.dataFormat.label, props);

  let veryLow = parseInt(veryLowStr);
  let low = parseInt(lowStr);
  let target = parseInt(targetStr);
  let high = parseInt(highStr);
  let veryHigh = parseInt(veryHighStr);

  const sum = veryLow + low + target + high + veryHigh;

  // Sum should always be between 98 - 102%. If not, something weird happened;
  // We display the stats without modification to prevent compounding calculation errors
  if (sum > 102 || sum < 98) return props;

  const diff = 100 - sum;

  high += diff;

  set(props, ['data', 'data', veryLowIndex, 'value'], veryLow);
  set(props, ['data', 'data', lowIndex, 'value'], low);
  set(props, ['data', 'data', targetIndex, 'value'], target);
  set(props, ['data', 'data', highIndex, 'value'], high);
  set(props, ['data', 'data', veryHighIndex, 'value'], veryHigh);
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
        const stat = isTIRStat ? transformTIRStats(statProps) : statProps;

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
