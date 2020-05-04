import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { VictoryLabel, VictoryTooltip, TextSize } from 'victory';

import colors from '../../../styles/colors.css';

export const HoverBarLabel = props => {
  const {
    barWidth,
    isDisabled,
    datum = { x: 0, y: 0 },
    domain,
    scale = {
      x: _.noop,
      y: _.noop,
    },
    style = {},
    text,
    tooltipText,
  } = props;

  const tooltipFontSize = _.min([barWidth / 2, 12]);
  const tooltipHeight = tooltipFontSize * 1.2;
  const tooltipRadius = tooltipHeight / 2;

  const disabled = isDisabled();

  const tooltipStyle = _.assign({}, style, {
    fontSize: tooltipFontSize,
    display: disabled ? 'none' : 'inherit',
  });

  const tooltipTextSize = TextSize.approximateTextSize(tooltipText(datum), tooltipStyle);

  const labelStyle = _.assign({}, style, {
    pointerEvents: 'none',
  });

  const labelUnitsStyle = _.assign({}, labelStyle, {
    fontSize: labelStyle.fontSize / 2,
    baselineShift: -((labelStyle.fontSize / 2) * 0.25),
    fill: colors.statDefault,
  });

  const labelText = text(datum);
  const labelUnitsTextSize = TextSize.approximateTextSize(labelText[1] || '', labelUnitsStyle);

  // Ensure that the datum y value isn't below zero, or the tooltip will be incorrectly positioned
  const tooltipDatum = {
    ...datum,
    y: _.max([datum.y, 0]),
  };

  return (
    <g className="HoverBarLabel">
      <VictoryLabel
        {...props}
        text={labelText[0]}
        renderInPortal={false}
        style={labelStyle}
        textAnchor="end"
        verticalAnchor="middle"
        x={scale.y(domain.x[1])}
        dx={-(labelUnitsTextSize.width * 1.9)}
      />
      <VictoryLabel
        {...props}
        text={labelText[1]}
        renderInPortal={false}
        style={labelUnitsStyle}
        textAnchor="end"
        verticalAnchor="middle"
        x={scale.y(domain.x[1])}
        dx={0}
      />
      {tooltipTextSize.width > 0 && (
        <VictoryTooltip
          {...props}
          cornerRadius={tooltipRadius}
          datum={tooltipDatum}
          x={scale.y(domain.x[1]) - style.paddingLeft - tooltipTextSize.width - (tooltipRadius * 2)}
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
  datum: PropTypes.object,
  style: PropTypes.object,
  domain: PropTypes.object.isRequired,
  isDisabled: PropTypes.func.isRequired,
  text: PropTypes.func.isRequired,
  scale: PropTypes.object,
  y: PropTypes.number,
};

HoverBarLabel.displayName = 'HoverBarLabel';

export default HoverBarLabel;
