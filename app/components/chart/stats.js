import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents } from '@tidepool/viz';
import { useLocalStorage } from '../../core/hooks';

const { Stat } = vizComponents;

const Stats = (props) => {
  const {
    bgPrefs,
    chartPrefs,
    chartType,
    stats,
    persistState,
  } = props;

  const [statsCollapsedState, setStatsCollapsedState] = useLocalStorage('statsCollapsedState', {});

  function handleCollapse (id, collapsed) {
    if (persistState) setStatsCollapsedState({
      ...statsCollapsedState,
      [chartType]: {
        ...statsCollapsedState[chartType],
        [id]: collapsed,
      }
    });
  }

  const renderStats = (stats, animate) => (_.map(stats, stat => (
    <div id={`Stat--${stat.id}`} key={stat.id}>
      <Stat
        animate={animate}
        bgPrefs={bgPrefs}
        onCollapse={handleCollapse.bind(null, stat.id)}
        isOpened={stat.collapsible ? !statsCollapsedState[chartType]?.[stat.id] : true}
        {...stat}
      />
    </div>
  )));

  return (
    <div className="Stats">
      {renderStats(stats, chartPrefs.animateStats)}
    </div>
  );
}

Stats.propTypes = {
  bgPrefs: PropTypes.object.isRequired,
  chartPrefs: PropTypes.object.isRequired,
  chartType: PropTypes.string,
  persistState: PropTypes.bool,
  stats: PropTypes.array.isRequired,
};

Stats.defaultProps = {
  persistState: true,
};

export default Stats;
