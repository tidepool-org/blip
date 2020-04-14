import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button as Base, Box, ButtonProps } from 'rebass/styled-components';
import styled, { ThemeContext } from 'styled-components';
import cx from 'classnames';

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

    > div:first-child {
      visibility: hidden;
    }
  }
`;

const StyledCircularProgress = styled(Box)`
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Button = props => {
  const { children, processing, className = '', ...buttonProps } = props;
  const classNames = cx({ processing });

  const themeContext = useContext(ThemeContext);

  return (
    <StyledButton variant="primary" {...buttonProps} className={`${classNames} ${className}`}>
      <div>{children}</div>
      {processing && (
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

Button.propTypes = {
  ...ButtonProps,
  processing: PropTypes.bool,
};

export default Button;
