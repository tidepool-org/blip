import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Bar, Rect, VictoryLabel, VictoryTooltip, TextSize } from 'victory';
import colors from '../../../styles/colors.css';

export const HoverBarLabel = props => {
  const {
    barWidth,
    isDisabled,
    domain,
    scale,
    style,
    text,
    tooltipText,
    y,
  } = props;

  const tooltipFontSize = _.min([barWidth / 2, 12]);
  const tooltipHeight = tooltipFontSize * 1.2;
  const tooltipRadius = tooltipHeight / 2;

  const disabled = isDisabled();

  const tooltipStyle = _.assign({}, props.style, {
    fontSize: tooltipFontSize,
    display: disabled ? 'none' : 'inherit',
  });

  const tooltipTextSize = TextSize.approximateTextSize(tooltipText(props.datum), tooltipStyle);

  const labelStyle = _.assign({}, props.style, {
    pointerEvents: 'none',
  });

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
      {tooltipTextSize.width > 0 && (
        <VictoryTooltip
          {...props}
          cornerRadius={tooltipRadius}
          x={scale.y(domain.x[1]) - style.paddingLeft - tooltipTextSize.width - (tooltipRadius * 2)}
          y={y}
          flyoutStyle={{
            display: disabled ? 'none' : 'inherit',
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
      )}
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

export const HoverBar = props => {
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
      <g className="HoverBarTarget">
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
      </g>
      <g className="barBg">
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
            fill: colors.axis,
          }}
        />
      </g>
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
