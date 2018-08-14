import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Bar, Rect, VictoryLabel, VictoryTooltip, TextSize } from 'victory';
import SizeMe from 'react-sizeme';
import { statColors } from './Stat';

export const HoverBarLabel = (props) => {
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
          stroke: statColors.axis,
          strokeWidth: 2,
          fill: statColors.white,
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

HoverBarLabel.propTypes = {
  domain: PropTypes.object.isRequired,
  scale: PropTypes.object,
  text: PropTypes.func,
  y: PropTypes.number,
};

HoverBarLabel.displayName = 'HoverBarLabel';

export const SizedHoverLabel = SizeMe()(HoverBarLabel);

export const HoverBar = (props) => {
  const {
    barSpacing,
    barWidth,
    chartLabelWidth,
    cornerRadius,
    domain,
    index,
    scale,
    width,
    y,
  } = props;

  const barGridWidth = barWidth / 6;
  const barGridRadius = cornerRadius.top || 2;
  const widthCorrection = (width - chartLabelWidth) / width;

  return (
    <g>
      <Rect
        {...props}
        x={0}
        y={scale.x(index + 1) - (barWidth / 2) - (barSpacing / 2)}
        rx={barGridRadius}
        ry={barGridRadius}
        width={scale.y(domain.x[1])}
        height={barWidth + barSpacing}
        style={{
          stroke: 'transparent',
          fill: 'transparent',
        }}
      />
      <Rect
        {...props}
        x={0}
        y={scale.x(index + 1) - (barGridWidth / 2)}
        rx={barGridRadius}
        ry={barGridRadius}
        width={scale.y(domain.x[1]) - chartLabelWidth}
        height={barGridWidth}
        style={{
          stroke: 'transparent',
          fill: statColors.axis,
        }}
      />
      <Bar
        {...props}
        width={scale.y(domain.x[1]) - chartLabelWidth}
        y={y * widthCorrection}
      />
    </g>
  );
};

HoverBar.propTypes = {
  chartLabelWidth: PropTypes.number,
  domain: PropTypes.object.isRequired,
  scale: PropTypes.object,
  y: PropTypes.number,
};

HoverBar.displayName = 'HoverBar';

export default HoverBar;
