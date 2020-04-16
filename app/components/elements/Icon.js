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
  const { icon: IconElement, label, variant, ...buttonProps } = props;
  const as = props.variant === 'icons.button' ? 'button' : 'span';

  const classNames = cx({
    disabled: props.disabled,
  });

  return (
    <StyledIcon
      as={as}
      aria-label={label}
      className={classNames}
      variant={`icons.${variant}`}
      {...buttonProps}
    >
      <IconElement />
    </StyledIcon>
  );
};

Icon.propTypes = {
  ...BoxProps,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'static', 'button', 'banner']),
};

Icon.defaultProps = {
  variant: 'default',
};

export default Icon;
