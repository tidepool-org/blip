
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bows from 'bows';
import cx from 'classnames';
import i18next from 'i18next';
import { SizeMe } from 'react-sizeme';
import { VictoryBar, VictoryContainer } from 'victory';
import { Collapse } from 'react-collapse';

import { formatPercentage, formatDecimalNumber, formatBgValue } from '../../../utils/format';
import { formatDuration } from '../../../utils/datetime';
import { generateBgRangeLabels, classifyBgValue, classifyCvValue } from '../../../utils/bloodglucose';
import { LBS_PER_KG, MGDL_UNITS, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP } from '../../../utils/constants';
import { statFormats, statTypes } from '../../../utils/stat';
import styles from './Stat.css';
import colors from '../../../styles/colors.css';
import { bgPrefsPropType } from '../../../propTypes';
import HoverBar from './HoverBar';
import HoverBarLabel from './HoverBarLabel';
import BgBar from './BgBar';
import BgBarLabel from './BgBarLabel';
import WheelPercent from './Wheel';
import StatTooltip from '../tooltips/StatTooltip';
import StatLegend from './StatLegend';
import CollapseIconOpen from './assets/expand-more-24-px.svg';
import CollapseIconClose from './assets/chevron-right-24-px.svg';
import InfoIcon from './assets/info-outline-24-px.svg';

const t = i18next.t.bind(i18next);

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

class Stat extends React.Component {
  static propTypes = {
    alwaysShowTooltips: PropTypes.bool,
    alwaysShowSummary: PropTypes.bool,
    annotations: PropTypes.arrayOf(PropTypes.string),
    bgPrefs: bgPrefsPropType,
    categories: PropTypes.object,
    chartHeight: PropTypes.number,
    collapsible: PropTypes.bool,
    data: PropTypes.shape({
      data: PropTypes.arrayOf(datumPropType).isRequired,
      total: datumPropType,
      dataPaths: PropTypes.shape({
        input: dataPathPropType,
        output: dataPathPropType,
        summary: dataPathPropType,
        title: dataPathPropType,
      }),
    }).isRequired,
    dataFormat: PropTypes.shape({
      label: statFormatPropType,
      summary: statFormatPropType,
      title: statFormatPropType,
      tooltip: statFormatPropType,
      tooltipTitle: statFormatPropType,
    }).isRequired,
    emptyDataPlaceholder: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    isOpened: PropTypes.bool,
    legend: PropTypes.bool,
    muteOthersOnHover: PropTypes.bool,
    reverseLegendOrder: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(_.keys(statTypes)),
    units: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  };

  static defaultProps = {
    alwaysShowSummary: false,
    alwaysShowTooltips: true,
    animate: true,
    bgPrefs: {},
    categories: {},
    chartHeight: 0,
    collapsible: false,
    emptyDataPlaceholder: '--',
    isDisabled: false,
    isOpened: true,
    legend: false,
    muteOthersOnHover: true,
    type: statTypes.simple,
    units: false,
  };

  static displayName = 'Stat';

