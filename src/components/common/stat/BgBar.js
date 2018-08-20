import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Point, Rect, VictoryLabel, VictoryTooltip, TextSize } from 'victory';
import colors from '../../../styles/colors.css';

export const BgBarLabel = props => {
  const {
    barWidth,
    domain,
    scale,
    style,
    text,
    tooltipText,
    y,
  } = props;

  const tooltipFontSize = _.max([barWidth / 2, 12]);
  const tooltipHeight = tooltipFontSize * 1.2;
  const tooltipRadius = tooltipHeight / 2;

  const labelStyle = _.assign({}, props.style, {
    pointerEvents: 'none',
  });

  const tooltipStyle = _.assign({}, props.style, {
    fontSize: tooltipFontSize,
  });

  const tooltipTextSize = TextSize.approximateTextSize(tooltipText(props.datum), tooltipStyle);

  return (
    <g>
      <VictoryLabel
        {...props}
        renderInPortal={false}
        style={labelStyle}
        text={text}
        textAnchor="end"
        verticalAnchor="middle"
        x={scale.y(domain.x[1])}
        y={y}
      />
      <VictoryTooltip
        {...props}
        cornerRadius={tooltipRadius}
        x={scale.y(domain.x[1]) - style.paddingLeft - tooltipTextSize.width - (tooltipRadius * 2)}
        y={y}
        flyoutStyle={{
          stroke: colors.axis,
          strokeWidth: 2,
          fill: colors.white,
        }}
        width={tooltipTextSize.width + (tooltipRadius * 2)}
        height={tooltipHeight}
        pointerLength={0}
        pointerWidth={0}
        renderInPortal={false}
        text={tooltipText}
        style={tooltipStyle}
      />
    </g>
  );
};

BgBarLabel.propTypes = {
  domain: PropTypes.object.isRequired,
  scale: PropTypes.object,
  text: PropTypes.func,
  y: PropTypes.number,
};

BgBarLabel.displayName = 'BgBarLabel';

export const BgBar = props => {
  const {
    barWidth,
    bgPrefs: { bgBounds } = {},
    chartLabelWidth,
    datum,
    domain,
    index,
    scale,
    width,
  } = props;

  const widthCorrection = (width - chartLabelWidth) / width;
  const widths = {
    low: scale.y(bgBounds.targetLowerBound) * widthCorrection,
    target: scale.y(bgBounds.targetUpperBound - bgBounds.targetLowerBound) * widthCorrection,
    high: scale.y(domain.x[1] - bgBounds.targetUpperBound) * widthCorrection,
  };

  return (
    <g>
      <Rect
        {...props}
        x={0}
        y={scale.x(index + 1)}
        width={widths.low}
        height={barWidth}
        style={{
          stroke: 'transparent',
          fill: colors.low,
        }}
      />
      <Rect
        {...props}
        x={widths.low}
        y={scale.x(index + 1)}
        width={widths.target}
        height={barWidth}
        style={{
          stroke: 'transparent',
          fill: colors.target,
        }}
      />
      <Rect
        {...props}
        x={(widths.low + widths.target)}
        y={scale.x(index + 1)}
        width={widths.high}
        height={barWidth}
        style={{
          stroke: 'transparent',
          fill: colors.high,
        }}
      />
      <Point
        x={scale.y(datum.y) * widthCorrection}
        y={scale.x(index + 1) + (barWidth / 2)}
        style={{
          fill: colors.target,
          stroke: colors.white,
          strokeWidth: 2,
        }}
        size={barWidth * 2}
      />
    </g>
  );
};

BgBar.propTypes = {
  bgPrefs: PropTypes.object,
};

BgBar.displayName = 'BgBar';

export default BgBar;
