import React, { PropTypes } from 'react';
import bows from 'bows';
import { Bar, VictoryLabel, Rect } from 'victory';
import SizeMe from 'react-sizeme';
import styles from './HoverBar.css';

export const HoverBarLabel = (props) => {
  const {
    domain,
    scale,
    text,
    y,
  } = props;

  return (
    <g>
      <VictoryLabel
        {...props}
        x={scale.y(domain.x[1])}
        y={y}
        text={text}
        textAnchor="end"
        verticalAnchor="middle"
      />
    </g>
  );
};

HoverBarLabel.propTypes = {
  text: PropTypes.func,
  scale: PropTypes.object,
  y: PropTypes.number,
  domain: PropTypes.object.isRequired,
};

HoverBarLabel.displayName = 'HoverBarLabel';

export const SizedHoverLabel = SizeMe()(HoverBarLabel);

export class HoverBar extends React.PureComponent {
  static propTypes = {
    scale: PropTypes.object,
    y: PropTypes.number,
    domain: PropTypes.object.isRequired,
  };

  static displayName = 'HoverBar';

  constructor(props) {
    super(props);
    this.log = bows('HoverBar');
  }

  render() {
    const {
      barSpacing,
      barWidth,
      cornerRadius,
      domain,
      index,
      scale,
      width,
      y,
    } = this.props;

    const rightPadding = barWidth * 2.5;
    const barGridWidth = barWidth / 6;
    const barGridRadius = cornerRadius.top || 2;
    const widthCorrection = (width - rightPadding) / width;

    return (
      <g>
        <Rect
          {...this.props}
          x={0}
          y={scale.x(index + 1) - (barWidth / 2) - (barSpacing / 2)}
          rx={barGridRadius}
          ry={barGridRadius}
          width={scale.y(domain.x[1]) - rightPadding}
          height={barWidth + barSpacing}
          className={styles.BarHoverTarget}
        />
        <Rect
          {...this.props}
          x={0}
          y={scale.x(index + 1) - (barGridWidth / 2)}
          rx={barGridRadius}
          ry={barGridRadius}
          width={scale.y(domain.x[1]) - rightPadding}
          height={barGridWidth}
          className={styles.BarGrid}
        />
        <Bar
          {...this.props}
          width={scale.y(domain.x[1]) - rightPadding}
          y={y * widthCorrection}
        />
      </g>
    );
  }
}

export default HoverBar;
