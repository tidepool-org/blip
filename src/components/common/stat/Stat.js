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

/* global document */

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';
import bows from 'bows';
import cx from 'classnames';
import { SizeMe } from 'react-sizeme';
import { VictoryBar, VictoryContainer } from 'victory';
import { Collapse } from 'react-collapse';
import { formatPercentage, formatDecimalNumber, formatBgValue, formatCarbs } from '../../../utils/format';
import { formatDuration } from '../../../utils/datetime';
import { generateBgRangeLabels, classifyBgValue, classifyCvValue } from '../../../utils/bloodglucose';
import { MGDL_UNITS, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP } from '../../../utils/constants';
import { statFormats, statTypes } from '../../../utils/stat';
import styles from './Stat.css';
import colors from '../../../styles/colors.css';
import { bgPrefsPropType } from '../../../propTypes';
import HoverBar from './HoverBar';
import HoverBarLabel from './HoverBarLabel';
import BgBar from './BgBar';
import BgBarLabel from './BgBarLabel';
import StatTooltip from '../tooltips/StatTooltip';
import StatLegend from './StatLegend';
import CollapseIconOpen from './assets/expand-more-24-px.svg';
import CollapseIconClose from './assets/chevron-right-24-px.svg';
import MGDLIcon from './assets/mgdl-inv-24-px.svg';
import MMOLIcon from './assets/mmol-inv-24-px.svg';
import InfoIcon from './assets/info-outline-24-px.svg';

const dataPathPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.array,
]);

const datumPropType = PropTypes.shape({
  id: PropTypes.string,
  value: PropTypes.number.isRequired,
  title: PropTypes.string,
});

const statFormatPropType = PropTypes.oneOf(_.values(statFormats));

class Stat extends PureComponent {
  static propTypes = {
    alwaysShowTooltips: PropTypes.bool,
    bgPrefs: bgPrefsPropType,
    categories: PropTypes.object,
    chartHeight: PropTypes.number,
    collapsible: PropTypes.bool,
    data: PropTypes.shape({
      data: PropTypes.arrayOf(datumPropType).isRequired,
      total: datumPropType,
      dataPaths: PropTypes.shape({
        summary: dataPathPropType,
        title: dataPathPropType,
      }),
    }),
    dataFormat: PropTypes.shape({
      label: statFormatPropType,
      summary: statFormatPropType,
      title: statFormatPropType,
      tooltip: statFormatPropType,
      tooltipTitle: statFormatPropType,
    }),
    emptyDataPlaceholder: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    isOpened: PropTypes.bool,
    legend: PropTypes.bool,
    annotations: PropTypes.arrayOf(PropTypes.string),
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
    emptyDataPlaceholder: '--',
    isDisabled: false,
    isOpened: true,
    legend: true,
    muteOthersOnHover: true,
    type: statTypes.simple,
  };

  constructor(props) {
    super(props);
    this.log = bows('Stat');

    this.state = this.getStateByType(props);
    this.setChartPropsByType(props);

    this.setStatRef = ref => {
      this.stat = ref;
    };

    this.setTooltipIconRef = ref => {
      this.tooltipIcon = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateByType(nextProps));
    this.setChartPropsByType(nextProps);
  }

  renderChartTitle = () => {
    const isDatumHovered = this.state.hoveredDatumIndex >= 0;

    const titleData = isDatumHovered
      ? this.state.tooltipTitleData
      : this.getFormattedDataByKey('title');

    const titleDataValue = _.get(titleData, 'value');

    return (
      <div className={styles.chartTitle}>
        {this.state.chartTitle}
        {titleDataValue && titleDataValue !== this.props.emptyDataPlaceholder && (
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
        {this.props.annotations && !isDatumHovered && (
          <span
            className={styles.tooltipIcon}
          >
            <img
              src={InfoIcon}
              alt="Hover for more info"
              ref={this.setTooltipIconRef}
              onMouseOver={this.handleTooltipIconMouseOver}
              onMouseOut={this.handleTooltipIconMouseOut}
            />
          </span>
        )}
      </div>
    );
  };

  renderChartSummary = () => {
    const summaryData = this.getFormattedDataByKey('summary');

    return (
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
              onClick={this.handleCollapse}
            />
          </div>
        )}
      </div>
    );
  };

