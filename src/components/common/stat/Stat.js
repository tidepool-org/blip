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
import cx from 'classnames';
import { SizeMe } from 'react-sizeme';
import { VictoryBar, VictoryContainer } from 'victory';
import { Collapse } from 'react-collapse';
import { formatPercentage, formatInsulin } from '../../../utils/format';
import { formatDuration } from '../../../utils/datetime';
import { generateBgRangeLabels, classifyGmiValue } from '../../../utils/bloodglucose';
import { MGDL_UNITS } from '../../../utils/constants';
import styles from './Stat.css';
import HoverBar, { HoverBarLabel } from './HoverBar';
import CollapseIconOpen from './assets/expand-more-24-px.svg';
import CollapseIconClose from './assets/chevron-right-24-px.svg';
import MGDLIcon from './assets/mgdl-inv-24-px.svg';
import MMOLIcon from './assets/mgdl-inv-24-px.svg'; // TODO: Replace with mmol icon when avail

export const statColors = {
  basal: '#0096d1',
  basalAutomated: '#00e9fa',
  bolus: '#7ed1f2',
  totalInsulin: '#0096d1',
  veryLow: '#fb5951',
  low: '#f28684',
  target: '#76db9b',
  high: '#b49de3',
  veryHigh: '#8c65d6',
  white: '#ffffff',
  axis: '#e7e9ee',
  muted: '#c1c9d6',
};

export const statTypes = {
  barHorizontal: 'barHorizontal',
  simple: 'simple',
};

export const statFormats = {
  bgRange: 'bgRange',
  bgValue: 'bgValue',
  duration: 'duration',
  gmi: 'gmi',
  percentage: 'percentage',
  units: 'units',
};

const dataPathPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.array,
]);

