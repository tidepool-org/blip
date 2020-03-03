import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { default as IconButtonBase } from '@material-ui/core/IconButton';

export const IconButton = props => {
  const { icon: Icon, label, ...buttonProps } = props;
  const StyledIconButton = styled(IconButtonBase)`
    padding: 0;

    &:hover,
    &:focus,
    &:active {
      background: none;
    }
  `;

  return (
    <StyledIconButton disableFocusRipple disableRipple aria-label={label} {...buttonProps}>
      <Icon />
    </StyledIconButton>
  );
};

IconButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

export default IconButton;
