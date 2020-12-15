/**
 * Copyright (c) 2020, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// @ts-ignore
import styles from './Stat.css';

/**
 * Like BgBar without bars
 * @param {{data: {id: string, value: number, valueString: string, units: string, title: string}[], id: string}} props
 */
function NoBar(props) {
  const { data, id } = props;
  const total = data.reduce((p, c) => p + Math.max(c.value, 0), 0);
  const percent = (v) => Number.isFinite(total) && total > 0 ? Math.round(100 * v / total).toString(10) : '--';

  const elements = [];
  data.forEach((v) => {
    elements.push(
      <span
        key={`${v.id}-title`}
        id={`nobar-${id}-${v.id}-title`}
        className={`${styles.nobarRowTitle} ${styles[`nobar-${id}-${v.id}`]}`}>
          {v.title}
      </span>
    );
    elements.push(
      <span
        key={`${v.id}-value`}
        id={`nobar-${id}-${v.id}-value`}
        className={`${styles.nobarRowValue} ${styles[`nobar-${id}-${v.id}`]}`}>
          { v.value > 0 ? v.valueString : '0' }
          &nbsp;
          {v.units}
      </span>
    );
    elements.push(
      <div
        key={`${v.id}-percent`}
        id={`nobar-${id}-${v.id}-percent`}
        className={`${styles.nobarRowPercent} ${styles[`nobar-${id}-${v.id}`]}`}>
          <span className={styles.nobarPercentValue}>{percent(Math.max(v.value, 0))}</span>
          <span className={styles.nobarPercentUnits}>%</span>
      </div>
    );
  });
  return (
    <div id={`nobar-${id}`} className={`${styles.nobar} ${styles[`nobar-${id}`]}`}>
      {elements}
    </div>
  );
}

NoBar.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    valueString: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  id: PropTypes.string.isRequired,
};

export default NoBar;
