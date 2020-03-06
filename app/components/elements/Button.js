import React, { useContext } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button as Base, Box } from 'rebass/styled-components';
import styled, { ThemeContext } from 'styled-components';
import cx from 'classnames';

import { ButtonFont } from './FontStyles';

import {
  transitions,
} from '../../themes/baseTheme';

const StyledButton = styled(Base)`
  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;

  &:disabled {
    pointer-events: none;
  }

  &.processing {
    pointer-events: none;
    line-height: 0;

    ${ButtonFont} {
      visibility: hidden;
    }
  }
`;

const StyledCircularProgress = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Button = props => {
  const { children, processing, ...buttonProps } = props;
  const classNames = cx({ processing });

  const themeContext = useContext(ThemeContext);

  return (
    <StyledButton {...buttonProps} className={classNames}>
      <ButtonFont>{children}</ButtonFont>
      { processing && (
        <StyledCircularProgress>
          <CircularProgress
            color="inherit"
            size={themeContext.fontSizes[3]}
            thickness={5}
          />
        </StyledCircularProgress>
      )}
    </StyledButton>
  );
};

export default Button;
