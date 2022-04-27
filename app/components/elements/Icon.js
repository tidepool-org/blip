import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';
import cx from 'classnames';

import { transitions } from '../../themes/baseTheme';

const StyledIcon = styled(Box)`
  cursor: ${({ cursor }) => cursor};
  transition: ${transitions.easeOut};
  position: relative;
  display: inline-flex;

  &.disabled, &:disabled {
    pointer-events: none;
  }

  .MuiSvgIcon-root {
    font-size: inherit;
  }

  .icon-custom-svg {
    width: 100%;
    height: 'auto';
  }
`;

export const Icon = props => {
  const {
    active,
    cursor = 'pointer',
    icon: IconElement,
    iconSrc,
    innerRef,
    label,
    variant,
    ...buttonProps
  } = props;

  const as = props.variant === 'button' ? 'button' : 'span';

  const classNames = cx({
    disabled: props.disabled,
    active,
  });

  return (
    <StyledIcon
      as={as}
      aria-label={label}
      className={classNames}
      cursor={cursor}
      variant={`icons.${variant}`}
      onKeyPress={(e) => (buttonProps.onClick && e.key === 'Enter' ? buttonProps.onClick(e) : null)}
      ref={innerRef}
      {...buttonProps}
    >
      {iconSrc ? <img className="icon-custom-svg" src={iconSrc} /> : <IconElement />}
    </StyledIcon>
  );
};

Icon.propTypes = {
  ...BoxProps,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconSrc: PropTypes.string,
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