  renderChartHeader = () => (
    <div className={styles.chartHeader}>
      {this.renderChartTitle()}
      {this.renderChartSummary()}
    </div>
  );

  renderChartFooter = () => (
    <div className={styles.chartFooter}>
      {this.chartProps.legend && this.state.isOpened && this.renderChartLegend()}
    </div>
  );

  renderChartLegend = () => {
    const items = _.map(
      this.props.data.data,
      datum => _.pick(datum, ['id', 'legendTitle'])
    ).reverse();

    return (
      <div className={styles.chartLegend}>
        <StatLegend items={items} />
      </div>
    );
  };

  renderChart = size => {
    const { renderer: Renderer, ...chartProps } = this.chartProps;

    return (
      <Collapse
        isOpened={this.state.isOpened}
        springConfig={{ stiffness: 200, damping: 23 }}
      >
        <div className={styles.chartContainer}>
          <Renderer {...chartProps} width={size.width || 298} />
        </div>
      </Collapse>
    );
  };

  renderTooltip = () => (
    <div className={styles.StatTooltipWrapper}>
      <StatTooltip
        annotations={this.props.annotations}
        offset={this.state.messageTooltipOffset}
        position={this.state.messageTooltipPosition}
        side={this.state.messageTooltipSide}
      />
    </div>
  );

  render() {
    const statClasses = cx({
      [styles.Stat]: true,
      [styles[this.props.type]]: true,
      [styles.isOpen]: this.state.isOpened,
    });

    return (
      <div className={styles.StatWrapper}>
        <div ref={this.setStatRef} className={statClasses}>
          {this.renderChartHeader()}
          {this.chartProps.renderer && <SizeMe render={({ size }) => (this.renderChart(size))} />}
          {this.renderChartFooter()}
        </div>
        {this.state.showMessages && this.renderTooltip()}
      </div>
    );
  }

  getStateByType = props => {
    const {
      data,
    } = props;

    const state = {
      chartTitle: props.title,
      isDisabled: _.sum(_.map(data.data, d => _.get(d, 'deviation.value', d.value))) <= 0,
    };

    switch (props.type) {
      case 'simple':
        state.isCollapsible = false;
        state.isOpened = false;
        break;

      case 'barHorizontal':
      default:
        state.isCollapsible = props.collapsible;
        state.isOpened = _.get(this.state, 'isOpened', props.isOpened);
        state.hoveredDatumIndex = -1;
        break;
    }

    return state;
  };

  getDefaultChartProps = props => {
    const { data, chartHeight } = props;
    const total = _.get(data, 'total.value');

    return {
      animate: { duration: 300, onLoad: { duration: 0 } },
      data: _.map(data.data, (d, i) => ({
        x: i + 1,
        y: total > 0 ? d.value / total : d.value,
        id: d.id,
      })),
      height: chartHeight,
      labels: d => formatPercentage(d.y),
      renderer: null,
      style: {
        data: {
          fill: d => colors[d.id] || colors.statDark,
        },
      },
    };
  };

