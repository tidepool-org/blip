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
import { VictoryBar, VictoryContainer } from 'victory';
import { Collapse } from 'react-collapse';
import { formatPercentage } from '../../../utils/format';
import styles from './Stat.css';
import cx from 'classnames';
import HoverBar, { SizedHoverLabel } from './HoverBar';
import CollapseIconOpen from './assets/expand-more-24-px.svg';
import CollapseIconClose from './assets/chevron-right-24-px.svg';

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
  simple: 'simple',
};

class Stat extends React.PureComponent {
  static propTypes = {
    categories: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.shape(
      {
        name: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }
    )).isRequired,
    chartHeight: PropTypes.number,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(_.keys(statTypes)),
    collapsible: PropTypes.bool,
    isOpened: PropTypes.bool,
    primaryStat: PropTypes.string,
  };

  static defaultProps = {
    categories: {},
    type: statTypes.barHorizontal.type,
    chartHeight: 0,
    collapsible: true,
    isOpened: true,
    primaryStat: '',
  };

  constructor(props) {
    super(props);
    this.log = bows('Stat');

    this.state = {
      isOpened: props.isOpened,
      isCollapsible: props.collapsible,
    };

    this.setChartProps(props);
  }

  toggleIsOpened = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  }

  componentWillUpdate(nextProps) {
    this.setChartProps(nextProps);
  }

  renderCollapsible = (size) => (
    <Collapse
      isOpened={this.state.isOpened}
      springConfig={{ stiffness: 200, damping: 23 }}
    >
      {this.renderChart(size)}
    </Collapse>
  );

  renderChart = (size) => (
    <div className={styles.chartContainer}>
      <this.chartRenderer {...this.chartProps} ref={this.setChartRef} width={size.width} />
    </div>
  );

  render() {
    const statOuterClasses = cx({
      [styles.Stat]: true,
      [styles[this.props.type]]: true,
    });

    return (
      <div className={statOuterClasses}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>{this.props.title}</div>
          {this.state.isCollapsible && (
            <div className={styles.chartCollapse}>
              <img
                className
                src={this.state.isOpened ? CollapseIconOpen : CollapseIconClose}
                onClick={this.toggleIsOpened}
              />
            </div>
          )}
        </div>
        {this.chartRenderer && <SizeMe render={({ size }) => (
          this.state.isCollapsible ? this.renderCollapsible(size) : this.renderChart(size)
        )} />}
      </div>
    );
  }

  setChartProps(props) {
    const { type, ...rest } = props;
    let chartRenderer = VictoryBar;
    const chartProps = _.defaults({
      animate: { duration: 300, onLoad: { duration: 300 } },
      labels: d => formatPercentage(d.y),
      primaryStat: props.primaryStat || _.get(props.data, [0, 'name']),
      style: {
        data: {
          fill: d => colors[d.name],
        },
      },
    }, rest);

    let barWidth;
    let barSpacing;
    let chartHeight;
    let domain;
    let padding;

    switch (type) {
      case 'simple':
        this.setState({
          isCollapsible: false,
        });
        chartRenderer = null;
        break;

      case 'barHorizontal':
      default:
        this.setState({
          isCollapsible: true,
        });

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
          labelComponent: <SizedHoverLabel domain={domain} />,
          padding,
          style: {
            data: {
              fill: d => colors[d.name],
              width: () => barWidth,
            },
            labels: {
              fill: d => colors[d.name],
              fontSize: barWidth,
              fontWeight: 600,
              paddingLeft: 70,
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
