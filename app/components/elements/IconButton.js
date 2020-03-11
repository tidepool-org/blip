import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { default as IconButtonBase } from '@material-ui/core/IconButton';

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
  const { icon: Icon, label, ...buttonProps } = props;

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