  setChartPropsByType = props => {
    const { type, data, bgPrefs: { bgUnits } } = props;

    let barWidth;
    let barSpacing;
    let domain;
    let height;
    let labelFontSize = 24;
    let chartLabelWidth = labelFontSize * 2.75;
    let padding;

    this.chartProps = this.getDefaultChartProps(props);

    switch (type) {
      case 'barBg':
        barWidth = 4;
        height = this.chartProps.height || barWidth * 6;

        domain = {
          x: [0, bgUnits === MGDL_UNITS ? MGDL_CLAMP_TOP : MMOLL_CLAMP_TOP],
          y: [0, 1],
        };

        padding = {
          top: 10,
          bottom: 10,
        };

        _.assign(this.chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { topLeft: 2, bottomLeft: 2, topRight: 2, bottomRight: 2 },
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
          height,
          horizontal: true,
          labelComponent: (
            <BgBarLabel
              active={props.alwaysShowTooltips}
              barWidth={barWidth}
              bgPrefs={props.bgPrefs}
              domain={domain}
              text={datum => {
                const datumRef = _.get(props.data, ['data', datum.eventKey]);
                const { value } = this.formatDatum(
                  datumRef.deviation || datumRef,
                  props.dataFormat.label
                );
                return `${value}`;
              }}
              tooltipText={datum => {
                const { value, suffix } = this.formatDatum(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.tooltip,
                );
                return `${value}${suffix}`;
              }}
            />
          ),
          padding,
          renderer: VictoryBar,
          style: {
            data: {
              fill: datum => this.getDatumColor(datum),
              width: () => barWidth,
            },
            labels: {
              fill: datum => this.getDatumColor(_.assign({}, datum, this.formatDatum(
                _.get(props.data, ['data', datum.eventKey]),
                props.dataFormat.label,
              ))),
              fontSize: labelFontSize,
              fontWeight: 600,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      case 'barHorizontal':
        barSpacing = 6;
        height = this.chartProps.height;

        if (height > 0) {
          barWidth = ((height - barSpacing) / props.data.data.length) - (barSpacing / 2);
          labelFontSize = _.min([barWidth * 0.833, labelFontSize]);
          chartLabelWidth = labelFontSize * 2.75;
        } else {
          barWidth = 30;
          height = (barWidth + barSpacing) * props.data.data.length;
        }

        domain = {
          x: [0, 1],
          y: [0, props.data.data.length],
        };

        padding = {
          top: barWidth / 2,
          bottom: barWidth / 2 * -1,
        };

        _.assign(this.chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { topLeft: 2, bottomLeft: 2, topRight: 2, bottomRight: 2 },
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
                  if (this.state.isDisabled || !props.dataFormat.tooltip) {
                    return {};
                  }

                  const datum = _.get(props.data, ['data', target.index], {});
                  datum.index = target.index;
                  this.setChartTitle(datum);
                  this.setState({ hoveredDatumIndex: target.index });

                  return {
                    target: 'labels',
                    mutation: () => ({
                      active: true,
                    }),
                  };
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
          height,
          horizontal: true,
          labelComponent: (
            <HoverBarLabel
              active={props.alwaysShowTooltips}
              barWidth={barWidth}
              isDisabled={() => this.state.isDisabled}
              domain={domain}
              text={datum => {
                const { value, suffix } = this.formatDatum(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.label,
                );
                return `${value}${suffix}`;
              }}
              tooltipText={datum => {
                const { value, suffix } = this.formatDatum(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.tooltip,
                );
                return `${value}${suffix}`;
              }}
            />
          ),
          legend: props.legend,
          padding,
          renderer: VictoryBar,
          style: {
            data: {
              fill: datum => (datum.y === 0 ? 'transparent' : this.getDatumColor(datum)),
              width: () => barWidth,
            },
            labels: {
              fill: datum => this.getDatumColor(_.assign({}, datum, this.formatDatum(
                _.get(props.data, ['data', datum.eventKey]),
                props.dataFormat.label,
              ))),
              fontSize: labelFontSize,
              fontWeight: 600,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      default:
        break;
    }
  };

  setChartTitle = (datum = {}) => {
    let tooltipTitleData;
    const { title = this.props.title } = datum;
    const tooltipTitleFormat = _.get(this.props, 'dataFormat.tooltipTitle');

    if (tooltipTitleFormat) {
      tooltipTitleData = this.getFormattedDataByDataPath(['data', datum.index], tooltipTitleFormat);
    }

    this.setState({
      chartTitle: title,
      tooltipTitleData,
    });
  };

  getFormattedDataByDataPath = (path, format) => {
    const datum = _.get(this.props.data, path);
    return this.formatDatum(datum, format);
  };

  getFormattedDataByKey = key => {
    const path = _.get(this.props.data, ['dataPaths', key]);
    const format = this.props.dataFormat[key];
    return this.getFormattedDataByDataPath(path, format);
  };

  getDatumColor = datum => {
    const { hoveredDatumIndex, isDisabled } = this.state;
    const isMuted = this.props.muteOthersOnHover
      && hoveredDatumIndex >= 0
      && hoveredDatumIndex !== datum.eventKey;

    let color = colors[datum.id] || colors.statDark;

    if (isDisabled || isMuted) {
      color = isDisabled ? colors.statDisabled : colors.muted;
    }

    return color;
  };

  formatDatum = (datum = {}, format) => {
    let id = datum.id;
    let value = datum.value;
    let suffix = '';
    let suffixSrc;
    let deviation;
    let lowerValue;
    let lowerColorId;
    let upperValue;
    let upperColorId;

    const total = _.get(this.props.data, 'total.value');
    const { bgPrefs, emptyDataPlaceholder } = this.props;
    const { bgBounds, bgUnits } = bgPrefs;

    function disableStat() {
      id = 'statDisabled';
      value = emptyDataPlaceholder;
    }

    switch (format) {
      case statFormats.bgCount:
        if (value < 0) disableStat();
        value = +value.toFixed(1);
        break;

      case statFormats.bgRange:
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        value = generateBgRangeLabels(bgPrefs, { condensed: true })[id];
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        break;

      case statFormats.bgValue:
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        if (value >= 0) {
          id = classifyBgValue(bgBounds, value);
          value = formatBgValue(value, bgPrefs);
        } else {
          disableStat();
        }
        break;

      case statFormats.carbs:
        if (value >= 0) {
          value = formatCarbs(value);
        } else {
          disableStat();
        }
        break;

      case statFormats.cv:
        if (value >= 0) {
          id = classifyCvValue(value);
          value = formatPercentage(value);
        } else {
          disableStat();
        }
        break;

      case statFormats.duration:
        if (value >= 0) {
          value = formatDuration(value, { condensed: true });
        } else {
          disableStat();
        }
        break;

      case statFormats.gmi:
        if (value >= 0) {
          value = formatPercentage(value, 1);
        } else {
          disableStat();
        }
        break;

      case statFormats.percentage:
        if (total && total >= 0) {
          const percentage = value / total;
          let precision = 0;
          // We want to show extra precision on very small percentages so that we avoid showing 0%
          // when there is some data there.
          if (percentage > 0 && percentage < 0.005) {
            precision = percentage < 0.0005 ? 2 : 1;
          }
          value = formatPercentage(percentage, precision);
        } else {
          disableStat();
        }
        break;

      case statFormats.standardDevRange:
        deviation = _.get(datum, 'deviation.value', -1);
        if (value >= 0 && deviation >= 0) {
          suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;

          lowerValue = value - deviation;
          lowerColorId = lowerValue >= 0
            ? classifyBgValue(bgBounds, lowerValue)
            : 'low';

          upperValue = value + deviation;
          upperColorId = classifyBgValue(bgBounds, upperValue);

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
          disableStat();
        }
        break;

      case statFormats.standardDevValue:
        suffixSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;
        suffix = <img className={styles.bgIcon} src={suffixSrc} />;
        if (value >= 0) {
          value = formatBgValue(value, bgPrefs);
        } else {
          disableStat();
        }
        break;

      case statFormats.units:
        if (value >= 0) {
          value = formatDecimalNumber(value, 1);
          suffix = 'U';
        } else {
          disableStat();
        }
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
  };

  handleCollapse = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  };

  handleTooltipIconMouseOver = () => {
    const { top, left, width, height } = this.tooltipIcon.getBoundingClientRect();
    const {
      top: parentTop,
      left: parentLeft,
      height: parentHeight,
    } = this.stat.getBoundingClientRect();

    const position = {
      top: (top - parentTop) + height / 2,
      left: (left - parentLeft) + width / 2,
    };

    const offset = {
      horizontal: width / 2,
      top: -parentHeight,
    };

    const side = (_.get(document, 'body.clientWidth', 0) - left < 225) ? 'left' : 'right';

    this.setState({
      showMessages: true,
      messageTooltipPosition: position,
      messageTooltipOffset: offset,
      messageTooltipSide: side,
    });
  };

  handleTooltipIconMouseOut = () => {
    this.setState({
      showMessages: false,
    });
  };
}

export default Stat;