class Stat extends React.PureComponent {
  static propTypes = {
    alwaysShowTooltips: PropTypes.bool,
    bgPrefs: PropTypes.shape({
      bgBounds: PropTypes.shape({
        veryHighThreshold: PropTypes.number.isRequired,
        targetUpperBound: PropTypes.number.isRequired,
        targetLowerBound: PropTypes.number.isRequired,
        veryLowThreshold: PropTypes.number.isRequired,
      }),
      bgUnits: PropTypes.string.isRequired,
    }),
    categories: PropTypes.object,
    chartHeight: PropTypes.number,
    collapsible: PropTypes.bool,
    data: PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.shape(
        {
          id: PropTypes.string.isRequired,
          value: PropTypes.number.isRequired,
          title: PropTypes.string,
        }
      )).isRequired,
      total: PropTypes.shape(
        {
          id: PropTypes.string,
          value: PropTypes.number.isRequired,
        }
      ),
      dataPaths: PropTypes.shape({
        summary: dataPathPropType,
        title: dataPathPropType,
      }),
    }),
    dataFormat: PropTypes.shape({
      label: PropTypes.oneOf(_.values(statFormats)),
      summary: PropTypes.oneOf(_.values(statFormats)),
      title: PropTypes.oneOf(_.values(statFormats)),
      tooltip: PropTypes.oneOf(_.values(statFormats)),
      tooltipTitle: PropTypes.oneOf(_.values(statFormats)),
    }),
    isOpened: PropTypes.bool,
    muteOthersOnHover: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(_.keys(statTypes)),
  };

  static defaultProps = {
    alwaysShowTooltips: false,
    categories: {},
    chartHeight: 0,
    collapsible: true,
    dataFormat: {
      label: statFormats.percentage,
      summary: statFormats.percentage,
      title: statFormats.percentage,
      tooltip: statFormats.percentage,
      tooltipTitle: statFormats.percentage,
    },
    isOpened: true,
    muteOthersOnHover: true,
    type: statTypes.barHorizontal.type,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stat');

    this.state = this.getStateByType(props);
    this.setChartPropsByType(props);
  }

  toggleIsOpened = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateByType(nextProps));
    this.setChartPropsByType(nextProps);
  }

  handleMouseOver = () => {
    if (this.props.type === statTypes.simple) {
      this.setChartTitle(_.get(this.props.data, 'data.0'));
    }
  };

  handleMouseOut = () => {
    this.setChartTitle();
  };

  renderChart = size => (
    <Collapse
      isOpened={this.state.isOpened}
      springConfig={{ stiffness: 200, damping: 23 }}
    >
      <div className={styles.chartContainer}>
        <this.chartRenderer {...this.chartProps} ref={this.setChartRef} width={size.width || 270} />
      </div>
    </Collapse>
  );

  render() {
    const isDatumHovered = this.state.hoveredDatumIndex >= 0;
    const statOuterClasses = cx({
      [styles.Stat]: true,
      [styles[this.props.type]]: true,
      [styles.isCollapsible]: this.state.isCollapsible,
      [styles.isOpen]: this.state.isOpened,
      [styles.isDatumHovered]: isDatumHovered,
    });

    const summaryData = this.getData({ pathKey: 'summary' });
    const titleData = isDatumHovered
      ? this.state.tooltipTitleData
      : this.getData({ pathKey: 'title' });

    return (
      <div
        className={statOuterClasses}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            {this.state.chartTitle}
            {titleData && (
              <span className={styles.chartTitleData}>
                (&nbsp;
                <span
                  style={{
                    color: statColors[titleData.id],
                  }}
                >
                  {titleData.value}
                </span>
                <span className={styles.titleSuffix}>{titleData.suffix}</span>
                &nbsp;)
              </span>
            )}
          </div>

          <div className={styles.chartSummary}>
            {summaryData && (
              <div
                className={styles.summaryValue}
                style={{
                  color: statColors[summaryData.id],
                }}
              >
                {summaryData.value}
                <span className={styles.summarySuffix}>{summaryData.suffix}</span>
              </div>
            )}

            {this.state.isCollapsible && (
              <div className={styles.chartCollapse}>
                <img
                  src={this.state.isOpened ? CollapseIconOpen : CollapseIconClose}
                  onClick={this.toggleIsOpened}
                />
              </div>
            )}
          </div>

        </div>
        {this.chartRenderer && <SizeMe render={({ size }) => (this.renderChart(size))} />}
      </div>
    );
  }

  getData = (opts = {}) => {
    const { pathKey, path, format } = opts;
    let dataPath = path;
    let dataFormat = format;
    let data;

    if (!dataPath && pathKey && this.props.dataFormat[pathKey]) {
      dataPath = _.get(this.props.data, ['dataPaths', pathKey]);
      dataFormat = this.props.dataFormat[pathKey];
    }

    if (dataPath) {
      const datum = _.get(this.props.data, dataPath);
      data = this.formatValue(datum, dataFormat);
    }

    return data;
  }

  getStateByType = props => {
    const state = {
      chartTitle: props.title,
    };
    switch (props.type) {
      case 'simple':
        state.isCollapsible = false;
        state.isOpened = false;
        break;

      case 'barHorizontal':
      default:
        state.isCollapsible = props.collapsible;
        state.isOpened = props.isOpened;
        state.hoveredDatumIndex = -1;
        break;
    }

    return state;
  }

  setChartPropsByType = props => {
    const { type, data, ...rest } = props;
    let chartRenderer = VictoryBar;
    const chartProps = _.defaults({
      animate: { duration: 300, onLoad: { duration: 0 } },
      data: _.map(data.data, (d, i) => ({
        x: i + 1,
        y: data.total ? d.value / data.total.value : d.value,
        id: d.id,
      })),
      labels: d => formatPercentage(d.y),
      style: {
        data: {
          fill: d => statColors[d.id],
        },
      },
    }, rest);

    let barWidth;
    let barSpacing;
    let chartHeight;
    let chartLabelWidth;
    let domain;
    let padding;
    let getStatColor;

    switch (type) {
      case 'simple':
        chartRenderer = null;
        break;

      case 'barHorizontal':
      default:
        domain = { y: [0, props.data.data.length], x: [0, 1] };
        barSpacing = chartProps.barSpacing || 4;
        chartHeight = chartProps.chartHeight;

        if (chartHeight > 0) {
          barWidth = ((chartHeight - barSpacing) / props.data.data.length) - (barSpacing / 2);
        } else {
          barWidth = chartProps.barWidth || 24;
          chartHeight = (barWidth + barSpacing) * props.data.data.length;
        }

        padding = { top: barWidth / 2, bottom: barWidth / 2 * -1 };
        chartLabelWidth = barWidth * 2.25;

        getStatColor = datum => {
          const { hoveredDatumIndex } = this.state;
          const isMuted = props.muteOthersOnHover
            && hoveredDatumIndex >= 0
            && hoveredDatumIndex !== datum.eventKey;

          return isMuted ? statColors.muted : statColors[datum.id];
        };

        _.assign(chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { top: 2, bottom: 2 },
          dataComponent: (
            <HoverBar
              domain={domain}
              barWidth={barWidth}
              barSpacing={barSpacing}
              chartLabelWidth={chartLabelWidth}
            />
          ),
          domain,
          events: [
            {
              target: 'data',
              eventHandlers: {
                onMouseOver: (event, target) => {
                  const datum = _.get(props.data, ['data', target.index], {});
                  datum.index = target.index;
                  this.setChartTitle(datum);
                  this.setState({ hoveredDatumIndex: target.index });
                  if (props.dataFormat.tooltip) {
                    return {
                      target: 'labels',
                      mutation: () => ({
                        active: true,
                      }),
                    };
                  }
                  return {};
                },
                onMouseOut: () => {
                  this.setChartTitle();
                  this.setState({ hoveredDatumIndex: -1 });
                  return {
                    target: 'labels',
                    mutation: () => ({ active: props.alwaysalwaysShowTooltips }),
                  };
                },
              },
            },
          ],
          height: chartHeight,
          horizontal: true,
          labelComponent: (
            <HoverBarLabel
              active={props.alwaysShowTooltips}
              domain={domain}
              barWidth={barWidth}
              text={datum => {
                const { value, suffix } = this.formatValue(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.label,
                );
                return `${value}${suffix}`;
              }}
              tooltipText={datum => {
                const { value, suffix } = this.formatValue(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.tooltip,
                );
                return `${value}${suffix}`;
              }}
            />
          ),
          padding,
          style: {
            data: {
              fill: d => getStatColor(d),
              width: () => barWidth,
            },
            labels: {
              fill: d => getStatColor(d),
              fontSize: barWidth * 0.833,
              fontWeight: 600,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;
    }
    this.chartProps = chartProps;
    this.setChartRenderer(chartRenderer);
  }

  setChartTitle = (datum = {}) => {
    let tooltipTitleData;
    const { title = this.props.title } = datum;
    const tooltipTitleFormat = _.get(this.props, 'dataFormat.tooltipTitle');

    if (tooltipTitleFormat) {
      tooltipTitleData = this.getData({
        path: ['data', datum.index],
        format: tooltipTitleFormat,
      });
    }

    this.setState({
      chartTitle: title,
      tooltipTitleData,
    });
  }

  setChartRef = element => {
    this.chartRef = element;
  }

  setChartRenderer = chartRenderer => {
    this.chartRenderer = chartRenderer;
  }

  formatValue = (datum = {}, format) => {
    let id = datum.id;
    let value = datum.value;
    let suffix = '';
    let suffixSrc;
    const total = _.get(this.props.data, 'total.value');

    switch (format) {
      case statFormats.percentage:
        if (total) {
          value = value / total;
        }
        value = formatPercentage(value);
        break;

      case statFormats.gmi:
        id = classifyGmiValue(value);
        value = formatPercentage(value, 1);
        break;

      case statFormats.duration:
        value = formatDuration(value, { condensed: true });
        break;

      case statFormats.units:
        value = formatInsulin(value);
        suffix = 'u';
        break;

      case statFormats.bgRange:
        suffixSrc = this.props.bgPrefs.bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        console.log(generateBgRangeLabels(this.props.bgPrefs, { condensed: true }), id);
        value = generateBgRangeLabels(this.props.bgPrefs, { condensed: true })[id];
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        break;

      default:
        break;
    }

    return {
      id,
      value,
      suffix,
    };
  }
}

export default Stat;
