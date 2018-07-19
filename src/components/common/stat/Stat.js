/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';
import _ from 'lodash';
import dimensions from 'react-dimensions';
import { VictoryBar, VictoryContainer, VictoryPie } from 'victory';

import { formatPercentage } from '../../../utils/format';
import styles from './Stat.css';
import cx from 'classnames';
import HoverBar, { HoverBarLabel } from './HoverBar';

const colors = {
  basal: '#0096d1',
  basalAutomated: '#00e9fa',
  bolus: '#7ed1f2',
  veryLow: '#fb5951',
  low: '#f28684',
  target: '#76db9b',
  high: '#b49de3',
  veryHigh: '#8c65d6',
};

export const statTypes = {
  barHorizontal: 'barHorizontal',
  barVertical: 'barVertical',
  pie: 'pie',
};

const Stat = (props) => {
  const { type, title, chartHeight } = props;
  let ChartRenderer = VictoryBar;
  const chartProps = _.defaults({
    animate: { duration: 300, onLoad: { duration: 300 } },
    labels: d => formatPercentage(d.y),
    style: {
      data: {
        fill: d => colors[d.type],
      },
    },
  }, props);

  let barWidth;
  let domain;
  let topPadding;
  let barSpacing;

  switch (type) {
    case 'pie':
      ChartRenderer = VictoryPie;
      break;

    case 'barVertical':
      _.assign(chartProps, {
        cornerRadius: 4,
        maxDomain: { y: 1.0 },
        sortOrder: 'descending',
      });
      break;

    case 'barHorizontal':
    default:
      topPadding = 6;
      barSpacing = 6;
      barWidth = (((chartHeight - (topPadding * 2)) / props.data.length) - (barSpacing / 2));
      domain = { y: [0, props.data.length], x: [0, 1] };

      _.assign(chartProps, {
        alignment: 'middle',
        containerComponent: <VictoryContainer
          responsive={false}
        />,
        cornerRadius: { top: 4, bottom: 4 },
        dataComponent: <HoverBar />,
        domain,
        height: chartHeight,
        horizontal: true,
        labelComponent: <HoverBarLabel domain={domain} />,
        padding: { top: (barWidth / 2 + barSpacing / 2) + topPadding, bottom: -topPadding },
        style: {
          data: {
            fill: d => colors[d.type],
            width: () => barWidth,
          },
          labels: {
            fill: d => colors[d.type],
          },
        },
      });
      break;
  }

  const statOuterClasses = cx({
    [styles.Stat]: true,
    [styles[type]]: true,
  });

  const InnerChart = dimensions()((innerProps) => {
    const { containerWidth, ...rest } = innerProps;
    return <ChartRenderer width={containerWidth} {...rest} />;
  });

  return (
    <div className={statOuterClasses}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>{title}</div>
      </div>
      <InnerChart {...chartProps} />
    </div>
  );
};

Stat.defaultProps = {
  categories: {},
  chartHeight: 80,
  type: statTypes.barHorizontal.type,
};

Stat.propTypes = {
  categories: PropTypes.object,
  data: PropTypes.array.isRequired,
  chartHeight: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(_.keys(statTypes)),
};

export default Stat;
