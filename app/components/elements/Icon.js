import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';
import cx from 'classnames';

import { transitions } from '../../themes/baseTheme';

const StyledIcon = styled(Box)`
  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;
  display: inline-flex;

  &.disabled, &:disabled {
    pointer-events: none;
  }

  .MuiSvgIcon-root {
    font-size: inherit;
  }
`;

export const Icon = props => {
  const { icon: IconElement, innerRef, label, variant, ...buttonProps } = props;
  const as = props.variant === 'button' ? 'button' : 'span';

  const classNames = cx({
    disabled: props.disabled,
  });

  return (
    <StyledIcon
      as={as}
      aria-label={label}
      className={classNames}
      variant={`icons.${variant}`}
      onKeyPress={(e) => (buttonProps.onClick && e.key === 'Enter' ? buttonProps.onClick(e) : null)}
      ref={innerRef}
      {...buttonProps}
    >
      <IconElement />
    </StyledIcon>
  );
};

Icon.propTypes = {
  ...BoxProps,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType.isRequired,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  label: PropTypes.string.isRequired,
  tabIndex: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['default', 'static', 'button']),
};

Icon.defaultProps = {
  tabIndex: 0,
  variant: 'default',
};

export default Icon;
