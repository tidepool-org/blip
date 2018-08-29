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

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';
import bows from 'bows';
import cx from 'classnames';
import { SizeMe } from 'react-sizeme';
import { VictoryBar, VictoryContainer } from 'victory';
import { Collapse } from 'react-collapse';
import { formatPercentage, formatInsulin, formatBgValue } from '../../../utils/format';
import { formatDuration } from '../../../utils/datetime';
import { generateBgRangeLabels, classifyBgValue, classifyCvValue } from '../../../utils/bloodglucose';
import { MGDL_UNITS, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP } from '../../../utils/constants';
import styles from './Stat.css';
import colors from '../../../styles/colors.css';
import HoverBar, { HoverBarLabel } from './HoverBar';
import BgBar, { BgBarLabel } from './BgBar';
import CollapseIconOpen from './assets/expand-more-24-px.svg';
import CollapseIconClose from './assets/chevron-right-24-px.svg';
import MGDLIcon from './assets/mgdl-inv-24-px.svg';
import MMOLIcon from './assets/mmol-inv-24-px.svg';
import InfoIcon from './assets/info-outline-24-px.svg';

export const statTypes = {
  barHorizontal: 'barHorizontal',
  barBg: 'barBg',
  simple: 'simple',
};

export const statFormats = {
  bgRange: 'bgRange',
  bgValue: 'bgValue',
  cv: 'cv',
  duration: 'duration',
  gmi: 'gmi',
  percentage: 'percentage',
  stdDevRange: 'stdDevRange',
  stdDevValue: 'stdDevValue',
  units: 'units',
};

const dataPathPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.array,
]);

class Stat extends PureComponent {
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
          id: PropTypes.string,
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
    bgPrefs: {},
    categories: {},
    chartHeight: 0,
    collapsible: true,
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
            {_.get(titleData, 'value') && (
              <span className={styles.chartTitleData}>
                (&nbsp;
                <span
                  style={{
                    color: colors[titleData.id] || colors.statDefault,
                  }}
                >
                  {titleData.value}
                </span>
                <span
                  style={{
                    color: colors[titleData.id] || colors.statDefault,
                  }}
                >
                  {titleData.suffix}
                </span>
                &nbsp;)
              </span>
            )}
            {this.props.tooltips && (
              <a href="">
                <img src={InfoIcon} alt="Hover for more info"/>
              </a>
            )}
          </div>

