import React, { PropTypes } from 'react';
import _ from 'lodash';
import { VictoryLabel } from 'victory';

export const BgBarLabel = props => {
  const {
    barWidth,
    domain,
    scale,
  } = props;

  const labelStyle = _.assign({}, props.style, {
    pointerEvents: 'none',
  });

  return (
    <g>
      <VictoryLabel
        {...props}
        renderInPortal={false}
        style={labelStyle}
        textAnchor="end"
        verticalAnchor="middle"
        dy={-(barWidth / 2 - 1)}
        x={scale.y(domain.x[1])}
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

export default BgBarLabel;
