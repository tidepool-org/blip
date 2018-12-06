import React, { PropTypes } from 'react';
import _ from 'lodash';
import { VictoryLabel, VictoryTooltip, TextSize } from 'victory';

import colors from '../../../styles/colors.css';

export const HoverBarLabel = props => {
  const {
    barWidth,
    isDisabled,
    domain,
    scale = {
      x: _.noop,
      y: _.noop,
    },
    style = {},
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

  const tooltipTextSize = TextSize.approximateTextSize(tooltipText(props.datum), tooltipStyle);

  const labelStyle = _.assign({}, style, {
    pointerEvents: 'none',
  });

  return (
    <g className="HoverBarLabel">
      <VictoryLabel
        {...props}
        renderInPortal={false}
        style={labelStyle}
        textAnchor="end"
        verticalAnchor="middle"
        x={scale.y(domain.x[1])}
      />
      {tooltipTextSize.width > 0 && (
        <VictoryTooltip
          {...props}
          cornerRadius={tooltipRadius}
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
  domain: PropTypes.object.isRequired,
  scale: PropTypes.object,
  text: PropTypes.func,
  y: PropTypes.number,
};

HoverBarLabel.displayName = 'HoverBarLabel';

export default HoverBarLabel;
