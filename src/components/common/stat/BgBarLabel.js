import React, { PropTypes } from 'react';
import _ from 'lodash';
import { VictoryLabel } from 'victory';

export const BgBarLabel = props => {
  const {
    barWidth,
    domain,
    scale = {
      x: _.noop,
      y: _.noop,
    },
  } = props;

  const labelStyle = _.assign({}, props.style, {
    pointerEvents: 'none',
  });

  return (
    <g className="bgBarLabel">
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
