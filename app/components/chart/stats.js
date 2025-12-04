import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import map from 'lodash/map';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { reconcileTIRDatumValues } = vizUtils.stat;
import { useLocalStorage } from '../../core/hooks';
import utils from '../../core/utils';

const { Stat } = vizComponents;

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
