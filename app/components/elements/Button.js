import React from 'react';
import { Button as Base } from 'rebass/styled-components';
import styled from 'styled-components';

import { ButtonFont } from './FontStyles';

import {
  transitions,
} from '../../themes/baseTheme';

const StyledButton = styled(Base)`
  cursor: pointer;
  transition: ${transitions.easeOut};
`;

export const Button = props => {
  const { children, ...buttonProps } = props;

  return (
    <StyledButton {...buttonProps}>
      <ButtonFont>{children}</ButtonFont>
    </StyledButton>
  );
};

export default Button;
