import React, { PropTypes } from 'react';
import { Bar, VictoryLabel } from 'victory';

export const HoverBarLabel = (props) => {
  const { text, scale, y, domain } = props;

  return (
    <VictoryLabel
      {...props}
      x={scale.y(domain.x[1])}
      y={y}
      text={text}
      textAnchor="end"
      verticalAnchor="middle"
    />
  );
};

HoverBarLabel.displayName = 'HoverBarLabel';

HoverBarLabel.propTypes = {
  text: PropTypes.string.isRequired,
  scale: PropTypes.object.isRequired,
  y: PropTypes.number.isRequired,
  domain: PropTypes.object.isRequired,
};

export const HoverBar = (props) => {
  return (
    <Bar
      {...props}
      events={{
        onClick: (d) => console.log('clicked', d),
        onMouseOver: (d) => console.log('hovered', d),
      }}
    />
  );
};

HoverBar.displayName = 'HoverBar';

export default HoverBar;
