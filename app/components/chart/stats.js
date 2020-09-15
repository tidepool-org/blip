import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents } from '@tidepool/viz';

const { Stat } = vizComponents;

const Stats = (props) => {
  const {
    bgPrefs,
    chartPrefs: { animateStats },
    stats,
  } = props;

  const renderStats = (stats, animate) => (_.map(stats, stat => (
    <div id={`Stat--${stat.id}`} key={stat.id}>
      <Stat animate={animate} bgPrefs={bgPrefs} {...stat} />
    </div>
  )));

  return (
    <div className="Stats">
      {renderStats(stats, animateStats)}
    </div>
  );
}

Stats.propTypes = {
  bgPrefs: PropTypes.object.isRequired,
  chartPrefs: PropTypes.object.isRequired,
  stats: PropTypes.array.isRequired,
};

export default Stats;