          <div className={styles.chartSummary}>
            {summaryData && (
              <div
                className={styles.summaryValue}
                style={{
                  color: colors[summaryData.id],
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
    const { data } = props;

    // TODO: consider whether we should be tracking disabled state internally or passing in a prop
    const isDisabled = _.sum(_.map(data.data, d => d.value)) <= 0;

    const state = {
      chartTitle: props.title,
      isDisabled,
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
    const { type, data, bgPrefs: { bgUnits }, ...rest } = props;
    const total = _.get(data, 'total.value');
    let chartRenderer = VictoryBar;
    const chartProps = _.defaults({
      animate: { duration: 300, onLoad: { duration: 0 } },
      data: _.map(data.data, (d, i) => ({
        x: i + 1,
        y: total > 0 ? d.value / total : d.value,
        id: d.id,
      })),
      labels: d => formatPercentage(d.y),
      style: {
        data: {
          fill: d => colors[d.id] || colors.statDark,
        },
      },
    }, rest);

    let barWidth;
    let barSpacing;
    let chartHeight;
    let chartLabelWidth = 60;
    let domain;
    let padding;

    switch (type) {
      case 'barBg':
        barWidth = 4;
        chartHeight = barWidth * 6;

        domain = {
          x: [0, bgUnits === MGDL_UNITS ? MGDL_CLAMP_TOP : MMOLL_CLAMP_TOP],
          y: [0, 1],
        };

        padding = {
          top: 10,
          bottom: 10,
        };

        this.chartProps = _.assign({}, chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { top: 2, bottom: 2 },
          data: _.map(data.data, (d, i) => ({
            x: i + 1,
            y: d.value,
            id: d.id,
            deviation: d.deviation,
          })),
          dataComponent: (
            <BgBar
              barWidth={barWidth}
              bgPrefs={props.bgPrefs}
              chartLabelWidth={chartLabelWidth}
              domain={domain}
            />
          ),
          domain,
          height: chartHeight,
          horizontal: true,
          labelComponent: (
            <BgBarLabel
              active={props.alwaysShowTooltips}
              barWidth={barWidth}
              bgPrefs={props.bgPrefs}
              domain={domain}
              text={datum => {
                const datumRef = _.get(props.data, ['data', datum.eventKey]);
                const { value } = this.formatValue(
                  datumRef.deviation || datumRef,
                  props.dataFormat.label
                );
                return `${value}`;
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
              fill: datum => this.getDatumColor(datum),
              width: () => barWidth,
            },
            labels: {
              fill: datum => this.getDatumColor(this.formatValue(
                _.get(props.data, ['data', datum.eventKey]),
                props.dataFormat.label,
              )),
              fontSize: barWidth * 0.833 * 6,
              fontWeight: 600,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      case 'barHorizontal':
        barSpacing = chartProps.barSpacing || 4;
        chartHeight = chartProps.chartHeight;

        if (chartHeight > 0) {
          barWidth = ((chartHeight - barSpacing) / props.data.data.length) - (barSpacing / 2);
          chartLabelWidth = barWidth * 2.25;
        } else {
          barWidth = chartProps.barWidth || 24;
          chartHeight = (barWidth + barSpacing) * props.data.data.length;
        }

        domain = {
          x: [0, 1],
          y: [0, props.data.data.length],
        };

        padding = {
          top: barWidth / 2,
          bottom: barWidth / 2 * -1,
        };

        this.chartProps = _.assign({}, chartProps, {
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
              fill: datum => this.getDatumColor(datum),
              width: () => barWidth,
            },
            labels: {
              fill: datum => this.getDatumColor(datum),
              fontSize: barWidth * 0.833,
              fontWeight: 600,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      case 'simple':
      default:
        chartRenderer = null;
        break;
    }
    this.setChartRenderer(chartRenderer);
  }

  getDatumColor = datum => {
    const { hoveredDatumIndex, isDisabled } = this.state;
    const isMuted = this.props.muteOthersOnHover
      && hoveredDatumIndex >= 0
      && hoveredDatumIndex !== datum.eventKey;

    let color = isDisabled
      ? colors.statDisabled
      : isMuted
        ? colors.muted
        : colors[datum.id] || colors.statDark;

    return color;
  };

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
    let deviation = _.get(datum, 'deviation.value', 0);
    let suffix = '';
    let suffixSrc;
    const total = _.get(this.props.data, 'total.value');
    const { bgPrefs } = this.props;
    const { bgBounds, bgUnits } = bgPrefs;

    switch (format) {
      case statFormats.bgRange:
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        value = generateBgRangeLabels(bgPrefs, { condensed: true })[id];
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        break;

      case statFormats.bgValue:
        if (value > 0) {
          id = classifyBgValue(bgBounds, value);
          value = formatBgValue(value, bgPrefs);
        } else {
          id = 'statDisabled';
          value = '--';
        }
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        break;

      case statFormats.cv:
        id = classifyCvValue(value);
        value = formatPercentage(value);
        break;

      case statFormats.duration:
        value = formatDuration(value, { condensed: true });
        break;

      case statFormats.gmi:
        value = formatPercentage(value, 1);
        break;

      case statFormats.percentage:
        if (total && total > 0) {
          if (total) {
            value = value / total;
          }
          value = formatPercentage(value);
        } else {
          id = 'statDisabled';
          value = '--';
        }
        break;

      case statFormats.stdDevRange:
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;

        const lowerValue = value - deviation;
        const lowerColorId = lowerValue > 0
          ? classifyBgValue(bgBounds, lowerValue)
          : 'statDisabled';

        const upperValue = value + deviation;
        const upperColorId = upperValue > 0
          ? classifyBgValue(bgBounds, upperValue)
          : 'statDisabled';

        if (value > 0) {
          value = (
            <span>
              <span style={{
                color: colors[lowerColorId],
              }}>
                {formatBgValue(value - deviation, bgPrefs)}
              </span>
              &nbsp;-&nbsp;
              <span style={{
                color: colors[upperColorId],
              }}>
                {formatBgValue(value + deviation, bgPrefs)}
              </span>
            </span>
          );
          suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        } else {
          value = undefined;
          suffix = undefined;
        }
        break;

      case statFormats.stdDevValue:
        if (value > 0) {
          value = formatBgValue(value, bgPrefs);
        } else {
          id = 'statDisabled';
          value = '--';
        }
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        break;

      case statFormats.units:
        value = formatInsulin(value);
        suffix = 'u';
        break;

      default:
        break;
    }

    return {
      id,
      value,
      suffix,
      suffixSrc,
    };
  }
}

export default Stat;
