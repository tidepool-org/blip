/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* global requestAnimationFrame */

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';

import styles from './Tooltip.css';

class Tooltip extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { offset: { top: 0, left: 0 } };

    this.setElementRef = ref => {
      this.element = ref;
    };

    this.setTailElemRef = ref => {
      this.tailElem = ref;
    };
  }

  componentDidMount() {
    this.calculateOffset(this.props);

    // In cases where the tooltip CSS width is not statically set, we may need to re-caculate
    // the offset after updates to get the proper positioning after browser reflow is complete,
    // but before repaint happens. The second call within requestAnimationFrame ensures the tooltip
    // is properly positioned on the first render.
    requestAnimationFrame(() => {
      this.calculateOffset(this.props);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.calculateOffset(nextProps);
  }

  calculateOffset(currentProps) {
    if (this.element) {
      const { offset: propOffset, side, tail } = currentProps;
      const offset = {};
      const tooltipRect = this.element.getBoundingClientRect();

      let horizontalOffset = (propOffset.left != null)
        ? propOffset.left
        : (propOffset.horizontal || 0);

      if (side === 'left') {
        horizontalOffset = -horizontalOffset;
      }

      if (tail) {
        const tailRect = this.tailElem.getBoundingClientRect();
        const tailCenter = {
          top: tailRect.top + (tailRect.height / 2),
          left: tailRect.left + (tailRect.width / 2),
        };
        offset.top = -tailCenter.top + tooltipRect.top + propOffset.top;
        offset.left = -tailCenter.left + tooltipRect.left + horizontalOffset;
      } else {
        let leftOffset;
        let topOffset;
        switch (side) {
          case 'top':
            leftOffset = -tooltipRect.width / 2;
            topOffset = -tooltipRect.height;
            break;
          case 'bottom':
            leftOffset = -tooltipRect.width / 2;
            topOffset = 0;
            break;
          case 'right':
            leftOffset = 0;
            topOffset = -tooltipRect.height / 2;
            break;
          case 'left':
          default:
            leftOffset = -tooltipRect.width;
            topOffset = -tooltipRect.height / 2;
        }
        offset.top = topOffset + propOffset.top;
        offset.left = leftOffset + horizontalOffset;
      }

      this.setState({ offset });
    }
  }

  renderTail(backgroundColor = 'white') {
    const { tailWidth, tailHeight, borderWidth, borderColor, side } = this.props;
    const tailSide = (side === 'left') ? 'right' : 'left';
    const padding = 10;
    let marginOuterValue;
    let marginInnerValue;
    if (tailSide === 'left') {
      marginOuterValue = `calc(-100% - (4 * ${tailWidth}px - ${padding}px)`;
      marginInnerValue = `calc(-100% - (4 * ${tailWidth}px - ${padding}px - ${borderWidth + 1}px))`;
    } else {
      marginOuterValue = `calc(${padding}px + ${borderWidth}px)`;
      marginInnerValue = `${padding - 1}px`;
    }
    const borderSide = (tailSide === 'left') ? 'right' : 'left';
    const tailInnerColor = this.props.tailColor || this.props.backgroundColor || backgroundColor;
    // The two child divs form the solid color tail and the border around it by layering
    // on one another offset by the border width adjusted slightly for the angle
    return (
      <div>
        <div
          ref={this.setTailElemRef}
          className={styles.tail}
          style={{
            marginTop: `-${tailHeight}px`,
            marginLeft: marginOuterValue,
            borderWidth: `${tailHeight}px ${2 * tailWidth}px`,
            [`border${_.upperFirst(borderSide)}Color`]: borderColor,
          }}
        />
        {tailInnerColor !== borderColor && (
          <div
            className={styles.tail}
            style={{
              marginTop: `-${tailHeight}px`,
              marginLeft: marginInnerValue,
              borderWidth: `${tailHeight}px ${2 * tailWidth}px`,
              [`border${_.upperFirst(borderSide)}Color`]:
                this.props.tailColor || this.props.backgroundColor || backgroundColor,
            }}
          />
        )}
      </div>
    );
  }

  renderTitle(title) {
    const { tail, content } = this.props;
    let renderedTitle = null;
    if (title) {
      renderedTitle = (
        <div className={styles.title}>
          <span>{title}</span>
          {tail && !content && this.renderTail(styles.tooltipTitleBg)}
        </div>
      );
    }
    return renderedTitle;
  }

  renderContent(content) {
    let renderedContent = null;
    const { tail } = this.props;
    if (content) {
      renderedContent = (
        <div className={styles.content}>
          <span>{content}</span>
          {tail && this.renderTail()}
        </div>
      );
    }
    return renderedContent;
  }

  render() {
    const { title, content, position, backgroundColor, borderColor, borderWidth } = this.props;
    const { offset } = this.state;
    const top = position.top + offset.top;
    const left = position.left + offset.left;

    return (
      <div
        className={styles.tooltip}
        style={{ top, left, backgroundColor, borderColor, borderWidth: `${borderWidth}px` }}
        ref={this.setElementRef}
      >
        {title && this.renderTitle(title)}
        {content && this.renderContent(content)}
      </div>
    );
  }
}

Tooltip.displayName = 'Tooltip';

Tooltip.propTypes = {
  title: PropTypes.node,
  content: PropTypes.node,
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }).isRequired,
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  tailColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
};

Tooltip.defaultProps = {
  tail: true,
  side: 'left',
  tailWidth: 7,
  tailHeight: 8,
  borderColor: 'black',
  borderWidth: 2,
  offset: { top: 0, left: 0 },
};

export default Tooltip;
