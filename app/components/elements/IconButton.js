import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';

import { transitions } from '../../themes/baseTheme';

const StyledIconButton = styled(Box)`
  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;
  display: inline-flex;

  &:disabled {
    pointer-events: none;
  }
`;

export const IconButton = props => {
  const { icon: Icon, label, ...buttonProps} = props;
  const as = props.variant === 'icons.static' ? 'span' : 'button';

  return (
    <StyledIconButton
      as={as}
      aria-label={label}
      {...buttonProps}
    >
      <Icon focusable />
    </StyledIconButton>
  );
};

IconButton.propTypes = {
  ...BoxProps,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

IconButton.defaultProps = {
  variant: 'icons.button',
};

export default IconButton;
