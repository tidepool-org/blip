import React from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps } from 'rebass/styled-components';
import styled from 'styled-components';
import { default as IconButtonBase } from '@material-ui/core/IconButton';
import { colors } from '../../themes/baseTheme';

const StyledIconButton = styled(IconButtonBase)`
  padding: 0;
  color: inherit;

  &:hover,
  &:focus,
  &:active {
    background: none;
  }
`;

export const IconButton = props => {
  const { sx, icon: Icon, label, rebass, ...buttonProps } = props;

  return (
    <Box
      as="span"
      color={colors.text.primary}
      aria-label={label}
      {...rebass}
    >
      {/* <StyledIconButton disableFocusRipple disableRipple aria-label={label} {...buttonProps}> */}
        <Icon focusable />
      {/* </StyledIconButton> */}
    </Box>
  );
};

IconButton.propTypes = {
  rebass: BoxProps,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

IconButton.defaultProps = {
  rebass: {},
};

export default IconButton;