  constructor(props) {
    super(props);
    this.log = bows('Stat');

    this.state = this.getStateByType(props);
    this.chartProps = this.getChartPropsByType(props);

    this.setStatRef = ref => {
      this.stat = ref;
    };

    this.setTooltipIconRef = ref => {
      this.tooltipIcon = ref;
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(() => this.getStateByType(nextProps));
    this.chartProps = this.getChartPropsByType(nextProps);
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
            <span className={styles.chartTitleSuffix}>
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
              alt={t('Hover for more info')}
              ref={this.setTooltipIconRef}
              onMouseOver={this.handleTooltipIconMouseOver}
              onMouseOut={this.handleTooltipIconMouseOut}
            />
          </span>
        )}
      </div>
    );
  }

  renderChartSummary = () => {
    const summaryData = this.getFormattedDataByKey('summary');
    const showSummary = this.props.alwaysShowSummary || !this.state.isOpened;
    const summaryDataValue = _.get(summaryData, 'value');

    return (
      <div className={styles.chartSummary}>
        {summaryDataValue && showSummary && (
          <div
            className={styles.summaryData}
            style={{
              color: colors[summaryData.id] || colors.statDefault,
            }}
          >
            <span className={styles.summaryValue}>
              {summaryData.value}
            </span>
            <span className={styles.summarySuffix}>
              {summaryData.suffix}
            </span>
          </div>
        )}

        {this.props.units && !this.state.showFooter && this.renderStatUnits()}

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
  }

  renderStatUnits() {
    return (
      <div className={styles.units}>
        {this.props.units}
      </div>
    );
  }

  renderStatHeader = () => (
    <div className={styles.statHeader}>
      {this.renderChartTitle()}
      {this.renderChartSummary()}
    </div>
  );

  renderStatFooter = () => (
    <div className={styles.statFooter}>
      {this.props.type === statTypes.input && this.renderCalculatedOutput()}
      {this.props.legend && this.renderStatLegend()}
      {this.props.units && this.renderStatUnits()}
    </div>
  );

  renderStatLegend = () => {
    const items = _.map(
      this.props.data.data,
      datum => _.pick(datum, ['id', 'legendTitle'])
    );

    if (!this.props.reverseLegendOrder) {
      _.reverse(items);
    }

    return (
      <div className={styles.statLegend}>
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
        <div className={styles.chartWrapper}>
          <Renderer {...chartProps} width={size.width || 298} />
        </div>
      </Collapse>
    );
  };

  renderWeight = () => {
    const input = _.get(this.props.data, this.props.data.dataPaths.input);

    return (
      <div className={styles.inputWrapper}>
        <div className={styles.inputlabel}>
          {input.label}
        </div>
        <div>
          <span className={styles.inputValue}>
            {input.value}
          </span>
          <span className={styles.units}>
            {input.suffix}
          </span>
        </div>
      </div>
    );
  };

  renderCalculatedOutput = () => {
    const outputPath = _.get(this.props.data, 'dataPaths.output');
    const format = _.get(this.props.dataFormat, 'output');
    const output = _.get(this.props.data, outputPath);

    const calc = {
      result: {
        value: this.props.emptyDataPlaceholder,
      },
    };

    const label = _.get(output, 'label');

    const datum = {
      value: this.state.inputValue,
      suffix: _.get(this.state, 'inputSuffix.value.label', this.state.inputSuffix),
    };

    if (outputPath && output) {
      switch (output.type) {
        case 'divisor':
          calc.dividend = _.get(this.props.data, _.get(output, 'dataPaths.dividend'), {}).value;
          datum.value = calc.dividend / datum.value;
          calc.result = this.formatDatum(datum, format);
          break;

        default:
          calc.result = this.formatDatum(datum, format);
          break;
      }
    }

    const outputValueClasses = cx({
      [styles.outputValue]: true,
      [styles.outputValueDisabled]: calc.result.value === this.props.emptyDataPlaceholder,
    });

    return (
      <div className={styles.outputWrapper}>
        {label && <div className={styles.outputLabel}>{label}</div>}
        <div className={styles.outputValueWrapper}>
          <span className={outputValueClasses}>
            {calc.result.value}
          </span>
          <span className={styles.outputSuffix}>
            {calc.result.suffix}
          </span>
        </div>
      </div>
    );
  }

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
      [styles.isOpen]: this.state.isOpened,
    });

    return (
      <div className={styles.StatWrapper}>
        <div ref={this.setStatRef} className={statClasses}>
          {this.renderStatHeader()}
          {this.chartProps.renderer && (
            <div className={styles.statMain}>
              <SizeMe render={({ size }) => (this.renderChart(size))} />
            </div>
          )}
          {this.props.type === statTypes.input && this.renderWeight()}
          {this.state.showFooter && this.renderStatFooter()}
        </div>
        {this.state.showMessages && this.renderTooltip()}
      </div>
    );
  }

  getStateByType = props => {
    const {
      data,
      legend,
    } = props;

    let isOpened;
    let input;

    const state = {
      chartTitle: props.title,
      isDisabled: _.sum(_.map(data.data, d => _.get(d, 'deviation.value', d.value))) <= 0,
    };

    switch (props.type) {
      case 'input':
        input = _.get(props.data, props.data.dataPaths.input, {});
        isOpened = _.get(this.state, 'isOpened', props.isOpened);
        state.inputSuffix = _.get(this.state, 'inputSuffix', input.suffix);
        state.inputValue = _.get(this.state, 'inputValue', input.value);
        state.isCollapsible = props.collapsible;
        state.isOpened = isOpened;
        state.showFooter = isOpened;
        break;

      case 'barHorizontal':
        isOpened = _.get(this.state, 'isOpened', props.isOpened);
        state.isCollapsible = props.collapsible;
        state.isOpened = isOpened;
        state.hoveredDatumIndex = -1;
        state.showFooter = legend && isOpened;
        break;

      case 'barBg':
        isOpened = _.get(this.state, 'isOpened', props.isOpened);
        state.isCollapsible = props.collapsible;
        state.isOpened = isOpened;
        break;

      case 'wheel':
        state.isCollapsible = false;
        state.isOpened = true;
        state.showFooter = false;
      break;

      case 'simple':
      default:
        state.isCollapsible = false;
        state.isOpened = false;
        state.showFooter = false;
        break;
    } 

    return state;
  };

  getDefaultChartProps = props => {
    const { chartHeight, animate } = props;

    return {
      animate: animate ? { duration: 300, onLoad: { duration: 0 } } : false,
      height: chartHeight,
      labels: d => formatPercentage(d.y),
      renderer: null,
      style: {
        data: {
          fill: d => colors[d.id] || colors.statDefault,
        },
      },
    };
  };

  getChartPropsByType = props => {
    const { type, data, bgPrefs: { bgUnits } } = props;

    let barWidth;
    let barSpacing;
    let domain;
    let height;
    let labelFontSize = 24;
    let chartLabelWidth = labelFontSize * 2.75;
    let padding;
    let total;
    let value;

    const chartProps = this.getDefaultChartProps(props);

    switch (type) {
      case 'barBg':
        barWidth = 4;
        height = chartProps.height || barWidth * 6;

        domain = {
          x: [0, bgUnits === MGDL_UNITS ? MGDL_CLAMP_TOP : MMOLL_CLAMP_TOP],
          y: [0, 1],
        };

        padding = {
          top: 10,
          bottom: 10,
        };

        _.assign(chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { topLeft: 2, bottomLeft: 2, topRight: 2, bottomRight: 2 },
          data: _.map(data.data, (d, i) => ({
            x: i + 1,
            y: d.value,
            deviation: d.deviation,
            eventKey: i,
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
              barWidth={barWidth}
              bgPrefs={props.bgPrefs}
              domain={domain}
              text={(datum = {}) => {
                const datumRef = _.get(props.data, ['data', datum.eventKey]);
                const { value } = this.formatDatum(
                  _.get(datumRef, 'deviation', datumRef),
                  props.dataFormat.label
                );
                return `${value}`;
              }}
              tooltipText={(datum = {}) => {
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
              fontWeight: 500,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      case 'barHorizontal':
        barSpacing = 6;
        height = chartProps.height;
        total = _.get(data, 'total.value');

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

        _.assign(chartProps, {
          alignment: 'middle',
          containerComponent: <VictoryContainer responsive={false} />,
          cornerRadius: { topLeft: 2, bottomLeft: 2, topRight: 2, bottomRight: 2 },
          data: _.map(data.data, (d, i) => ({
            x: i + 1,
            y: total > 0 ? d.value / total : d.value,
            id: d.id,
            eventKey: i,
          })),
          dataComponent: (
            <HoverBar
              barWidth={barWidth}
              barSpacing={barSpacing}
              chartLabelWidth={chartLabelWidth}
              domain={domain}
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
                    mutation: () => ({ active: props.alwaysShowTooltips }),
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
              text={(datum = {}) => {
                const { value, suffix } = this.formatDatum(
                  _.get(props.data, ['data', datum.eventKey]),
                  props.dataFormat.label,
                );
                return [value, suffix];
              }}
              tooltipText={(datum = {}) => {
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
              fill: datum => (datum.y === 0 ? 'transparent' : this.getDatumColor(datum)),
              width: () => barWidth,
            },
            labels: {
              fill: datum => this.getDatumColor(_.assign({}, datum, this.formatDatum(
                _.get(props.data, ['data', datum.eventKey]),
                props.dataFormat.label,
              ))),
              fontSize: labelFontSize,
              fontWeight: 500,
              paddingLeft: chartLabelWidth,
            },
          },
        });
        break;

      case 'wheel':
        total = _.get(data, 'total.value', 0);
        value = _.get(data, 'data[1].value', 0);
        chartProps.renderer = WheelPercent;
        chartProps.className = styles.statWheelTimeInAuto;
        chartProps.values = {
          on: Math.round(100 * value / total),
          off: 100 - Math.round(100 * value / total),
        }
        chartProps.rawValues = {
          on: this.formatDatum(data.data[1], props.dataFormat.summary).value,
          off: this.formatDatum(data.data[0], props.dataFormat.summary).value,
        };
        break;

      case 'simple':
      case 'input':
        break;

      default:
        this.log.error(`Invalid chart type ${type}`);
        chartProps.height = 20;
        chartProps.renderer = () => <div>{`Invalid chart type ${type}`}</div>;
        break;
    }

    return chartProps;
  }

  setChartTitle = (datum = {}) => {
    let tooltipTitleData;
    const { title = this.props.title } = datum;
    const tooltipTitleFormat = _.get(this.props, 'dataFormat.tooltipTitle');

    if (tooltipTitleFormat && datum.index >= 0) {
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

    let color = colors[datum.id] || colors.statDefault;

    if (isDisabled || isMuted) {
      color = isDisabled ? colors.statDisabled : colors.muted;
    }

    return color;
  };

  formatDatum = (datum = {}, format) => {
    let id = datum.id;
    let value = datum.value;
    let suffix = datum.suffix || '';
    let deviation;
    let lowerValue;
    let lowerColorId;
    let upperValue;
    let upperColorId;

    const total = _.get(this.props.data, 'total.value');
    const { bgPrefs, emptyDataPlaceholder } = this.props;
    const { bgBounds } = bgPrefs;

    function disableStat() {
      id = 'statDisabled';
      value = emptyDataPlaceholder;
    }

    switch (format) {
      case statFormats.bgCount:
        if (value >= 0) {
          const precision = value < 0.05 ? 2 : 1;
          // Note: the + converts the rounded, fixed string back to a number
          // This allows 2.67777777 to render as 2.7 and 3.0000001 to render as 3 (not 3.0)
          value = +value.toFixed(precision);
        } else {
          disableStat();
        }
        break;

      case statFormats.bgRange:
        value = generateBgRangeLabels(bgPrefs, { condensed: true })[id];
        break;

      case statFormats.bgValue:
        if (value >= 0) {
          id = classifyBgValue(bgBounds, value);
          value = formatBgValue(value, bgPrefs);
        } else {
          disableStat();
        }
        break;

      case statFormats.carbs:
        if (value >= 0) {
          value = formatDecimalNumber(value);
          suffix = 'g';
        } else {
          disableStat();
        }
        break;

      case statFormats.cv:
        if (value >= 0) {
          id = classifyCvValue(value);
          value = formatDecimalNumber(value);
          suffix = '%';
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
          value = formatDecimalNumber(value, 1);
          suffix = '%';
        } else {
          disableStat();
        }
        break;

      case statFormats.percentage:
        if (total && total >= 0) {
          value = _.max([value, 0]);
          const percentage = (value / total) * 100;
          let precision = 0;
          // We want to show extra precision on very small percentages so that we avoid showing 0%
          // when there is some data there.
          if (percentage > 0 && percentage < 0.5) {
            precision = percentage < 0.05 ? 2 : 1;
          }
          value = formatDecimalNumber(percentage, precision);
          suffix = '%';
        } else {
          disableStat();
        }
        break;

      case statFormats.standardDevRange:
        deviation = _.get(datum, 'deviation.value', -1);
        if (value >= 0 && deviation >= 0) {
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
        } else {
          disableStat();
        }
        break;

      case statFormats.standardDevValue:
        if (value >= 0) {
          value = formatBgValue(value, bgPrefs);
        } else {
          disableStat();
        }
        break;

      case statFormats.units:
        if (value >= 0) {
          value = formatDecimalNumber(value, 1);
          suffix = t('U');
        } else {
          disableStat();
        }
        break;

      case statFormats.unitsPerKg:
        if (suffix === t('lb')) {
          value = value * LBS_PER_KG;
        }
        suffix = t('U/kg');
        if (value > 0 && _.isFinite(value)) {
          value = formatDecimalNumber(value, 2);
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
    };
  }

  handleCollapse = () => {
    this.setState(state => ({
      isOpened: !state.isOpened,
    }), () => this.setState(this.getStateByType(this.props)));
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
