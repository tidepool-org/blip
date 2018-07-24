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
import bows from 'bows';
import { SizeMe } from 'react-sizeme';
import { Line, VictoryBar, VictoryContainer, VictoryPie } from 'victory';
import { VictoryLine } from 'victory-chart';
import { formatPercentage } from '../../../utils/format';
import styles from './Stat.css';
import cx from 'classnames';
import HoverBar, { SizedHoverLabel } from './HoverBar';

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

// const Stat = (props) => {
class Stat extends React.PureComponent {
  static propTypes = {
    categories: PropTypes.object,
    data: PropTypes.array.isRequired,
    chartHeight: PropTypes.number,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(_.keys(statTypes)),
  };

  static defaultProps = {
    categories: {},
    type: statTypes.barHorizontal.type,
    chartHeight: 0,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stat');

    this.setChartProps(props);
  }

  componentWillUpdate(nextProps) {
    this.setChartProps(nextProps);
  }

  render() {
    this.log('rendering');
    const statOuterClasses = cx({
      [styles.Stat]: true,
      [styles[this.props.type]]: true,
    });

    return (
      <div className={statOuterClasses}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>{this.props.title}</div>
        </div>
        <SizeMe render={({ size }) => <div><this.chartRenderer {...this.chartProps} ref={this.setChartRef} width={size.width} /></div>} />
      </div>
    );
  }

  setChartProps(props) {
    const { type, ...rest } = props;
    let chartRenderer = VictoryBar;
    const chartProps = _.defaults({
      animate: { duration: 300, onLoad: { duration: 300 } },
      labels: d => formatPercentage(d.y),
      style: {
        data: {
          fill: d => colors[d.type],
        },
      },
    }, rest);

    let barWidth;
    let barSpacing;
    let chartHeight;
    let domain;
    let padding;

    switch (type) {
      case 'pie':
        chartRenderer = VictoryPie;
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
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { top: 2, bottom: 2 },
          dataComponent: <HoverBar domain={domain} barWidth={barWidth} />,
          domain,
          height: chartHeight,
          horizontal: true,
          labelComponent: <SizedHoverLabel onSize={(size) => console.log(size)} domain={domain} />,
          padding,
          style: {
            data: {
              fill: d => colors[d.type],
              width: () => barWidth,
            },
            labels: {
              fill: d => colors[d.type],
              fontSize: barWidth,
              fontWeight: 600,
            },
          },
        });
        break;
    }
    this.chartProps = chartProps;
    this.setChartRenderer(chartRenderer);
  }

  setChartRef = (element) => {
    this.chartRef = element;
  }

  setChartRenderer(chartRenderer) {
    this.chartRenderer = chartRenderer;
  }
}

export default Stat;
