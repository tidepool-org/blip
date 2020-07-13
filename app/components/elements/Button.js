import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button as Base, Flex, Box, ButtonProps } from 'rebass/styled-components';
import styled, { ThemeContext } from 'styled-components';
import cx from 'classnames';

import Icon from './Icon';
import baseTheme, { transitions } from '../../themes/baseTheme';

const StyledButton = styled(Base)`
  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;

  &:disabled {
    pointer-events: none;
  }

  &.processing {
    pointer-events: none;

    > div:first-child, .icon {
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
  const { children, selected, processing, icon, iconLabel, className = '', ...buttonProps } = props;
  const classNames = cx({ processing, selected });

  const themeContext = useContext(ThemeContext);

  return (
    <Flex as={StyledButton} alignItems="center" {...buttonProps} className={`${classNames} ${className}`}>
      <Box>{children}</Box>
      {icon && (
        <Icon className="icon" ml={1} theme={baseTheme} variant="static" icon={icon} label={iconLabel} />
      )}
      {processing && (
        <StyledCircularProgress>
          <CircularProgress
            color="inherit"
            size={themeContext.fontSizes[3]}
            thickness={5}
          />
        </StyledCircularProgress>
      )}
    </Flex>
  );
};

Button.propTypes = {
  ...ButtonProps,
  processing: PropTypes.bool,
  selected: PropTypes.bool,
  icon: PropTypes.elementType,
  iconLabel: PropTypes.string,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'textPrimary',
    'textSecondary',
    'pagination',
    'filter',
    'chip',
  ]),
};

Button.defaultProps = {
  type: 'button',
  variant: 'primary',
};

export default Button;
