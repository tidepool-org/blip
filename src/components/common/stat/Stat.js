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
  const { type, title } = props;
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
  let barSpacing;
  let chartHeight;
  let domain;
  let padding;

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
      domain = { y: [0, props.data.length], x: [0, 1] };
      barSpacing = chartProps.barSpacing || 6;
      chartHeight = chartProps.chartHeight;

      if (chartHeight > 0) {
        barWidth = ((chartHeight - barSpacing) / props.data.length) - (barSpacing / 2);
      } else {
        barWidth = chartProps.barWidth || 24;
        chartHeight = (barWidth + barSpacing) * props.data.length;
      }

      padding = { top: barWidth / 2, bottom: barWidth / 2 * -1 };

      _.assign(chartProps, {
        alignment: 'middle',
        containerComponent: <VictoryContainer
          responsive={false}
        />,
        cornerRadius: { top: 2, bottom: 2 },
        dataComponent: <HoverBar />,
        domain,
        height: chartHeight,
        horizontal: true,
        labelComponent: <HoverBarLabel domain={domain} />,
        padding,
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
  type: statTypes.barHorizontal.type,
  chartHeight: 0,
};

Stat.propTypes = {
  categories: PropTypes.object,
  data: PropTypes.array.isRequired,
  chartHeight: PropTypes.number,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(_.keys(statTypes)),
};

export default Stat;
