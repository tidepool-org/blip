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

export const Button = props => (
  <StyledButton {...props}>
    <ButtonFont {...props} />
  </StyledButton>
);

export default Button;
